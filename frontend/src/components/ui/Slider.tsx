import { clsx } from 'clsx';

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  formatValue?: (v: number) => string;
  helper?: string;
}

export default function Slider({
  label,
  min,
  max,
  step = 0.1,
  value,
  onChange,
  formatValue,
  helper,
}: SliderProps) {
  const displayValue = formatValue ? formatValue(value) : String(value);
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
          }}
          className="w-20 bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-md px-2 py-1 text-right focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="relative h-2 flex items-center">
        {/* Track */}
        <div className="absolute w-full h-1.5 bg-slate-700 rounded-full" />
        {/* Filled portion */}
        <div
          className="absolute h-1.5 bg-blue-500 rounded-full transition-all duration-100"
          style={{ width: `${pct}%` }}
        />
        {/* Range input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={clsx(
            'absolute w-full h-1.5 opacity-0 cursor-pointer',
            'appearance-none bg-transparent',
          )}
        />
        {/* Thumb indicator */}
        <div
          className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-slate-900 shadow-lg transition-all duration-100 pointer-events-none"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>

      <div className="flex justify-between">
        <span className="text-xs text-slate-600">{formatValue ? formatValue(min) : min}</span>
        <span className="text-xs text-slate-400 font-medium">{displayValue}</span>
        <span className="text-xs text-slate-600">{formatValue ? formatValue(max) : max}</span>
      </div>

      {helper && <p className="text-xs text-slate-500">{helper}</p>}
    </div>
  );
}
