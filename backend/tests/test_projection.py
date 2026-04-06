"""Tests for the projection engine."""
import pytest
from dataclasses import dataclass
from typing import Optional
from app.engine.projection import run_projection, YearResult
from app.engine.tax import calculate_federal_tax, calculate_ss_taxation
from app.engine.spending import calculate_annual_expenses


# ── Minimal mock objects ───────────────────────────────────────────────────────

@dataclass
class MockProfile:
    current_age: int = 52
    retirement_age: int = 60
    projection_end_age: int = 90
    filing_status: str = "married_filing_jointly"


@dataclass
class MockAccount:
    id: int
    name: str
    account_type: str
    tax_treatment: str
    current_balance: float
    annual_contribution: float = 0.0
    employer_match_percent: float = 0.0
    expected_annual_return_percent: float = 7.0
    dividend_yield_percent: float = 0.0
    contribution_stop_age: Optional[int] = None
    withdrawal_priority: int = 5
    include_in_projection: bool = True
    spend_dividends_in_retirement: bool = False
    starting_monthly_income: Optional[float] = None
    income_start_age: Optional[int] = None
    income_end_age: Optional[int] = None
    cola_percent: float = 0.0


@dataclass
class MockIncomeStream:
    id: int
    name: str
    stream_type: str
    start_age: int
    annual_amount: float
    end_age: Optional[int] = None
    is_monthly: bool = False
    cola_percent: float = 0.0
    is_taxable: bool = True
    is_partially_taxable: bool = False


@dataclass
class MockExpenseItem:
    id: int
    name: str
    category: str
    annual_amount: float
    start_age: int
    end_age: Optional[int] = None
    is_monthly: bool = False
    inflation_linked: bool = True
    custom_inflation_rate: Optional[float] = None
    is_essential: bool = True


@dataclass
class MockAssumptions:
    baseline_return: float = 7.0
    conservative_return: float = 4.0
    aggressive_return: float = 10.0
    inflation_rate: float = 0.03
    healthcare_inflation_rate: float = 0.05
    federal_tax_rate: float = 0.22
    state_tax_rate: float = 0.0
    qualified_dividend_rate: float = 0.15
    long_term_capital_gains_rate: float = 0.15
    social_security_taxable_percent: float = 0.85
    rmd_enabled: bool = True
    roth_conversion_enabled: bool = False
    spending_reduction_age: Optional[int] = None
    spending_reduction_percent: float = 0.0
    medical_increase_age: Optional[int] = None
    medical_increase_percent: float = 0.0
    bear_market_stress_test: bool = False
    sequence_of_returns_stress: bool = False
    active_return_scenario: str = "baseline"
    withdrawal_strategy: str = "taxable_first"


# ── Tests ──────────────────────────────────────────────────────────────────────

def test_projection_returns_correct_number_of_years():
    profile = MockProfile(current_age=52, projection_end_age=90)
    accounts = [MockAccount(id=1, name="401k", account_type="401k", tax_treatment="tax_deferred", current_balance=300000)]
    results = run_projection(profile, accounts, [], [], [], MockAssumptions())
    assert len(results) == 90 - 52 + 1  # 39 years


def test_projection_grows_portfolio_pre_retirement():
    profile = MockProfile(current_age=52, retirement_age=60, projection_end_age=65)
    accounts = [MockAccount(id=1, name="401k", account_type="401k", tax_treatment="tax_deferred", current_balance=100000)]
    results = run_projection(profile, accounts, [], [], [], MockAssumptions())

    # Portfolio should grow pre-retirement (no withdrawals, 7% return)
    age_55_result = next(r for r in results if r.age == 55)
    assert age_55_result.total_portfolio_value > 100000


def test_projection_with_income_stream():
    profile = MockProfile(current_age=60, retirement_age=60, projection_end_age=65)
    accounts = [MockAccount(id=1, name="Taxable", account_type="taxable_brokerage", tax_treatment="taxable", current_balance=500000)]
    income = [MockIncomeStream(id=1, name="Pension", stream_type="pension", start_age=60, annual_amount=30000)]
    expenses = [MockExpenseItem(id=1, name="Housing", category="core", annual_amount=36000, start_age=60)]

    results = run_projection(profile, accounts, income, expenses, [], MockAssumptions())
    first_year = results[0]

    assert first_year.pension_income == pytest.approx(30000, rel=0.01)
    assert first_year.total_expenses == pytest.approx(36000, rel=0.01)


def test_ss_taxation_mfj():
    # MFJ provisional income above upper threshold — 85% taxable
    taxable = calculate_ss_taxation(
        ss_income=38000,
        other_income=50000,
        filing_status="married_filing_jointly",
    )
    assert taxable == pytest.approx(38000 * 0.85, rel=0.01)


def test_ss_taxation_below_threshold():
    # Below lower threshold — 0% taxable
    taxable = calculate_ss_taxation(
        ss_income=10000,
        other_income=5000,  # provisional = 5000 + 5000 = 10000 < 32000
        filing_status="married_filing_jointly",
    )
    assert taxable == 0.0


def test_federal_tax_mfj():
    # MFJ with $80k taxable income (standard deduction ~$29k → net $51k)
    tax = calculate_federal_tax(80000, "married_filing_jointly", 2024)
    assert tax > 0
    assert tax < 80000 * 0.22  # Should be less than flat 22%


def test_expense_inflation():
    expenses = [MockExpenseItem(id=1, name="Housing", category="core", annual_amount=36000, start_age=52)]
    # After 10 years at 3% inflation
    inflated = calculate_annual_expenses(
        expense_items=expenses,
        current_age=62,
        base_inflation=0.03,
        healthcare_inflation=0.05,
        base_age=52,
        spending_reduction_age=None,
        spending_reduction_percent=0.0,
        medical_increase_age=None,
        medical_increase_percent=0.0,
    )
    expected = 36000 * (1.03 ** 10)
    assert inflated == pytest.approx(expected, rel=0.001)


def test_expense_not_started():
    expenses = [MockExpenseItem(id=1, name="Housing", category="core", annual_amount=36000, start_age=65)]
    amount = calculate_annual_expenses(
        expense_items=expenses,
        current_age=60,
        base_inflation=0.03,
        healthcare_inflation=0.05,
        base_age=52,
        spending_reduction_age=None,
        spending_reduction_percent=0.0,
        medical_increase_age=None,
        medical_increase_percent=0.0,
    )
    assert amount == 0.0


def test_projection_no_shortfall_adequate_portfolio():
    profile = MockProfile(current_age=60, retirement_age=60, projection_end_age=90)
    accounts = [
        MockAccount(
            id=1, name="Taxable", account_type="taxable_brokerage",
            tax_treatment="taxable", current_balance=2_000_000
        )
    ]
    income = [
        MockIncomeStream(id=1, name="Pension", stream_type="pension", start_age=60, annual_amount=30000),
        MockIncomeStream(id=2, name="SS", stream_type="social_security", start_age=67, annual_amount=38400),
    ]
    expenses = [MockExpenseItem(id=1, name="All", category="core", annual_amount=80000, start_age=60)]

    results = run_projection(profile, accounts, income, expenses, [], MockAssumptions())
    shortfalls = [r for r in results if r.is_shortfall]
    assert len(shortfalls) == 0, "Large portfolio should not have shortfall"
