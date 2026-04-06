"""
CSV import/export service.

Handles parsing, validation, and persistence of CSV data for all importable
entity types: accounts, income streams, expenses, assumptions, events.
"""

import csv
import io
from typing import Any
from sqlalchemy.orm import Session

from app.models.models import Account, IncomeStream, ExpenseItem, AssumptionSet
from app.schemas.schemas import ImportResult


# ─── Column definitions per import type ─────────────────────────────────────

ACCOUNT_COLUMNS = [
    "name", "account_type", "tax_treatment", "institution", "owner",
    "current_balance", "annual_contribution", "employer_match_percent",
    "expected_annual_return_percent", "dividend_yield_percent",
    "contribution_stop_age", "withdrawal_priority", "include_in_projection",
    "spend_dividends_in_retirement", "starting_monthly_income",
    "income_start_age", "income_end_age", "cola_percent", "notes",
]

INCOME_COLUMNS = [
    "name", "stream_type", "start_age", "end_age", "annual_amount",
    "is_monthly", "cola_percent", "is_taxable", "is_partially_taxable", "notes",
]

EXPENSE_COLUMNS = [
    "name", "category", "annual_amount", "is_monthly", "start_age",
    "end_age", "inflation_linked", "custom_inflation_rate", "is_essential", "notes",
]

ASSUMPTION_COLUMNS = [
    "baseline_return", "conservative_return", "aggressive_return",
    "inflation_rate", "healthcare_inflation_rate",
    "federal_tax_rate", "state_tax_rate",
    "qualified_dividend_rate", "long_term_capital_gains_rate",
    "social_security_taxable_percent", "rmd_enabled", "roth_conversion_enabled",
    "spending_reduction_age", "spending_reduction_percent",
    "medical_increase_age", "medical_increase_percent",
    "bear_market_stress_test", "sequence_of_returns_stress",
    "active_return_scenario", "withdrawal_strategy",
]

EVENT_COLUMNS = ["name", "age", "amount", "is_inflow", "description"]


COLUMNS_MAP = {
    "accounts": ACCOUNT_COLUMNS,
    "income": INCOME_COLUMNS,
    "expenses": EXPENSE_COLUMNS,
    "assumptions": ASSUMPTION_COLUMNS,
    "events": EVENT_COLUMNS,
}


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _to_bool(val: Any) -> bool:
    if isinstance(val, bool):
        return val
    if isinstance(val, str):
        return val.strip().lower() in ("true", "1", "yes", "y")
    return bool(val)


def _to_float(val: Any, default: float = 0.0) -> float:
    if val is None or str(val).strip() == "":
        return default
    try:
        return float(val)
    except (ValueError, TypeError):
        return default


def _to_int(val: Any, default: int = None):
    if val is None or str(val).strip() == "":
        return default
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return default


# ─── Parse ───────────────────────────────────────────────────────────────────

def parse_csv(file_content: str, import_type: str) -> ImportResult:
    """
    Parse and validate CSV content for the given import type.

    Returns an ImportResult with valid row count, errors, and a preview
    of parsed rows (all valid rows, not just first 10, stored in .preview).
    """
    columns = COLUMNS_MAP.get(import_type, [])
    if not columns:
        return ImportResult(
            valid_rows=0, invalid_rows=0,
            errors=[f"Unknown import type: {import_type}"],
            preview=[], import_type=import_type, filename="",
        )

    reader = csv.DictReader(io.StringIO(file_content.strip()))
    valid_rows = []
    errors = []
    invalid_count = 0

    if not reader.fieldnames:
        return ImportResult(
            valid_rows=0, invalid_rows=0,
            errors=["CSV file appears to be empty or missing headers"],
            preview=[], import_type=import_type, filename="",
        )

    for i, row in enumerate(reader, start=2):  # row 1 = header
        row_errors = _validate_row(row, import_type, i)
        if row_errors:
            errors.extend(row_errors)
            invalid_count += 1
        else:
            valid_rows.append(dict(row))

    return ImportResult(
        valid_rows=len(valid_rows),
        invalid_rows=invalid_count,
        errors=errors,
        preview=valid_rows[:10],  # Only first 10 for display
        import_type=import_type,
        filename="",
    )


