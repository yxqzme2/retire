import copy
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.models import (
    Scenario, Account, IncomeStream, ExpenseItem, OneTimeEvent, AssumptionSet
)
from app.schemas.schemas import (
    ScenarioCreate, ScenarioRead, ScenarioUpdate, ScenarioSummary
)

router = APIRouter(prefix="/scenarios", tags=["scenarios"])


@router.get("/", response_model=List[ScenarioSummary])
def list_scenarios(profile_id: int = None, db: Session = Depends(get_db)):
    q = db.query(Scenario)
    if profile_id:
        q = q.filter(Scenario.profile_id == profile_id)
    return q.all()


@router.get("/{scenario_id}", response_model=ScenarioRead)
def get_scenario(scenario_id: int, db: Session = Depends(get_db)):
    scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return scenario


@router.post("/", response_model=ScenarioRead, status_code=201)
def create_scenario(data: ScenarioCreate, db: Session = Depends(get_db)):
    scenario = Scenario(**data.model_dump())
    db.add(scenario)
    db.commit()
    db.refresh(scenario)

    # Auto-create a default assumption set
    assumption = AssumptionSet(scenario_id=scenario.id)
    db.add(assumption)
    db.commit()
    db.refresh(scenario)
    return scenario


@router.put("/{scenario_id}", response_model=ScenarioRead)
def update_scenario(scenario_id: int, data: ScenarioUpdate, db: Session = Depends(get_db)):
    scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(scenario, field, value)
    db.commit()
    db.refresh(scenario)
    return scenario


@router.delete("/{scenario_id}", status_code=204)
def delete_scenario(scenario_id: int, db: Session = Depends(get_db)):
    scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    db.delete(scenario)
    db.commit()


@router.post("/{scenario_id}/duplicate", response_model=ScenarioRead, status_code=201)
def duplicate_scenario(scenario_id: int, db: Session = Depends(get_db)):
    """Create a deep copy of a scenario including all its child data."""
    source = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Scenario not found")

    # Create new scenario
    new_scenario = Scenario(
        name=f"{source.name} (Copy)",
        description=source.description,
        is_base_case=False,
        status="unknown",
        profile_id=source.profile_id,
    )
    db.add(new_scenario)
    db.flush()

    # Copy accounts
    for acc in source.accounts:
        new_acc = Account(
            scenario_id=new_scenario.id,
            account_id_code=acc.account_id_code,
            name=acc.name,
            account_type=acc.account_type,
            tax_treatment=acc.tax_treatment,
            institution=acc.institution,
            owner=acc.owner,
            current_balance=acc.current_balance,
            annual_contribution=acc.annual_contribution,
            employer_match_percent=acc.employer_match_percent,
            expected_annual_return_percent=acc.expected_annual_return_percent,
            dividend_yield_percent=acc.dividend_yield_percent,
            contribution_stop_age=acc.contribution_stop_age,
            withdrawal_priority=acc.withdrawal_priority,
            include_in_projection=acc.include_in_projection,
            spend_dividends_in_retirement=acc.spend_dividends_in_retirement,
            starting_monthly_income=acc.starting_monthly_income,
            income_start_age=acc.income_start_age,
            income_end_age=acc.income_end_age,
            cola_percent=acc.cola_percent,
            notes=acc.notes,
        )
        db.add(new_acc)

    # Copy income streams
    for stream in source.income_streams:
        new_stream = IncomeStream(
            scenario_id=new_scenario.id,
            name=stream.name,
            stream_type=stream.stream_type,
            start_age=stream.start_age,
            end_age=stream.end_age,
            annual_amount=stream.annual_amount,
            is_monthly=stream.is_monthly,
            cola_percent=stream.cola_percent,
            is_taxable=stream.is_taxable,
            is_partially_taxable=stream.is_partially_taxable,
            notes=stream.notes,
        )
        db.add(new_stream)

    # Copy expense items
    for expense in source.expenses:
        new_expense = ExpenseItem(
            scenario_id=new_scenario.id,
            name=expense.name,
            category=expense.category,
            annual_amount=expense.annual_amount,
            is_monthly=expense.is_monthly,
            start_age=expense.start_age,
            end_age=expense.end_age,
            inflation_linked=expense.inflation_linked,
            custom_inflation_rate=expense.custom_inflation_rate,
            is_essential=expense.is_essential,
            notes=expense.notes,
        )
        db.add(new_expense)

    # Copy one-time events
    for event in source.one_time_events:
        new_event = OneTimeEvent(
            scenario_id=new_scenario.id,
            name=event.name,
            age=event.age,
            amount=event.amount,
            is_inflow=event.is_inflow,
            description=event.description,
        )
        db.add(new_event)

    # Copy assumption set
    if source.assumption_set:
        src_a = source.assumption_set
        new_assumptions = AssumptionSet(
            scenario_id=new_scenario.id,
            baseline_return=src_a.baseline_return,
            conservative_return=src_a.conservative_return,
            aggressive_return=src_a.aggressive_return,
            inflation_rate=src_a.inflation_rate,
            healthcare_inflation_rate=src_a.healthcare_inflation_rate,
            federal_tax_rate=src_a.federal_tax_rate,
            state_tax_rate=src_a.state_tax_rate,
            qualified_dividend_rate=src_a.qualified_dividend_rate,
            long_term_capital_gains_rate=src_a.long_term_capital_gains_rate,
            social_security_taxable_percent=src_a.social_security_taxable_percent,
            rmd_enabled=src_a.rmd_enabled,
            roth_conversion_enabled=src_a.roth_conversion_enabled,
            spending_reduction_age=src_a.spending_reduction_age,
            spending_reduction_percent=src_a.spending_reduction_percent,
            medical_increase_age=src_a.medical_increase_age,
            medical_increase_percent=src_a.medical_increase_percent,
            bear_market_stress_test=src_a.bear_market_stress_test,
            sequence_of_returns_stress=src_a.sequence_of_returns_stress,
            active_return_scenario=src_a.active_return_scenario,
            withdrawal_strategy=src_a.withdrawal_strategy,
        )
        db.add(new_assumptions)

    db.commit()
    db.refresh(new_scenario)
    return new_scenario
