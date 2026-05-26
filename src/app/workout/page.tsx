'use client';
import { useEffect, useState } from 'react';

const muscleMap: Record<string, string> = {
  'Push - Chest & Shoulder Focus': 'Đẩy - Ngực & Vai', 'Pull - Back & Biceps Focus': 'Kéo - Lưng & Tay Trước',
  'Legs - Quads & Glutes Focus': 'Chân - Đùi Trước & Mông', 'Push - Shoulder & Triceps Focus': 'Đẩy - Vai & Tay Sau',
  'Pull - Lats & Rear Delts Focus': 'Kéo - Xô & Vai Sau', 'Upper Body - Push Focus': 'Thân Trên - Đẩy',
  'Lower Body - Quads Focus': 'Thân Dưới - Đùi Trước', 'Upper Body - Pull Focus': 'Thân Trên - Kéo',
  'Lower Body - Posterior Chain': 'Thân Dưới - Chuỗi Sau',
};

const weekDayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function WorkoutPage() {
  const [data, setData] = useState<any>(null);
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch('/api/workout-plan').then(r => r.json()).then(d => { setData(d); setLoading(false); }); }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  const plan = data?.plan;
  if (!plan) return <div className="p-8 text-center text-gray-400">Cần tạo kế hoạch từ onboarding.</div>;
  const days = plan.days || [];

  const groupByWeek = () => {
    const weeks: Record<string, typeof days> = {};
    for (const d of days) {
      const date = new Date(d.date);
      const weekStart = new Date(date);
      const day = weekStart.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      weekStart.setDate(weekStart.getDate() + diff);
      const key = weekStart.toISOString().split('T')[0];
      if (!weeks[key]) weeks[key] = [];
      weeks[key].push(d);
    }
    return Object.entries(weeks);
  };

  const grouped = groupByWeek();

  const renderDay = (d: any) => (
    <div key={d.id} className={`bg-gray-900 rounded-xl border p-4 ${d.completed ? 'border-emerald-500/30' : 'border-gray-800'}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs text-gray-500">{weekDayNames[new Date(d.date).getDay()]}, {new Date(d.date).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })}</p>
          <p className="text-base font-semibold text-white">{muscleMap[d.focus] || d.focus}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${d.completed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-700 text-gray-400'}`}>{d.completed ? 'Xong' : 'Chưa'}</span>
      </div>
      <div className="space-y-1">
        {d.exercises?.map((we: any, i: number) => (
          <div key={i} className="flex items-center justify-between px-2 py-1 rounded bg-gray-800/30"><span className="text-xs text-gray-400">{we.exercise?.name || `Bài ${i + 1}`}</span><span className="text-xs text-gray-500">{we.sets}x{we.reps}</span></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Lịch Tập</h1><p className="text-gray-400 text-sm">{plan.name}</p></div>
        <div className="flex bg-gray-800 rounded-lg p-1">
          {[{ v: 'daily', l: 'Ngày' }, { v: 'weekly', l: 'Tuần' }, { v: 'monthly', l: 'Tháng' }].map(v => (
            <button key={v.v} onClick={() => setView(v.v as any)} className={`px-3 py-2 text-xs font-medium rounded-md transition-colors min-h-[44px] flex items-center ${view === v.v ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}>{v.l}</button>
          ))}
        </div>
      </div>

      {view === 'daily' && (<div className="grid gap-4">{days.map(renderDay)}</div>)}
      {view === 'weekly' && (<div className="space-y-8">{grouped.map(([week, weekDays]) => (<div key={week}><h3 className="text-sm font-semibold text-gray-400 mb-3">Tuần {new Date(week).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })}</h3><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{weekDays.map(renderDay)}</div></div>))}</div>)}
      {view === 'monthly' && (<div className="space-y-8">{grouped.map(([week, weekDays]) => (<div key={week}><h3 className="text-sm font-semibold text-gray-400 mb-3">Tuần {new Date(week).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })}</h3><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{weekDays.map(renderDay)}</div></div>))}</div>)}
    </div>
  );
}