def _validate_row(row: dict, import_type: str, row_num: int) -> list:
    """Validate a single row and return a list of error strings."""
    errors = []

    if import_type == "accounts":
        if not row.get("name", "").strip():
            errors.append(f"Row {row_num}: 'name' is required")
        if not row.get("account_type", "").strip():
            errors.append(f"Row {row_num}: 'account_type' is required")
        if not row.get("tax_treatment", "").strip():
            errors.append(f"Row {row_num}: 'tax_treatment' is required")
        bal = row.get("current_balance", "0")
        try:
            float(bal)
        except (ValueError, TypeError):
            errors.append(f"Row {row_num}: 'current_balance' must be a number, got '{bal}'")

    elif import_type == "income":
        if not row.get("name", "").strip():
            errors.append(f"Row {row_num}: 'name' is required")
        if not row.get("stream_type", "").strip():
            errors.append(f"Row {row_num}: 'stream_type' is required")
        try:
            int(float(row.get("start_age", "")))
        except (ValueError, TypeError):
            errors.append(f"Row {row_num}: 'start_age' must be an integer")

    elif import_type == "expenses":
        if not row.get("name", "").strip():
            errors.append(f"Row {row_num}: 'name' is required")
        try:
            int(float(row.get("start_age", "")))
        except (ValueError, TypeError):
            errors.append(f"Row {row_num}: 'start_age' must be an integer")

    return errors


# ─── Import functions ─────────────────────────────────────────────────────────

def import_accounts(rows: list, scenario_id: int, db: Session, overwrite: bool = False) -> int:
    """Import account rows into the database. Returns count of records saved."""
    if overwrite:
        db.query(Account).filter(Account.scenario_id == scenario_id).delete()
        db.flush()

    imported = 0
    for row in rows:
        account = Account(
            scenario_id=scenario_id,
            name=row.get("name", "").strip(),
            account_type=row.get("account_type", "other").strip(),
            tax_treatment=row.get("tax_treatment", "taxable").strip(),
            institution=row.get("institution", "").strip(),
            owner=row.get("owner", "self").strip(),
            current_balance=_to_float(row.get("current_balance"), 0.0),
            annual_contribution=_to_float(row.get("annual_contribution"), 0.0),
            employer_match_percent=_to_float(row.get("employer_match_percent"), 0.0),
            expected_annual_return_percent=_to_float(row.get("expected_annual_return_percent"), 7.0),
            dividend_yield_percent=_to_float(row.get("dividend_yield_percent"), 0.0),
            contribution_stop_age=_to_int(row.get("contribution_stop_age")),
            withdrawal_priority=_to_int(row.get("withdrawal_priority"), 5),
            include_in_projection=_to_bool(row.get("include_in_projection", True)),
            spend_dividends_in_retirement=_to_bool(row.get("spend_dividends_in_retirement", False)),
            starting_monthly_income=_to_float(row.get("starting_monthly_income")) if row.get("starting_monthly_income", "").strip() else None,
            income_start_age=_to_int(row.get("income_start_age")),
            income_end_age=_to_int(row.get("income_end_age")),
            cola_percent=_to_float(row.get("cola_percent"), 0.0),
            notes=row.get("notes", "").strip(),
        )
        db.add(account)
        imported += 1

    db.commit()
    return imported


def import_income_streams(rows: list, scenario_id: int, db: Session, overwrite: bool = False) -> int:
    from app.models.models import IncomeStream
    if overwrite:
        db.query(IncomeStream).filter(IncomeStream.scenario_id == scenario_id).delete()
        db.flush()

    imported = 0
    for row in rows:
        stream = IncomeStream(
            scenario_id=scenario_id,
            name=row.get("name", "").strip(),
            stream_type=row.get("stream_type", "other").strip(),
            start_age=_to_int(row.get("start_age"), 65),
            end_age=_to_int(row.get("end_age")),
            annual_amount=_to_float(row.get("annual_amount"), 0.0),
            is_monthly=_to_bool(row.get("is_monthly", True)),
            cola_percent=_to_float(row.get("cola_percent"), 0.0),
            is_taxable=_to_bool(row.get("is_taxable", True)),
            is_partially_taxable=_to_bool(row.get("is_partially_taxable", False)),
            notes=row.get("notes", "").strip(),
        )
        db.add(stream)
        imported += 1

    db.commit()
    return imported


