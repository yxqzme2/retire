"""
Withdrawal strategy engine.

Determines how much to withdraw from each account to meet spending needs,
following the chosen withdrawal strategy.

Strategies:
  taxable_first    – Draw down taxable accounts before pre-tax, then Roth
  pretax_first     – Draw pre-tax (401k/IRA) before taxable, then Roth
  dividends_first  – Use dividend income fully, then taxable, then pre-tax
  custom_priority  – Follow the withdrawal_priority field on each account
"""

from typing import Optional


def calculate_withdrawal_need(
    spending_need: float,
    income_available: float,
    accounts: list,
    strategy: str,
    current_age: int,
    assumptions,
    account_balances: dict,
) -> dict:
    """
    Given a spending need and available passive income, determine how much to
    withdraw from which accounts.

    Args:
        spending_need:     Total annual expenses to be covered.
        income_available:  Passive income already accounted for (pension, SS, dividends).
        accounts:          List of Account ORM objects.
        strategy:          Withdrawal strategy string.
        current_age:       Current age of the retiree.
        assumptions:       AssumptionSet ORM object.
        account_balances:  Dict mapping account.id → current balance.

    Returns:
        Dict mapping account.id → withdrawal_amount.
    """
    withdrawal_remaining = max(0.0, spending_need - income_available)

    if withdrawal_remaining <= 0:
        return {}

    # Filter eligible accounts: included, not pension/social_security (those are income streams)
    eligible = [
        a for a in accounts
        if a.include_in_projection
        and a.account_type not in ("pension", "social_security")
        and account_balances.get(a.id, 0) > 0
    ]

    if not eligible:
        return {}

    # Sort accounts per strategy
    sorted_accounts = _sort_accounts(eligible, strategy)

    withdrawals: dict = {}
    remaining = withdrawal_remaining

    for account in sorted_accounts:
        if remaining <= 0:
            break
        available = account_balances.get(account.id, 0.0)
        if available <= 0:
            continue
        withdraw = min(remaining, available)
        withdrawals[account.id] = withdraw
        remaining -= withdraw

    return withdrawals


def _sort_accounts(accounts: list, strategy: str) -> list:
    """Return accounts sorted by withdrawal order for the chosen strategy."""

    def taxable_first_key(a):
        """Taxable → partially_taxable → tax_deferred → tax_free."""
        order = {
            "taxable": 0,
            "partially_taxable": 1,
            "tax_deferred": 2,
            "tax_free": 3,
        }
        return (order.get(a.tax_treatment, 5), a.withdrawal_priority)

    def pretax_first_key(a):
        """Tax_deferred → taxable → partially_taxable → tax_free."""
        order = {
            "tax_deferred": 0,
            "taxable": 1,
            "partially_taxable": 2,
            "tax_free": 3,
        }
        return (order.get(a.tax_treatment, 5), a.withdrawal_priority)

    def dividends_first_key(a):
        """Dividend portfolio → taxable → tax_deferred → tax_free."""
        type_order = {
            "dividend_portfolio": 0,
            "taxable_brokerage": 1,
            "cash_hysa": 2,
            "401k": 3,
            "hsa": 4,
            "roth_ira": 5,
            "other": 6,
        }
        return (type_order.get(a.account_type, 7), a.withdrawal_priority)

    def custom_priority_key(a):
        return (a.withdrawal_priority, 0)

    key_fn = {
        "taxable_first": taxable_first_key,
        "pretax_first": pretax_first_key,
        "dividends_first": dividends_first_key,
        "custom_priority": custom_priority_key,
    }.get(strategy, taxable_first_key)

    return sorted(accounts, key=key_fn)
