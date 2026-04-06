import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.models import ImportHistory
from app.schemas.schemas import ImportHistoryRead, ImportResult
from app.services.csv_service import (
    parse_csv,
    import_accounts,
    import_income_streams,
    import_expenses,
    import_assumptions,
    export_accounts,
    export_income_streams,
    export_expenses,
    get_template_csv,
)

router = APIRouter(prefix="/import", tags=["import_export"])

VALID_IMPORT_TYPES = {"accounts", "income", "expenses", "assumptions", "events"}


@router.post("/{import_type}/preview")
async def preview_import(
    import_type: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Parse CSV and return validation results before committing to DB."""
    if import_type not in VALID_IMPORT_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid import type. Must be one of: {VALID_IMPORT_TYPES}")

    content = await file.read()
    try:
        text = content.decode("utf-8-sig")  # handle BOM
    except UnicodeDecodeError:
        text = content.decode("latin-1")

    result = parse_csv(text, import_type)
    result.filename = file.filename or "upload.csv"
    return result


@router.post("/{import_type}/confirm")
async def confirm_import(
    import_type: str,
    scenario_id: int,
    file: UploadFile = File(...),
    overwrite: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    """Parse CSV and save records to the database."""
    if import_type not in VALID_IMPORT_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid import type. Must be one of: {VALID_IMPORT_TYPES}")

    content = await file.read()
    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = content.decode("latin-1")

    parse_result = parse_csv(text, import_type)

    if parse_result.valid_rows == 0 and parse_result.invalid_rows > 0:
        raise HTTPException(status_code=422, detail={"errors": parse_result.errors, "message": "No valid rows to import"})

    imported = 0
    skipped = parse_result.invalid_rows
    errors = parse_result.errors.copy()

    try:
        if import_type == "accounts":
            imported = import_accounts(parse_result.preview, scenario_id, db, overwrite)
        elif import_type == "income":
            imported = import_income_streams(parse_result.preview, scenario_id, db, overwrite)
        elif import_type == "expenses":
            imported = import_expenses(parse_result.preview, scenario_id, db, overwrite)
        elif import_type == "assumptions":
            imported = import_assumptions(parse_result.preview, scenario_id, db, overwrite)
    except Exception as e:
        errors.append(str(e))
        skipped = parse_result.valid_rows

    # Log the import
    history = ImportHistory(
        filename=file.filename or "upload.csv",
        import_type=import_type,
        records_imported=imported,
        records_skipped=skipped,
        status="success" if not errors else ("partial" if imported > 0 else "failed"),
        error_log="\n".join(errors),
    )
    db.add(history)
    db.commit()

    return {
        "imported": imported,
        "skipped": skipped,
        "errors": errors,
        "status": history.status,
    }


@router.get("/history", response_model=List[ImportHistoryRead])
def get_import_history(db: Session = Depends(get_db)):
    return db.query(ImportHistory).order_by(ImportHistory.imported_at.desc()).limit(50).all()


@router.get("/templates/{import_type}")
def download_template(import_type: str):
    """Download an empty CSV template for the given import type."""
    if import_type not in VALID_IMPORT_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid import type. Must be one of: {VALID_IMPORT_TYPES}")

    csv_content = get_template_csv(import_type)
    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=template_{import_type}.csv"},
    )


@router.get("/export/accounts")
def export_accounts_csv(scenario_id: int, db: Session = Depends(get_db)):
    csv_content = export_accounts(scenario_id, db)
    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=accounts_export.csv"},
    )


@router.get("/export/income")
def export_income_csv(scenario_id: int, db: Session = Depends(get_db)):
    csv_content = export_income_streams(scenario_id, db)
    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=income_export.csv"},
    )


@router.get("/export/expenses")
def export_expenses_csv(scenario_id: int, db: Session = Depends(get_db)):
    csv_content = export_expenses(scenario_id, db)
    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=expenses_export.csv"},
    )
