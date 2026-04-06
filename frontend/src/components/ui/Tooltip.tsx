import { useState, type ReactNode } from 'react';
import { clsx } from 'clsx';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
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
            'absolute z-50 w-max max-w-xs px-2.5 py-1.5 rounded-lg',
            'bg-slate-700 border border-slate-600 text-slate-200 text-xs shadow-xl',
            positionClasses[position],
          )}
        >
          {content}
        </div>
      )}
    </span>
  );
}
