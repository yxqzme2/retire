"""
Tax calculation module for retirement projections.

Uses simplified 2024 federal tax brackets scaled for inflation. State taxes
are calculated as flat rates. Social Security taxation follows combined-income
thresholds.
"""

from typing import Tuple


# 2024 Federal tax brackets (taxable income thresholds, rate)
# Format: (upper_limit, marginal_rate) — last entry has no upper limit
_BRACKETS_MFJ = [
    (23_200,   0.10),
    (94_300,   0.12),
    (201_050,  0.22),
    (383_900,  0.24),
    (487_450,  0.32),
    (731_200,  0.35),
    (float("inf"), 0.37),
]

_BRACKETS_SINGLE = [
    (11_600,   0.10),
    (47_150,   0.12),
    (100_525,  0.22),
    (191_950,  0.24),
    (243_725,  0.32),
    (609_350,  0.35),
    (float("inf"), 0.37),
]

_BRACKETS_MFS = [
    (11_600,   0.10),
    (47_150,   0.12),
    (100_525,  0.22),
    (191_950,  0.24),
    (243_725,  0.32),
    (365_600,  0.35),
    (float("inf"), 0.37),
]

_BRACKETS_HOH = [
    (16_550,   0.10),
    (63_100,   0.12),
    (100_500,  0.22),
    (191_950,  0.24),
    (243_700,  0.32),
    (609_350,  0.35),
    (float("inf"), 0.37),
]

# Standard deductions 2024
_STD_DEDUCTIONS = {
    "married_filing_jointly": 29_200,
    "single": 14_600,
    "married_filing_separately": 14_600,
    "head_of_household": 21_900,
}


def _get_brackets(filing_status: str) -> list:
    mapping = {
        "married_filing_jointly": _BRACKETS_MFJ,
        "single": _BRACKETS_SINGLE,
        "married_filing_separately": _BRACKETS_MFS,
        "head_of_household": _BRACKETS_HOH,
    }
    return mapping.get(filing_status, _BRACKETS_MFJ)


def _apply_brackets(taxable_income: float, brackets: list) -> float:
    """Apply marginal tax brackets to taxable income."""
    if taxable_income <= 0:
        return 0.0

    tax = 0.0
    prev_limit = 0.0

    for upper_limit, rate in brackets:
        if taxable_income <= prev_limit:
            break
        income_in_bracket = min(taxable_income, upper_limit) - prev_limit
        tax += income_in_bracket * rate
        prev_limit = upper_limit
        if upper_limit == float("inf"):
            break

    return tax


def _inflate_brackets(brackets: list, inflation_rate: float, years: int) -> list:
    """Scale brackets by inflation over the given number of years."""
    if years <= 0:
        return brackets
    factor = (1 + inflation_rate) ** years
    return [(limit * factor if limit != float("inf") else float("inf"), rate) for limit, rate in brackets]


def calculate_federal_tax(
    taxable_income: float,
    filing_status: str,
    year: int,
    base_year: int = 2024,
    inflation_rate: float = 0.03,
) -> float:
    """
    Estimate federal income tax using 2024 brackets inflated to the target year.

    Args:
        taxable_income: Gross taxable income before standard deduction.
        filing_status: One of single/married_filing_jointly/married_filing_separately/head_of_household.
        year: The tax year to estimate for.
        base_year: The year the brackets are defined for (2024).
        inflation_rate: Annual bracket inflation assumption.

    Returns:
        Estimated federal tax owed.
    """
    if taxable_income <= 0:
        return 0.0

    years_elapsed = max(0, year - base_year)
    brackets = _get_brackets(filing_status)
    adjusted_brackets = _inflate_brackets(brackets, inflation_rate, years_elapsed)

    # Apply standard deduction (also inflated)
    std_deduction = _STD_DEDUCTIONS.get(filing_status, 14_600)
    std_deduction_adjusted = std_deduction * ((1 + inflation_rate) ** years_elapsed)

    net_taxable = max(0.0, taxable_income - std_deduction_adjusted)
    return _apply_brackets(net_taxable, adjusted_brackets)


def calculate_ss_taxation(
    ss_income: float,
    other_income: float,
    filing_status: str,
) -> float:
    """
    Calculate the taxable portion of Social Security benefits using the
    combined income (provisional income) thresholds.

    IRS rules:
    - MFJ:    combined < $32k → 0%; $32k–$44k → 50%; > $44k → 85%
    - Others: combined < $25k → 0%; $25k–$34k → 50%; > $34k → 85%

    Args:
        ss_income: Total Social Security income received.
        other_income: All other taxable income (wages, pension, taxable withdrawals).
        filing_status: Filing status string.

    Returns:
        The dollar amount of SS income that is taxable.
    """
    if ss_income <= 0:
        return 0.0

    # Provisional income = other income + half of SS
    provisional = other_income + (ss_income * 0.5)

    if filing_status == "married_filing_jointly":
        lower_threshold = 32_000.0
        upper_threshold = 44_000.0
    else:
        lower_threshold = 25_000.0
        upper_threshold = 34_000.0

    if provisional <= lower_threshold:
        taxable_pct = 0.0
    elif provisional <= upper_threshold:
        # Up to 50% taxable in this band
        over_lower = provisional - lower_threshold
        taxable_pct = min(0.50, over_lower / ss_income * 0.5)
    else:
        # Up to 85% taxable above upper threshold
        taxable_pct = 0.85

    return ss_income * taxable_pct


def calculate_qualified_dividend_tax(
    dividends: float,
    total_ordinary_income: float,
    filing_status: str,
    year: int = 2024,
) -> float:
    """
    Calculate federal tax on qualified dividends at preferential 0%/15%/20% rates.

    2024 thresholds (MFJ):
    - 0%:  income ≤ $94,050
    - 15%: income ≤ $583,750
    - 20%: income > $583,750

    2024 thresholds (Single):
    - 0%:  income ≤ $47,025
    - 15%: income ≤ $518,900
    - 20%: income > $518,900

    Args:
        dividends: Total qualified dividend income.
        total_ordinary_income: Other ordinary income (sets rate bracket).
        filing_status: Filing status string.
        year: Tax year (used for minor bracket adjustment awareness).

    Returns:
        Estimated tax on qualified dividends.
    """
    if dividends <= 0:
        return 0.0

    if filing_status == "married_filing_jointly":
        zero_limit = 94_050.0
        fifteen_limit = 583_750.0
    else:
        zero_limit = 47_025.0
        fifteen_limit = 518_900.0

    # Dividends are stacked on top of ordinary income for bracket determination
    income_with_divs = total_ordinary_income + dividends

    if income_with_divs <= zero_limit:
        return 0.0
    elif total_ordinary_income >= fifteen_limit:
        # All dividends taxed at 20%
        return dividends * 0.20
    elif income_with_divs <= fifteen_limit:
        # All dividends taxed at 15%
        return dividends * 0.15
    else:
        # Split: some at 15%, some at 20%
        at_twenty = income_with_divs - fifteen_limit
        at_fifteen = dividends - at_twenty
        return max(0, at_fifteen) * 0.15 + max(0, at_twenty) * 0.20


def calculate_state_tax(income: float, state_rate: float) -> float:
    """
    Simplified flat-rate state income tax.

    Args:
        income: Taxable income for state purposes.
        state_rate: State marginal/flat rate (e.g. 0.05 = 5%).

    Returns:
        Estimated state tax.
    """
    if income <= 0 or state_rate <= 0:
        return 0.0
    return income * state_rate
