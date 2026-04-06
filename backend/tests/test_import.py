"""Tests for CSV import/export service."""
import pytest
from app.services.csv_service import parse_csv, get_template_csv


def test_parse_valid_account_csv():
    csv_content = """name,account_type,tax_treatment,institution,owner,current_balance,annual_contribution,employer_match_percent,expected_annual_return_percent,dividend_yield_percent,contribution_stop_age,withdrawal_priority,include_in_projection,spend_dividends_in_retirement,starting_monthly_income,income_start_age,income_end_age,cola_percent,notes
Work 401k,401k,tax_deferred,Fidelity,self,292396,21000,8,7.0,0,,3,TRUE,FALSE,,,,0,Primary 401k
"""
    result = parse_csv(csv_content, "accounts")
    assert result.valid_rows == 1
    assert result.invalid_rows == 0
    assert len(result.errors) == 0


def test_parse_invalid_account_missing_name():
    csv_content = """name,account_type,tax_treatment,institution,owner,current_balance,annual_contribution,employer_match_percent,expected_annual_return_percent,dividend_yield_percent,contribution_stop_age,withdrawal_priority,include_in_projection,spend_dividends_in_retirement,starting_monthly_income,income_start_age,income_end_age,cola_percent,notes
,401k,tax_deferred,Fidelity,self,292396,21000,8,7.0,0,,3,TRUE,FALSE,,,,0,
"""
    result = parse_csv(csv_content, "accounts")
    assert result.invalid_rows == 1
    assert any("name" in e.lower() for e in result.errors)


def test_parse_empty_csv():
    result = parse_csv("", "accounts")
    assert result.valid_rows == 0
    assert len(result.errors) > 0


def test_parse_valid_income_csv():
    csv_content = """name,stream_type,start_age,end_age,annual_amount,is_monthly,cola_percent,is_taxable,is_partially_taxable,notes
Pension,pension,60,,30000,FALSE,2.0,TRUE,FALSE,Employer pension
"""
    result = parse_csv(csv_content, "income")
    assert result.valid_rows == 1
    assert result.invalid_rows == 0


def test_parse_invalid_income_missing_start_age():
    csv_content = """name,stream_type,start_age,end_age,annual_amount,is_monthly,cola_percent,is_taxable,is_partially_taxable,notes
Pension,pension,notanumber,,30000,FALSE,2.0,TRUE,FALSE,
"""
    result = parse_csv(csv_content, "income")
    assert result.invalid_rows == 1


def test_get_template_returns_headers():
    for import_type in ["accounts", "income", "expenses", "assumptions", "events"]:
        template = get_template_csv(import_type)
        assert len(template) > 0
        # First line should be headers
        first_line = template.split("\n")[0]
        assert "," in first_line


def test_parse_unknown_type():
    result = parse_csv("col1,col2\nval1,val2", "unknown_type")
    assert result.valid_rows == 0
    assert len(result.errors) > 0


def test_parse_expense_csv():
    csv_content = """name,category,annual_amount,is_monthly,start_age,end_age,inflation_linked,custom_inflation_rate,is_essential,notes
Housing,core,36000,FALSE,52,,TRUE,,TRUE,Primary residence
Food,core,18000,FALSE,52,,TRUE,,TRUE,Groceries
"""
    result = parse_csv(csv_content, "expenses")
    assert result.valid_rows == 2
    assert result.invalid_rows == 0
