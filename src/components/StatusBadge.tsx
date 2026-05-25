interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  ON_TRACK: {
    label: 'Đúng Tiến Độ',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
  },
  NEED_ADJUSTMENT: {
    label: 'Cần Điều Chỉnh',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
  },
  OFF_TRACK: {
    label: 'Lệch Hướng',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    dot: 'bg-red-400',
  },
  RECOVERY_NEEDED: {
    label: 'Cần Hồi Phục',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    dot: 'bg-blue-400',
  },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    bg: 'bg-gray-500/10',
    text: 'text-gray-400',
    dot: 'bg-gray-400',
  };

  const sizeClasses = size === 'sm'
    ? 'text-[10px] px-2 py-0.5 gap-1'
    : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${config.bg} ${config.text} ${sizeClasses}`}>
      <span className={`inline-block rounded-full ${config.dot} ${size === 'sm' ? 'w-1 h-1' : 'w-1.5 h-1.5'}`} />
      {config.label}
    </span>
  );
}
