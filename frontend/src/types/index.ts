// ─── Enums / Union Types ───────────────────────────────────────────────────────

export type AccountType =
  | '401k'
  | 'roth_ira'
  | 'taxable_brokerage'
  | 'dividend_portfolio'
  | 'cash_hysa'
  | 'pension'
  | 'social_security'
  | 'hsa'
  | 'other';

export type TaxTreatment =
  | 'taxable'
  | 'tax_deferred'
  | 'tax_free'
  | 'partially_taxable';

export type WithdrawalStrategy =
  | 'taxable_first'
  | 'pretax_first'
  | 'dividends_first'
  | 'custom_priority';

export type ScenarioStatus = 'on_track' | 'borderline' | 'off_track' | 'unknown';

export type FilingStatus =
  | 'single'
  | 'married_filing_jointly'
  | 'married_filing_separately'
  | 'head_of_household';

export type ExpenseCategory = 'core' | 'flexible' | 'irregular';

export type StreamType =
  | 'pension'
  | 'social_security'
  | 'part_time'
  | 'rental'
  | 'annuity'
  | 'other';

export type ReturnScenario = 'baseline' | 'conservative' | 'aggressive';

// ─── Profile ───────────────────────────────────────────────────────────────────

export interface Profile {
  id: number;
  name: string;
  current_age: number;
  spouse_age: number | null;
  retirement_age: number;
  spouse_retirement_age: number | null;
  projection_end_age: number;
  filing_status: FilingStatus;
  retirement_state: string;
  inflation_rate: number;
  healthcare_inflation_rate: number;
  longevity_assumption: number;
  notes: string;
  created_at: string;
  updated_at: string | null;
}

export interface ProfileCreate {
  name?: string;
  current_age: number;
  spouse_age?: number | null;
  retirement_age: number;
  spouse_retirement_age?: number | null;
  projection_end_age?: number;
  filing_status?: FilingStatus;
  retirement_state?: string;
  inflation_rate?: number;
  healthcare_inflation_rate?: number;
  longevity_assumption?: number;
  notes?: string;
}

export type ProfileUpdate = Partial<ProfileCreate>;

// ─── Account ───────────────────────────────────────────────────────────────────

export interface Account {
  id: number;
  scenario_id: number;
  account_id_code: string | null;
  name: string;
  account_type: AccountType;
  tax_treatment: TaxTreatment;
  institution: string;
  owner: 'self' | 'spouse' | 'joint';
  current_balance: number;
  annual_contribution: number;
  employer_match_percent: number;
  expected_annual_return_percent: number;
  dividend_yield_percent: number;
  contribution_stop_age: number | null;
  withdrawal_priority: number;
  include_in_projection: boolean;
  spend_dividends_in_retirement: boolean;
  starting_monthly_income: number | null;
  income_start_age: number | null;
  income_end_age: number | null;
  cola_percent: number;
  notes: string;
  created_at: string;
  updated_at: string | null;
}

export interface AccountCreate {
  scenario_id: number;
  name: string;
  account_type: AccountType;
  tax_treatment: TaxTreatment;
  institution?: string;
  owner?: 'self' | 'spouse' | 'joint';
  current_balance?: number;
  annual_contribution?: number;
  employer_match_percent?: number;
  expected_annual_return_percent?: number;
  dividend_yield_percent?: number;
  contribution_stop_age?: number | null;
  withdrawal_priority?: number;
  include_in_projection?: boolean;
  spend_dividends_in_retirement?: boolean;
  starting_monthly_income?: number | null;
  income_start_age?: number | null;
  income_end_age?: number | null;
  cola_percent?: number;
  notes?: string;
}

export type AccountUpdate = Partial<Omit<AccountCreate, 'scenario_id'>>;

// ─── IncomeStream ───────────────────────────────────────────────────────────────

export interface IncomeStream {
  id: number;
  scenario_id: number;
  name: string;
  stream_type: StreamType;
  start_age: number;
  end_age: number | null;
  annual_amount: number;
  is_monthly: boolean;
  cola_percent: number;
  is_taxable: boolean;
  is_partially_taxable: boolean;
  notes: string;
  created_at: string;
  updated_at: string | null;
}

export interface IncomeStreamCreate {
  scenario_id: number;
  name: string;
  stream_type: StreamType;
  start_age: number;
  end_age?: number | null;
  annual_amount: number;
  is_monthly?: boolean;
  cola_percent?: number;
  is_taxable?: boolean;
  is_partially_taxable?: boolean;
  notes?: string;
}

export type IncomeStreamUpdate = Partial<Omit<IncomeStreamCreate, 'scenario_id'>>;

// ─── ExpenseItem ────────────────────────────────────────────────────────────────

