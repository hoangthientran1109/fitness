'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StatCard from '@/components/StatCard';
import ProgressBar from '@/components/ProgressBar';
import AiCoachCard from '@/components/AiCoachCard';
import StatusBadge from '@/components/StatusBadge';
import { MetricChart } from '@/components/MetricChart';

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const refreshDashboard = () => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => {
        if (d.error) { router.push('/onboarding'); return; }
        setData(d); setLoading(false);
      })
      .catch(() => router.push('/onboarding'));
  };

  useEffect(() => { refreshDashboard(); }, [router]);

  const generateInsight = () => {
    setGenerating(true);
    fetch('/api/ai-insights/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'daily' }) })
      .then(r => r.json())
      .then(() => { refreshDashboard(); setGenerating(false); })
      .catch(() => setGenerating(false));
  };

  if (loading) return (<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>);
  if (!data) return null;

  const { user, goal, latestMetric, workoutRate, nutritionPlan, avgCalories, avgProtein, avgSleep, avgStress, bodyMetrics, latestInsight } = data;
  const isNewUser = !bodyMetrics || bodyMetrics.length <= 1;
  let status: string = isNewUser ? 'ON_TRACK' : 'ON_TRACK';
  if (!isNewUser) {
    if (workoutRate < 60) status = 'OFF_TRACK';
    else if (workoutRate < 80) status = 'NEED_ADJUSTMENT';
    if (avgSleep < 6 && avgSleep > 0) status = 'RECOVERY_NEEDED';
  }

  const weightData = bodyMetrics?.filter((m: any) => m.weight).map((m: any) => ({
    date: new Date(m.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
    weight: m.weight,
  })) || [];

  const goalLabel = goal?.goalType === 'fat_loss' ? 'Giảm Mỡ' : goal?.goalType === 'muscle_gain' ? 'Tăng Cơ' : goal?.goalType === 'body_recomposition' ? 'Tái Cấu Trúc' : goal?.goalType === 'strength' ? 'Sức Mạnh' : 'Sức Khỏe';

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bảng Điều Khiển</h1>
          <p className="text-gray-400 text-sm mt-1">Chào mừng trở lại, {user.name}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>}
          title="Cân Nặng" value={`${latestMetric?.weight || user.weight} kg`}
          subtitle={`Mục tiêu: ${goal?.targetWeight || '-'} kg`}
          trend={latestMetric?.weight && user.weight && latestMetric.weight < user.weight ? 'down' : 'neutral'}
        />
        <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>}
          title="Tập Luyện" value={`${workoutRate}%`}
          subtitle="Hoàn thành tuần" statusBadge={workoutRate >= 80 ? 'ON_TRACK' : workoutRate >= 60 ? 'NEED_ADJUSTMENT' : 'OFF_TRACK'}
        />
        <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg>}
          title="Calo TB" value={avgCalories ? `${avgCalories}` : '-'}
          subtitle={nutritionPlan ? `Mục tiêu: ${nutritionPlan.caloriesTarget}` : ''}
        />
        <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>}
          title="Đạm TB" value={avgProtein ? `${avgProtein}g` : '-'}
          subtitle={nutritionPlan ? `Mục tiêu: ${nutritionPlan.proteinTarget}g` : ''}
        />
      </div>

      {latestInsight ? (
        <div>
          <AiCoachCard title={latestInsight.title} content={latestInsight.content} recommendation={latestInsight.recommendation} />
          <div className="flex justify-end mt-2">
            <button onClick={generateInsight} disabled={generating} className="text-xs px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5 min-h-[44px]">
              {generating ? (
                <>
                  <div className="w-3 h-3 border border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  Đang phân tích...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  Phân Tích AI
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 text-center">
          <p className="text-gray-400 text-sm mb-3">Chưa có phân tích AI. Nhấn nút bên dưới để HLV AI phân tích dữ liệu của bạn.</p>
          <button onClick={generateInsight} disabled={generating} className="btn-primary text-sm mx-auto">
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang phân tích...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                Phân Tích Dữ Liệu Của Tôi
              </>
            )}
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Chỉ Tiêu Dinh Dưỡng</h3>
          {nutritionPlan ? (
            <div className="space-y-3">
              <ProgressBar label="Calo" current={avgCalories || 0} target={nutritionPlan.caloriesTarget} color="emerald" />
              <ProgressBar label="Đạm" current={avgProtein || 0} target={nutritionPlan.proteinTarget} unit="g" color="blue" />
              <ProgressBar label="Giấc Ngủ" current={avgSleep} target={7} unit="h" color="purple" />
            </div>
          ) : <p className="text-gray-500 text-sm">Hoàn thành onboarding để có chỉ tiêu dinh dưỡng.</p>}
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Thống Kê Nhanh</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="stat-card"><p className="text-xs text-gray-500">Giấc Ngủ TB</p><p className="text-xl font-bold text-white">{avgSleep > 0 ? `${avgSleep}h` : '-'}</p></div>
            <div className="stat-card"><p className="text-xs text-gray-500">Stress TB</p><p className="text-xl font-bold text-white">{avgStress > 0 ? `${avgStress}/10` : '-'}</p></div>
            <div className="stat-card"><p className="text-xs text-gray-500">Mục Tiêu</p><p className="text-xl font-bold text-white">{goalLabel}</p></div>
            <div className="stat-card"><p className="text-xs text-gray-500">Kinh Nghiệm</p><p className="text-xl font-bold text-white capitalize">{user.experienceLevel === 'beginner' ? 'Mới' : user.experienceLevel === 'intermediate' ? 'TB' : 'Cao'}</p></div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Xu Hướng Cân Nặng</h3>
        {weightData.length > 0 ? <MetricChart data={weightData} lines={[{ dataKey: 'weight', stroke: '#22c55e', name: 'Cân nặng (kg)' }]} height={250} /> : <p className="text-gray-500 text-sm">Đang theo dõi...</p>}
      </div>
    </div>
  );
}
