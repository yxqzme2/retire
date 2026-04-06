import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { ProjectionResult } from '../../types';
import { formatCurrency } from '../../utils/format';

interface NetWorthChartProps {
  data: ProjectionResult[];
  retirementAge: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl">
      <p className="text-slate-400 text-xs mb-1.5 font-medium">Age {label}</p>
      <p className="text-slate-100 font-semibold text-sm">{formatCurrency(payload[0]?.value ?? 0)}</p>
      {payload[0]?.payload?.is_shortfall && (
        <p className="text-red-400 text-xs mt-1">Portfolio depleted</p>
      )}
    </div>
  );
};

export default function NetWorthChart({ data, retirementAge }: NetWorthChartProps) {
  const hasShortfall = data.some((d) => d.is_shortfall);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="networth-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.5} />
        <XAxis
          dataKey="age"
          tick={{ fill: '#94A3B8', fontSize: 11 }}
          axisLine={{ stroke: '#334155' }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`}
          tick={{ fill: '#94A3B8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          x={retirementAge}
          stroke="#3B82F6"
          strokeDasharray="4 4"
          strokeOpacity={0.7}
          label={{ value: 'Retirement', position: 'top', fill: '#3B82F6', fontSize: 10 }}
        />
        {hasShortfall && (
          <ReferenceLine y={0} stroke="#EF4444" strokeDasharray="3 3" strokeOpacity={0.5} />
        )}
        <Area
          type="monotone"
          dataKey="total_portfolio_value"
          name="Portfolio Value"
          stroke="#10B981"
          fill="url(#networth-grad)"
          strokeWidth={2}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
