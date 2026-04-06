import { clsx } from 'clsx';

interface ToggleProps {
  label?: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function Toggle({ label, description, checked, onChange, disabled }: ToggleProps) {
  return (
    <label
      className={clsx(
        'flex items-center justify-between gap-4 cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <div className="flex-1">
        {label && <span className="text-sm font-medium text-slate-200 block">{label}</span>}
        {description && <span className="text-xs text-slate-500 mt-0.5 block">{description}</span>}
      </div>
      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={clsx(
            'w-10 h-5 rounded-full transition-colors duration-200',
            checked ? 'bg-blue-600' : 'bg-slate-700',
          )}
        />
        <div
          className={clsx(
            'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
            checked && 'translate-x-5',
          )}
        />
      </div>
    </label>
  );
}
