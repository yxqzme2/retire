from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.models import IncomeStream
from app.schemas.schemas import IncomeStreamCreate, IncomeStreamRead, IncomeStreamUpdate

router = APIRouter(prefix="/income", tags=["income"])


@router.get("/", response_model=List[IncomeStreamRead])
def list_income_streams(scenario_id: int = None, db: Session = Depends(get_db)):
    q = db.query(IncomeStream)
    if scenario_id is not None:
        q = q.filter(IncomeStream.scenario_id == scenario_id)
    return q.order_by(IncomeStream.start_age).all()


@router.get("/{stream_id}", response_model=IncomeStreamRead)
def get_income_stream(stream_id: int, db: Session = Depends(get_db)):
    stream = db.query(IncomeStream).filter(IncomeStream.id == stream_id).first()
    if not stream:
        raise HTTPException(status_code=404, detail="Income stream not found")
    return stream


@router.post("/", response_model=IncomeStreamRead, status_code=201)
def create_income_stream(data: IncomeStreamCreate, db: Session = Depends(get_db)):
    stream = IncomeStream(**data.model_dump())
    db.add(stream)
    db.commit()
    db.refresh(stream)
    return stream


@router.put("/{stream_id}", response_model=IncomeStreamRead)
def update_income_stream(stream_id: int, data: IncomeStreamUpdate, db: Session = Depends(get_db)):
    stream = db.query(IncomeStream).filter(IncomeStream.id == stream_id).first()
    if not stream:
        raise HTTPException(status_code=404, detail="Income stream not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(stream, field, value)
    db.commit()
    db.refresh(stream)
    return stream


@router.delete("/{stream_id}", status_code=204)
def delete_income_stream(stream_id: int, db: Session = Depends(get_db)):
    stream = db.query(IncomeStream).filter(IncomeStream.id == stream_id).first()
    if not stream:
        raise HTTPException(status_code=404, detail="Income stream not found")
    db.delete(stream)
    db.commit()