def import_expenses(rows: list, scenario_id: int, db: Session, overwrite: bool = False) -> int:
    from app.models.models import ExpenseItem
    if overwrite:
        db.query(ExpenseItem).filter(ExpenseItem.scenario_id == scenario_id).delete()
        db.flush()

    imported = 0
    for row in rows:
        expense = ExpenseItem(
            scenario_id=scenario_id,
            name=row.get("name", "").strip(),
            category=row.get("category", "core").strip(),
            annual_amount=_to_float(row.get("annual_amount"), 0.0),
            is_monthly=_to_bool(row.get("is_monthly", False)),
            start_age=_to_int(row.get("start_age"), 52),
            end_age=_to_int(row.get("end_age")),
            inflation_linked=_to_bool(row.get("inflation_linked", True)),
            custom_inflation_rate=_to_float(row.get("custom_inflation_rate")) if row.get("custom_inflation_rate", "").strip() else None,
            is_essential=_to_bool(row.get("is_essential", True)),
            notes=row.get("notes", "").strip(),
        )
        db.add(expense)
        imported += 1

    db.commit()
    return imported


def import_assumptions(rows: list, scenario_id: int, db: Session, overwrite: bool = False) -> int:
    """Import a single row of assumptions (only first row is used)."""
    if not rows:
        return 0

    row = rows[0]
    existing = db.query(AssumptionSet).filter(AssumptionSet.scenario_id == scenario_id).first()

    if existing:
        for col in ASSUMPTION_COLUMNS:
            val = row.get(col)
            if val is not None and str(val).strip() != "":
                if col in ("rmd_enabled", "roth_conversion_enabled", "bear_market_stress_test", "sequence_of_returns_stress"):
                    setattr(existing, col, _to_bool(val))
                elif col in ("spending_reduction_age", "medical_increase_age"):
                    setattr(existing, col, _to_int(val))
                elif col in ("active_return_scenario", "withdrawal_strategy"):
                    setattr(existing, col, str(val).strip())
                else:
                    setattr(existing, col, _to_float(val))
        db.commit()
        return 1
    else:
        assumptions = AssumptionSet(
            scenario_id=scenario_id,
            baseline_return=_to_float(row.get("baseline_return"), 7.0),
            conservative_return=_to_float(row.get("conservative_return"), 4.0),
            aggressive_return=_to_float(row.get("aggressive_return"), 10.0),
            inflation_rate=_to_float(row.get("inflation_rate"), 0.03),
            healthcare_inflation_rate=_to_float(row.get("healthcare_inflation_rate"), 0.05),
            federal_tax_rate=_to_float(row.get("federal_tax_rate"), 0.22),
            state_tax_rate=_to_float(row.get("state_tax_rate"), 0.05),
            qualified_dividend_rate=_to_float(row.get("qualified_dividend_rate"), 0.15),
            long_term_capital_gains_rate=_to_float(row.get("long_term_capital_gains_rate"), 0.15),
            social_security_taxable_percent=_to_float(row.get("social_security_taxable_percent"), 0.85),
            rmd_enabled=_to_bool(row.get("rmd_enabled", True)),
            roth_conversion_enabled=_to_bool(row.get("roth_conversion_enabled", False)),
            spending_reduction_age=_to_int(row.get("spending_reduction_age")),
            spending_reduction_percent=_to_float(row.get("spending_reduction_percent"), 0.0),
            medical_increase_age=_to_int(row.get("medical_increase_age")),
            medical_increase_percent=_to_float(row.get("medical_increase_percent"), 0.0),
            bear_market_stress_test=_to_bool(row.get("bear_market_stress_test", False)),
            sequence_of_returns_stress=_to_bool(row.get("sequence_of_returns_stress", False)),
            active_return_scenario=str(row.get("active_return_scenario", "baseline")).strip(),
            withdrawal_strategy=str(row.get("withdrawal_strategy", "taxable_first")).strip(),
        )
        db.add(assumptions)
        db.commit()
        return 1


