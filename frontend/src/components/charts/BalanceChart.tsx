import {
  AreaChart,
  Area,
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

interface BalanceChartProps {
  data: ProjectionResult[];
  retirementAge: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl">
      <p className="text-slate-400 text-xs mb-2 font-medium">Age {label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
            <span className="text-slate-400">{entry.name}</span>
          </span>
          <span className="text-slate-100 font-medium">{formatCurrency(entry.value)}</span>
        </div>
      ))}
      <div className="mt-2 pt-2 border-t border-slate-700 flex justify-between text-xs">
        <span className="text-slate-500">Total</span>
        <span className="text-slate-100 font-semibold">
          {formatCurrency(payload.reduce((s: number, p: any) => s + (p.value ?? 0), 0))}
        </span>
      </div>
    </div>
  );
};

export default function BalanceChart({ data, retirementAge }: BalanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="grad-roth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="grad-pretax" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="grad-taxable" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="grad-cash" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.5} />
        <XAxis
          dataKey="age"
          tick={{ fill: '#94A3B8', fontSize: 11 }}
          axisLine={{ stroke: '#334155' }}
          tickLine={false}
          label={{ value: 'Age', position: 'insideBottom', offset: -2, fill: '#64748B', fontSize: 11 }}
        />
        <YAxis
          tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`}
          tick={{ fill: '#94A3B8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 11, color: '#94A3B8', paddingTop: 8 }}
          iconType="circle"
          iconSize={8}
        />
        <ReferenceLine
          x={retirementAge}
          stroke="#3B82F6"
          strokeDasharray="4 4"
          strokeOpacity={0.7}
          label={{ value: 'Retirement', position: 'top', fill: '#3B82F6', fontSize: 10 }}
        />
        <Area
          type="monotone"
          dataKey="roth_balance"
          name="Roth (Tax-Free)"
          stackId="1"
          stroke="#10B981"
          fill="url(#grad-roth)"
          strokeWidth={1.5}
        />
        <Area
          type="monotone"
          dataKey="pretax_balance"
          name="Pre-Tax"
          stackId="1"
          stroke="#3B82F6"
          fill="url(#grad-pretax)"
          strokeWidth={1.5}
        />
        <Area
          type="monotone"
          dataKey="taxable_balance"
          name="Taxable"
          stackId="1"
          stroke="#F59E0B"
          fill="url(#grad-taxable)"
          strokeWidth={1.5}
        />
        <Area
          type="monotone"
          dataKey="cash_balance"
          name="Cash"
          stackId="1"
          stroke="#94A3B8"
          fill="url(#grad-cash)"
          strokeWidth={1.5}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
