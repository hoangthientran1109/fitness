'use client';
import { useEffect, useState } from 'react';
import { MetricChart } from '@/components/MetricChart';

export default function ProgressPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ weight: '', bodyFat: '', waist: '', chest: '', arm: '', thigh: '', hip: '', shoulder: '' });
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => { fetch('/api/progress').then(r => r.json()).then(d => { setData(d); setLoading(false); }); }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    const payload: Record<string, number> = {};
    if (form.weight) payload.weight = parseFloat(form.weight);
    if (form.bodyFat) payload.bodyFat = parseFloat(form.bodyFat);
    if (form.waist) payload.waist = parseFloat(form.waist);
    if (form.chest) payload.chest = parseFloat(form.chest);
    if (form.arm) payload.arm = parseFloat(form.arm);
    if (form.thigh) payload.thigh = parseFloat(form.thigh);
    if (form.hip) payload.hip = parseFloat(form.hip);
    if (form.shoulder) payload.shoulder = parseFloat(form.shoulder);

    if (Object.keys(payload).length === 0) {
      setSaveMsg('Vui lòng nhập ít nhất 1 chỉ số');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/body-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Lỗi lưu');
      setSaveMsg('Đã lưu! Refresh trang để thấy biểu đồ cập nhật.');
      setForm({ weight: '', bodyFat: '', waist: '', chest: '', arm: '', thigh: '', hip: '', shoulder: '' });
    } catch {
      setSaveMsg('Lỗi khi lưu, thử lại.');
    } finally {
      setSaving(false);
    }
  };

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

      {/* FORM NHẬP CHỈ SỐ */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Ghi Nhận Chỉ Số Hôm Nay</h2>
          <span className="text-xs text-gray-500">1-2 lần/tuần, sáng sớm lúc đói</span>
        </div>
        {saveMsg && (
          <div className={`mb-3 p-2 rounded text-sm ${saveMsg.includes('Đã lưu') ? 'bg-emerald-900/30 text-emerald-300' : 'bg-red-900/30 text-red-300'}`}>{saveMsg}</div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div><label className="text-xs text-gray-500">Cân nặng (kg) *</label><input className="input-field" type="number" step="0.1" placeholder="VD: 74.2" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} /></div>
          <div><label className="text-xs text-gray-500">Body Fat (%)</label><input className="input-field" type="number" step="0.1" placeholder="VD: 18" value={form.bodyFat} onChange={e => setForm(p => ({ ...p, bodyFat: e.target.value }))} /></div>
          <div><label className="text-xs text-gray-500">Vòng eo (cm)</label><input className="input-field" type="number" step="0.5" placeholder="VD: 88" value={form.waist} onChange={e => setForm(p => ({ ...p, waist: e.target.value }))} /></div>
          <div><label className="text-xs text-gray-500">Vòng ngực (cm)</label><input className="input-field" type="number" step="0.5" placeholder="VD: 102" value={form.chest} onChange={e => setForm(p => ({ ...p, chest: e.target.value }))} /></div>
          <div><label className="text-xs text-gray-500">Bắp tay (cm)</label><input className="input-field" type="number" step="0.5" placeholder="VD: 36" value={form.arm} onChange={e => setForm(p => ({ ...p, arm: e.target.value }))} /></div>
          <div><label className="text-xs text-gray-500">Đùi (cm)</label><input className="input-field" type="number" step="0.5" placeholder="VD: 55" value={form.thigh} onChange={e => setForm(p => ({ ...p, thigh: e.target.value }))} /></div>
          <div><label className="text-xs text-gray-500">Hông (cm)</label><input className="input-field" type="number" step="0.5" placeholder="VD: 95" value={form.hip} onChange={e => setForm(p => ({ ...p, hip: e.target.value }))} /></div>
          <div><label className="text-xs text-gray-500">Vai (cm)</label><input className="input-field" type="number" step="0.5" placeholder="VD: 48" value={form.shoulder} onChange={e => setForm(p => ({ ...p, shoulder: e.target.value }))} /></div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary mt-4 text-sm px-6"
        >
          {saving ? 'Đang lưu...' : '💾 Lưu Chỉ Số'}
        </button>
      </div>

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
