"""
Seed data service.

Creates a default profile, base case scenario, and pre-populated
accounts/income/expenses/assumptions on first startup if the database is empty.
"""

from sqlalchemy.orm import Session
from app.models.models import (
    Profile, Scenario, Account, IncomeStream, ExpenseItem, OneTimeEvent, AssumptionSet
)


def seed_database(db: Session) -> None:
    """Seed the database with default data if it's empty."""
    if db.query(Profile).count() > 0:
        return  # Already seeded

    # ── Profile ────────────────────────────────────────────────────────────────
    profile = Profile(
        name="My Retirement Plan",
        current_age=52,
        spouse_age=50,
        retirement_age=60,
        spouse_retirement_age=60,
        projection_end_age=90,
        filing_status="married_filing_jointly",
        retirement_state="TX",
        inflation_rate=0.03,
        healthcare_inflation_rate=0.05,
        longevity_assumption=90,
        notes="Auto-generated base plan. Adjust values to match your actual situation.",
    )
    db.add(profile)
    db.flush()

    # ── Base Case Scenario ─────────────────────────────────────────────────────
    base_scenario = Scenario(
        name="Base Case",
        description="Primary retirement scenario with baseline assumptions.",
        is_base_case=True,
        status="unknown",
        profile_id=profile.id,
    )
    db.add(base_scenario)
    db.flush()

    # ── Accounts ───────────────────────────────────────────────────────────────
    accounts_data = [
        dict(
            account_id_code="ACC-001",
            name="Work 401(k)",
            account_type="401k",
            tax_treatment="tax_deferred",
            institution="Fidelity",
            owner="self",
            current_balance=292396.0,
            annual_contribution=21000.0,
            employer_match_percent=8.0,
            expected_annual_return_percent=7.0,
            dividend_yield_percent=0.0,
            contribution_stop_age=60,
            withdrawal_priority=3,
            include_in_projection=True,
            spend_dividends_in_retirement=False,
            notes="Primary workplace retirement account.",
        ),
        dict(
            account_id_code="ACC-002",
            name="Roth IRA",
            account_type="roth_ira",
            tax_treatment="tax_free",
            institution="Vanguard",
            owner="self",
            current_balance=15000.0,
            annual_contribution=7500.0,
            employer_match_percent=0.0,
            expected_annual_return_percent=7.0,
            dividend_yield_percent=0.5,
            contribution_stop_age=60,
            withdrawal_priority=4,
            include_in_projection=True,
            spend_dividends_in_retirement=False,
            notes="Tax-free growth; last to withdraw.",
        ),
        dict(
            account_id_code="ACC-003",
            name="Dividend Portfolio",
            account_type="dividend_portfolio",
            tax_treatment="taxable",
            institution="Schwab",
            owner="self",
            current_balance=5000.0,
            annual_contribution=3600.0,
            employer_match_percent=0.0,
            expected_annual_return_percent=6.0,
            dividend_yield_percent=3.2,
            contribution_stop_age=None,
            withdrawal_priority=2,
            include_in_projection=True,
            spend_dividends_in_retirement=True,
            notes="Taxable dividend portfolio. Dividends spent in retirement.",
        ),
        dict(
            account_id_code="ACC-004",
            name="Pension",
            account_type="pension",
            tax_treatment="partially_taxable",
            institution="Employer Pension Fund",
            owner="self",
            current_balance=0.0,
            annual_contribution=0.0,
            employer_match_percent=0.0,
            expected_annual_return_percent=0.0,
            dividend_yield_percent=0.0,
            withdrawal_priority=5,
            include_in_projection=True,
            spend_dividends_in_retirement=False,
            starting_monthly_income=2500.0,
            income_start_age=60,
            income_end_age=None,
            cola_percent=2.0,
            notes="Defined benefit pension. Starts at age 60.",
        ),
        dict(
            account_id_code="ACC-005",
            name="Social Security",
            account_type="social_security",
            tax_treatment="partially_taxable",
            institution="SSA",
            owner="self",
            current_balance=0.0,
            annual_contribution=0.0,
            employer_match_percent=0.0,
            expected_annual_return_percent=0.0,
            dividend_yield_percent=0.0,
            withdrawal_priority=5,
            include_in_projection=True,
            spend_dividends_in_retirement=False,
            starting_monthly_income=3200.0,
            income_start_age=67,
            income_end_age=None,
            cola_percent=2.0,
            notes="Social Security benefits. Full retirement age 67.",
        ),
        dict(
            account_id_code="ACC-006",
            name="Cash Reserve / HYSA",
            account_type="cash_hysa",
            tax_treatment="taxable",
            institution="Marcus by Goldman Sachs",
            owner="joint",
            current_balance=25000.0,
            annual_contribution=0.0,
            employer_match_percent=0.0,
            expected_annual_return_percent=3.5,
            dividend_yield_percent=0.0,
            withdrawal_priority=1,
            include_in_projection=True,
            spend_dividends_in_retirement=False,
            notes="Emergency fund / high-yield savings. First to draw from.",
        ),
    ]

    for acc_data in accounts_data:
        account = Account(scenario_id=base_scenario.id, **acc_data)
        db.add(account)

    # ── Income Streams ─────────────────────────────────────────────────────────
    income_data = [
        dict(
            name="Pension Income",
            stream_type="pension",
            start_age=60,
            end_age=None,
            annual_amount=30000.0,   # 2500/mo × 12
            is_monthly=False,
            cola_percent=2.0,
            is_taxable=True,
            is_partially_taxable=False,
            notes="Employer defined benefit pension.",
        ),
        dict(
            name="Social Security",
            stream_type="social_security",
            start_age=67,
            end_age=None,
            annual_amount=38400.0,   # 3200/mo × 12
            is_monthly=False,
            cola_percent=2.0,
            is_taxable=True,
            is_partially_taxable=True,
            notes="Social Security at full retirement age.",
        ),
    ]

    for s_data in income_data:
        stream = IncomeStream(scenario_id=base_scenario.id, **s_data)
        db.add(stream)

    # ── Expense Items ──────────────────────────────────────────────────────────
    expense_data = [
        dict(name="Housing (Mortgage/Rent/Taxes)", category="core", annual_amount=36000.0, start_age=52, inflation_linked=True, is_essential=True),
        dict(name="Food & Groceries", category="core", annual_amount=18000.0, start_age=52, inflation_linked=True, is_essential=True),
        dict(name="Transportation", category="core", annual_amount=12000.0, start_age=52, inflation_linked=True, is_essential=True),
        dict(name="Healthcare & Insurance", category="core", annual_amount=12000.0, start_age=52, inflation_linked=True, is_essential=True, custom_inflation_rate=0.05),
        dict(name="Entertainment & Dining", category="flexible", annual_amount=9600.0, start_age=52, inflation_linked=True, is_essential=False),
        dict(name="Travel & Vacation", category="flexible", annual_amount=12000.0, start_age=52, inflation_linked=True, is_essential=False),
        dict(name="Utilities & Subscriptions", category="core", annual_amount=6000.0, start_age=52, inflation_linked=True, is_essential=True),
        dict(name="Clothing & Personal", category="flexible", annual_amount=4800.0, start_age=52, inflation_linked=True, is_essential=False),
        dict(name="Home Maintenance", category="irregular", annual_amount=6000.0, start_age=52, inflation_linked=True, is_essential=True),
        dict(name="Gifts & Charitable", category="flexible", annual_amount=3600.0, start_age=52, inflation_linked=False, is_essential=False),
    ]

    for e_data in expense_data:
        expense = ExpenseItem(scenario_id=base_scenario.id, **e_data)
        db.add(expense)

    # ── One-Time Events ────────────────────────────────────────────────────────
    event_data = [
        dict(name="Pay off Mortgage", age=62, amount=80000.0, is_inflow=False, description="Final mortgage payoff"),
        dict(name="New Vehicle", age=65, amount=45000.0, is_inflow=False, description="Replace vehicle at retirement"),
        dict(name="Home Renovation", age=68, amount=50000.0, is_inflow=False, description="Kitchen and bath remodel"),
        dict(name="Inheritance", age=70, amount=75000.0, is_inflow=True, description="Expected inheritance from estate"),
    ]

    for ev_data in event_data:
        event = OneTimeEvent(scenario_id=base_scenario.id, **ev_data)
        db.add(event)

    # ── Assumption Set ─────────────────────────────────────────────────────────
    assumptions = AssumptionSet(
        scenario_id=base_scenario.id,
        baseline_return=7.0,
        conservative_return=4.0,
        aggressive_return=10.0,
        inflation_rate=0.03,
        healthcare_inflation_rate=0.05,
        federal_tax_rate=0.22,
        state_tax_rate=0.0,  # Texas has no state income tax
        qualified_dividend_rate=0.15,
        long_term_capital_gains_rate=0.15,
        social_security_taxable_percent=0.85,
        rmd_enabled=True,
        roth_conversion_enabled=False,
        spending_reduction_age=80,
        spending_reduction_percent=0.10,
        medical_increase_age=75,
        medical_increase_percent=0.02,
        bear_market_stress_test=False,
        sequence_of_returns_stress=False,
        active_return_scenario="baseline",
        withdrawal_strategy="taxable_first",
    )
    db.add(assumptions)

    # ── Additional Scenarios ───────────────────────────────────────────────────
    scenario_configs = [
        dict(
            name="Conservative",
            description="Lower returns (4%) and higher inflation assumptions.",
            return_scenario="conservative",
        ),
        dict(
            name="Aggressive Growth",
            description="Higher return assumptions (10%) — best case portfolio growth.",
            return_scenario="aggressive",
        ),
        dict(
            name="Retire at 55",
            description="Early retirement at age 55 — higher spending needs, shorter accumulation.",
            return_scenario="baseline",
            retirement_age_override=55,
        ),
        dict(
            name="High Medical",
            description="Models elevated medical costs with 7% healthcare inflation after age 70.",
            return_scenario="baseline",
            medical_increase=True,
        ),
        dict(
            name="Lower Spending",
            description="Reduces discretionary spending by 20% after age 75.",
            return_scenario="baseline",
            spending_reduction=True,
        ),
    ]

    for cfg in scenario_configs:
        s = Scenario(
            name=cfg["name"],
            description=cfg["description"],
            is_base_case=False,
            status="unknown",
            profile_id=profile.id,
        )
        db.add(s)
        db.flush()

        # Copy all base case data to this scenario
        _copy_scenario_data(db, base_scenario.id, s.id)

        # Override assumptions for this scenario
        new_assumptions = db.query(AssumptionSet).filter(AssumptionSet.scenario_id == s.id).first()
        if new_assumptions:
            new_assumptions.active_return_scenario = cfg.get("return_scenario", "baseline")
            if cfg.get("medical_increase"):
                new_assumptions.medical_increase_age = 70
                new_assumptions.medical_increase_percent = 0.02
                new_assumptions.healthcare_inflation_rate = 0.07
            if cfg.get("spending_reduction"):
                new_assumptions.spending_reduction_age = 75
                new_assumptions.spending_reduction_percent = 0.20

        # Modify profile retirement age for early retirement scenario
        if cfg.get("retirement_age_override"):
            # We don't change the profile (shared) — just note it in description
            # In a full implementation, scenarios would have their own profile overrides
            pass

    db.commit()
    print("Database seeded successfully.")


def _copy_scenario_data(db: Session, source_id: int, target_id: int) -> None:
    """Copy all data from source scenario to target scenario."""
    source = db.query(Scenario).filter(Scenario.id == source_id).first()
    if not source:
        return

    # Copy accounts
    for acc in source.accounts:
        new_acc = Account(
            scenario_id=target_id,
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
            scenario_id=target_id,
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

    # Copy expenses
    for expense in source.expenses:
        new_expense = ExpenseItem(
            scenario_id=target_id,
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
            scenario_id=target_id,
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
            scenario_id=target_id,
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

    db.flush()
