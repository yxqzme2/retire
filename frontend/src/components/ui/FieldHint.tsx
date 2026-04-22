import { HelpCircle } from 'lucide-react';
import Tooltip from './Tooltip';
import type { ReactNode } from 'react';

interface FieldHintProps {
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  width?: 'sm' | 'md' | 'lg';
}

/**
 * A small ? icon that reveals a tooltip on hover.
 * Drop it next to any label: <label>Annual Return <FieldHint content="..." /></label>
 */
export default function FieldHint({ content, position = 'top', width = 'md' }: FieldHintProps) {
  return (
    <Tooltip content={content} position={position} width={width}>
      <HelpCircle
        size={12}
        className="inline-block ml-1 mb-0.5 text-slate-600 hover:text-blue-400 cursor-help transition-colors align-middle"
      />
    </Tooltip>
  );
}
