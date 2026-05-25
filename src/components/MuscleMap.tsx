'use client';
import { ReactNode } from 'react';

interface MuscleMapProps {
  mainMuscle: string;
  secondaryMuscle?: string | null;
  category: string;
}

const MUSCLE_GROUPS: Record<string, { path: string; color: string; label: string }> = {
  'Ngực': { path: 'chest', color: '#22c55e', label: 'Ngực' },
  'Ngực Trên': { path: 'chest_upper', color: '#16a34a', label: 'Ngực Trên' },
  'Ngực Dưới': { path: 'chest_lower', color: '#15803d', label: 'Ngực Dưới' },
  'Lưng Giữa': { path: 'back_mid', color: '#3b82f6', label: 'Lưng Giữa' },
  'Xô': { path: 'lats', color: '#2563eb', label: 'Xô' },
  'Cơ Dựng Sống': { path: 'erectors', color: '#1d4ed8', label: 'Cơ Dựng Sống' },
  'Vai': { path: 'shoulder', color: '#f59e0b', label: 'Vai' },
  'Vai Trước': { path: 'front_delt', color: '#d97706', label: 'Vai Trước' },
  'Vai Giữa': { path: 'side_delt', color: '#f59e0b', label: 'Vai Giữa' },
  'Vai Sau': { path: 'rear_delt', color: '#b45309', label: 'Vai Sau' },
  'Tay Trước': { path: 'biceps', color: '#a855f7', label: 'Tay Trước' },
  'Tay Sau': { path: 'triceps', color: '#ef4444', label: 'Tay Sau' },
  'Cẳng Tay': { path: 'forearm', color: '#ec4899', label: 'Cẳng Tay' },
  'Đùi Trước': { path: 'quads', color: '#06b6d4', label: 'Đùi Trước' },
  'Đùi Sau': { path: 'hamstrings', color: '#0891b2', label: 'Đùi Sau' },
  'Mông': { path: 'glutes', color: '#14b8a6', label: 'Mông' },
  'Mông Giữa': { path: 'glutes_med', color: '#0d9488', label: 'Mông Giữa' },
  'Bắp Chân': { path: 'calves', color: '#84cc16', label: 'Bắp Chân' },
  'Bụng': { path: 'abs', color: '#ea580c', label: 'Bụng' },
  'Cơ Liên Sườn': { path: 'obliques', color: '#c2410c', label: 'Liên Sườn' },
  'Tim Mạch': { path: 'cardio', color: '#ef4444', label: 'Tim Mạch' },
  'Lưng Dưới': { path: 'lowerback', color: '#64748b', label: 'Lưng Dưới' },
  'Cầu Vai': { path: 'traps', color: '#78716c', label: 'Cầu Vai' },
  'Xoay Vai': { path: 'rotator', color: '#a8a29e', label: 'Xoay Vai' },
  'Cơ Gập Hông': { path: 'hip_flex', color: '#475569', label: 'Gập Hông' },
  'Cột Sống': { path: 'spine', color: '#94a3b8', label: 'Cột Sống' },
  'Hông': { path: 'hip', color: '#22c55e', label: 'Hông' },
};

function findMuscleKey(name: string): string[] {
  const keys: string[] = [];
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(MUSCLE_GROUPS)) {
    if (lower.includes(key.toLowerCase()) || lower.includes(val.label.toLowerCase())) {
      keys.push(key);
    }
  }
  if (keys.length === 0) {
    for (const [key, val] of Object.entries(MUSCLE_GROUPS)) {
      if (val.path === name || lower.includes(val.path)) keys.push(key);
    }
  }
  return keys;
}