export interface ExpenseItem {
  id: number;
  scenario_id: number;
  name: string;
  category: ExpenseCategory;
  annual_amount: number;
  is_monthly: boolean;
  start_age: number;
  end_age: number | null;
  inflation_linked: boolean;
  custom_inflation_rate: number | null;
  is_essential: boolean;
  notes: string;
  created_at: string;
  updated_at: string | null;
}

export interface ExpenseItemCreate {
  scenario_id: number;
  name: string;
  category?: ExpenseCategory;
  annual_amount: number;
  is_monthly?: boolean;
  start_age: number;
  end_age?: number | null;
  inflation_linked?: boolean;
  custom_inflation_rate?: number | null;
  is_essential?: boolean;
  notes?: string;
}

export type ExpenseItemUpdate = Partial<Omit<ExpenseItemCreate, 'scenario_id'>>;

// ─── OneTimeEvent ───────────────────────────────────────────────────────────────

export interface OneTimeEvent {
  id: number;
  scenario_id: number;
  name: string;
  age: number;
  amount: number;
  is_inflow: boolean;
  description: string;
  created_at: string;
  updated_at: string | null;
}

export interface OneTimeEventCreate {
  scenario_id: number;
  name: string;
  age: number;
  amount: number;
  is_inflow?: boolean;
  description?: string;
}

export type OneTimeEventUpdate = Partial<Omit<OneTimeEventCreate, 'scenario_id'>>;

// ─── AssumptionSet ──────────────────────────────────────────────────────────────

export interface AssumptionSet {
  id: number;
  scenario_id: number;
  baseline_return: number;
  conservative_return: number;
  aggressive_return: number;
  inflation_rate: number;
  healthcare_inflation_rate: number;
  federal_tax_rate: number;
  state_tax_rate: number;
  qualified_dividend_rate: number;
  long_term_capital_gains_rate: number;
  social_security_taxable_percent: number;
  rmd_enabled: boolean;
  roth_conversion_enabled: boolean;
  spending_reduction_age: number | null;
  spending_reduction_percent: number;
  medical_increase_age: number | null;
  medical_increase_percent: number;
  bear_market_stress_test: boolean;
  sequence_of_returns_stress: boolean;
  active_return_scenario: ReturnScenario;
  withdrawal_strategy: WithdrawalStrategy;
  created_at: string;
  updated_at: string | null;
}

export type AssumptionSetUpdate = Partial<Omit<AssumptionSet, 'id' | 'scenario_id' | 'created_at' | 'updated_at'>>;

// ─── Scenario ───────────────────────────────────────────────────────────────────

export interface ScenarioSummary {
  id: number;
  name: string;
  description: string;
  is_base_case: boolean;
  status: ScenarioStatus;
  profile_id: number;
  created_at: string;
  updated_at: string | null;
}

export interface Scenario extends ScenarioSummary {
  accounts: Account[];
  income_streams: IncomeStream[];
  expenses: ExpenseItem[];
  one_time_events: OneTimeEvent[];
  assumption_set: AssumptionSet | null;
}

export interface ScenarioCreate {
  name: string;
  description?: string;
  is_base_case?: boolean;
  profile_id: number;
}

export interface ScenarioUpdate {
  name?: string;
  description?: string;
  is_base_case?: boolean;
  status?: ScenarioStatus;
}

// ─── Projection ─────────────────────────────────────────────────────────────────

export interface ProjectionResult {
  id: number;
  scenario_id: number;
  age: number;
  year: number;
  total_income: number;
  pension_income: number;
  ss_income: number;
  dividend_income: number;
  portfolio_withdrawal: number;
  total_expenses: number;
  federal_tax: number;
  state_tax: number;
  net_cash_flow: number;
  total_portfolio_value: number;
  roth_balance: number;
  pretax_balance: number;
  taxable_balance: number;
  cash_balance: number;
  is_shortfall: boolean;
  created_at: string;
}

export interface ProjectionSummary {
  portfolio_at_retirement: number;
  monthly_retirement_income: number;
  monthly_spending_target: number;
  surplus_or_gap: number;
  first_shortfall_age: number | null;
  portfolio_survival_age: number | null;
  total_tax_drag: number;
  scenario_status: ScenarioStatus;
  years_of_data: number;
  retirement_age: number;
}

// ─── Import ─────────────────────────────────────────────────────────────────────

export interface ImportResult {
  valid_rows: number;
  invalid_rows: number;
  errors: string[];
  preview: Record<string, string>[];
  import_type: string;
  filename: string;
}

export interface ImportHistory {
  id: number;
  filename: string;
  import_type: string;
  records_imported: number;
  records_skipped: number;
  status: 'success' | 'partial' | 'failed';
  error_log: string;
  imported_at: string;
}

// ─── Utility ─────────────────────────────────────────────────────────────────────

export type ImportType = 'accounts' | 'income' | 'expenses' | 'assumptions' | 'events';
