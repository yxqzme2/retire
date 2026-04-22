import { useState, type ReactNode } from 'react';
import { clsx } from 'clsx';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  width?: 'sm' | 'md' | 'lg';
}

export default function Tooltip({ content, children, position = 'top', width = 'md' }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const widthClasses = {
    sm: 'max-w-[180px]',
    md: 'max-w-[260px]',
    lg: 'max-w-[340px]',
  };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={clsx(
            'absolute z-50 px-3 py-2 rounded-lg pointer-events-none',
            'bg-slate-800 border border-slate-600 text-slate-200 text-xs shadow-2xl leading-relaxed',
            positionClasses[position],
            widthClasses[width],
          )}
        >
          {content}
        </div>
      )}
    </span>
  );
}
