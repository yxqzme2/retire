import Slider from '../ui/Slider';
import Tooltip from '../ui/Tooltip';
import { HelpCircle } from 'lucide-react';

interface AssumptionControlProps {
  label: string;
  tooltip?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  formatValue?: (v: number) => string;
  helper?: string;
}

export default function AssumptionControl({
  label,
  tooltip,
  min,
  max,
  step,
  value,
  onChange,
  formatValue,
  helper,
}: AssumptionControlProps) {
  return (
    <div className="py-3">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-xs font-medium text-slate-300">{label}</span>
        {tooltip && (
          <Tooltip content={tooltip}>
            <HelpCircle size={12} className="text-slate-600 cursor-help" />
          </Tooltip>
        )}
      </div>
      <Slider
        label=""
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        formatValue={formatValue}
        helper={helper}
      />
    </div>
  );
}
