// admin/components/ui/Badge.tsx
import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'neutral' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'neutral', size = 'sm', className = '' }: BadgeProps) {
  const variants = {
    success: 'bg-success-50 text-success-700 ring-success-500/20',
    warning: 'bg-warning-50 text-warning-700 ring-warning-500/20',
    error: 'bg-error-50 text-error-700 ring-error-500/20',
    neutral: 'bg-gray-50 text-gray-700 ring-gray-500/20',
    info: 'bg-blue-50 text-blue-700 ring-blue-500/20',
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ring-1 ring-inset ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
}