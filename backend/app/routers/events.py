from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.models import OneTimeEvent
from app.schemas.schemas import OneTimeEventCreate, OneTimeEventRead, OneTimeEventUpdate

router = APIRouter(prefix="/events", tags=["events"])


@router.get("/", response_model=List[OneTimeEventRead])
def list_events(scenario_id: int = None, db: Session = Depends(get_db)):
    q = db.query(OneTimeEvent)
    if scenario_id is not None:
        q = q.filter(OneTimeEvent.scenario_id == scenario_id)
    return q.order_by(OneTimeEvent.age).all()


@router.get("/{event_id}", response_model=OneTimeEventRead)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(OneTimeEvent).filter(OneTimeEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.post("/", response_model=OneTimeEventRead, status_code=201)
def create_event(data: OneTimeEventCreate, db: Session = Depends(get_db)):
    event = OneTimeEvent(**data.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.put("/{event_id}", response_model=OneTimeEventRead)
def update_event(event_id: int, data: OneTimeEventUpdate, db: Session = Depends(get_db)):
    event = db.query(OneTimeEvent).filter(OneTimeEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(event, field, value)
    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}", status_code=204)
def delete_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(OneTimeEvent).filter(OneTimeEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