# ─── Export functions ─────────────────────────────────────────────────────────

def export_accounts(scenario_id: int, db: Session) -> str:
    accounts = db.query(Account).filter(Account.scenario_id == scenario_id).all()
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=ACCOUNT_COLUMNS)
    writer.writeheader()
    for acc in accounts:
        writer.writerow({
            "name": acc.name,
            "account_type": acc.account_type,
            "tax_treatment": acc.tax_treatment,
            "institution": acc.institution or "",
            "owner": acc.owner,
            "current_balance": acc.current_balance,
            "annual_contribution": acc.annual_contribution,
            "employer_match_percent": acc.employer_match_percent,
            "expected_annual_return_percent": acc.expected_annual_return_percent,
            "dividend_yield_percent": acc.dividend_yield_percent,
            "contribution_stop_age": acc.contribution_stop_age or "",
            "withdrawal_priority": acc.withdrawal_priority,
            "include_in_projection": acc.include_in_projection,
            "spend_dividends_in_retirement": acc.spend_dividends_in_retirement,
            "starting_monthly_income": acc.starting_monthly_income or "",
            "income_start_age": acc.income_start_age or "",
            "income_end_age": acc.income_end_age or "",
            "cola_percent": acc.cola_percent,
            "notes": acc.notes or "",
        })
    return output.getvalue()


def export_income_streams(scenario_id: int, db: Session) -> str:
    from app.models.models import IncomeStream
    streams = db.query(IncomeStream).filter(IncomeStream.scenario_id == scenario_id).all()
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=INCOME_COLUMNS)
    writer.writeheader()
    for s in streams:
        writer.writerow({
            "name": s.name,
            "stream_type": s.stream_type,
            "start_age": s.start_age,
            "end_age": s.end_age or "",
            "annual_amount": s.annual_amount,
            "is_monthly": s.is_monthly,
            "cola_percent": s.cola_percent,
            "is_taxable": s.is_taxable,
            "is_partially_taxable": s.is_partially_taxable,
            "notes": s.notes or "",
        })
    return output.getvalue()


def export_expenses(scenario_id: int, db: Session) -> str:
    from app.models.models import ExpenseItem
    expenses = db.query(ExpenseItem).filter(ExpenseItem.scenario_id == scenario_id).all()
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=EXPENSE_COLUMNS)
    writer.writeheader()
    for e in expenses:
        writer.writerow({
            "name": e.name,
            "category": e.category,
            "annual_amount": e.annual_amount,
            "is_monthly": e.is_monthly,
            "start_age": e.start_age,
            "end_age": e.end_age or "",
            "inflation_linked": e.inflation_linked,
            "custom_inflation_rate": e.custom_inflation_rate or "",
            "is_essential": e.is_essential,
            "notes": e.notes or "",
        })
    return output.getvalue()


def get_template_csv(import_type: str) -> str:
    """Return an empty CSV template with headers for the given import type."""
    columns = COLUMNS_MAP.get(import_type, [])
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(columns)
    # Write one example row to help the user understand the format
    if import_type == "accounts":
        writer.writerow([
            "Work 401k", "401k", "tax_deferred", "Fidelity", "self",
            "292396", "21000", "8", "7.0", "0", "", "3", "TRUE", "FALSE",
            "", "", "", "0", "",
        ])
    elif import_type == "income":
        writer.writerow(["Pension", "pension", "60", "", "2500", "TRUE", "2.0", "TRUE", "FALSE", ""])
    elif import_type == "expenses":
        writer.writerow(["Housing", "core", "36000", "FALSE", "52", "", "TRUE", "", "TRUE", ""])
    elif import_type == "assumptions":
        writer.writerow([
            "7.0", "4.0", "10.0", "0.03", "0.05", "0.22", "0.05",
            "0.15", "0.15", "0.85", "TRUE", "FALSE", "", "0.0",
            "", "0.0", "FALSE", "FALSE", "baseline", "taxable_first",
        ])
    elif import_type == "events":
        writer.writerow(["Home Renovation", "65", "50000", "FALSE", "Major kitchen remodel"])
    return output.getvalue()
