import { clsx } from 'clsx';
import type { ScenarioStatus, AccountType, TaxTreatment } from '../../types';

// ─── Scenario status badges ────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: ScenarioStatus;
  size?: 'sm' | 'md';
}

const statusStyles: Record<ScenarioStatus, string> = {
  on_track: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  borderline: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  off_track: 'bg-red-500/15 text-red-400 border border-red-500/30',
  unknown: 'bg-slate-700/50 text-slate-400 border border-slate-600',
};

const statusLabels: Record<ScenarioStatus, string> = {
  on_track: 'On Track',
  borderline: 'Borderline',
  off_track: 'Off Track',
  unknown: 'Not Run',
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        'font-medium rounded-full',
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1',
        statusStyles[status],
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

// ─── Account type badge ────────────────────────────────────────────────────────

interface TypeBadgeProps {
  type: AccountType | string;
}

const accountTypeLabels: Record<string, string> = {
  '401k': '401(k)',
  roth_ira: 'Roth IRA',
  taxable_brokerage: 'Brokerage',
  dividend_portfolio: 'Dividends',
  cash_hysa: 'HYSA',
  pension: 'Pension',
  social_security: 'Soc. Security',
  hsa: 'HSA',
  other: 'Other',
};

const accountTypeColors: Record<string, string> = {
  '401k': 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  roth_ira: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  taxable_brokerage: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  dividend_portfolio: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  cash_hysa: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
  pension: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
  social_security: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
  hsa: 'bg-teal-500/15 text-teal-400 border border-teal-500/30',
  other: 'bg-slate-700/50 text-slate-400 border border-slate-600',
};

export function AccountTypeBadge({ type }: TypeBadgeProps) {
  return (
    <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', accountTypeColors[type] ?? accountTypeColors.other)}>
      {accountTypeLabels[type] ?? type}
    </span>
  );
}

// ─── Tax treatment badge ───────────────────────────────────────────────────────

interface TaxBadgeProps {
  treatment: TaxTreatment | string;
}

const taxLabels: Record<string, string> = {
  taxable: 'Taxable',
  tax_deferred: 'Tax-Deferred',
  tax_free: 'Tax-Free',
  partially_taxable: 'Partial',
};

const taxColors: Record<string, string> = {
  taxable: 'bg-red-500/10 text-red-400 border border-red-500/20',
  tax_deferred: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  tax_free: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  partially_taxable: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
};

export function TaxBadge({ treatment }: TaxBadgeProps) {
  return (
    <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', taxColors[treatment] ?? 'bg-slate-700/50 text-slate-400')}>
      {taxLabels[treatment] ?? treatment}
    </span>
  );
}

// ─── Generic badge ────────────────────────────────────────────────────────────

interface BadgeProps {
  children: React.ReactNode;
  color?: 'emerald' | 'blue' | 'amber' | 'red' | 'slate' | 'purple';
  size?: 'sm' | 'md';
}

const colorClasses: Record<string, string> = {
  emerald: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  blue: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  amber: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  red: 'bg-red-500/15 text-red-400 border border-red-500/30',
  slate: 'bg-slate-700/50 text-slate-400 border border-slate-600',
  purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
};

export default function Badge({ children, color = 'slate', size = 'md' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'font-medium rounded-full',
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1',
        colorClasses[color],
      )}
    >
      {children}
    </span>
  );
}
