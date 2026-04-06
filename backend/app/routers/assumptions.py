from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import AssumptionSet
from app.schemas.schemas import AssumptionSetCreate, AssumptionSetRead, AssumptionSetUpdate

router = APIRouter(prefix="/assumptions", tags=["assumptions"])


@router.get("/scenario/{scenario_id}", response_model=AssumptionSetRead)
def get_assumptions(scenario_id: int, db: Session = Depends(get_db)):
    assumptions = db.query(AssumptionSet).filter(AssumptionSet.scenario_id == scenario_id).first()
    if not assumptions:
        raise HTTPException(status_code=404, detail="Assumption set not found for this scenario")
    return assumptions


@router.post("/", response_model=AssumptionSetRead, status_code=201)
def create_assumptions(data: AssumptionSetCreate, db: Session = Depends(get_db)):
    # Only one assumption set per scenario
    existing = db.query(AssumptionSet).filter(AssumptionSet.scenario_id == data.scenario_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Assumption set already exists for this scenario. Use PUT to update.")
    assumptions = AssumptionSet(**data.model_dump())
    db.add(assumptions)
    db.commit()
    db.refresh(assumptions)
    return assumptions


@router.put("/scenario/{scenario_id}", response_model=AssumptionSetRead)
def update_assumptions(scenario_id: int, data: AssumptionSetUpdate, db: Session = Depends(get_db)):
    assumptions = db.query(AssumptionSet).filter(AssumptionSet.scenario_id == scenario_id).first()
    if not assumptions:
        raise HTTPException(status_code=404, detail="Assumption set not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(assumptions, field, value)
    db.commit()
    db.refresh(assumptions)
    return assumptions


@router.delete("/scenario/{scenario_id}", status_code=204)
def delete_assumptions(scenario_id: int, db: Session = Depends(get_db)):
    assumptions = db.query(AssumptionSet).filter(AssumptionSet.scenario_id == scenario_id).first()
    if not assumptions:
        raise HTTPException(status_code=404, detail="Assumption set not found")
    db.delete(assumptions)
    db.commit()
