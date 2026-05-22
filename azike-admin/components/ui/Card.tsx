// admin/components/ui/Card.tsx
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
  hover?: boolean;
}

export function Card({ children, className = '', padding = false, hover = false }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm ${
        hover ? 'hover:shadow-md transition-shadow duration-200' : ''
      } ${className}`}
    >
      {padding ? <div className="p-6">{children}</div> : children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl ${className}`}>
      {children}
    </div>
  );
}