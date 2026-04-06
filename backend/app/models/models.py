from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Boolean, Column, Float, ForeignKey, Integer, String, Text, DateTime, UniqueConstraint
)
from sqlalchemy.orm import relationship, DeclarativeBase


class Base(DeclarativeBase):
    pass


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, default="My Retirement Plan")
    current_age = Column(Integer, nullable=False)
    spouse_age = Column(Integer, nullable=True)
    retirement_age = Column(Integer, nullable=False)
    spouse_retirement_age = Column(Integer, nullable=True)
    projection_end_age = Column(Integer, nullable=False, default=90)
    filing_status = Column(
        String(50),
        nullable=False,
        default="married_filing_jointly"
    )  # single | married_filing_jointly | married_filing_separately | head_of_household
    retirement_state = Column(String(50), nullable=False, default="TX")
    inflation_rate = Column(Float, nullable=False, default=0.03)
    healthcare_inflation_rate = Column(Float, nullable=False, default=0.05)
    longevity_assumption = Column(Integer, nullable=False, default=90)
    notes = Column(Text, nullable=True, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    scenarios = relationship("Scenario", back_populates="profile", cascade="all, delete-orphan")


class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True, default="")
    is_base_case = Column(Boolean, default=False)
    status = Column(String(50), default="unknown")  # on_track | borderline | off_track | unknown
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("Profile", back_populates="scenarios")
    accounts = relationship("Account", back_populates="scenario", cascade="all, delete-orphan")
    income_streams = relationship("IncomeStream", back_populates="scenario", cascade="all, delete-orphan")
    expenses = relationship("ExpenseItem", back_populates="scenario", cascade="all, delete-orphan")
    one_time_events = relationship("OneTimeEvent", back_populates="scenario", cascade="all, delete-orphan")
    assumption_set = relationship("AssumptionSet", back_populates="scenario", uselist=False, cascade="all, delete-orphan")
    projection_results = relationship("ProjectionResult", back_populates="scenario", cascade="all, delete-orphan")


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(Integer, ForeignKey("scenarios.id"), nullable=False)
    account_id_code = Column(String(50), nullable=True)  # e.g. "ACC-001"
    name = Column(String(255), nullable=False)
    account_type = Column(String(50), nullable=False)
    # 401k | roth_ira | taxable_brokerage | dividend_portfolio | cash_hysa | pension | social_security | hsa | other
    tax_treatment = Column(String(50), nullable=False)
    # taxable | tax_deferred | tax_free | partially_taxable
    institution = Column(String(255), nullable=True, default="")
    owner = Column(String(20), nullable=False, default="self")  # self | spouse | joint
    current_balance = Column(Float, nullable=False, default=0.0)
    annual_contribution = Column(Float, nullable=False, default=0.0)
    employer_match_percent = Column(Float, nullable=False, default=0.0)
    expected_annual_return_percent = Column(Float, nullable=False, default=7.0)
    dividend_yield_percent = Column(Float, nullable=False, default=0.0)
    contribution_stop_age = Column(Integer, nullable=True)
    withdrawal_priority = Column(Integer, nullable=False, default=5)
    include_in_projection = Column(Boolean, default=True)
    spend_dividends_in_retirement = Column(Boolean, default=False)
    starting_monthly_income = Column(Float, nullable=True)
    income_start_age = Column(Integer, nullable=True)
    income_end_age = Column(Integer, nullable=True)
    cola_percent = Column(Float, nullable=False, default=0.0)
    notes = Column(Text, nullable=True, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    scenario = relationship("Scenario", back_populates="accounts")


class IncomeStream(Base):
    __tablename__ = "income_streams"

    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(Integer, ForeignKey("scenarios.id"), nullable=False)
    name = Column(String(255), nullable=False)
    stream_type = Column(String(50), nullable=False)
    # pension | social_security | part_time | rental | annuity | other
    start_age = Column(Integer, nullable=False)
    end_age = Column(Integer, nullable=True)
    annual_amount = Column(Float, nullable=False, default=0.0)
    is_monthly = Column(Boolean, default=True)  # if True, annual_amount is actually a monthly amount * 12
    cola_percent = Column(Float, nullable=False, default=0.0)
    is_taxable = Column(Boolean, default=True)
    is_partially_taxable = Column(Boolean, default=False)
    notes = Column(Text, nullable=True, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    scenario = relationship("Scenario", back_populates="income_streams")


class ExpenseItem(Base):
    __tablename__ = "expense_items"

    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(Integer, ForeignKey("scenarios.id"), nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False, default="core")  # core | flexible | irregular
    annual_amount = Column(Float, nullable=False, default=0.0)
    is_monthly = Column(Boolean, default=False)
    start_age = Column(Integer, nullable=False)
    end_age = Column(Integer, nullable=True)
    inflation_linked = Column(Boolean, default=True)
    custom_inflation_rate = Column(Float, nullable=True)
    is_essential = Column(Boolean, default=True)
    notes = Column(Text, nullable=True, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    scenario = relationship("Scenario", back_populates="expenses")


class OneTimeEvent(Base):
    __tablename__ = "one_time_events"

    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(Integer, ForeignKey("scenarios.id"), nullable=False)
    name = Column(String(255), nullable=False)
    age = Column(Integer, nullable=False)
    amount = Column(Float, nullable=False)
    is_inflow = Column(Boolean, default=False)  # True = money in, False = money out
    description = Column(Text, nullable=True, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    scenario = relationship("Scenario", back_populates="one_time_events")


class AssumptionSet(Base):
    __tablename__ = "assumption_sets"
    __table_args__ = (UniqueConstraint("scenario_id"),)

    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(Integer, ForeignKey("scenarios.id"), nullable=False, unique=True)

    # Returns
    baseline_return = Column(Float, nullable=False, default=7.0)
    conservative_return = Column(Float, nullable=False, default=4.0)
    aggressive_return = Column(Float, nullable=False, default=10.0)

    # Inflation
    inflation_rate = Column(Float, nullable=False, default=0.03)
    healthcare_inflation_rate = Column(Float, nullable=False, default=0.05)

    # Taxes
    federal_tax_rate = Column(Float, nullable=False, default=0.22)
    state_tax_rate = Column(Float, nullable=False, default=0.05)
    qualified_dividend_rate = Column(Float, nullable=False, default=0.15)
    long_term_capital_gains_rate = Column(Float, nullable=False, default=0.15)
    social_security_taxable_percent = Column(Float, nullable=False, default=0.85)

    # RMDs and conversions
    rmd_enabled = Column(Boolean, default=True)
    roth_conversion_enabled = Column(Boolean, default=False)

    # Age-based spending adjustments
    spending_reduction_age = Column(Integer, nullable=True)
    spending_reduction_percent = Column(Float, nullable=False, default=0.0)
    medical_increase_age = Column(Integer, nullable=True)
    medical_increase_percent = Column(Float, nullable=False, default=0.0)

    # Stress tests
    bear_market_stress_test = Column(Boolean, default=False)
    sequence_of_returns_stress = Column(Boolean, default=False)

    # Active return scenario
    active_return_scenario = Column(String(20), nullable=False, default="baseline")
    # baseline | conservative | aggressive

    # Withdrawal strategy
    withdrawal_strategy = Column(String(50), nullable=False, default="taxable_first")
    # taxable_first | pretax_first | dividends_first | custom_priority

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    scenario = relationship("Scenario", back_populates="assumption_set")


class ProjectionResult(Base):
    __tablename__ = "projection_results"

    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(Integer, ForeignKey("scenarios.id"), nullable=False)
    age = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    total_income = Column(Float, nullable=False, default=0.0)
    pension_income = Column(Float, nullable=False, default=0.0)
    ss_income = Column(Float, nullable=False, default=0.0)
    dividend_income = Column(Float, nullable=False, default=0.0)
    portfolio_withdrawal = Column(Float, nullable=False, default=0.0)
    total_expenses = Column(Float, nullable=False, default=0.0)
    federal_tax = Column(Float, nullable=False, default=0.0)
    state_tax = Column(Float, nullable=False, default=0.0)
    net_cash_flow = Column(Float, nullable=False, default=0.0)
    total_portfolio_value = Column(Float, nullable=False, default=0.0)
    roth_balance = Column(Float, nullable=False, default=0.0)
    pretax_balance = Column(Float, nullable=False, default=0.0)
    taxable_balance = Column(Float, nullable=False, default=0.0)
    cash_balance = Column(Float, nullable=False, default=0.0)
    is_shortfall = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    scenario = relationship("Scenario", back_populates="projection_results")


class ImportHistory(Base):
    __tablename__ = "import_history"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    import_type = Column(String(50), nullable=False)
    records_imported = Column(Integer, nullable=False, default=0)
    records_skipped = Column(Integer, nullable=False, default=0)
    status = Column(String(20), nullable=False, default="success")  # success | partial | failed
    error_log = Column(Text, nullable=True, default="")
    imported_at = Column(DateTime, default=datetime.utcnow)
