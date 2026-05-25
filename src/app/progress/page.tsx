'use client';
import { useEffect, useState } from 'react';
import { MetricChart } from '@/components/MetricChart';

export default function ProgressPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch('/api/progress').then(r => r.json()).then(d => { setData(d); setLoading(false); }); }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return null;

  const { bodyMetrics, workoutLogs, nutritionLogs, nutritionPlan, progressRecords } = data;
  const fmt = (d: Date) => d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' });

  const weightData = bodyMetrics?.filter((m: any) => m.weight).map((m: any) => ({ date: fmt(new Date(m.date)), weight: m.weight })) || [];
  const caloriesData = nutritionLogs?.map((l: any) => ({ date: fmt(new Date(l.date)), calories: l.calories, protein: l.protein })) || [];
  const adherenceData = progressRecords?.map((p: any) => ({ date: fmt(new Date(p.date)), adherence: p.adherenceScore, workoutRate: p.workoutCompletionRate })) || [];
  const bodyMeasurements = bodyMetrics?.filter((m: any) => m.waist || m.chest).map((m: any) => ({ date: fmt(new Date(m.date)), waist: m.waist, chest: m.chest, arm: m.arm })) || [];
  const totalWorkouts = workoutLogs?.length || 0;
  const completedWorkouts = workoutLogs?.filter((l: any) => l.completed).length || 0;
  const avgCompletion = totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Theo Dõi Tiến Độ</h1><p className="text-gray-400 text-sm mt-1">Theo dõi hành trình thay đổi của bạn</p></div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card text-center"><p className="text-xs text-gray-500">Tổng Buổi Tập</p><p className="text-2xl font-bold text-white mt-1">{totalWorkouts}</p></div>
        <div className="stat-card text-center"><p className="text-xs text-gray-500">Đã Hoàn Thành</p><p className="text-2xl font-bold text-emerald-400 mt-1">{completedWorkouts}</p></div>
        <div className="stat-card text-center"><p className="text-xs text-gray-500">Tỷ Lệ Hoàn Thành</p><p className="text-2xl font-bold text-white mt-1">{avgCompletion}%</p></div>
        <div className="stat-card text-center"><p className="text-xs text-gray-500">Tuân Thủ TB</p><p className="text-2xl font-bold text-white mt-1">{progressRecords?.length > 0 ? Math.round(progressRecords.reduce((s: number, p: any) => s + p.adherenceScore, 0) / progressRecords.length) : '-'}%</p></div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Xu Hướng Cân Nặng</h3>
          {weightData.length > 0 ? <MetricChart data={weightData} lines={[{ dataKey: 'weight', stroke: '#22c55e', name: 'Cân nặng (kg)' }]} height={250} /> : <p className="text-gray-500 text-sm">Chưa có dữ liệu.</p>}
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Số Đo Cơ Thể</h3>
          {bodyMeasurements.length > 0 ? <MetricChart data={bodyMeasurements} lines={[{ dataKey: 'waist', stroke: '#ef4444', name: 'Eo' }, { dataKey: 'chest', stroke: '#3b82f6', name: 'Ngực' }, { dataKey: 'arm', stroke: '#a855f7', name: 'Tay' }]} height={250} /> : <p className="text-gray-500 text-sm">Chưa có dữ liệu.</p>}
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Calo vs Mục Tiêu</h3>
          {caloriesData.length > 0 && nutritionPlan ? <MetricChart data={caloriesData} lines={[{ dataKey: 'calories', stroke: '#f59e0b', name: 'Calo' }, { dataKey: 'protein', stroke: '#22c55e', name: 'Đạm' }]} height={250} goalLine={nutritionPlan.caloriesTarget} /> : <p className="text-gray-500 text-sm">Ghi nhận bữa ăn để thấy xu hướng.</p>}
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Điểm Tuân Thủ</h3>
          {adherenceData.length > 0 ? <MetricChart data={adherenceData} lines={[{ dataKey: 'adherence', stroke: '#8b5cf6', name: 'Tuân Thủ' }, { dataKey: 'workoutRate', stroke: '#22c55e', name: 'Tỉ Lệ Tập' }]} height={250} /> : <p className="text-gray-500 text-sm">Chưa có dữ liệu.</p>}
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Nhật Ký Tập Gần Đây</h3>
        {workoutLogs?.length > 0 ? (
          <div className="space-y-3">
            {workoutLogs.slice(0, 10).map((log: any) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div><p className="text-sm text-gray-300">{fmt(new Date(log.date))} - {log.workoutDay?.focus || 'Tập'}</p><p className="text-xs text-gray-500">{log.exercises?.length || 0} bài · {log.completed ? log.exercises?.reduce((s: number, e: any) => s + e.setsCompleted, 0) + ' hiệp' : ''}</p></div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${log.completed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{log.completed ? 'Hoàn Thành' : 'Nghỉ'}</span>
              </div>))}
          </div>
        ) : <p className="text-gray-500 text-sm">Chưa có nhật ký tập.</p>}
      </div>
    </div>
  );
}
