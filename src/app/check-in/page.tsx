'use client';
import { useEffect, useState } from 'react';

const sliders = [
  { key: 'energy', label: 'Năng Lượng' },
  { key: 'stress', label: 'Căng Thẳng' },
  { key: 'mood', label: 'Tâm Trạng' },
  { key: 'soreness', label: 'Đau Cơ' },
  { key: 'hunger', label: 'Đói' },
  { key: 'motivation', label: 'Động Lực' },
];

export default function CheckInPage() {
  const [form, setForm] = useState({ sleepHours: '', energy: 7, stress: 4, mood: 7, soreness: 4, hunger: 5, motivation: 8, painNote: '', digestionNote: '', dailyNote: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch('/api/today').then(r => r.json()).then(d => { if (d.todayCheckIn) setForm({ sleepHours: String(d.todayCheckIn.sleepHours || ''), energy: d.todayCheckIn.energy || 7, stress: d.todayCheckIn.stress || 4, mood: d.todayCheckIn.mood || 7, soreness: d.todayCheckIn.soreness || 4, hunger: d.todayCheckIn.hunger || 5, motivation: d.todayCheckIn.motivation || 8, painNote: d.todayCheckIn.painNote || '', digestionNote: d.todayCheckIn.digestionNote || '', dailyNote: d.todayCheckIn.dailyNote || '' }); setLoading(false); }); }, []);
  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    await fetch('/api/checkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sleepHours: parseFloat(form.sleepHours) || 0, energy: form.energy, stress: form.stress, mood: form.mood, soreness: form.soreness, hunger: form.hunger, motivation: form.motivation, painNote: form.painNote || null, digestionNote: form.digestionNote || null, dailyNote: form.dailyNote || null }) });
    setSubmitted(true);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (submitted) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center"><svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
      <h2 className="text-xl font-bold text-white mb-2">Đã Điểm Danh!</h2>
      <p className="text-gray-400 text-sm mb-4">Dữ liệu của bạn giúp HLV AI đưa ra gợi ý tốt hơn.</p>
      <button onClick={() => setSubmitted(false)} className="btn-primary">Sửa Điểm Danh</button>
    </div>
  );

  const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const today = new Date();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Điểm Danh Hàng Ngày</h1><p className="text-gray-400 text-sm mt-1">{dayNames[today.getDay()]}, {today.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })}</p></div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="mb-4"><label className="block text-sm font-medium text-gray-300 mb-1">Giờ Ngủ</label><input className="input-field" type="number" step={0.5} min={0} max={12} value={form.sleepHours} onChange={e => update('sleepHours', e.target.value)} placeholder="7.5" /></div>

        <div className="space-y-5 mb-6">
          {sliders.map(s => (<div key={s.key}><div className="flex items-center justify-between mb-1"><label className="text-sm text-gray-300">{s.label}</label><span className={`text-sm font-bold ${(form as any)[s.key] >= 7 ? 'text-emerald-400' : (form as any)[s.key] <= 3 ? 'text-red-400' : 'text-amber-400'}`}>{(form as any)[s.key]}/10</span></div><input type="range" min={1} max={10} value={(form as any)[s.key]} onChange={e => update(s.key, parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" /><div className="flex justify-between text-xs text-gray-600 mt-1"><span>Thấp</span><span>Cao</span></div></div>))}
        </div>

        <div className="space-y-3 mb-6">
          <div><label className="block text-sm font-medium text-gray-300 mb-1">Ghi Chú Đau / Chấn Thương</label><textarea className="input-field" rows={2} value={form.painNote} onChange={e => update('painNote', e.target.value)} placeholder="Có đau hay khó chịu gì hôm nay?" /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-1">Ghi Chú Tiêu Hóa</label><textarea className="input-field" rows={2} value={form.digestionNote} onChange={e => update('digestionNote', e.target.value)} placeholder="Tiêu hóa hôm nay thế nào?" /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-1">Ghi Chú Hôm Nay</label><textarea className="input-field" rows={2} value={form.dailyNote} onChange={e => update('dailyNote', e.target.value)} placeholder="Còn gì cần ghi chú thêm?" /></div>
        </div>

        <button onClick={handleSubmit} className="btn-primary w-full">Gửi Điểm Danh</button>
      </div>
    </div>
  );
}
