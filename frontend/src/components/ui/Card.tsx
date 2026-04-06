import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
  noPadding?: boolean;
}

export default function Card({ title, subtitle, actions, className, children, noPadding }: CardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'border border-slate-700 bg-slate-800/60 backdrop-blur-sm rounded-xl',
          'hover:border-slate-600 transition-colors duration-200',
          className,
        ),
      )}
    >
      {(title || actions) && (
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-slate-700/50">
          <div>
            {title && <h2 className="text-slate-100 font-semibold text-sm">{title}</h2>}
            {subtitle && <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 ml-4 flex-shrink-0">{actions}</div>}
        </div>
      )}
      <div className={clsx(!noPadding && 'p-5')}>{children}</div>
    </div>
  );
}
