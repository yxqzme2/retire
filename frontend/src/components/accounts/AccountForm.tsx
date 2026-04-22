import { useEffect } from 'react';
import { useForm } from '../../hooks/useForm';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Toggle from '../ui/Toggle';
import Button from '../ui/Button';
import FieldHint from '../ui/FieldHint';
import type { Account, AccountCreate, AccountUpdate } from '../../types';

interface AccountFormProps {
  scenarioId: number;
  account?: Account | null;
  onSubmit: (data: AccountCreate | AccountUpdate) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const accountTypeOptions = [
  { value: '401k', label: '401(k)' },
  { value: 'roth_ira', label: 'Roth IRA' },
  { value: 'taxable_brokerage', label: 'Taxable Brokerage' },
  { value: 'dividend_portfolio', label: 'Dividend Portfolio' },
  { value: 'cash_hysa', label: 'Cash / HYSA' },
  { value: 'pension', label: 'Pension' },
  { value: 'social_security', label: 'Social Security' },
  { value: 'hsa', label: 'HSA' },
  { value: 'other', label: 'Other' },
];

const taxTreatmentOptions = [
  { value: 'taxable', label: 'Taxable' },
  { value: 'tax_deferred', label: 'Tax-Deferred' },
  { value: 'tax_free', label: 'Tax-Free (Roth)' },
  { value: 'partially_taxable', label: 'Partially Taxable' },
];

const ownerOptions = [
  { value: 'self', label: 'Self' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'joint', label: 'Joint' },
];

export default function AccountForm({ scenarioId, account, onSubmit, onCancel, isLoading }: AccountFormProps) {
  const { values, setValue, setValues } = useForm<AccountCreate>({
    scenario_id: scenarioId,
    name: '',
    account_type: '401k',
    tax_treatment: 'tax_deferred',
    institution: '',
    owner: 'self',
    current_balance: 0,
    annual_contribution: 0,
    employer_match_percent: 0,
    expected_annual_return_percent: 7.0,
    dividend_yield_percent: 0,
    contribution_stop_age: undefined,
    withdrawal_priority: 5,
    include_in_projection: true,
    spend_dividends_in_retirement: false,
    starting_monthly_income: undefined,
    income_start_age: undefined,
    income_end_age: undefined,
    cola_percent: 0,
    notes: '',
  });

  useEffect(() => {
    if (account) {
      setValues({
        scenario_id: account.scenario_id,
        name: account.name,
        account_type: account.account_type,
        tax_treatment: account.tax_treatment,
        institution: account.institution,
        owner: account.owner,
        current_balance: account.current_balance,
        annual_contribution: account.annual_contribution,
        employer_match_percent: account.employer_match_percent,
        expected_annual_return_percent: account.expected_annual_return_percent,
        dividend_yield_percent: account.dividend_yield_percent,
        contribution_stop_age: account.contribution_stop_age ?? undefined,
        withdrawal_priority: account.withdrawal_priority,
        include_in_projection: account.include_in_projection,
        spend_dividends_in_retirement: account.spend_dividends_in_retirement,
        starting_monthly_income: account.starting_monthly_income ?? undefined,
        income_start_age: account.income_start_age ?? undefined,
        income_end_age: account.income_end_age ?? undefined,
        cola_percent: account.cola_percent,
        notes: account.notes,
      });
    }
  }, [account]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  const isIncomeType = values.account_type === 'pension' || values.account_type === 'social_security';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Input
            label="Account Name"
            hint="Give this account a recognizable name — e.g. 'Work 401(k) at Fidelity' or 'Leigh's Roth IRA'."
            value={values.name}
            onChange={(e) => setValue('name', e.target.value)}
            placeholder="e.g. Work 401(k)"
            required
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
            Account Type
            <FieldHint content={
              <div className="space-y-1">
                <p className="font-semibold text-slate-100 mb-1">Account Types:</p>
                <p><span className="text-blue-300">401(k) / 403(b)</span> — employer retirement plan, pre-tax contributions</p>
                <p><span className="text-blue-300">Roth IRA</span> — after-tax contributions, tax-free growth & withdrawals</p>
                <p><span className="text-blue-300">Taxable Brokerage</span> — regular investment account, capital gains taxed</p>
                <p><span className="text-blue-300">Dividend Portfolio</span> — brokerage focused on dividend income</p>
                <p><span className="text-blue-300">Cash / HYSA</span> — savings account or high-yield savings</p>
                <p><span className="text-blue-300">Pension</span> — defined-benefit plan from an employer</p>
                <p><span className="text-blue-300">Social Security</span> — government retirement benefit</p>
                <p><span className="text-blue-300">HSA</span> — Health Savings Account, triple tax-advantaged</p>
              </div>
            } width="lg" position="right" />
          </label>
          <Select
            options={accountTypeOptions}
            value={values.account_type}
            onChange={(e) => setValue('account_type', e.target.value as any)}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
            Tax Treatment
            <FieldHint content={
              <div className="space-y-1">
                <p className="font-semibold text-slate-100 mb-1">How this account is taxed:</p>
                <p><span className="text-emerald-300">Tax-Deferred</span> — you pay taxes when you withdraw (401k, traditional IRA). Contributions reduce taxable income now.</p>
                <p><span className="text-emerald-300">Tax-Free</span> — contributions are after-tax but growth and withdrawals are tax-free (Roth IRA/401k).</p>
                <p><span className="text-emerald-300">Taxable</span> — dividends and gains taxed each year (brokerage, HYSA).</p>
                <p><span className="text-emerald-300">Partially Taxable</span> — only a portion is taxed (Social Security, some pensions).</p>
              </div>
            } width="lg" position="right" />
          </label>
          <Select
            options={taxTreatmentOptions}
            value={values.tax_treatment}
            onChange={(e) => setValue('tax_treatment', e.target.value as any)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Institution"
          hint="The bank, brokerage, or plan provider — e.g. Fidelity, Vanguard, Schwab. For display purposes only."
          value={values.institution ?? ''}
          onChange={(e) => setValue('institution', e.target.value)}
          placeholder="e.g. Fidelity"
        />
        <div>
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
            Owner
            <FieldHint content="Who owns this account. 'Self' = you, 'Spouse' = your partner, 'Joint' = both of you. Used for household net worth tracking." />
          </label>
          <Select
            options={ownerOptions}
            value={values.owner}
            onChange={(e) => setValue('owner', e.target.value as any)}
          />
        </div>
      </div>

      {/* Financial Details */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Current Balance"
          hint="Today's actual balance in this account. Check your last statement or log into your brokerage to get the current value."
          type="number"
          value={values.current_balance ?? 0}
          onChange={(e) => setValue('current_balance', parseFloat(e.target.value) || 0)}
          leftAddon="$"
          min={0}
          step={1000}
        />
        <Input
          label="Expected Return %"
          hint={
            <div>
              <p className="font-semibold text-slate-100 mb-1">Annual growth rate for this specific account.</p>
              <p className="mb-1">Common benchmarks:</p>
              <p>• 401k / Roth (stocks): <span className="text-emerald-300">6–8%</span></p>
              <p>• Dividend portfolio: <span className="text-emerald-300">5–7%</span></p>
              <p>• Cash / HYSA: <span className="text-emerald-300">3–5%</span></p>
              <p>• Bonds / conservative: <span className="text-emerald-300">3–4%</span></p>
              <p className="mt-1 text-slate-400">The S&amp;P 500 has averaged ~10% historically but past performance doesn't guarantee future results.</p>
            </div>
          }
          type="number"
          value={values.expected_annual_return_percent ?? 7}
          onChange={(e) => setValue('expected_annual_return_percent', parseFloat(e.target.value) || 0)}
          rightAddon="%"
          min={0}
          max={30}
          step={0.1}
          width="lg"
        />
      </div>

      {!isIncomeType && (
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Annual Contribution"
            hint={
              <div>
                <p className="font-semibold text-slate-100 mb-1">How much you contribute per year.</p>
                <p className="mb-1">2024 IRS limits:</p>
                <p>• 401(k): <span className="text-blue-300">$23,000</span> ($30,500 if 50+)</p>
                <p>• Roth IRA: <span className="text-blue-300">$7,000</span> ($8,000 if 50+)</p>
                <p>• HSA: <span className="text-blue-300">$4,150</span> individual / $8,300 family</p>
                <p className="mt-1 text-slate-400">Include only your contribution — add employer match separately.</p>
              </div>
            }
            type="number"
            value={values.annual_contribution ?? 0}
            onChange={(e) => setValue('annual_contribution', parseFloat(e.target.value) || 0)}
            leftAddon="$"
            min={0}
            step={500}
          />
          <Input
            label="Employer Match %"
            hint={
              <div>
                <p className="font-semibold text-slate-100 mb-1">Your employer's matching contribution as a % of your contribution.</p>
                <p>Example: If your employer matches 50% up to 6% of salary, and you contribute 6%, enter <span className="text-blue-300">50%</span> here — the engine will add half your contribution as a bonus deposit.</p>
                <p className="mt-1 text-slate-400">Leave at 0 if no match or for IRAs/taxable accounts.</p>
              </div>
            }
            type="number"
            value={values.employer_match_percent ?? 0}
            onChange={(e) => setValue('employer_match_percent', parseFloat(e.target.value) || 0)}
            rightAddon="%"
            min={0}
            max={100}
            step={0.5}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Dividend Yield %"
          hint={
            <div>
              <p className="font-semibold text-slate-100 mb-1">Annual dividend income as a % of account value.</p>
              <p>Only relevant for dividend-focused accounts. If you have a dividend portfolio yielding 3.2%, enter <span className="text-blue-300">3.2</span>.</p>
              <p className="mt-1 text-slate-400">Leave at 0 for growth accounts (401k, Roth) where dividends are reinvested automatically.</p>
            </div>
          }
          type="number"
          value={values.dividend_yield_percent ?? 0}
          onChange={(e) => setValue('dividend_yield_percent', parseFloat(e.target.value) || 0)}
          rightAddon="%"
          min={0}
          max={20}
          step={0.1}
        />
        <Input
          label="Withdrawal Priority"
          hint={
            <div>
              <p className="font-semibold text-slate-100 mb-1">Order to draw from this account when retirement spending needs extra cash.</p>
              <p><span className="text-blue-300">1</span> = first to withdraw (e.g. cash/HYSA)</p>
              <p><span className="text-blue-300">5</span> = middle (e.g. taxable brokerage)</p>
              <p><span className="text-blue-300">10</span> = last resort (e.g. Roth IRA)</p>
              <p className="mt-1 text-slate-400">Only matters if you choose "Custom Priority" withdrawal strategy in Assumptions.</p>
            </div>
          }
          type="number"
          value={values.withdrawal_priority ?? 5}
          onChange={(e) => setValue('withdrawal_priority', parseInt(e.target.value) || 5)}
          helper="1 = first to withdraw, 10 = last"
          min={1}
          max={10}
        />
      </div>

      {!isIncomeType && (
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Contribution Stop Age"
            hint="The age at which you stop making contributions to this account — usually your planned retirement age. Leave blank to use your global retirement age."
            type="number"
            value={values.contribution_stop_age ?? ''}
            onChange={(e) => setValue('contribution_stop_age', parseInt(e.target.value) || undefined)}
            placeholder="Defaults to retirement age"
            min={40}
            max={80}
          />
        </div>
      )}

      {isIncomeType && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Income Details
            <FieldHint content="For Pension and Social Security accounts, enter the monthly benefit amount and when it starts. The projection engine will automatically include this as income — no need to also add it on the Income page." width="lg" />
          </p>
          <div className="grid grid-cols-3 gap-4 pt-1">
            <Input
              label="Monthly Income"
              hint="The fixed monthly benefit amount at the time it starts. For Social Security, check your most recent SSA statement at ssa.gov/myaccount."
              type="number"
              value={values.starting_monthly_income ?? 0}
              onChange={(e) => setValue('starting_monthly_income', parseFloat(e.target.value) || undefined)}
              leftAddon="$"
              min={0}
            />
            <Input
              label="Start Age"
              hint={
                <div>
                  <p className="font-semibold text-slate-100 mb-1">The age at which this income begins.</p>
                  <p><span className="text-blue-300">Pension:</span> usually your retirement age (e.g. 60)</p>
                  <p><span className="text-blue-300">Social Security:</span></p>
                  <p>• Age 62 — reduced benefit (~75%)</p>
                  <p>• Age 67 — full benefit (born after 1960)</p>
                  <p>• Age 70 — maximum benefit (~132%)</p>
                </div>
              }
              type="number"
              value={values.income_start_age ?? ''}
              onChange={(e) => setValue('income_start_age', parseInt(e.target.value) || undefined)}
              min={50}
              max={90}
            />
            <Input
              label="COLA %"
              hint="Cost-of-Living Adjustment — the annual raise this benefit receives to keep up with inflation. Social Security has typically adjusted ~2–3% per year. Many pensions have 0% COLA."
              type="number"
              value={values.cola_percent ?? 0}
              onChange={(e) => setValue('cola_percent', parseFloat(e.target.value) || 0)}
              rightAddon="%"
              min={0}
              max={10}
              step={0.5}
            />
          </div>
        </div>
      )}

      {/* Toggles */}
      <div className="space-y-3 pt-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-300 flex items-center gap-1">
              Include in Projection
              <FieldHint content="When enabled, this account's balance is tracked and grown in the projection. Disable temporarily to model 'what if I didn't have this account' scenarios." />
            </p>
          </div>
          <Toggle
            label=""
            checked={values.include_in_projection ?? true}
            onChange={(v) => setValue('include_in_projection', v)}
          />
        </div>
        <Toggle
          label="Spend Dividends in Retirement"
          description="Use dividend income to cover living expenses instead of reinvesting. Best for dividend-focused accounts in retirement."
          checked={values.spend_dividends_in_retirement ?? false}
          onChange={(v) => setValue('spend_dividends_in_retirement', v)}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
          Notes
        </label>
        <textarea
          value={values.notes ?? ''}
          onChange={(e) => setValue('notes', e.target.value)}
          rows={2}
          className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600"
          placeholder="Optional notes..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onCancel} type="button">Cancel</Button>
        <Button variant="primary" type="submit" loading={isLoading}>
          {account ? 'Update Account' : 'Add Account'}
        </Button>
      </div>
    </form>
  );
}
