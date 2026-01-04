import { ChevronDown, ChevronUp } from 'lucide-react';

interface ScrollButtonProps {
  direction: 'up' | 'down';
  onClick: () => void;
  label: string;
  className?: string;
}

export function ScrollButton({ direction, onClick, label, className = '' }: ScrollButtonProps) {
  const Icon = direction === 'up' ? ChevronUp : ChevronDown;

  return (
    <button
      onClick={onClick}
      className={`hover:opacity-70 transition-opacity ${className}`}
      aria-label={label}
    >
      <Icon className="h-5 w-5 text-white/70 hover:text-white" />
    </button>
  );
}
