'use client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';

interface LineConfig {
  dataKey: string;
  stroke: string;
  name: string;
}

interface MetricChartProps {
  data: any[];
  lines?: LineConfig[];
  dataKey?: string;
  color?: string;
  title?: string;
  unit?: string;
  goalLine?: number;
  goalLabel?: string;
  showGrid?: boolean;
  height?: number;
  className?: string;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-gray-400">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export function MetricChart({
  data,
  lines,
  dataKey,
  color = '#22c55e',
  title,
  unit = '',
  goalLine,
  goalLabel,
  showGrid = true,
  height = 200,
  className = '',
}: MetricChartProps) {
  if (!data || data.length === 0) {
    return <div className={`flex items-center justify-center ${className}`} style={{ height }}><p className="text-gray-500 text-sm">No data</p></div>;
  }

  const lineConfigs = lines || [{ dataKey: dataKey || 'value', stroke: color, name: title || 'Value' }];

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(75, 85, 99, 0.3)" vertical={false} />
          )}
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} dy={8} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} dx={-4} />
          <Tooltip content={<CustomTooltip />} />
          {lineConfigs.length > 1 && <Legend />}
          {goalLine !== undefined && (
            <ReferenceLine y={goalLine} stroke="rgba(248, 113, 113, 0.5)" strokeDasharray="6 4" strokeWidth={1.5}
              label={{ value: goalLabel || `Goal: ${goalLine}`, position: 'right', fill: '#f87171', fontSize: 10 }} />
          )}
          {lineConfigs.map((l, i) => (
            <Line key={i} type="monotone" dataKey={l.dataKey} stroke={l.stroke} name={l.name} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: l.stroke, strokeWidth: 0 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
