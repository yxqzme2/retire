import { useEffect } from 'react';
import { useForm } from '../../hooks/useForm';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Toggle from '../ui/Toggle';
import Button from '../ui/Button';
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
            value={values.name}
            onChange={(e) => setValue('name', e.target.value)}
            placeholder="e.g. Work 401(k)"
            required
          />
        </div>
        <Select
          label="Account Type"
          options={accountTypeOptions}
          value={values.account_type}
          onChange={(e) => setValue('account_type', e.target.value as any)}
        />
        <Select
          label="Tax Treatment"
          options={taxTreatmentOptions}
          value={values.tax_treatment}
          onChange={(e) => setValue('tax_treatment', e.target.value as any)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Institution"
          value={values.institution ?? ''}
          onChange={(e) => setValue('institution', e.target.value)}
          placeholder="e.g. Fidelity"
        />
        <Select
          label="Owner"
          options={ownerOptions}
          value={values.owner}
          onChange={(e) => setValue('owner', e.target.value as any)}
        />
      </div>

      {/* Financial Details */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Current Balance"
          type="number"
          value={values.current_balance ?? 0}
          onChange={(e) => setValue('current_balance', parseFloat(e.target.value) || 0)}
          leftAddon="$"
          min={0}
          step={1000}
        />
        <Input
          label="Expected Return %"
          type="number"
          value={values.expected_annual_return_percent ?? 7}
          onChange={(e) => setValue('expected_annual_return_percent', parseFloat(e.target.value) || 0)}
          rightAddon="%"
          min={0}
          max={30}
          step={0.1}
        />
      </div>

      {!isIncomeType && (
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Annual Contribution"
            type="number"
            value={values.annual_contribution ?? 0}
            onChange={(e) => setValue('annual_contribution', parseFloat(e.target.value) || 0)}
            leftAddon="$"
            min={0}
            step={500}
          />
          <Input
            label="Employer Match %"
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
          type="number"
          value={values.withdrawal_priority ?? 5}
          onChange={(e) => setValue('withdrawal_priority', parseInt(e.target.value) || 5)}
          helper="1 = first to withdraw, 10 = last"
          min={1}
          max={10}
        />
      </div>

      {isIncomeType && (
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Monthly Income"
            type="number"
            value={values.starting_monthly_income ?? 0}
            onChange={(e) => setValue('starting_monthly_income', parseFloat(e.target.value) || undefined)}
            leftAddon="$"
            min={0}
          />
          <Input
            label="Start Age"
            type="number"
            value={values.income_start_age ?? ''}
            onChange={(e) => setValue('income_start_age', parseInt(e.target.value) || undefined)}
            min={50}
            max={90}
          />
          <Input
            label="COLA %"
            type="number"
            value={values.cola_percent ?? 0}
            onChange={(e) => setValue('cola_percent', parseFloat(e.target.value) || 0)}
            rightAddon="%"
            min={0}
            max={10}
            step={0.5}
          />
        </div>
      )}

      {/* Toggles */}
      <div className="space-y-3 pt-2">
        <Toggle
          label="Include in Projection"
          checked={values.include_in_projection ?? true}
          onChange={(v) => setValue('include_in_projection', v)}
        />
        <Toggle
          label="Spend Dividends in Retirement"
          description="Use dividend income to cover expenses instead of reinvesting"
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
