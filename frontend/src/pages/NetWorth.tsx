import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { useActiveScenarioStore } from '../hooks/useScenario';
import { useActiveProjection } from '../hooks/useProjection';
import NetWorthChart from '../components/charts/NetWorthChart';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SummaryCard from '../components/dashboard/SummaryCard';
import { formatCurrencyCompact } from '../utils/format';
import type { ProjectionResult } from '../types';

const RETIREMENT_AGE_OPTIONS = [
  { value: '62', label: 'Age 62' },
  { value: '65', label: 'Age 65' },
  { value: '67', label: 'Age 67' },
  { value: '70', label: 'Age 70' },
];

export default function NetWorth() {
  const { activeScenarioId } = useActiveScenarioStore();
  const { results, summary } = useActiveProjection();
  const [selectedRetirementAge, setSelectedRetirementAge] = useState('67');

  const projectionData = results.data ?? [];
  const summaryData = summary.data;

  if (!activeScenarioId) {
    return (
      <EmptyState
        icon={<TrendingUp size={24} />}
        title="No scenario selected"
        description="Select a scenario from the sidebar to view net worth projections."
      />
    );
  }

  if (results.isLoading || summary.isLoading) {
    return <LoadingSpinner message="Loading projection..." />;
  }

  if (projectionData.length === 0) {
    return (
      <EmptyState
        icon={<TrendingUp size={24} />}
        title="No projection results yet"
        description="Run a projection to see your net worth trajectory."
      />
    );
  }

  const selectedAge = Number(selectedRetirementAge);

  // Find data points for the selected retirement age
  const dataAtRetirement = projectionData.find((d) => d.age === selectedAge);
  const netWorthAtRetirement = dataAtRetirement?.total_portfolio_value ?? 0;

  // Find peak net worth and when it occurs
  let peakNetWorth = 0;
  let peakAge = 0;
  projectionData.forEach((d) => {
    if (d.total_portfolio_value > peakNetWorth) {
      peakNetWorth = d.total_portfolio_value;
      peakAge = d.age;
    }
  });

  // Find minimum net worth after retirement
  let minNetWorth = netWorthAtRetirement;
  let minAge = selectedAge;
  projectionData.filter((d) => d.age >= selectedAge).forEach((d) => {
    if (d.total_portfolio_value < minNetWorth) {
      minNetWorth = d.total_portfolio_value;
      minAge = d.age;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Net Worth Projection</h1>
          <p className="text-slate-400 text-sm mt-1">Model your net worth trajectory over time</p>
        </div>
        <div className="w-48">
          <label className="text-xs text-slate-400 font-medium block mb-2">
            Retirement Age
          </label>
          <Select
            value={selectedRetirementAge}
            onChange={(e) => setSelectedRetirementAge(e.target.value)}
            options={RETIREMENT_AGE_OPTIONS}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Net Worth at Retirement"
          value={formatCurrencyCompact(netWorthAtRetirement)}
          subtitle={`At age ${selectedAge}`}
          icon={<TrendingUp size={18} />}
          color="blue"
        />
        <SummaryCard
          title="Peak Net Worth"
          value={formatCurrencyCompact(peakNetWorth)}
          subtitle={`At age ${peakAge}`}
          icon={<TrendingUp size={18} />}
          color="emerald"
        />
        <SummaryCard
          title="Minimum After Retirement"
          value={formatCurrencyCompact(Math.max(0, minNetWorth))}
          subtitle={`At age ${minAge}`}
          icon={<TrendingUp size={18} />}
          color={minNetWorth < 0 ? 'red' : 'amber'}
        />
      </div>

      {/* Chart */}
      <Card
        title="Portfolio Value Over Time"
        subtitle={`Net worth projection from age ${Math.min(...projectionData.map((d) => d.age))} to ${Math.max(...projectionData.map((d) => d.age))}`}
      >
        <NetWorthChart data={projectionData} retirementAge={selectedAge} />
      </Card>
    </div>
  );
}
