// admin/components/ui/StatCard.tsx
import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  trend?: {
    value: number;
    positive: boolean;
  };
  icon?: ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red';
  loading?: boolean;
}

export function StatCard({ label, value, sublabel, trend, icon, color = 'blue', loading }: StatCardProps) {
  const colors = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  };

  const c = colors[color];

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
        <div className="h-4 w-24 skeleton mb-3" />
        <div className="h-8 w-32 skeleton mb-2" />
        <div className="h-3 w-20 skeleton" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        {icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.bg}`}>
            <span className={c.text}>{icon}</span>
          </div>
        )}
      </div>
      <p className={`text-3xl font-bold ${c.text} mb-1`}>{value}</p>
      {sublabel && <p className="text-sm text-gray-500">{sublabel}</p>}
      {trend && (
        <div className={`mt-3 pt-3 border-t ${c.border}`}>
          <span className={`text-sm font-medium ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        </div>
      )}
    </div>
  );
}