import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
}

export default function LoadingSpinner({ size = 'md', className, message }: LoadingSpinnerProps) {
  const sizes = { sm: 16, md: 24, lg: 36 };

  return (
    <div className={clsx('flex flex-col items-center justify-center gap-3 py-12', className)}>
      <Loader2 size={sizes[size]} className="text-blue-400 animate-spin" />
      {message && <p className="text-slate-500 text-sm">{message}</p>}
    </div>
  );
}
