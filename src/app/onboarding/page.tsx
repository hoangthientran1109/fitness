'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Ít vận động' },
  { value: 'lightly_active', label: 'Nhẹ (1-3 ngày/tuần)' },
  { value: 'moderately_active', label: 'Vừa (3-5 ngày/tuần)' },
  { value: 'very_active', label: 'Nặng (6-7 ngày/tuần)' },
  { value: 'extremely_active', label: 'Rất nặng (VĐV)' },
];

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Mới tập (< 6 tháng)' },
  { value: 'intermediate', label: 'Trung bình (6 tháng - 2 năm)' },
  { value: 'advanced', label: 'Nâng cao (trên 2 năm)' },
];

const GOAL_TYPES = [
  { value: 'fat_loss', label: 'Giảm Mỡ', icon: '📉' },
  { value: 'muscle_gain', label: 'Tăng Cơ', icon: '💪' },
  { value: 'body_recomposition', label: 'Tái Cấu Trúc Cơ Thể', icon: '🔄' },
  { value: 'strength', label: 'Tăng Sức Mạnh', icon: '🏋️' },
  { value: 'general_health', label: 'Sức Khỏe Tổng Thể', icon: '❤️' },
];

const EQUIPMENT_OPTIONS = [
  'barbell', 'dumbbell', 'kettlebell', 'machine', 'cable', 'bodyweight', 'bands', 'smith_machine',
];

