from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


# ─── Profile ───────────────────────────────────────────────────────────────────

class ProfileBase(BaseModel):
    name: str = "My Retirement Plan"
    current_age: int
    spouse_age: Optional[int] = None
    retirement_age: int
    spouse_retirement_age: Optional[int] = None
    projection_end_age: int = 90
    filing_status: str = "married_filing_jointly"
    retirement_state: str = "TX"
    inflation_rate: float = 0.03
    healthcare_inflation_rate: float = 0.05
    longevity_assumption: int = 90
    notes: Optional[str] = ""


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    current_age: Optional[int] = None
    spouse_age: Optional[int] = None
    retirement_age: Optional[int] = None
    spouse_retirement_age: Optional[int] = None
    projection_end_age: Optional[int] = None
    filing_status: Optional[str] = None
    retirement_state: Optional[str] = None
    inflation_rate: Optional[float] = None
    healthcare_inflation_rate: Optional[float] = None
    longevity_assumption: Optional[int] = None
    notes: Optional[str] = None


class ProfileRead(ProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None


# ─── Account ───────────────────────────────────────────────────────────────────

class AccountBase(BaseModel):
    account_id_code: Optional[str] = None
    name: str
    account_type: str
    tax_treatment: str
    institution: Optional[str] = ""
    owner: str = "self"
    current_balance: float = 0.0
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
    notes: Optional[str] = ""


class AccountCreate(AccountBase):
    scenario_id: int


class AccountUpdate(BaseModel):
    account_id_code: Optional[str] = None
    name: Optional[str] = None
    account_type: Optional[str] = None
    tax_treatment: Optional[str] = None
    institution: Optional[str] = None
    owner: Optional[str] = None
    current_balance: Optional[float] = None
    annual_contribution: Optional[float] = None
    employer_match_percent: Optional[float] = None
    expected_annual_return_percent: Optional[float] = None
    dividend_yield_percent: Optional[float] = None
    contribution_stop_age: Optional[int] = None
    withdrawal_priority: Optional[int] = None
    include_in_projection: Optional[bool] = None
    spend_dividends_in_retirement: Optional[bool] = None
    starting_monthly_income: Optional[float] = None
    income_start_age: Optional[int] = None
    income_end_age: Optional[int] = None
    cola_percent: Optional[float] = None
    notes: Optional[str] = None


class AccountRead(AccountBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    scenario_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None


# ─── IncomeStream ───────────────────────────────────────────────────────────────

class IncomeStreamBase(BaseModel):
    name: str
    stream_type: str
    start_age: int
    end_age: Optional[int] = None
    annual_amount: float = 0.0
    is_monthly: bool = True
    cola_percent: float = 0.0
    is_taxable: bool = True
    is_partially_taxable: bool = False
    notes: Optional[str] = ""


class IncomeStreamCreate(IncomeStreamBase):
    scenario_id: int


class IncomeStreamUpdate(BaseModel):
    name: Optional[str] = None
    stream_type: Optional[str] = None
    start_age: Optional[int] = None
    end_age: Optional[int] = None
    annual_amount: Optional[float] = None
    is_monthly: Optional[bool] = None
    cola_percent: Optional[float] = None
    is_taxable: Optional[bool] = None
    is_partially_taxable: Optional[bool] = None
    notes: Optional[str] = None


class IncomeStreamRead(IncomeStreamBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    scenario_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None


# ─── ExpenseItem ────────────────────────────────────────────────────────────────

class ExpenseItemBase(BaseModel):
    name: str
    category: str = "core"
    annual_amount: float = 0.0
    is_monthly: bool = False
    start_age: int
    end_age: Optional[int] = None
    inflation_linked: bool = True
    custom_inflation_rate: Optional[float] = None
    is_essential: bool = True
    notes: Optional[str] = ""


class ExpenseItemCreate(ExpenseItemBase):
    scenario_id: int


class ExpenseItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    annual_amount: Optional[float] = None
    is_monthly: Optional[bool] = None
    start_age: Optional[int] = None
    end_age: Optional[int] = None
    inflation_linked: Optional[bool] = None
    custom_inflation_rate: Optional[float] = None
    is_essential: Optional[bool] = None
    notes: Optional[str] = None


class ExpenseItemRead(ExpenseItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    scenario_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None


# ─── OneTimeEvent ───────────────────────────────────────────────────────────────

class OneTimeEventBase(BaseModel):
    name: str
    age: int
    amount: float
    is_inflow: bool = False
    description: Optional[str] = ""


class OneTimeEventCreate(OneTimeEventBase):
    scenario_id: int


class OneTimeEventUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    amount: Optional[float] = None
    is_inflow: Optional[bool] = None
    description: Optional[str] = None


class OneTimeEventRead(OneTimeEventBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    scenario_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None


# ─── AssumptionSet ──────────────────────────────────────────────────────────────

class AssumptionSetBase(BaseModel):
    baseline_return: float = 7.0
    conservative_return: float = 4.0
    aggressive_return: float = 10.0
    inflation_rate: float = 0.03
    healthcare_inflation_rate: float = 0.05
    federal_tax_rate: float = 0.22
    state_tax_rate: float = 0.05
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


class AssumptionSetCreate(AssumptionSetBase):
    scenario_id: int


class AssumptionSetUpdate(BaseModel):
    baseline_return: Optional[float] = None
    conservative_return: Optional[float] = None
    aggressive_return: Optional[float] = None
    inflation_rate: Optional[float] = None
    healthcare_inflation_rate: Optional[float] = None
    federal_tax_rate: Optional[float] = None
    state_tax_rate: Optional[float] = None
    qualified_dividend_rate: Optional[float] = None
    long_term_capital_gains_rate: Optional[float] = None
    social_security_taxable_percent: Optional[float] = None
    rmd_enabled: Optional[bool] = None
    roth_conversion_enabled: Optional[bool] = None
    spending_reduction_age: Optional[int] = None
    spending_reduction_percent: Optional[float] = None
    medical_increase_age: Optional[int] = None
    medical_increase_percent: Optional[float] = None
    bear_market_stress_test: Optional[bool] = None
    sequence_of_returns_stress: Optional[bool] = None
    active_return_scenario: Optional[str] = None
    withdrawal_strategy: Optional[str] = None


class AssumptionSetRead(AssumptionSetBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    scenario_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None


# ─── Scenario ───────────────────────────────────────────────────────────────────

class ScenarioBase(BaseModel):
    name: str
    description: Optional[str] = ""
    is_base_case: bool = False
    status: str = "unknown"
    profile_id: int


class ScenarioCreate(ScenarioBase):
    pass


class ScenarioUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_base_case: Optional[bool] = None
    status: Optional[str] = None


class ScenarioRead(ScenarioBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    accounts: List[AccountRead] = []
    income_streams: List[IncomeStreamRead] = []
    expenses: List[ExpenseItemRead] = []
    one_time_events: List[OneTimeEventRead] = []
    assumption_set: Optional[AssumptionSetRead] = None


class ScenarioSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str] = ""
    is_base_case: bool
    status: str
    profile_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None


# ─── ProjectionResult ───────────────────────────────────────────────────────────

class ProjectionResultRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    scenario_id: int
    age: int
    year: int
    total_income: float
    pension_income: float
    ss_income: float
    dividend_income: float
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
    created_at: datetime


class ProjectionSummary(BaseModel):
    """Aggregated summary for dashboard cards."""
    portfolio_at_retirement: float
    monthly_retirement_income: float
    monthly_spending_target: float
    surplus_or_gap: float
    first_shortfall_age: Optional[int]
    portfolio_survival_age: Optional[int]
    total_tax_drag: float
    scenario_status: str  # on_track | borderline | off_track | unknown
    years_of_data: int
    retirement_age: int


# ─── ImportHistory ──────────────────────────────────────────────────────────────

class ImportHistoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    import_type: str
    records_imported: int
    records_skipped: int
    status: str
    error_log: Optional[str] = ""
    imported_at: datetime


class ImportResult(BaseModel):
    """Validation result shown to user before confirming import."""
    valid_rows: int
    invalid_rows: int
    errors: List[str]
    preview: List[dict]  # First 10 rows parsed
    import_type: str
    filename: str
