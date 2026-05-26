'use client';
import { useEffect, useState } from 'react';
import { MetricChart } from '@/components/MetricChart';

export default function ProgressPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ weight: '', bodyFat: '', waist: '', chest: '', arm: '', thigh: '', hip: '', shoulder: '' });
  const [saveMsg, setSaveMsg] = useState('');
  const [warnings, setWarnings] = useState<any[]>([]);

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
      const json = await res.json();
      setSaveMsg('Đã lưu! Refresh trang để thấy biểu đồ cập nhật.');
      if (json.warnings) {
        setWarnings(json.warnings);
      } else {
        setSaveMsg('Đã lưu chỉ số thành công.');
      }
      setForm({ weight: '', bodyFat: '', waist: '', chest: '', arm: '', thigh: '', hip: '', shoulder: '' });
    } catch {
      setSaveMsg('Lỗi khi lưu, thử lại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return null;

  const { bodyMetrics, workoutLogs, progressRecords } = data;
  const fmt = (d: Date) => d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' });

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
        {warnings.length > 0 && (
          <div className="mb-3 space-y-2">
            {warnings.map((w: any, i: number) => (
              <div key={i} className={`p-3 rounded-lg border ${w.type === 'danger' ? 'bg-red-900/20 border-red-800 text-red-300' : 'bg-amber-900/20 border-amber-800 text-amber-300'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{w.type === 'danger' ? '🔴' : '🟡'}</span>
                  <span className="text-sm font-semibold">{w.message}</span>
                </div>
                <p className="text-xs opacity-80 ml-6">{w.action}</p>
              </div>
            ))}
          </div>
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
