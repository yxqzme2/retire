import { StatusBadge } from '../ui/Badge';
import { formatCurrency } from '../../utils/format';
import type { ScenarioSummary } from '../../types';
import { useProjectionSummary } from '../../hooks/useProjection';

interface ScenarioComparisonProps {
  scenarios: ScenarioSummary[];
}

function ScenarioColumn({ scenario }: { scenario: ScenarioSummary }) {
  const { data: summary } = useProjectionSummary(scenario.id);

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700/50">
        <h3 className="text-slate-200 font-semibold text-sm truncate">{scenario.name}</h3>
        <StatusBadge status={scenario.status} size="sm" />
      </div>

      {summary ? (
        <div className="space-y-3">
          <div>
            <p className="text-slate-500 text-xs mb-0.5">Portfolio at Retirement</p>
            <p className="text-slate-100 font-semibold">{formatCurrency(summary.portfolio_at_retirement)}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-0.5">Monthly Income</p>
            <p className="text-slate-100 font-semibold">{formatCurrency(summary.monthly_retirement_income)}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-0.5">Surplus / Gap</p>
            <p className={`font-semibold ${summary.surplus_or_gap >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {summary.surplus_or_gap >= 0 ? '+' : ''}{formatCurrency(summary.surplus_or_gap)}/mo
            </p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-0.5">Portfolio Survives To</p>
            <p className="text-slate-100 font-semibold">
              {summary.portfolio_survival_age != null ? `Age ${summary.portfolio_survival_age}` : '—'}
            </p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-0.5">First Shortfall</p>
            <p className={`font-semibold ${summary.first_shortfall_age ? 'text-red-400' : 'text-emerald-400'}`}>
              {summary.first_shortfall_age ? `Age ${summary.first_shortfall_age}` : 'None'}
            </p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-0.5">Total Tax Drag</p>
            <p className="text-slate-100 font-semibold">{formatCurrency(summary.total_tax_drag)}</p>
          </div>
        </div>
      ) : (
        <p className="text-slate-600 text-xs">Run projection to see results</p>
      )}
    </div>
  );
}

export default function ScenarioComparison({ scenarios }: ScenarioComparisonProps) {
  const compareScenarios = scenarios.slice(0, 3); // max 3 at a time

  return (
    <div className="border border-slate-700 bg-slate-800/60 backdrop-blur-sm rounded-xl p-5">
      <h2 className="text-slate-100 font-semibold text-sm mb-5">Scenario Comparison</h2>
      <div className="flex gap-6 divide-x divide-slate-700/50">
        {compareScenarios.map((s) => (
          <div key={s.id} className="flex-1 first:pl-0 pl-6 min-w-0">
            <ScenarioColumn scenario={s} />
          </div>
        ))}
      </div>
    </div>
  );
}
