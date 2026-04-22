import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Receipt,
  CalendarDays,
  SlidersHorizontal,
  GitBranch,
  LineChart,
  FolderInput,
  Settings,
  TrendingUpIcon,
  BookOpen,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useScenarios, useActiveScenarioStore } from '../../hooks/useScenario';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/instructions', label: 'Instructions', icon: BookOpen },
  { to: '/accounts', label: 'Accounts', icon: Wallet },
  { to: '/income', label: 'Income', icon: TrendingUp },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/assumptions', label: 'Assumptions', icon: SlidersHorizontal },
  { to: '/scenarios', label: 'Scenarios', icon: GitBranch },
  { to: '/projections', label: 'Projections', icon: LineChart },
  { to: '/import', label: 'Import / Export', icon: FolderInput },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { data: scenarios } = useScenarios();
  const { activeScenarioId, setActiveScenarioId } = useActiveScenarioStore();

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-900 border-r border-slate-700/50 flex flex-col h-full">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700/50">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
          <TrendingUpIcon size={16} className="text-white" />
        </div>
        <div>
          <span className="text-white font-semibold text-sm leading-tight block">RetireVision</span>
          <span className="text-slate-500 text-xs">Planning Dashboard</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-colors duration-150 group',
                isActive
                  ? 'bg-slate-800 text-blue-400 border-l-2 border-blue-500 pl-[10px]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-l-2 border-transparent',
              )
            }
          >
            <Icon size={16} className="flex-shrink-0" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Scenario Selector */}
      <div className="px-3 py-4 border-t border-slate-700/50">
        <label className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2 block">
          Active Scenario
        </label>
        <select
          value={activeScenarioId ?? ''}
          onChange={(e) => setActiveScenarioId(Number(e.target.value) || null)}
          className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        >
          <option value="">Select scenario...</option>
          {scenarios?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}{s.is_base_case ? ' ★' : ''}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}