const WEAK_PARTS = ['Ngực', 'Lưng', 'Vai', 'Tay Trước', 'Tay Sau', 'Đùi Trước', 'Đùi Sau', 'Mông', 'Bụng', 'Bắp Chân'];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', gender: 'male', age: 25, height: 170, weight: 70, bodyFat: '',
    activityLevel: 'moderately_active', experienceLevel: 'intermediate',
    goalType: 'body_recomposition', trainingDaysPerWeek: 4, timePerWorkout: 60,
    gymAccess: true, equipment: ['barbell', 'dumbbell', 'cable'] as string[],
    weakBodyParts: [] as string[], injuries: '',
    foodAllergies: '', foodsToAvoid: '', mealFrequency: 4,
    wakeUpTime: '06:30', sleepTime: '23:00', stressLevel: 4, avgSleepHours: 7,
  });

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));
  const toggleItem = (arr: string[], item: string, key: string) => {
    const next = arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
    update(key, next);
  };

  const handleSubmit = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/onboarding', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        ...form, bodyFat: form.bodyFat ? parseFloat(form.bodyFat) : undefined,
        targetWeight: form.goalType === 'fat_loss' ? form.weight - 5 : form.goalType === 'muscle_gain' ? form.weight + 5 : form.weight - 3,
      })});
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Thất bại'); }
      router.push('/'); router.refresh();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const steps = [
    {
      title: 'Thông Tin Cá Nhân',
      subtitle: 'Thông tin cơ bản để tính toán chỉ số',
      content: (
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-300 mb-1">Tên</label><input className="input-field" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Tên của bạn" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Giới tính</label><select className="select-field" value={form.gender} onChange={e => update('gender', e.target.value)}><option value="male">Nam</option><option value="female">Nữ</option></select></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Tuổi</label><input className="input-field" type="number" value={form.age} onChange={e => update('age', parseInt(e.target.value) || 0)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Chiều cao (cm)</label><input className="input-field" type="number" value={form.height} onChange={e => update('height', parseFloat(e.target.value) || 0)} /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Cân nặng (kg)</label><input className="input-field" type="number" value={form.weight} onChange={e => update('weight', parseFloat(e.target.value) || 0)} /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-300 mb-1">Mỡ cơ thể % (tùy chọn)</label><input className="input-field" type="number" value={form.bodyFat} onChange={e => update('bodyFat', e.target.value)} placeholder="18" /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-1">Mức độ hoạt động</label><select className="select-field" value={form.activityLevel} onChange={e => update('activityLevel', e.target.value)}>{ACTIVITY_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}</select></div>
        </div>
      ),
    },
    {
      title: 'Mục Tiêu',
      subtitle: 'Bạn muốn đạt được điều gì?',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {GOAL_TYPES.map(g => (
              <button key={g.value} onClick={() => update('goalType', g.value)} className={`p-4 rounded-xl border text-center transition-all ${form.goalType === g.value ? 'border-emerald-500 bg-emerald-500/10' : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'}`}>
                <div className="text-2xl mb-1">{g.icon}</div><div className="text-xs text-gray-300">{g.label}</div>
              </button>
            ))}
          </div>
          <div><label className="block text-sm font-medium text-gray-300 mb-1">Kinh nghiệm tập luyện</label><select className="select-field" value={form.experienceLevel} onChange={e => update('experienceLevel', e.target.value)}>{EXPERIENCE_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Số ngày tập/tuần</label><input className="input-field" type="number" min={1} max={7} value={form.trainingDaysPerWeek} onChange={e => update('trainingDaysPerWeek', parseInt(e.target.value) || 1)} /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Thời gian/buổi (phút)</label><input className="input-field" type="number" min={15} max={120} value={form.timePerWorkout} onChange={e => update('timePerWorkout', parseInt(e.target.value) || 45)} /></div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg"><input type="checkbox" checked={form.gymAccess} onChange={e => update('gymAccess', e.target.checked)} className="w-4 h-4 rounded accent-emerald-500" /><span className="text-sm text-gray-300">Tôi có đi tập gym</span></div>
        </div>
      ),
    },
    {
      title: 'Tùy Chọn Tập Luyện',
      subtitle: 'Thiết bị và ưu tiên',
      content: (
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-300 mb-2">Thiết bị có sẵn</label>
            <div className="flex flex-wrap gap-2">{EQUIPMENT_OPTIONS.map(e => (
              <button key={e} onClick={() => toggleItem(form.equipment, e, 'equipment')} className={`px-3 py-1.5 rounded-lg text-sm transition-all capitalize ${form.equipment.includes(e) ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-800/50 text-gray-400 border border-gray-700'}`}>{e.replace('_', ' ')}</button>
            ))}</div>
          </div>
          <div><label className="block text-sm font-medium text-gray-300 mb-2">Nhóm cơ yếu cần ưu tiên</label>
            <div className="flex flex-wrap gap-2">{WEAK_PARTS.map(p => (
              <button key={p} onClick={() => toggleItem(form.weakBodyParts, p, 'weakBodyParts')} className={`px-3 py-1.5 rounded-lg text-sm transition-all ${form.weakBodyParts.includes(p) ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-gray-800/50 text-gray-400 border border-gray-700'}`}>{p}</button>
            ))}</div>
          </div>
          <div><label className="block text-sm font-medium text-gray-300 mb-1">Chấn thương / giới hạn vận động</label><textarea className="input-field" rows={2} value={form.injuries} onChange={e => update('injuries', e.target.value)} placeholder="VD: Đau gối, đau vai khi tập overhead press..." /></div>
        </div>
      ),
    },
    {
      title: 'Dinh Dưỡng & Lối Sống',
      subtitle: 'Chế độ ăn và thói quen hàng ngày',
      content: (
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-300 mb-1">Dị ứng thực phẩm</label><input className="input-field" value={form.foodAllergies} onChange={e => update('foodAllergies', e.target.value)} placeholder="VD: Đậu phộng, hải sản, lactose..." /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-1">Món cần tránh</label><input className="input-field" value={form.foodsToAvoid} onChange={e => update('foodsToAvoid', e.target.value)} placeholder="VD: Đồ chiên rán, đường, đồ chế biến sẵn..." /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-1">Số bữa ăn mỗi ngày</label><select className="select-field" value={form.mealFrequency} onChange={e => update('mealFrequency', parseInt(e.target.value))}>{[2,3,4,5,6].map(n => <option key={n} value={n}>{n} bữa</option>)}</select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Giờ thức dậy</label><input className="input-field" type="time" value={form.wakeUpTime} onChange={e => update('wakeUpTime', e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Giờ đi ngủ</label><input className="input-field" type="time" value={form.sleepTime} onChange={e => update('sleepTime', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Mức stress (1-10)</label><input className="input-field" type="number" min={1} max={10} value={form.stressLevel} onChange={e => update('stressLevel', parseInt(e.target.value) || 1)} /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Ngủ TB (giờ)</label><input className="input-field" type="number" min={4} max={12} step={0.5} value={form.avgSleepHours} onChange={e => update('avgSleepHours', parseFloat(e.target.value) || 7)} /></div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/20">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Personal Fitness OS</h1>
          <p className="text-gray-400 mt-1">Thiết lập hồ sơ của bạn</p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <div className="flex gap-1 mb-6">{steps.map((_, i) => (<div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-emerald-500' : 'bg-gray-700'}`} />))}</div>
          <h2 className="text-lg font-semibold text-white mb-1">{steps[step].title}</h2>
          <p className="text-sm text-gray-500 mb-6">{steps[step].subtitle}</p>
          {steps[step].content}
          {error && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}
        </div>
        <div className="flex justify-between mt-6">
          <button onClick={() => setStep(s => s - 1)} disabled={step === 0} className="btn-secondary disabled:opacity-30">Quay Lại</button>
          {step < steps.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} className="btn-primary">Tiếp</button>
          ) : (
            <button onClick={handleSubmit} disabled={loading || !form.name} className="btn-primary">{loading ? 'Đang tạo...' : 'Tạo Kế Hoạch'}</button>
          )}
        </div>
      </div>
    </div>
  );
}
