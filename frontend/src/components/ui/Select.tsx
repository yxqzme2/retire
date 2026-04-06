import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';
import type { SelectHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helper?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helper, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '_');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            {...props}
            className={clsx(
              'w-full appearance-none bg-slate-900 border text-slate-100 rounded-lg px-3 py-2 pr-8 text-sm',
              'focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-150',
              error ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-blue-500',
              className,
            )}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {helper && !error && <p className="text-xs text-slate-500">{helper}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
export default Select;
