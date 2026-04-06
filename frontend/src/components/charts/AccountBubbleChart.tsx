import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { Account } from '../../types';
import { formatCurrency } from '../../utils/format';

interface AccountBubbleChartProps {
  accounts: Account[];
}

// Tax efficiency: how favorable is this tax treatment for withdrawals
const taxEfficiencyScore = (account: Account): number => {
  switch (account.tax_treatment) {
    case 'tax_free': return 90;
    case 'tax_deferred': return 60;
    case 'partially_taxable': return 50;
    case 'taxable': return 30;
    default: return 30;
  }
};

// Liquidity: how easily can you access this without penalty
const liquidityScore = (account: Account): number => {
  switch (account.account_type) {
    case 'cash_hysa': return 95;
    case 'taxable_brokerage': return 80;
    case 'dividend_portfolio': return 78;
    case 'roth_ira': return 70;
    case 'hsa': return 55;
    case '401k': return 40;
    case 'pension': return 20;
    case 'social_security': return 10;
    default: return 45;
  }
};

const ACCOUNT_COLORS: Record<string, string> = {
  '401k': '#3B82F6',
  roth_ira: '#10B981',
  taxable_brokerage: '#F59E0B',
  dividend_portfolio: '#A78BFA',
  cash_hysa: '#94A3B8',
  pension: '#6366F1',
  social_security: '#06B6D4',
  hsa: '#14B8A6',
  other: '#64748B',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl">
      <p className="text-slate-100 font-medium text-sm mb-1">{d.name}</p>
      <p className="text-slate-400 text-xs">Balance: <span className="text-slate-200">{formatCurrency(d.balance)}</span></p>
      <p className="text-slate-400 text-xs">Tax Efficiency: <span className="text-slate-200">{d.taxScore}/100</span></p>
      <p className="text-slate-400 text-xs">Liquidity: <span className="text-slate-200">{d.liquidityScore}/100</span></p>
    </div>
  );
};

// Custom dot with dynamic radius
const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  const maxBubble = 40;
  const minBubble = 8;
  const r = Math.max(minBubble, Math.min(maxBubble, Math.sqrt(payload.balance / 5000)));
  const color = ACCOUNT_COLORS[payload.accountType] ?? '#64748B';
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill={color}
      fillOpacity={0.5}
      stroke={color}
      strokeWidth={1.5}
    />
  );
};

export default function AccountBubbleChart({ accounts }: AccountBubbleChartProps) {
  const chartData = accounts
    .filter((a) => a.include_in_projection && a.current_balance >= 0)
    .map((a) => ({
      name: a.name,
      taxScore: taxEfficiencyScore(a),
      liquidityScore: liquidityScore(a),
      balance: a.current_balance,
      accountType: a.account_type,
    }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.5} />
          <XAxis
            type="number"
            dataKey="taxScore"
            name="Tax Efficiency"
            domain={[0, 100]}
            tick={{ fill: '#94A3B8', fontSize: 11 }}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
            label={{ value: 'Tax Efficiency Score', position: 'insideBottom', offset: -10, fill: '#64748B', fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey="liquidityScore"
            name="Liquidity"
            domain={[0, 100]}
            tick={{ fill: '#94A3B8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={40}
            label={{ value: 'Liquidity', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter
            data={chartData}
            shape={<CustomDot />}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={ACCOUNT_COLORS[entry.accountType] ?? '#64748B'}
                fillOpacity={0.5}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-2 justify-center">
        {chartData.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-400">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: ACCOUNT_COLORS[d.accountType] ?? '#64748B' }}
            />
            {d.name}
          </div>
        ))}
      </div>
    </div>
  );
}
