import { clsx } from 'clsx';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, leftAddon, rightAddon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '_');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftAddon && (
            <span className="absolute left-3 text-slate-500 text-sm pointer-events-none">{leftAddon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            {...props}
            className={clsx(
              'w-full bg-slate-900 border text-slate-100 rounded-lg px-3 py-2 text-sm',
              'focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-150',
              'placeholder:text-slate-600',
              error ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-blue-500',
              leftAddon && 'pl-8',
              rightAddon && 'pr-8',
              className,
            )}
          />
          {rightAddon && (
            <span className="absolute right-3 text-slate-500 text-sm pointer-events-none">{rightAddon}</span>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {helper && !error && <p className="text-xs text-slate-500">{helper}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
