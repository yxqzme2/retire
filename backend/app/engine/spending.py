"""
Spending / expense calculation module.

Inflates expenses from base_age to current_age and applies optional
age-based adjustments (spending reduction in older retirement, medical
cost increase with age).
"""

from typing import Optional


def calculate_annual_expenses(
    expense_items: list,
    current_age: int,
    base_inflation: float,
    healthcare_inflation: float,
    base_age: int,
    spending_reduction_age: Optional[int],
    spending_reduction_percent: float,
    medical_increase_age: Optional[int],
    medical_increase_percent: float,
) -> float:
    """
    Calculate total annual expenses for a given age, inflating each item from
    base_age and applying age-based adjustments.

    Args:
        expense_items:             List of ExpenseItem ORM objects.
        current_age:               Age to calculate expenses for.
        base_inflation:            General inflation rate (e.g. 0.03 = 3%).
        healthcare_inflation:      Healthcare-specific inflation rate (e.g. 0.05).
        base_age:                  The starting age (inflation compounding starts here).
        spending_reduction_age:    Age after which overall spending is reduced.
        spending_reduction_percent: Percentage reduction to apply after spending_reduction_age.
        medical_increase_age:      Age after which additional medical increase is applied.
        medical_increase_percent:  Additional percentage increase for medical expenses after that age.

    Returns:
        Total annual expenses in nominal dollars for current_age.
    """
    years_from_base = max(0, current_age - base_age)
    total = 0.0

    for item in expense_items:
        # Skip if expense hasn't started yet
        if current_age < item.start_age:
            continue
        # Skip if expense has ended
        if item.end_age is not None and current_age > item.end_age:
            continue

        # Get base annual amount (convert monthly if needed)
        base_annual = item.annual_amount
        if item.is_monthly:
            base_annual = base_annual * 12

        # Determine inflation rate for this item
        if item.inflation_linked:
            if item.custom_inflation_rate is not None:
                inflation = item.custom_inflation_rate
            else:
                # Healthcare category uses healthcare inflation rate
                category_lower = (item.category or "").lower()
                name_lower = (item.name or "").lower()
                if "health" in name_lower or "medical" in name_lower or category_lower == "healthcare":
                    inflation = healthcare_inflation
                else:
                    inflation = base_inflation
        else:
            inflation = 0.0

        # Years this item has been running (starts inflating from its start_age or base_age,
        # whichever is later)
        inflation_start = max(base_age, item.start_age)
        inflation_years = max(0, current_age - inflation_start)

        # Apply inflation compounding
        inflated_amount = base_annual * ((1 + inflation) ** inflation_years)

        # Apply medical increase if applicable
        if medical_increase_age is not None and current_age >= medical_increase_age:
            is_medical = (
                "health" in (item.name or "").lower()
                or "medical" in (item.name or "").lower()
                or (item.category or "").lower() == "healthcare"
            )
            if is_medical and medical_increase_percent > 0:
                years_with_increase = current_age - medical_increase_age
                inflated_amount *= (1 + medical_increase_percent) ** years_with_increase

        total += inflated_amount

    # Apply overall spending reduction if past spending_reduction_age
    if spending_reduction_age is not None and current_age >= spending_reduction_age:
        reduction_factor = 1.0 - spending_reduction_percent
        total *= max(0.0, reduction_factor)

    return total
