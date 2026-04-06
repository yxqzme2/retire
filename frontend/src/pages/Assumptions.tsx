import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SlidersHorizontal, CheckCircle2 } from 'lucide-react';
import { getAssumptions, updateAssumptions } from '../api/assumptions';
import { useActiveScenarioStore } from '../hooks/useScenario';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Toggle from '../components/ui/Toggle';
import Input from '../components/ui/Input';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import AssumptionControl from '../components/assumptions/AssumptionControl';
import type { AssumptionSet, AssumptionSetUpdate, WithdrawalStrategy, ReturnScenario } from '../types';

const pct = (v: number) => `${v.toFixed(1)}%`;

export default function Assumptions() {
  const { activeScenarioId } = useActiveScenarioStore();
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [local, setLocal] = useState<AssumptionSetUpdate | null>(null);

  const { data: assumptions, isLoading } = useQuery({
    queryKey: ['assumptions', activeScenarioId],
    queryFn: () => getAssumptions(activeScenarioId!),
    enabled: activeScenarioId != null,
  });

  useEffect(() => {
    if (assumptions && !local) {
      setLocal({ ...assumptions });
    }
  }, [assumptions]);

  const updateMut = useMutation({
    mutationFn: (data: AssumptionSetUpdate) => updateAssumptions(activeScenarioId!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assumptions', activeScenarioId] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  if (!activeScenarioId) return <EmptyState icon={<SlidersHorizontal size={24} />} title="No scenario selected" />;
  if (isLoading || !local) return <LoadingSpinner />;

  const set = (key: keyof AssumptionSetUpdate, value: any) => setLocal((prev) => ({ ...prev!, [key]: value }));

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          variant={saved ? 'success' : 'primary'}
          onClick={() => updateMut.mutate(local!)}
          loading={updateMut.isPending}
          leftIcon={saved ? <CheckCircle2 size={14} /> : undefined}
        >
          {saved ? 'Saved!' : 'Save Assumptions'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Returns */}
        <Card title="Investment Returns" subtitle="Expected annual portfolio growth rates">
          <div className="space-y-1 divide-y divide-slate-700/30">
            <AssumptionControl label="Baseline Return" tooltip="Expected average annual return in normal market conditions" min={0} max={15} step={0.1} value={local.baseline_return ?? 7} onChange={(v) => set('baseline_return', v)} formatValue={pct} />
            <AssumptionControl label="Conservative Return" tooltip="Expected return in a conservative/bear market scenario" min={0} max={10} step={0.1} value={local.conservative_return ?? 4} onChange={(v) => set('conservative_return', v)} formatValue={pct} />
            <AssumptionControl label="Aggressive Return" tooltip="Expected return in a strong bull market scenario" min={0} max={20} step={0.1} value={local.aggressive_return ?? 10} onChange={(v) => set('aggressive_return', v)} formatValue={pct} />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Active Return Scenario</p>
            <div className="flex gap-2">
              {(['baseline', 'conservative', 'aggressive'] as ReturnScenario[]).map((s) => (
                <button
                  key={s}
                  onClick={() => set('active_return_scenario', s)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${local.active_return_scenario === s ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Inflation */}
        <Card title="Inflation" subtitle="Price inflation assumptions">
          <div className="space-y-1 divide-y divide-slate-700/30">
            <AssumptionControl label="General Inflation Rate" tooltip="Overall consumer price inflation (CPI)" min={0} max={10} step={0.1} value={(local.inflation_rate ?? 0.03) * 100} onChange={(v) => set('inflation_rate', v / 100)} formatValue={pct} />
            <AssumptionControl label="Healthcare Inflation Rate" tooltip="Medical cost inflation, typically higher than general CPI" min={0} max={15} step={0.1} value={(local.healthcare_inflation_rate ?? 0.05) * 100} onChange={(v) => set('healthcare_inflation_rate', v / 100)} formatValue={pct} />
          </div>
        </Card>

        {/* Taxes */}
        <Card title="Tax Rates" subtitle="Effective tax rates for projection">
          <div className="space-y-1 divide-y divide-slate-700/30">
            <AssumptionControl label="Federal Effective Rate" tooltip="Effective federal income tax rate on ordinary income" min={0} max={40} step={0.5} value={(local.federal_tax_rate ?? 0.22) * 100} onChange={(v) => set('federal_tax_rate', v / 100)} formatValue={pct} />
            <AssumptionControl label="State Income Tax Rate" tooltip="State income tax rate (0% for TX, FL, etc.)" min={0} max={15} step={0.1} value={(local.state_tax_rate ?? 0) * 100} onChange={(v) => set('state_tax_rate', v / 100)} formatValue={pct} />
            <AssumptionControl label="Qualified Dividend Rate" tooltip="Preferential rate on qualified dividends (0%, 15%, or 20%)" min={0} max={25} step={1} value={(local.qualified_dividend_rate ?? 0.15) * 100} onChange={(v) => set('qualified_dividend_rate', v / 100)} formatValue={pct} />
            <AssumptionControl label="Long-Term Capital Gains Rate" tooltip="Rate on long-term capital gains" min={0} max={25} step={1} value={(local.long_term_capital_gains_rate ?? 0.15) * 100} onChange={(v) => set('long_term_capital_gains_rate', v / 100)} formatValue={pct} />
            <AssumptionControl label="SS Taxable Portion" tooltip="Percentage of Social Security benefits subject to income tax (max 85%)" min={0} max={85} step={5} value={(local.social_security_taxable_percent ?? 0.85) * 100} onChange={(v) => set('social_security_taxable_percent', v / 100)} formatValue={pct} />
          </div>
        </Card>

        {/* Withdrawal Strategy */}
        <Card title="Withdrawal Strategy" subtitle="Order to draw down accounts in retirement">
          <div className="space-y-2 mb-4">
            {([
              { value: 'taxable_first', label: 'Taxable First', desc: 'Draw taxable accounts → pre-tax → Roth. Preserves tax-advantaged growth.' },
              { value: 'pretax_first', label: 'Pre-Tax First', desc: 'Draw 401k/IRA first to control future RMDs.' },
              { value: 'dividends_first', label: 'Dividends First', desc: 'Spend dividends, then taxable, then pre-tax.' },
              { value: 'custom_priority', label: 'Custom Priority', desc: 'Follow the priority number set on each account.' },
            ] as { value: WithdrawalStrategy; label: string; desc: string }[]).map((opt) => (
              <button
                key={opt.value}
                onClick={() => set('withdrawal_strategy', opt.value)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${local.withdrawal_strategy === opt.value ? 'bg-blue-600/15 border-blue-500 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
              >
                <p className="font-medium text-sm">{opt.label}</p>
                <p className="text-xs mt-0.5 opacity-70">{opt.desc}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Age-Based Adjustments */}
        <Card title="Age-Based Adjustments" subtitle="Modify spending patterns as you age">
          <div className="space-y-4 divide-y divide-slate-700/30">
            <div className="pb-4">
              <p className="text-sm font-medium text-slate-300 mb-3">Spending Reduction</p>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Start Age" type="number" value={local.spending_reduction_age ?? ''} onChange={(e) => set('spending_reduction_age', parseInt(e.target.value) || null)} placeholder="None" min={55} max={100} />
                <Input label="Reduction %" type="number" value={(local.spending_reduction_percent ?? 0) * 100} onChange={(e) => set('spending_reduction_percent', (parseFloat(e.target.value) || 0) / 100)} rightAddon="%" min={0} max={50} step={5} />
              </div>
            </div>
            <div className="pt-4">
              <p className="text-sm font-medium text-slate-300 mb-3">Medical Cost Increase</p>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Start Age" type="number" value={local.medical_increase_age ?? ''} onChange={(e) => set('medical_increase_age', parseInt(e.target.value) || null)} placeholder="None" min={55} max={100} />
                <Input label="Extra Increase %" type="number" value={(local.medical_increase_percent ?? 0) * 100} onChange={(e) => set('medical_increase_percent', (parseFloat(e.target.value) || 0) / 100)} rightAddon="%" min={0} max={20} step={1} />
              </div>
            </div>
          </div>
        </Card>

        {/* Stress Tests */}
        <Card title="Stress Tests & Options" subtitle="Optional scenario modifiers">
          <div className="space-y-4">
            <Toggle label="Enable RMDs" description="Apply Required Minimum Distribution rules from age 73" checked={local.rmd_enabled ?? true} onChange={(v) => set('rmd_enabled', v)} />
            <Toggle label="Roth Conversion Strategy" description="Model Roth conversions to reduce future tax burden" checked={local.roth_conversion_enabled ?? false} onChange={(v) => set('roth_conversion_enabled', v)} />
            <Toggle label="Bear Market Stress Test" description="Apply a 30% drawdown at the start of retirement" checked={local.bear_market_stress_test ?? false} onChange={(v) => set('bear_market_stress_test', v)} />
            <Toggle label="Sequence of Returns Risk" description="Apply poor early returns to stress-test the plan" checked={local.sequence_of_returns_stress ?? false} onChange={(v) => set('sequence_of_returns_stress', v)} />
          </div>
        </Card>
      </div>
    </div>
  );
}