export default function MuscleMap({ mainMuscle, secondaryMuscle, category }: MuscleMapProps) {
  const mainKeys = findMuscleKey(mainMuscle);
  let secKeys: string[] = [];
  if (secondaryMuscle) {
    for (const s of secondaryMuscle.split(',')) {
      secKeys.push(...findMuscleKey(s.trim()));
    }
  }

  const highlightedMuscles = [...new Set([...mainKeys, ...secKeys])];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 rounded-full bg-emerald-500" />
        <h3 className="text-sm font-semibold text-white">Sơ Đồ Cơ Thể</h3>
      </div>

      <div className="flex items-start justify-center gap-8 py-2">
        {/* Front */}
        <div className="relative">
          <div className="text-center text-[10px] text-gray-500 mb-1">Mặt Trước</div>
          <svg viewBox="0 0 120 240" className="w-[100px] h-[200px]">
            {/* Body outline front */}
            <path d="M60 10 C75 10 88 30 90 50 C92 60 90 75 85 85 L80 95 L85 100 C95 100 105 105 110 115 L112 130 L110 145 C108 155 100 165 95 175 L92 185 L88 200 L85 215 C83 225 78 230 72 232 L60 234 L48 232 C42 230 37 225 35 215 L32 200 L28 185 L25 175 C20 165 12 155 10 145 L8 130 L10 115 C15 105 25 100 35 100 L40 95 L35 85 C30 75 28 60 30 50 C32 30 45 10 60 10Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            {/* Head */}
            <ellipse cx="60" cy="40" rx="20" ry="22" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            {highlightedMuscles.filter(m => ['Ngực', 'Ngực Trên', 'Ngực Dưới'].some(c => m.includes(c))).length > 0 && (
              <>
                <path d="M42 55 C44 50 48 52 50 55 L48 85 C48 88 46 92 42 95 C40 98 36 98 34 95 C30 92 28 88 28 85 L28 60 C28 55 36 55 38 60 L38 55Z" fill="#22c55e" fillOpacity="0.4" stroke="#22c55e" strokeWidth="0.5" />
                <path d="M78 55 C76 50 72 52 70 55 L72 85 C72 88 74 92 78 95 C80 98 84 98 86 95 C90 92 92 88 92 85 L92 60 C92 55 84 55 82 60 L82 55Z" fill="#22c55e" fillOpacity="0.4" stroke="#22c55e" strokeWidth="0.5" />
              </>
            )}
            {highlightedMuscles.some(m => m.includes('Vai') || m.includes('Vai Giữa') || m.includes('Vai Trước')) && (
              <>
                <ellipse cx="40" cy="50" rx="8" ry="10" fill="#f59e0b" fillOpacity="0.4" stroke="#f59e0b" strokeWidth="0.5" />
                <ellipse cx="80" cy="50" rx="8" ry="10" fill="#f59e0b" fillOpacity="0.4" stroke="#f59e0b" strokeWidth="0.5" />
              </>
            )}
            {highlightedMuscles.some(m => m.includes('Tay Trước') || m.includes('Cẳng Tay')) && (
              <>
                <path d="M34 60 L28 80 L26 105 L30 115 L32 105 L30 80 L36 60Z" fill="#a855f7" fillOpacity="0.3" stroke="#a855f7" strokeWidth="0.5" />
                <path d="M86 60 L92 80 L94 105 L90 115 L88 105 L90 80 L84 60Z" fill="#a855f7" fillOpacity="0.3" stroke="#a855f7" strokeWidth="0.5" />
              </>
            )}
            {highlightedMuscles.some(m => m.includes('Bụng')) && (
              <ellipse cx="60" cy="100" rx="18" ry="22" fill="#ea580c" fillOpacity="0.25" stroke="#ea580c" strokeWidth="0.5" />
            )}
            {highlightedMuscles.some(m => m.includes('Đùi Trước')) && (
              <>
                <path d="M45 120 L40 155 L38 175 L42 185 L48 185 L48 160 L52 120Z" fill="#06b6d4" fillOpacity="0.3" stroke="#06b6d4" strokeWidth="0.5" />
                <path d="M75 120 L80 155 L82 175 L78 185 L72 185 L72 160 L68 120Z" fill="#06b6d4" fillOpacity="0.3" stroke="#06b6d4" strokeWidth="0.5" />
              </>
            )}
            {highlightedMuscles.some(m => m.includes('Bắp Chân')) && (
              <>
                <ellipse cx="45" cy="195" rx="10" ry="15" fill="#84cc16" fillOpacity="0.3" stroke="#84cc16" strokeWidth="0.5" />
                <ellipse cx="75" cy="195" rx="10" ry="15" fill="#84cc16" fillOpacity="0.3" stroke="#84cc16" strokeWidth="0.5" />
              </>
            )}
          </svg>
        </div>

        {/* Back */}
        <div className="relative">
          <div className="text-center text-[10px] text-gray-500 mb-1">Mặt Sau</div>
          <svg viewBox="0 0 120 240" className="w-[100px] h-[200px]">
            {/* Body outline back */}
            <path d="M60 10 C50 8 38 20 35 35 L32 50 L28 65 C24 70 20 80 18 90 L16 110 L18 130 C20 145 25 165 30 180 L32 195 L28 215 C26 225 32 230 36 232 L44 234 L60 236 L76 234 L84 232 C88 230 94 225 92 215 L88 195 L90 180 C95 165 100 145 102 130 L104 110 L102 90 C100 80 96 70 92 65 L88 50 L85 35 C82 20 70 8 60 10Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <ellipse cx="60" cy="40" rx="20" ry="22" fill="#1e293b" stroke="#334155" strokeWidth="1" />

            {highlightedMuscles.some(m => m.includes('Xô')) && (
              <>
                <path d="M35 55 C30 65 25 80 24 95 L25 110 C28 100 32 90 38 85 L42 72Z" fill="#2563eb" fillOpacity="0.35" stroke="#2563eb" strokeWidth="0.5" />
                <path d="M85 55 C90 65 95 80 96 95 L95 110 C92 100 88 90 82 85 L78 72Z" fill="#2563eb" fillOpacity="0.35" stroke="#2563eb" strokeWidth="0.5" />
              </>
            )}
            {highlightedMuscles.some(m => m.includes('Lưng Giữa') || m.includes('Cơ Dựng Sống')) && (
              <path d="M52 65 L52 130 L60 140 L68 130 L68 65Z" fill="#3b82f6" fillOpacity="0.3" stroke="#3b82f6" strokeWidth="0.5" />
            )}
            {highlightedMuscles.some(m => m.includes('Cầu Vai')) && (
              <>
                <path d="M48 42 L42 35 L48 32Z" fill="#78716c" fillOpacity="0.35" stroke="#78716c" strokeWidth="0.5" />
                <path d="M72 42 L78 35 L72 32Z" fill="#78716c" fillOpacity="0.35" stroke="#78716c" strokeWidth="0.5" />
              </>
            )}
            {highlightedMuscles.some(m => m.includes('Tay Sau') || m.includes('Tay Sau - Đầu Dài')) && (
              <>
                <path d="M34 60 L28 80 L26 105 L30 115 L32 105 L30 80 L36 60Z" fill="#ef4444" fillOpacity="0.3" stroke="#ef4444" strokeWidth="0.5" />
                <path d="M86 60 L92 80 L94 105 L90 115 L88 105 L90 80 L84 60Z" fill="#ef4444" fillOpacity="0.3" stroke="#ef4444" strokeWidth="0.5" />
              </>
            )}
            {highlightedMuscles.some(m => m.includes('Vai Sau')) && (
              <>
                <ellipse cx="38" cy="52" rx="8" ry="7" fill="#b45309" fillOpacity="0.35" stroke="#b45309" strokeWidth="0.5" />
                <ellipse cx="82" cy="52" rx="8" ry="7" fill="#b45309" fillOpacity="0.35" stroke="#b45309" strokeWidth="0.5" />
              </>
            )}
            {highlightedMuscles.some(m => m.includes('Mông') || m.includes('Mông Giữa')) && (
              <>
                <path d="M45 130 L42 145 L44 155 L52 155 L52 140Z" fill="#14b8a6" fillOpacity="0.3" stroke="#14b8a6" strokeWidth="0.5" />
                <path d="M75 130 L78 145 L76 155 L68 155 L68 140Z" fill="#14b8a6" fillOpacity="0.3" stroke="#14b8a6" strokeWidth="0.5" />
              </>
            )}
            {highlightedMuscles.some(m => m.includes('Đùi Sau')) && (
              <>
                <path d="M45 155 L42 180 L44 195 L50 195 L50 175 L52 155Z" fill="#0891b2" fillOpacity="0.3" stroke="#0891b2" strokeWidth="0.5" />
                <path d="M75 155 L78 180 L76 195 L70 195 L70 175 L68 155Z" fill="#0891b2" fillOpacity="0.3" stroke="#0891b2" strokeWidth="0.5" />
              </>
            )}
            {highlightedMuscles.some(m => m.includes('Bắp Chân')) && (
              <>
                <ellipse cx="46" cy="202" rx="10" ry="14" fill="#84cc16" fillOpacity="0.3" stroke="#84cc16" strokeWidth="0.5" />
                <ellipse cx="74" cy="202" rx="10" ry="14" fill="#84cc16" fillOpacity="0.3" stroke="#84cc16" strokeWidth="0.5" />
              </>
            )}
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-800/60">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#22d3ee' }} />
          <span className="text-[9px] text-gray-400 font-medium">CƠ HOẠT ĐỘNG</span>
        </div>
        {highlightedMuscles.map(m => (
          <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800/80 border border-gray-700/50 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: MUSCLE_GROUPS[m]?.color || '#22c55e' }} />
            {m}
          </span>
        ))}
        {highlightedMuscles.length === 0 && <span className="text-[10px] text-gray-500">Toàn thân</span>}
      </div>
    </div>
  );
}
