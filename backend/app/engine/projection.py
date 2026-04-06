"""
Retirement Projection Engine
============================

Runs a year-by-year simulation from the profile's current_age to
projection_end_age. Each year follows this sequence:

1.  Grow account balances by the chosen return rate.
2.  Apply contributions (pre-retirement only; stop at contribution_stop_age).
3.  Collect income streams that are active this year.
4.  Collect dividend income from dividend-paying accounts (in retirement).
5.  Inflate and sum annual expenses.
6.  Apply one-time events (windfalls or large expenditures).
7.  Compute portfolio withdrawal needed after passive income.
8.  Execute withdrawal across accounts per strategy.
9.  Calculate taxes on taxable income.
10. Compute net cash flow and flag shortfalls.
11. Append YearResult to results list.
"""

from dataclasses import dataclass
from typing import Optional

from app.engine.tax import (
    calculate_federal_tax,
    calculate_ss_taxation,
    calculate_qualified_dividend_tax,
    calculate_state_tax,
)
from app.engine.withdrawal import calculate_withdrawal_need
from app.engine.spending import calculate_annual_expenses


BASE_YEAR = 2024  # Year corresponding to age 0 offset


@dataclass
class YearResult:
    age: int
    year: int
    total_income: float
    pension_income: float
    ss_income: float
    dividend_income: float
    other_income: float
    portfolio_withdrawal: float
    total_expenses: float
    federal_tax: float
    state_tax: float
    net_cash_flow: float
    total_portfolio_value: float
    roth_balance: float
    pretax_balance: float
    taxable_balance: float
    cash_balance: float
    is_shortfall: bool


def get_return_rate(assumptions) -> float:
    """Return the annual return rate (as a percentage, e.g. 7.0 for 7%) based on active scenario."""
    scenario = getattr(assumptions, "active_return_scenario", "baseline")
    if scenario == "conservative":
        return assumptions.conservative_return
    elif scenario == "aggressive":
        return assumptions.aggressive_return
    return assumptions.baseline_return


def _bucket_balances(accounts: list, account_balances: dict) -> tuple:
    """Compute (roth, pretax, taxable, cash) bucket totals from current balances."""
    roth = sum(
        account_balances.get(a.id, 0.0)
        for a in accounts
        if a.tax_treatment == "tax_free"
    )
    pretax = sum(
        account_balances.get(a.id, 0.0)
        for a in accounts
        if a.tax_treatment == "tax_deferred"
    )
    taxable = sum(
        account_balances.get(a.id, 0.0)
        for a in accounts
        if a.tax_treatment in ("taxable", "partially_taxable")
        and a.account_type not in ("social_security", "pension")
    )
    cash = sum(
        account_balances.get(a.id, 0.0)
        for a in accounts
        if a.account_type == "cash_hysa"
    )
    return roth, pretax, taxable, cash


