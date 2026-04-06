import { useState } from 'react';
import { Play, Download, ChevronDown, ChevronUp, LineChart } from 'lucide-react';
import { useActiveScenarioStore } from '../hooks/useScenario';
import { useProjection, useRunProjection } from '../hooks/useProjection';
import BalanceChart from '../components/charts/BalanceChart';
import IncomeExpenseChart from '../components/charts/IncomeExpenseChart';
import WithdrawalMixChart from '../components/charts/WithdrawalMixChart';
import TaxChart from '../components/charts/TaxChart';
import NetWorthChart from '../components/charts/NetWorthChart';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatCurrency, formatPercentDirect } from '../utils/format';
import { getExportUrl } from '../api/import_export';

export default function Projections() {
  const { activeScenarioId } = useActiveScenarioStore();
  const { results, summary } = useProjection(activeScenarioId);
  const { mutate: runProjection, isPending } = useRunProjection();
  const [showTable, setShowTable] = useState(false);

  const retirementAge = summary.data?.retirement_age ?? 60;
  const projectionData = results.data ?? [];

  if (!activeScenarioId) {
    return <EmptyState icon={<LineChart size={24} />} title="No scenario selected" description="Select a scenario to view projections." />;
  }

  if (results.isLoading || summary.isLoading) return <LoadingSpinner />;

  if (projectionData.length === 0) {
    return (
      <EmptyState
        icon={<Play size={24} />}
        title="No projection data"
        description="Run the projection engine to generate year-by-year results."
        action={<Button variant="primary" onClick={() => runProjection(activeScenarioId)} loading={isPending} leftIcon={<Play size={14} />} size="lg">Run Projection</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions bar */}
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{projectionData.length} years projected</p>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Download size={14} />}
            onClick={() => {
              const url = getExportUrl('accounts', activeScenarioId);
              window.open(url, '_blank');
            }}
          >
            Export Results
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Play size={14} />} onClick={() => runProjection(activeScenarioId)} loading={isPending}>
            Re-run Projection
          </Button>
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Portfolio Value (Net Worth)" subtitle="Total portfolio across all account types by age">
          <NetWorthChart data={projectionData} retirementAge={retirementAge} />
        </Card>
        <Card title="Account Balances by Type" subtitle="Stacked by tax bucket (Roth / Pre-Tax / Taxable / Cash)">
          <BalanceChart data={projectionData} retirementAge={retirementAge} />
        </Card>
        <Card title="Retirement Income vs Expenses" subtitle="All income sources vs spending in retirement">
          <IncomeExpenseChart data={projectionData} retirementAge={retirementAge} />
        </Card>
        <Card title="Withdrawal Mix" subtitle="Source breakdown of retirement income by age">
          <WithdrawalMixChart data={projectionData} retirementAge={retirementAge} />
        </Card>
        <Card title="Annual Tax Burden" subtitle="Federal and state taxes in retirement">
          <TaxChart data={projectionData} retirementAge={retirementAge} />
        </Card>
      </div>

      {/* Year-by-Year Table (collapsible) */}
      <Card
        title="Year-by-Year Results"
        actions={
          <Button variant="ghost" size="sm" onClick={() => setShowTable(!showTable)} rightIcon={showTable ? <ChevronUp size={14} /> : <ChevronDown size={14} />}>
            {showTable ? 'Collapse' : 'Expand'}
          </Button>
        }
      >
        {showTable && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {['Age', 'Year', 'Total Income', 'Expenses', 'Fed Tax', 'Net Flow', 'Portfolio', 'Shortfall'].map((h) => (
                    <th key={h} className="text-right first:text-left pb-3 pr-3 text-slate-500 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projectionData.map((row) => (
                  <tr key={row.id} className={`border-b border-slate-700/20 hover:bg-slate-700/20 ${row.is_shortfall ? 'bg-red-900/10' : ''}`}>
                    <td className="py-2 pr-3 text-slate-300 font-medium">{row.age}</td>
                    <td className="py-2 pr-3 text-right text-slate-500 tabular-nums">{row.year}</td>
                    <td className="py-2 pr-3 text-right text-slate-200 tabular-nums">{formatCurrency(row.total_income)}</td>
                    <td className="py-2 pr-3 text-right text-slate-300 tabular-nums">{formatCurrency(row.total_expenses)}</td>
                    <td className="py-2 pr-3 text-right text-amber-400 tabular-nums">{formatCurrency(row.federal_tax)}</td>
                    <td className={`py-2 pr-3 text-right tabular-nums font-medium ${row.net_cash_flow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {row.net_cash_flow >= 0 ? '+' : ''}{formatCurrency(row.net_cash_flow)}
                    </td>
                    <td className="py-2 pr-3 text-right text-slate-100 tabular-nums font-medium">{formatCurrency(row.total_portfolio_value)}</td>
                    <td className="py-2 text-right">
                      {row.is_shortfall && <span className="text-red-400 font-medium">DEPLETED</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!showTable && <p className="text-slate-500 text-sm text-center py-2">Click "Expand" to view the full year-by-year table</p>}
      </Card>
    </div>
  );
}
