interface GradientTextProps {
  children: React.ReactNode;
  from: string;
  via?: string;
  to: string;
  className?: string;
}

export function GradientText({ children, from, via, to, className = '' }: GradientTextProps) {
  const gradientClass = via
    ? `bg-gradient-to-r from-${from} via-${via} to-${to}`
    : `bg-gradient-to-r from-${from} to-${to}`;

  return (
    <span className={`${gradientClass} bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
}
