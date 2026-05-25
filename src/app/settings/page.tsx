'use client';
import { useEffect, useState } from 'react';

const RULE_TYPES = [
  { value: 'training', label: 'Tập Luyện' },
  { value: 'nutrition', label: 'Dinh Dưỡng' },
  { value: 'recovery', label: 'Phục Hồi' },
  { value: 'lifestyle', label: 'Lối Sống' },
];

const activityLabels: Record<string, string> = {
  sedentary: 'Ít Vận Động', lightly_active: 'Nhẹ', moderately_active: 'Vừa', very_active: 'Nặng', extremely_active: 'Rất Nặng',
};
const expLabels: Record<string, string> = { beginner: 'Mới Tập', intermediate: 'Trung Bình', advanced: 'Nâng Cao' };
const goalLabels: Record<string, string> = { fat_loss: 'Giảm Mỡ', muscle_gain: 'Tăng Cơ', body_recomposition: 'Tái Cấu Trúc', strength: 'Sức Mạnh', general_health: 'Sức Khỏe' };

export default function SettingsPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newRule, setNewRule] = useState({ ruleType: 'training', description: '' });
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', gender: '', age: 0, height: 0, weight: 0, bodyFat: '', activityLevel: '', experienceLevel: '' });

  useEffect(() => {
    Promise.all([fetch('/api/rules'), fetch('/api/user-profile')])
      .then(([r1, r2]) => Promise.all([r1.json(), r2.json()]))
      .then(([rulesData, userData]) => {
        setRules(rulesData.rules || []);
        if (userData.user) {
          setUser(userData.user);
          setProfileForm({ name: userData.user.name, gender: userData.user.gender, age: userData.user.age, height: userData.user.height, weight: userData.user.weight, bodyFat: userData.user.bodyFat?.toString() || '', activityLevel: userData.user.activityLevel, experienceLevel: userData.user.experienceLevel });
        }
        setLoading(false);
      });
  }, []);

  const addRule = async () => { if (!newRule.description.trim()) return; const res = await fetch('/api/rules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newRule) }); const d = await res.json(); setRules(prev => [d.rule, ...prev]); setNewRule({ ruleType: 'training', description: '' }); };
  const deleteRule = async (id: string) => { await fetch(`/api/rules?id=${id}`, { method: 'DELETE' }); setRules(prev => prev.filter(r => r.id !== id)); };
  const toggleRule = async (id: string) => { const res = await fetch('/api/rules', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); const d = await res.json(); setRules(prev => prev.map(r => r.id === id ? d.rule : r)); };
  const saveProfile = async () => { const res = await fetch('/api/user-profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...profileForm, bodyFat: profileForm.bodyFat ? parseFloat(profileForm.bodyFat) : null }) }); const d = await res.json(); if (d.user) { setUser(d.user); setEditingProfile(false); } };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Cài Đặt</h1><p className="text-gray-400 text-sm mt-1">Hồ Sơ & Quy Tắc Cá Nhân</p></div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-white">Hồ Sơ</h2><button onClick={() => setEditingProfile(!editingProfile)} className="btn-secondary text-sm">{editingProfile ? 'Hủy' : 'Sửa'}</button></div>

        {editingProfile ? (
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500">Tên</label><input className="input-field" value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><label className="text-xs text-gray-500">Giới tính</label><select className="select-field" value={profileForm.gender} onChange={e => setProfileForm(p => ({ ...p, gender: e.target.value }))}><option value="male">Nam</option><option value="female">Nữ</option></select></div>
            <div><label className="text-xs text-gray-500">Tuổi</label><input className="input-field" type="number" value={profileForm.age} onChange={e => setProfileForm(p => ({ ...p, age: parseInt(e.target.value) || 0 }))} /></div>
            <div><label className="text-xs text-gray-500">Cao (cm)</label><input className="input-field" type="number" value={profileForm.height} onChange={e => setProfileForm(p => ({ ...p, height: parseFloat(e.target.value) || 0 }))} /></div>
            <div><label className="text-xs text-gray-500">Nặng (kg)</label><input className="input-field" type="number" value={profileForm.weight} onChange={e => setProfileForm(p => ({ ...p, weight: parseFloat(e.target.value) || 0 }))} /></div>
            <div><label className="text-xs text-gray-500">Mỡ cơ thể %</label><input className="input-field" value={profileForm.bodyFat} onChange={e => setProfileForm(p => ({ ...p, bodyFat: e.target.value }))} /></div>
            <div><label className="text-xs text-gray-500">Hoạt động</label><select className="select-field" value={profileForm.activityLevel} onChange={e => setProfileForm(p => ({ ...p, activityLevel: e.target.value }))}>{Object.entries(activityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div><label className="text-xs text-gray-500">Kinh nghiệm</label><select className="select-field" value={profileForm.experienceLevel} onChange={e => setProfileForm(p => ({ ...p, experienceLevel: e.target.value }))}>{Object.entries(expLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div className="col-span-2"><button onClick={saveProfile} className="btn-primary w-full mt-2">Lưu Hồ Sơ</button></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gray-800/50 rounded-lg p-3"><p className="text-xs text-gray-500">Tên</p><p className="text-sm text-white font-medium">{user?.name}</p></div>
            <div className="bg-gray-800/50 rounded-lg p-3"><p className="text-xs text-gray-500">Tuổi</p><p className="text-sm text-white font-medium">{user?.age}</p></div>
            <div className="bg-gray-800/50 rounded-lg p-3"><p className="text-xs text-gray-500">Cao</p><p className="text-sm text-white font-medium">{user?.height} cm</p></div>
            <div className="bg-gray-800/50 rounded-lg p-3"><p className="text-xs text-gray-500">Nặng</p><p className="text-sm text-white font-medium">{user?.weight} kg</p></div>
            <div className="bg-gray-800/50 rounded-lg p-3"><p className="text-xs text-gray-500">Mỡ</p><p className="text-sm text-white font-medium">{user?.bodyFat ?? '-'}%</p></div>
            <div className="bg-gray-800/50 rounded-lg p-3"><p className="text-xs text-gray-500">Hoạt động</p><p className="text-sm text-white font-medium">{activityLabels[user?.activityLevel] || user?.activityLevel}</p></div>
            <div className="bg-gray-800/50 rounded-lg p-3"><p className="text-xs text-gray-500">Kinh nghiệm</p><p className="text-sm text-white font-medium">{expLabels[user?.experienceLevel] || user?.experienceLevel}</p></div>
            <div className="bg-gray-800/50 rounded-lg p-3"><p className="text-xs text-gray-500">Mục tiêu</p><p className="text-sm text-white font-medium">{goalLabels[user?.goals?.[0]?.goalType] || user?.goals?.[0]?.goalType}</p></div>
          </div>
        )}
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quy Tắc Cá Nhân</h2>

        <div className="flex gap-2 mb-4">
          <select className="select-field w-32" value={newRule.ruleType} onChange={e => setNewRule(p => ({ ...p, ruleType: e.target.value }))}>{RULE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
          <input className="input-field flex-1" placeholder="Mô tả quy tắc mới..." value={newRule.description} onChange={e => setNewRule(p => ({ ...p, description: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addRule()} />
          <button onClick={addRule} className="btn-primary text-sm">Thêm</button>
        </div>

        <div className="space-y-2">
          {rules.length === 0 && <p className="text-gray-500 text-sm">Chưa có quy tắc nào. Thêm quy tắc tập luyện, dinh dưỡng, phục hồi hoặc lối sống để cá nhân hóa.</p>}
          {rules.map(rule => (
            <div key={rule.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${rule.isActive ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-800/20 border-gray-800 opacity-50'}`}>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${rule.ruleType === 'training' ? 'bg-blue-500/10 text-blue-400' : rule.ruleType === 'nutrition' ? 'bg-emerald-500/10 text-emerald-400' : rule.ruleType === 'recovery' ? 'bg-purple-500/10 text-purple-400' : 'bg-amber-500/10 text-amber-400'}`}>{RULE_TYPES.find(t => t.value === rule.ruleType)?.label || rule.ruleType}</span>
                <span className="text-sm text-gray-300">{rule.description}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleRule(rule.id)} className={`text-xs px-3 py-2 rounded min-h-[44px] flex items-center ${rule.isActive ? 'text-amber-400 hover:bg-amber-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'}`}>{rule.isActive ? 'Tắt' : 'Bật'}</button>
                <button onClick={() => deleteRule(rule.id)} className="text-xs px-3 py-2 rounded min-h-[44px] flex items-center text-red-400 hover:bg-red-500/10">Xóa</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Tài Khoản</h2>
        <div className="space-y-3">
          <button onClick={() => { if (confirm('Xóa toàn bộ dữ liệu? Bạn sẽ phải làm lại onboarding.')) { window.location.href = '/onboarding'; } }} className="btn-danger text-sm w-full text-left">Xóa Toàn Bộ Dữ Liệu & Onboarding Lại</button>
        </div>
      </div>
    </div>
  );
}
