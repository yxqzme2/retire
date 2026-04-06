from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.models import ExpenseItem
from app.schemas.schemas import ExpenseItemCreate, ExpenseItemRead, ExpenseItemUpdate

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.get("/", response_model=List[ExpenseItemRead])
def list_expenses(scenario_id: int = None, db: Session = Depends(get_db)):
    q = db.query(ExpenseItem)
    if scenario_id is not None:
        q = q.filter(ExpenseItem.scenario_id == scenario_id)
    return q.order_by(ExpenseItem.category, ExpenseItem.name).all()


@router.get("/{expense_id}", response_model=ExpenseItemRead)
def get_expense(expense_id: int, db: Session = Depends(get_db)):
    expense = db.query(ExpenseItem).filter(ExpenseItem.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@router.post("/", response_model=ExpenseItemRead, status_code=201)
def create_expense(data: ExpenseItemCreate, db: Session = Depends(get_db)):
    expense = ExpenseItem(**data.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.put("/{expense_id}", response_model=ExpenseItemRead)
def update_expense(expense_id: int, data: ExpenseItemUpdate, db: Session = Depends(get_db)):
    expense = db.query(ExpenseItem).filter(ExpenseItem.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(expense, field, value)
    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}", status_code=204)
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    expense = db.query(ExpenseItem).filter(ExpenseItem.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()
