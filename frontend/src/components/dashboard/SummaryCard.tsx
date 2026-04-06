import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: ReactNode;
  color?: 'emerald' | 'blue' | 'amber' | 'red';
}

const iconBgColors = {
  emerald: 'bg-emerald-500/15 text-emerald-400',
  blue: 'bg-blue-500/15 text-blue-400',
  amber: 'bg-amber-500/15 text-amber-400',
  red: 'bg-red-500/15 text-red-400',
};

const trendColors = {
  up: 'text-emerald-400',
  down: 'text-red-400',
  neutral: 'text-slate-500',
};

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'neutral' }) => {
  if (trend === 'up') return <TrendingUp size={12} />;
  if (trend === 'down') return <TrendingDown size={12} />;
  return <Minus size={12} />;
};

export default function SummaryCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  color = 'blue',
}: SummaryCardProps) {
  return (
    <div className="border border-slate-700 bg-slate-800/60 backdrop-blur-sm rounded-xl p-5 hover:border-slate-600 transition-colors duration-200">
      <div className="flex items-start justify-between mb-4">
        <div
          className={clsx(
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
            iconBgColors[color],
          )}
        >
          {icon}
        </div>
        {trend && trendValue && (
          <div className={clsx('flex items-center gap-1 text-xs font-medium', trendColors[trend])}>
            <TrendIcon trend={trend} />
            {trendValue}
          </div>
        )}
      </div>

      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
      <p className="text-slate-100 text-2xl font-semibold leading-tight">{value}</p>
      {subtitle && <p className="text-slate-500 text-xs mt-1.5">{subtitle}</p>}
    </div>
  );
}
