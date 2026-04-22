from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.models import Scenario, ProjectionResult, AssumptionSet
from app.schemas.schemas import ProjectionResultRead, ProjectionSummary
from app.engine.projection import run_projection

router = APIRouter(prefix="/projections", tags=["projections"])


@router.post("/scenarios/{scenario_id}/run", status_code=200)
def run_scenario_projection(scenario_id: int, db: Session = Depends(get_db)):
    """
    Run the projection engine for a scenario. Clears previous results and stores
    new year-by-year results. Returns the summary.
    """
    scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    profile = scenario.profile
    if not profile:
        raise HTTPException(status_code=400, detail="Scenario has no associated profile")

    assumptions = scenario.assumption_set
    if not assumptions:
        # Create default assumptions if missing
        assumptions = AssumptionSet(scenario_id=scenario_id)
        db.add(assumptions)
        db.commit()
        db.refresh(assumptions)

    # Run the projection engine
    try:
        year_results = run_projection(
            profile=profile,
            accounts=scenario.accounts,
            income_streams=scenario.income_streams,
            expense_items=scenario.expenses,
            one_time_events=scenario.one_time_events,
            assumptions=assumptions,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Projection engine error: {str(e)}")

    # Clear previous results
    db.query(ProjectionResult).filter(ProjectionResult.scenario_id == scenario_id).delete()

    # Store new results
    for yr in year_results:
        result = ProjectionResult(
            scenario_id=scenario_id,
            age=yr.age,
            year=yr.year,
            total_income=yr.total_income,
            pension_income=yr.pension_income,
            ss_income=yr.ss_income,
            dividend_income=yr.dividend_income,
            portfolio_withdrawal=yr.portfolio_withdrawal,
            total_expenses=yr.total_expenses,
            federal_tax=yr.federal_tax,
            state_tax=yr.state_tax,
            net_cash_flow=yr.net_cash_flow,
            total_portfolio_value=yr.total_portfolio_value,
            roth_balance=yr.roth_balance,
            pretax_balance=yr.pretax_balance,
            taxable_balance=yr.taxable_balance,
            cash_balance=yr.cash_balance,
            is_shortfall=yr.is_shortfall,
        )
        db.add(result)

    # Update scenario status and projection timestamp
    scenario.status = _determine_status(year_results, profile.retirement_age)
    scenario.last_projected_at = datetime.utcnow()
    db.commit()

    # Return summary
    return _build_summary(year_results, profile.retirement_age, scenario_id)


@router.get("/scenarios/{scenario_id}/results", response_model=List[ProjectionResultRead])
def get_projection_results(scenario_id: int, db: Session = Depends(get_db)):
    results = (
        db.query(ProjectionResult)
        .filter(ProjectionResult.scenario_id == scenario_id)
        .order_by(ProjectionResult.age)
        .all()
    )
    return results


@router.get("/scenarios/{scenario_id}/summary", response_model=ProjectionSummary)
def get_projection_summary(scenario_id: int, db: Session = Depends(get_db)):
    scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    results = (
        db.query(ProjectionResult)
        .filter(ProjectionResult.scenario_id == scenario_id)
        .order_by(ProjectionResult.age)
        .all()
    )
    if not results:
        raise HTTPException(status_code=404, detail="No projection results found. Run the projection first.")

    profile = scenario.profile
    from app.engine.projection import YearResult
    year_results = [
        YearResult(
            age=r.age,
            year=r.year,
            total_income=r.total_income,
            pension_income=r.pension_income,
            ss_income=r.ss_income,
            dividend_income=r.dividend_income,
            other_income=0.0,
            portfolio_withdrawal=r.portfolio_withdrawal,
            total_expenses=r.total_expenses,
            federal_tax=r.federal_tax,
            state_tax=r.state_tax,
            net_cash_flow=r.net_cash_flow,
            total_portfolio_value=r.total_portfolio_value,
            roth_balance=r.roth_balance,
            pretax_balance=r.pretax_balance,
            taxable_balance=r.taxable_balance,
            cash_balance=r.cash_balance,
            is_shortfall=r.is_shortfall,
        )
        for r in results
    ]

    return _build_summary(year_results, profile.retirement_age, scenario_id)


def _determine_status(results: list, retirement_age: int) -> str:
    """Determine scenario status from projection results."""
    if not results:
        return "unknown"

    has_shortfall = any(r.is_shortfall for r in results)
    shortfall_results = [r for r in results if r.is_shortfall]

    if not has_shortfall:
        return "on_track"

    # If shortfall occurs only after age 85, borderline; earlier = off_track
    first_shortfall_age = min(r.age for r in shortfall_results)
    if first_shortfall_age >= 85:
        return "borderline"
    return "off_track"


def _build_summary(results: list, retirement_age: int, scenario_id: int) -> ProjectionSummary:
    """Build aggregated summary data from year results."""
    if not results:
        return ProjectionSummary(
            portfolio_at_retirement=0,
            monthly_retirement_income=0,
            monthly_spending_target=0,
            surplus_or_gap=0,
            first_shortfall_age=None,
            portfolio_survival_age=None,
            total_tax_drag=0,
            scenario_status="unknown",
            years_of_data=0,
            retirement_age=retirement_age,
        )

    # Portfolio at retirement age
    retirement_result = next((r for r in results if r.age == retirement_age), results[0])
    portfolio_at_retirement = retirement_result.total_portfolio_value

    # Monthly income and spending in first year of retirement
    monthly_income = retirement_result.total_income / 12
    monthly_spending = retirement_result.total_expenses / 12
    surplus = retirement_result.net_cash_flow / 12

    # First shortfall age
    shortfalls = [r for r in results if r.is_shortfall]
    first_shortfall_age = min(r.age for r in shortfalls) if shortfalls else None

    # Portfolio survival age (last age with positive portfolio)
    positive_portfolio = [r for r in results if r.total_portfolio_value > 0]
    portfolio_survival_age = max(r.age for r in positive_portfolio) if positive_portfolio else retirement_age

    # Total tax drag (sum of all taxes across retirement years)
    retirement_results = [r for r in results if r.age >= retirement_age]
    total_tax_drag = sum(r.federal_tax + r.state_tax for r in retirement_results)

    status = _determine_status(results, retirement_age)

    return ProjectionSummary(
        portfolio_at_retirement=portfolio_at_retirement,
        monthly_retirement_income=monthly_income,
        monthly_spending_target=monthly_spending,
        surplus_or_gap=surplus,
        first_shortfall_age=first_shortfall_age,
        portfolio_survival_age=portfolio_survival_age,
        total_tax_drag=total_tax_drag,
        scenario_status=status,
        years_of_data=len(results),
        retirement_age=retirement_age,
    )