def run_projection(
    profile,
    accounts: list,
    income_streams: list,
    expense_items: list,
    one_time_events: list,
    assumptions,
) -> list:
    """
    Run a full year-by-year retirement projection.

    Args:
        profile:          Profile ORM object.
        accounts:         List of Account ORM objects.
        income_streams:   List of IncomeStream ORM objects.
        expense_items:    List of ExpenseItem ORM objects.
        one_time_events:  List of OneTimeEvent ORM objects.
        assumptions:      AssumptionSet ORM object.

    Returns:
        List of YearResult dataclass instances, one per age from
        profile.current_age to profile.projection_end_age (inclusive).
    """
    results: list[YearResult] = []

    # Initialize mutable account balances
    account_balances: dict[int, float] = {
        a.id: a.current_balance for a in accounts if a.include_in_projection
    }

    annual_return_pct = get_return_rate(assumptions)  # e.g. 7.0

    base_age = profile.current_age

    for age in range(profile.current_age, profile.projection_end_age + 1):
        year = BASE_YEAR + (age - base_age)
        is_retired = age >= profile.retirement_age

        # ── Step 1: Grow account balances ────────────────────────────────────
        for account in accounts:
            if not account.include_in_projection:
                continue
            # Pension and SS are modeled as income streams, not growing portfolios
            if account.account_type in ("pension", "social_security"):
                continue
            rate = annual_return_pct / 100.0
            account_balances[account.id] = account_balances.get(account.id, 0.0) * (1.0 + rate)

        # ── Step 2: Contributions (pre-retirement only) ───────────────────────
        if not is_retired:
            for account in accounts:
                if not account.include_in_projection:
                    continue
                if account.annual_contribution <= 0:
                    continue
                if account.account_type in ("pension", "social_security"):
                    continue
                stop_age = account.contribution_stop_age or profile.retirement_age
                if age < stop_age:
                    employee_contrib = account.annual_contribution
                    employer_match = employee_contrib * (account.employer_match_percent / 100.0)
                    account_balances[account.id] = (
                        account_balances.get(account.id, 0.0) + employee_contrib + employer_match
                    )

        # ── Step 3: Income streams ────────────────────────────────────────────
        pension_income = 0.0
        ss_income = 0.0
        other_income = 0.0

        for stream in income_streams:
            if age < stream.start_age:
                continue
            if stream.end_age is not None and age > stream.end_age:
                continue

            years_active = age - stream.start_age
            cola_factor = (1.0 + stream.cola_percent / 100.0) ** years_active
            annual = stream.annual_amount * cola_factor

            if stream.stream_type == "pension":
                pension_income += annual
            elif stream.stream_type == "social_security":
                ss_income += annual
            else:
                other_income += annual

        # ── Step 4: Dividend income ───────────────────────────────────────────
        dividend_income = 0.0
        if is_retired:
            for account in accounts:
                if not account.include_in_projection:
                    continue
                if not account.spend_dividends_in_retirement:
                    continue
                if account.dividend_yield_percent <= 0:
                    continue
                bal = account_balances.get(account.id, 0.0)
                div = bal * (account.dividend_yield_percent / 100.0)
                dividend_income += div

        # ── Step 5: Expenses ──────────────────────────────────────────────────
        total_expenses = calculate_annual_expenses(
            expense_items=expense_items,
            current_age=age,
            base_inflation=assumptions.inflation_rate,
            healthcare_inflation=assumptions.healthcare_inflation_rate,
            base_age=base_age,
            spending_reduction_age=assumptions.spending_reduction_age,
            spending_reduction_percent=assumptions.spending_reduction_percent,
            medical_increase_age=assumptions.medical_increase_age,
            medical_increase_percent=assumptions.medical_increase_percent,
        )

        # ── Step 6: One-time events ───────────────────────────────────────────
        for event in one_time_events:
            if event.age == age:
                if event.is_inflow:
                    other_income += event.amount
                else:
                    total_expenses += event.amount

        # ── Step 7: Determine portfolio withdrawal needed ──────────────────────
        total_passive_income = pension_income + ss_income + other_income + dividend_income
        withdrawal_needed = max(0.0, total_expenses - total_passive_income)

        # ── Step 8: Execute withdrawals ───────────────────────────────────────
        portfolio_withdrawal = 0.0
        withdrawal_result: dict[int, float] = {}

        if is_retired and withdrawal_needed > 0:
            withdrawal_result = calculate_withdrawal_need(
                spending_need=withdrawal_needed,
                income_available=0.0,  # already factored into withdrawal_needed
                accounts=accounts,
                strategy=assumptions.withdrawal_strategy,
                current_age=age,
                assumptions=assumptions,
                account_balances=account_balances,
            )
            portfolio_withdrawal = sum(withdrawal_result.values())
            # Deduct withdrawals from each account
            for account_id, amount in withdrawal_result.items():
                current = account_balances.get(account_id, 0.0)
                account_balances[account_id] = max(0.0, current - amount)

        # Recompute bucket balances after withdrawals
        roth_bal, pretax_bal, taxable_bal, cash_bal = _bucket_balances(accounts, account_balances)

        # ── Step 9: Taxes ─────────────────────────────────────────────────────
        # Taxable income = pre-tax withdrawals + pension + SS (taxable portion) + other income
        pretax_withdrawal_amount = sum(
            amount
            for account_id, amount in withdrawal_result.items()
            if _get_account(accounts, account_id) is not None
            and _get_account(accounts, account_id).tax_treatment == "tax_deferred"
        )

        gross_ordinary = pretax_withdrawal_amount + pension_income + other_income

        # SS taxation (depends on provisional income)
        taxable_ss = calculate_ss_taxation(
            ss_income=ss_income,
            other_income=gross_ordinary,
            filing_status=profile.filing_status,
        )

        total_ordinary_income = gross_ordinary + taxable_ss

        # Federal tax on ordinary income
        federal_tax = calculate_federal_tax(
            taxable_income=total_ordinary_income,
            filing_status=profile.filing_status,
            year=year,
            base_year=BASE_YEAR,
            inflation_rate=assumptions.inflation_rate,
        )

        # Qualified dividend tax (separate preferential rates)
        div_tax = calculate_qualified_dividend_tax(
            dividends=dividend_income,
            total_ordinary_income=total_ordinary_income,
            filing_status=profile.filing_status,
            year=year,
        )

        federal_tax += div_tax

        state_tax = calculate_state_tax(
            income=total_ordinary_income + dividend_income,
            state_rate=assumptions.state_tax_rate,
        )

        # ── Step 10: Net cash flow and shortfall ──────────────────────────────
        total_income = total_passive_income + portfolio_withdrawal
        net_cash_flow = total_income - total_expenses - federal_tax - state_tax

        total_portfolio = roth_bal + pretax_bal + taxable_bal + cash_bal
        is_shortfall = total_portfolio <= 0.0 and withdrawal_needed > 0.0

        results.append(
            YearResult(
                age=age,
                year=year,
                total_income=total_income,
                pension_income=pension_income,
                ss_income=ss_income,
                dividend_income=dividend_income,
                other_income=other_income,
                portfolio_withdrawal=portfolio_withdrawal,
                total_expenses=total_expenses,
                federal_tax=federal_tax,
                state_tax=state_tax,
                net_cash_flow=net_cash_flow,
                total_portfolio_value=total_portfolio,
                roth_balance=roth_bal,
                pretax_balance=pretax_bal,
                taxable_balance=taxable_bal,
                cash_balance=cash_bal,
                is_shortfall=is_shortfall,
            )
        )

    return results


def _get_account(accounts: list, account_id: int):
    """Find an account by id in a list."""
    for a in accounts:
        if a.id == account_id:
            return a
    return None
