import { useLocation } from 'react-router-dom';
import { Play, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import { useActiveScenarioStore, useScenarios } from '../../hooks/useScenario';
import { useRunProjection } from '../../hooks/useProjection';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/accounts': 'Accounts',
  '/income': 'Income Streams',
  '/expenses': 'Expenses',
  '/events': 'One-Time Events',
  '/assumptions': 'Assumptions',
  '/scenarios': 'Scenarios',
  '/projections': 'Projections',
  '/import': 'Import & Export',
  '/settings': 'Settings',
};

const STATUS_STYLES = {
  on_track: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  borderline: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  off_track: 'bg-red-500/15 text-red-400 border border-red-500/30',
  unknown: 'bg-slate-700/50 text-slate-400 border border-slate-600',
};

const STATUS_LABELS = {
  on_track: 'On Track',
  borderline: 'Borderline',
  off_track: 'Off Track',
  unknown: 'Not Run',
};

export default function Header() {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'RetireVision';
  const { activeScenarioId } = useActiveScenarioStore();
  const { data: scenarios } = useScenarios();
  const { mutate: runProjection, isPending } = useRunProjection();

  const activeScenario = scenarios?.find((s) => s.id === activeScenarioId);
  const status = activeScenario?.status ?? 'unknown';

  return (
    <header className="h-14 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 flex items-center justify-between px-6 flex-shrink-0">
      {/* Page title */}
      <div className="flex items-center gap-3">
        <h1 className="text-slate-100 font-semibold text-base">{pageTitle}</h1>
        {activeScenario && (
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
            {activeScenario.name}
          </span>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {activeScenario && (
          <span
            className={clsx(
              'text-xs font-medium px-2.5 py-1 rounded-full',
              STATUS_STYLES[status as keyof typeof STATUS_STYLES] ?? STATUS_STYLES.unknown,
            )}
          >
            {STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? 'Unknown'}
          </span>
        )}

        <button
          onClick={() => activeScenarioId && runProjection(activeScenarioId)}
          disabled={!activeScenarioId || isPending}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150',
            activeScenarioId && !isPending
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed',
          )}
        >
          {isPending ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <Play size={14} />
          )}
          {isPending ? 'Running...' : 'Run Projection'}
        </button>
      </div>
    </header>
  );
}
