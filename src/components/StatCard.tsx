import { ReactNode } from 'react';
import StatusBadge from './StatusBadge';

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  statusBadge?: string;
}

const trendColors = {
  up: 'text-emerald-400',
  down: 'text-red-400',
  neutral: 'text-gray-400',
};

const trendIcons = {
  up: 'M5 10l7-7m0 0l7 7m-7-7v18',
  down: 'M19 14l-7 7m0 0l-7-7m7 7V3',
  neutral: 'M5 12h14',
};

export default function StatCard({ icon, title, value, subtitle, trend, statusBadge }: StatCardProps) {
  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-5 hover:border-gray-600/50 transition-colors duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400">
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400">{title}</h3>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-white">{value}</span>
              {trend && (
                <span className={`flex items-center gap-0.5 text-xs font-medium ${trendColors[trend]}`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={trendIcons[trend]} />
                  </svg>
                </span>
              )}
            </div>
          </div>
        </div>
        {statusBadge && <StatusBadge status={statusBadge} />}
      </div>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
