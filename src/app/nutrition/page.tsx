'use client';
import { useEffect, useState } from 'react';
import ProgressBar from '@/components/ProgressBar';

export default function NutritionPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [suggestedMeals, setSuggestedMeals] = useState<any[]>([]);
  const [suggestResult, setSuggestResult] = useState<any>(null);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestError, setSuggestError] = useState('');
  const [swapModal, setSwapModal] = useState<{ foodName: string; grams: number; options: any[] } | null>(null);

  useEffect(() => { fetch('/api/today').then(r => r.json()).then(d => { setData(d); setLoading(false); }); }, []);

  const handleSuggest = async () => {
    setSuggesting(true);
    setSuggestError('');
    try {
      const res = await fetch('/api/nutrition/suggest', { method: 'POST' });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Lỗi tạo thực đơn');
      setSuggestedMeals(d.meals || []);
      setSuggestResult(d);
    } catch (e: any) {
      setSuggestError(e.message);
    } finally {
      setSuggesting(false);
    }
  };

  const handleSwap = async (foodName: string, grams: number) => {
    try {
      const res = await fetch('/api/nutrition/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodName, grams }),
      });
      const d = await res.json();
      if (d.options?.length > 0) setSwapModal({ foodName, grams, options: d.options });
    } catch {}
  };

  // Calculate nutrition score
  const todayLog = data?.todayLog;
  const nutritionPlan = data?.nutritionPlan;
  const hasTodayData = todayLog && nutritionPlan;

  let scoreData = null;
  if (hasTodayData) {
    const calRatio = todayLog.calories / nutritionPlan.caloriesTarget;
    const proRatio = todayLog.protein / nutritionPlan.proteinTarget;
    const fiber = 0;
    const waterRatio = nutritionPlan.waterTarget > 0 ? todayLog.water / nutritionPlan.waterTarget : 0;

    let calScore: number;
    if (calRatio >= 0.85 && calRatio <= 1.15) calScore = 30;
    else if (calRatio >= 0.7 && calRatio <= 1.3) calScore = 20;
    else if (calRatio >= 0.5 && calRatio <= 1.5) calScore = 10;
    else calScore = 0;

    let proScore: number;
    if (proRatio >= 0.9) proScore = 35;
    else if (proRatio >= 0.75) proScore = 25;
    else if (proRatio >= 0.6) proScore = 15;
    else if (proRatio >= 0.4) proScore = 8;
    else proScore = 0;

    let fiberScore = 0;
    let waterScore: number;
    if (waterRatio >= 0.9) waterScore = 15;
    else if (waterRatio >= 0.7) waterScore = 12;
    else if (waterRatio >= 0.5) waterScore = 8;
    else if (waterRatio >= 0.3) waterScore = 4;
    else waterScore = 0;

    const totalScore = calScore + proScore + fiberScore + waterScore;
    let scoreLabel: string;
    let scoreColor: string;
    if (totalScore >= 85) { scoreLabel = 'Xuất Sắc'; scoreColor = 'text-emerald-400'; }
    else if (totalScore >= 70) { scoreLabel = 'Tốt'; scoreColor = 'text-blue-400'; }
    else if (totalScore >= 50) { scoreLabel = 'Trung Bình'; scoreColor = 'text-amber-400'; }
    else { scoreLabel = 'Cần Cải Thiện'; scoreColor = 'text-red-400'; }

    scoreData = { score: totalScore, label: scoreLabel, color: scoreColor, calScore, proScore, fiberScore, waterScore };
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return null;

  const mealTypeLabels: Record<string, string> = { breakfast: 'Bữa Sáng', lunch: 'Bữa Trưa', dinner: 'Bữa Tối', snack: 'Bữa Phụ', pre_workout: 'Trước Tập', post_workout: 'Sau Tập' };

  const displayMeals = suggestedMeals.length > 0 ? suggestedMeals : (nutritionPlan?.meals || []);
  const isSuggested = suggestedMeals.length > 0;

  const dailyTargets = {
    calories: nutritionPlan?.caloriesTarget || 0,
    protein: nutritionPlan?.proteinTarget || 0,
    carbs: nutritionPlan?.carbTarget || 0,
    fat: nutritionPlan?.fatTarget || 0,
  };

  const plannedTotal = isSuggested
    ? {
      calories: suggestedMeals.reduce((s: number, m: any) => s + m.calories, 0),
      protein: suggestedMeals.reduce((s: number, m: any) => s + m.protein, 0),
      carbs: suggestedMeals.reduce((s: number, m: any) => s + m.carbs, 0),
      fat: suggestedMeals.reduce((s: number, m: any) => s + m.fat, 0),
    }
    : { calories: 0, protein: 0, carbs: 0, fat: 0 };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Kế Hoạch Dinh Dưỡng</h1><p className="text-gray-400 text-sm mt-1">Chỉ tiêu macro & theo dõi bữa ăn</p></div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Chỉ Tiêu Hàng Ngày</h2>
          {nutritionPlan ? (<>
            <ProgressBar label="Calo" current={todayLog?.calories || 0} target={nutritionPlan.caloriesTarget} color="emerald" />
            <div className="mt-4 space-y-3">
              <ProgressBar label="Đạm" current={todayLog?.protein || 0} target={nutritionPlan.proteinTarget} unit="g" color="blue" />
              <ProgressBar label="Carb" current={todayLog?.carbs || 0} target={nutritionPlan.carbTarget} unit="g" color="amber" />
              <ProgressBar label="Béo" current={todayLog?.fat || 0} target={nutritionPlan.fatTarget} unit="g" color="red" />
              <ProgressBar label="Nước" current={todayLog?.water || 0} target={nutritionPlan.waterTarget} unit="ml" color="blue" />
            </div></>) : <p className="text-gray-400 text-sm">Hoàn thành onboarding để có kế hoạch.</p>}
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Điểm Dinh Dưỡng</h2>
          {scoreData ? (
            <div className="text-center py-4">
              <div className={`text-5xl font-bold ${scoreData.color} mb-2`}>{scoreData.score}</div>
              <p className={`text-lg font-semibold ${scoreData.color}`}>{scoreData.label}</p>
              <div className="grid grid-cols-4 gap-2 mt-4">
                <div className="bg-gray-800/50 rounded-lg p-2"><p className="text-xs text-gray-500">Calo</p><p className="text-sm font-semibold text-white">{scoreData.calScore}/30</p></div>
                <div className="bg-gray-800/50 rounded-lg p-2"><p className="text-xs text-gray-500">Đạm</p><p className="text-sm font-semibold text-blue-400">{scoreData.proScore}/35</p></div>
                <div className="bg-gray-800/50 rounded-lg p-2"><p className="text-xs text-gray-500">Xơ</p><p className="text-sm font-semibold text-green-400">{scoreData.fiberScore}/20</p></div>
                <div className="bg-gray-800/50 rounded-lg p-2"><p className="text-xs text-gray-500">Nước</p><p className="text-sm font-semibold text-sky-400">{scoreData.waterScore}/15</p></div>
              </div>
            </div>
          ) : <p className="text-gray-400 text-sm">Ghi nhận dinh dưỡng hôm nay để có điểm.</p>}
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">{isSuggested ? 'Thực Đơn Hôm Nay (Engine)' : 'Bữa Ăn Gợi Ý'}</h2>
          <button
            onClick={handleSuggest}
            disabled={suggesting}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg flex items-center gap-1.5 disabled:opacity-50"
          >
            {suggesting ? (
              <><span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></span>Đang tạo...</>
            ) : (
              <>✨ Gợi ý món mới</>
            )}
          </button>
        </div>

        {suggestError && <div className="mb-3 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">{suggestError}</div>}

        {isSuggested && (
          <p className="text-xs text-emerald-400 mb-3">Thực đơn được tính chính xác từ Macro Target → Food Selection → Meal Generation.</p>
        )}

        {displayMeals.length > 0 ? (
          <>
            <div className="grid md:grid-cols-3 gap-4">
              {displayMeals.map((m: any, i: number) => (
                <div key={m.id || i} className={`rounded-lg p-4 border ${isSuggested ? 'bg-emerald-900/20 border-emerald-700/30' : 'bg-gray-800/50 border-gray-700/50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium uppercase ${isSuggested ? 'text-emerald-300' : 'text-emerald-400'}`}>{mealTypeLabels[m.mealType] || m.mealType}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{m.calories} cal</span>
                      {isSuggested && m.items?.length > 0 && (
                        <button
                          onClick={() => handleSwap(m.items[0].foodName || '', m.items[0].grams || 0)}
                          className="text-xs text-gray-500 hover:text-white transition-colors"
                          title="Đổi món"
                        >🔄</button>
                      )}
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">{m.name}</h3>
                  <div className="flex gap-3 text-xs text-gray-400"><span>Đ: {m.protein}g</span><span>C: {m.carbs}g</span><span>B: {m.fat}g</span></div>
                  {m.ingredients && <p className="text-xs text-gray-500 mt-2"><strong>Nguyên liệu:</strong> {m.ingredients}</p>}
                  {m.instructions && <p className="text-xs text-gray-500 mt-1"><strong>Cách làm:</strong> {m.instructions}</p>}
                  {m.items && m.items.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-700/30">
                      <p className="text-xs text-gray-600 mb-1">Chi tiết:</p>
                      {m.items.map((it: any, j: number) => (
                        <div key={j} className="flex items-center justify-between text-xs text-gray-500">
                          <span>{it.foodName} ({it.grams}g)</span>
                          <span className="text-gray-600">{it.calories} cal</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Daily Summary */}
            {isSuggested && (
              <div className="mt-6 bg-gray-800/30 rounded-lg border border-gray-700/30 p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Tổng Kết Thực Đơn</h3>
                <div className="grid grid-cols-4 gap-3 text-center text-sm">
                  {['calories', 'protein', 'carbs', 'fat'].map(k => {
                    const label = { calories: 'Calo', protein: 'Đạm', carbs: 'Carb', fat: 'Béo' }[k];
                    const unit = k === 'calories' ? '' : 'g';
                    const planned = (plannedTotal as any)[k];
                    const target = (dailyTargets as any)[k];
                    const diff = planned - target;
                    const diffColor = k === 'calories'
                      ? (Math.abs(diff) <= target * 0.05 ? 'text-emerald-400' : 'text-amber-400')
                      : k === 'protein' ? (diff >= -5 ? 'text-emerald-400' : 'text-red-400')
                      : 'text-gray-400';
                    const diffSign = diff > 0 ? '+' : '';
                    return (
                      <div key={k} className="bg-gray-900/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">{label}</p>
                        <p className="text-base font-bold text-white">{planned} <span className="text-xs text-gray-500">/ {target}{unit}</span></p>
                        <p className={`text-xs ${diffColor} mt-1`}>{diffSign}{diff}{unit}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : <p className="text-gray-400 text-sm">Chưa có kế hoạch bữa ăn. Hoàn thành onboarding để nhận gợi ý.</p>}
      </div>

      {/* Swap Modal */}
      {swapModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSwapModal(null)}>
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-3">Đổi Món — {swapModal.foodName}</h3>
            <div className="space-y-2">
              {swapModal.options.map((opt: any, i: number) => (
                <div key={i} className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">{opt.food.nameVi} {opt.grams}g</p>
                    <p className="text-xs text-gray-400">{opt.macros.calories} cal | Đ: {opt.macros.protein}g C: {opt.macros.carbs}g B: {opt.macros.fat}g</p>
                  </div>
                  <button
                    onClick={async () => {
                      // Re-generate with swapped food
                      setSwapModal(null);
                      handleSuggest();
                    }}
                    className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded"
                  >Dùng</button>
                </div>
              ))}
            </div>
            <button onClick={() => setSwapModal(null)} className="mt-3 text-sm text-gray-400 hover:text-white w-full text-center">Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}
