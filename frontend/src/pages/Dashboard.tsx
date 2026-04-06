import { Play, DollarSign, TrendingUp, Receipt, AlertTriangle, Shield, CalendarClock } from 'lucide-react';
import { useActiveScenarioStore } from '../hooks/useScenario';
import { useActiveProjection, useRunProjection } from '../hooks/useProjection';
import SummaryCard from '../components/dashboard/SummaryCard';
import StatusBadge from '../components/dashboard/StatusBadge';
import NetWorthChart from '../components/charts/NetWorthChart';
import IncomeExpenseChart from '../components/charts/IncomeExpenseChart';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { formatCurrency, formatCurrencyCompact } from '../utils/format';

export default function Dashboard() {
  const { activeScenarioId } = useActiveScenarioStore();
  const { results, summary } = useActiveProjection();
  const { mutate: runProjection, isPending } = useRunProjection();

  const hasResults = results.data && results.data.length > 0;
  const summaryData = summary.data;
  const projectionData = results.data ?? [];
  const retirementAge = summaryData?.retirement_age ?? 60;

  if (!activeScenarioId) {
    return (
      <EmptyState
        icon={<TrendingUp size={24} />}
        title="No scenario selected"
        description="Select a scenario from the sidebar to view your retirement projection."
      />
    );
  }

  if (results.isLoading || summary.isLoading) {
    return <LoadingSpinner message="Loading projection..." />;
  }

  if (!hasResults) {
    return (
      <EmptyState
        icon={<Play size={24} />}
        title="No projection results yet"
        description="Run a projection to see your retirement outlook, portfolio trajectory, and income analysis."
        action={
          <Button
            variant="primary"
            onClick={() => runProjection(activeScenarioId)}
            loading={isPending}
            leftIcon={<Play size={14} />}
            size="lg"
          >
            Run Projection
          </Button>
        }
      />
    );
  }

  const surplusColor = (summaryData?.surplus_or_gap ?? 0) >= 0 ? 'emerald' : 'red';

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <div className="flex items-center justify-between">
        {summaryData && (
          <div className="flex items-center gap-3">
            <StatusBadge status={summaryData.scenario_status} size="lg" showIcon />
            <span className="text-slate-500 text-sm">
              Projection covers {summaryData.years_of_data} years
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={() => runProjection(activeScenarioId)}
          loading={isPending}
          leftIcon={<Play size={12} />}
          size="sm"
        >
          Re-run
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Portfolio at Retirement"
          value={formatCurrencyCompact(summaryData?.portfolio_at_retirement ?? 0)}
          subtitle={`At age ${retirementAge}`}
          icon={<DollarSign size={18} />}
          color="blue"
        />
        <SummaryCard
          title="Monthly Income"
          value={formatCurrency(summaryData?.monthly_retirement_income ?? 0)}
          subtitle="First year of retirement"
          icon={<TrendingUp size={18} />}
          color="emerald"
        />
        <SummaryCard
          title="Monthly Spending"
          value={formatCurrency(summaryData?.monthly_spending_target ?? 0)}
          subtitle="Estimated first year"
          icon={<Receipt size={18} />}
          color="amber"
        />
        <SummaryCard
          title="Monthly Surplus / Gap"
          value={`${(summaryData?.surplus_or_gap ?? 0) >= 0 ? '+' : ''}${formatCurrency(summaryData?.surplus_or_gap ?? 0)}`}
          subtitle="After tax, per month"
          trend={(summaryData?.surplus_or_gap ?? 0) >= 0 ? 'up' : 'down'}
          icon={<AlertTriangle size={18} />}
          color={surplusColor}
        />
      </div>

      {/* Secondary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <SummaryCard
          title="Portfolio Survives To"
          value={summaryData?.portfolio_survival_age ? `Age ${summaryData.portfolio_survival_age}` : 'Unknown'}
          subtitle={summaryData?.portfolio_survival_age ? 'Portfolio remains positive' : 'Run projection first'}
          icon={<Shield size={18} />}
          color="emerald"
        />
        <SummaryCard
          title="First Shortfall"
          value={summaryData?.first_shortfall_age ? `Age ${summaryData.first_shortfall_age}` : 'None'}
          subtitle={summaryData?.first_shortfall_age ? 'Portfolio depleted at this age' : 'No shortfall detected'}
          icon={<AlertTriangle size={18} />}
          color={summaryData?.first_shortfall_age ? 'red' : 'emerald'}
        />
        <SummaryCard
          title="Total Tax Drag"
          value={formatCurrencyCompact(summaryData?.total_tax_drag ?? 0)}
          subtitle="Cumulative retirement taxes"
          icon={<CalendarClock size={18} />}
          color="amber"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Portfolio Value Over Time" subtitle="Total across all accounts by age">
          <NetWorthChart data={projectionData} retirementAge={retirementAge} />
        </Card>
        <Card title="Retirement Income vs Expenses" subtitle="Income sources stacked against spending">
          <IncomeExpenseChart data={projectionData} retirementAge={retirementAge} />
        </Card>
      </div>
    </div>
  );
}
