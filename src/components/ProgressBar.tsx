interface ProgressBarProps {
  label: string;
  current: number;
  target: number;
  color?: string;
  unit?: string;
  showPercentage?: boolean;
}

export default function ProgressBar({ label, current, target, color = 'emerald', unit = '', showPercentage = true }: ProgressBarProps) {
  const percentage = Math.min(Math.round((current / target) * 100), 100);
  const isOverTarget = current > target;

  const colorMap: Record<string, { bg: string; text: string }> = {
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-400' },
    blue: { bg: 'bg-blue-500', text: 'text-blue-400' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-400' },
    red: { bg: 'bg-red-500', text: 'text-red-400' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-400' },
  };

  const colors = colorMap[color] || colorMap.emerald;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm tabular-nums">
            <span className="text-white font-medium">{current}{unit}</span>
            <span className="text-gray-500"> / {target}{unit}</span>
          </span>
          {showPercentage && (
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${isOverTarget ? 'bg-red-500/10 text-red-400' : 'bg-gray-700 text-gray-300'}`}>
              {percentage}%
            </span>
          )}
        </div>
      </div>
      <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${isOverTarget ? 'bg-gradient-to-r from-amber-500 to-red-500' : colors.bg}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
