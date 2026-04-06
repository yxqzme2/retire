import { clsx } from 'clsx';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import type { ScenarioStatus } from '../../types';

interface StatusBadgeProps {
  status: ScenarioStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const config = {
  on_track: {
    label: 'On Track',
    icon: CheckCircle2,
    classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  borderline: {
    label: 'Borderline',
    icon: AlertTriangle,
    classes: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  off_track: {
    label: 'Off Track',
    icon: XCircle,
    classes: 'bg-red-500/15 text-red-400 border-red-500/30',
  },
  unknown: {
    label: 'Not Run',
    icon: HelpCircle,
    classes: 'bg-slate-700/50 text-slate-400 border-slate-600',
  },
};

export default function StatusBadge({ status, showIcon = true, size = 'md' }: StatusBadgeProps) {
  const { label, icon: Icon, classes } = config[status] ?? config.unknown;
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        size === 'sm' && 'text-xs px-2 py-0.5',
        size === 'md' && 'text-xs px-2.5 py-1',
        size === 'lg' && 'text-sm px-3 py-1.5',
        classes,
      )}
    >
      {showIcon && <Icon size={iconSize} />}
      {label}
    </span>
  );
}
