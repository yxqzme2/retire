import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ProjectionResult } from '../../types';
import { formatCurrency } from '../../utils/format';

interface WithdrawalMixChartProps {
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

export default function WithdrawalMixChart({ data, retirementAge }: WithdrawalMixChartProps) {
  const retirementData = data.filter((d) => d.age >= retirementAge);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={retirementData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="wm-pension" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="wm-ss" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#34D399" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#34D399" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="wm-div" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#FBBF24" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="wm-withdrawal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.5} />
        <XAxis dataKey="age" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
        <YAxis
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          tick={{ fill: '#94A3B8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={55}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11, color: '#94A3B8', paddingTop: 8 }} iconType="circle" iconSize={8} />
        <Area type="monotone" dataKey="pension_income" name="Pension" stackId="1" stroke="#60A5FA" fill="url(#wm-pension)" strokeWidth={1.5} />
        <Area type="monotone" dataKey="ss_income" name="Social Security" stackId="1" stroke="#34D399" fill="url(#wm-ss)" strokeWidth={1.5} />
        <Area type="monotone" dataKey="dividend_income" name="Dividends" stackId="1" stroke="#FBBF24" fill="url(#wm-div)" strokeWidth={1.5} />
        <Area type="monotone" dataKey="portfolio_withdrawal" name="Portfolio" stackId="1" stroke="#94A3B8" fill="url(#wm-withdrawal)" strokeWidth={1.5} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
