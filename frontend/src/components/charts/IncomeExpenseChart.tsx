import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { ProjectionResult } from '../../types';
import { formatCurrency } from '../../utils/format';

interface IncomeExpenseChartProps {
  data: ProjectionResult[];
  retirementAge: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl min-w-[180px]">
      <p className="text-slate-400 text-xs mb-2 font-medium">Age {label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 text-xs mb-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
            <span className="text-slate-400">{entry.name}</span>
          </span>
          <span className="text-slate-100 font-medium">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function IncomeExpenseChart({ data, retirementAge }: IncomeExpenseChartProps) {
  // Only show retirement years for this chart to keep it readable
  const retirementData = data.filter((d) => d.age >= retirementAge);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={retirementData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.5} />
        <XAxis
          dataKey="age"
          tick={{ fill: '#94A3B8', fontSize: 11 }}
          axisLine={{ stroke: '#334155' }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          tick={{ fill: '#94A3B8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={55}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 11, color: '#94A3B8', paddingTop: 8 }}
          iconType="circle"
          iconSize={8}
        />
        <Bar dataKey="pension_income" name="Pension" stackId="income" fill="#60A5FA" radius={[0, 0, 0, 0]} />
        <Bar dataKey="ss_income" name="Social Security" stackId="income" fill="#34D399" radius={[0, 0, 0, 0]} />
        <Bar dataKey="dividend_income" name="Dividends" stackId="income" fill="#FBBF24" radius={[0, 0, 0, 0]} />
        <Bar dataKey="portfolio_withdrawal" name="Withdrawals" stackId="income" fill="#94A3B8" radius={[2, 2, 0, 0]} />
        <Line
          type="monotone"
          dataKey="total_expenses"
          name="Expenses"
          stroke="#EF4444"
          strokeWidth={2}
          dot={false}
          strokeDasharray="5 3"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
