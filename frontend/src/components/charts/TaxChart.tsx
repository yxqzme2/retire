import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ProjectionResult } from '../../types';
import { formatCurrency } from '../../utils/format';

interface TaxChartProps {
  data: ProjectionResult[];
  retirementAge: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s: number, p: any) => s + (p.value ?? 0), 0);
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl">
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
      <div className="mt-2 pt-2 border-t border-slate-700 flex justify-between text-xs">
        <span className="text-slate-500">Total</span>
        <span className="text-slate-100 font-semibold">{formatCurrency(total)}</span>
      </div>
    </div>
  );
};

export default function TaxChart({ data, retirementAge }: TaxChartProps) {
  const retirementData = data.filter((d) => d.age >= retirementAge);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={retirementData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
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
        <Bar dataKey="federal_tax" name="Federal Tax" stackId="a" fill="#EF4444" radius={[0, 0, 0, 0]} />
        <Bar dataKey="state_tax" name="State Tax" stackId="a" fill="#F97316" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
