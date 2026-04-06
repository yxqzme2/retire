import { Copy, Play, Trash2, Pencil, CalendarDays } from 'lucide-react';
import { StatusBadge } from '../ui/Badge';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/format';
import type { ScenarioSummary } from '../../types';

interface ScenarioCardProps {
  scenario: ScenarioSummary;
  onEdit: (scenario: ScenarioSummary) => void;
  onDuplicate: (id: number) => void;
  onDelete: (id: number) => void;
  onRun: (id: number) => void;
  onSelect: (id: number) => void;
  isActive: boolean;
  isRunning?: boolean;
}

export default function ScenarioCard({
  scenario,
  onEdit,
  onDuplicate,
  onDelete,
  onRun,
  onSelect,
  isActive,
  isRunning,
}: ScenarioCardProps) {
  return (
    <div
      className={`border rounded-xl p-5 bg-slate-800/60 backdrop-blur-sm transition-all duration-200 cursor-pointer ${
        isActive
          ? 'border-blue-500/60 ring-1 ring-blue-500/20'
          : 'border-slate-700 hover:border-slate-600'
      }`}
      onClick={() => onSelect(scenario.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-slate-100 font-semibold text-sm truncate">{scenario.name}</h3>
            {scenario.is_base_case && (
              <span className="text-xs bg-blue-500/15 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded-full flex-shrink-0">
                Base
              </span>
            )}
          </div>
          {scenario.description && (
            <p className="text-slate-500 text-xs line-clamp-2">{scenario.description}</p>
          )}
        </div>
        <StatusBadge status={scenario.status} size="sm" />
      </div>

      <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-4">
        <CalendarDays size={11} />
        <span>
          {scenario.updated_at
            ? `Updated ${new Date(scenario.updated_at).toLocaleDateString()}`
            : `Created ${new Date(scenario.created_at).toLocaleDateString()}`}
        </span>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-slate-700/50">
        <Button
          size="sm"
          variant="primary"
          onClick={(e) => { e.stopPropagation(); onRun(scenario.id); }}
          loading={isRunning}
          leftIcon={<Play size={12} />}
          className="flex-1"
        >
          Run
        </Button>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(scenario); }}
          className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-md transition-colors"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(scenario.id); }}
          className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-md transition-colors"
        >
          <Copy size={13} />
        </button>
        {!scenario.is_base_case && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete scenario "${scenario.name}"?`)) onDelete(scenario.id);
            }}
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
