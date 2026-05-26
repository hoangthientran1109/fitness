'use client';
import { useEffect, useState } from 'react';
import ProgressBar from '@/components/ProgressBar';

export default function NutritionPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [suggestedMeals, setSuggestedMeals] = useState<any[]>([]);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestError, setSuggestError] = useState('');

  useEffect(() => { fetch('/api/today').then(r => r.json()).then(d => { setData(d); setLoading(false); }); }, []);

  const handleSuggest = async () => {
    setSuggesting(true);
    setSuggestError('');
    try {
      const res = await fetch('/api/nutrition/suggest', { method: 'POST' });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Lỗi tạo thực đơn');
      setSuggestedMeals(d.meals || []);
    } catch (e: any) {
      setSuggestError(e.message);
    } finally {
      setSuggesting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return null;

  const { nutritionPlan } = data;

  const mealTypeLabels: Record<string, string> = { breakfast: 'Bữa Sáng', lunch: 'Bữa Trưa', dinner: 'Bữa Tối', snack: 'Bữa Phụ', pre_workout: 'Trước Tập', post_workout: 'Sau Tập' };

  const displayMeals = suggestedMeals.length > 0 ? suggestedMeals : (nutritionPlan?.meals || []);
  const isSuggested = suggestedMeals.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Kế Hoạch Dinh Dưỡng</h1><p className="text-gray-400 text-sm mt-1">Chỉ tiêu macro & theo dõi bữa ăn</p></div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Chỉ Tiêu Hàng Ngày</h2>
          {nutritionPlan ? (<>
            <ProgressBar label="Calo" current={data.todayLog?.calories || 0} target={nutritionPlan.caloriesTarget} color="emerald" />
            <div className="mt-4 space-y-3">
              <ProgressBar label="Đạm" current={data.todayLog?.protein || 0} target={nutritionPlan.proteinTarget} unit="g" color="blue" />
              <ProgressBar label="Carb" current={data.todayLog?.carbs || 0} target={nutritionPlan.carbTarget} unit="g" color="amber" />
              <ProgressBar label="Béo" current={data.todayLog?.fat || 0} target={nutritionPlan.fatTarget} unit="g" color="red" />
              <ProgressBar label="Nước" current={data.todayLog?.water || 0} target={nutritionPlan.waterTarget} unit="ml" color="blue" />
            </div></>) : <p className="text-gray-400 text-sm">Hoàn thành onboarding để có kế hoạch.</p>}
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Kiến Thức Dinh Dưỡng</h2>
          <div className="space-y-3 text-sm">
            <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3">
              <h3 className="text-blue-300 font-semibold mb-1">Đạm (Protein) — Nguyên liệu xây dựng cơ</h3>
              <p className="text-gray-400 leading-relaxed">Sửa chữa & phát triển mô cơ sau tập. Mỗi bữa nên có nguồn đạm nạc: ức gà, cá, trứng, đậu phụ, whey. Thiếu đạm = cơ không phục hồi, mất cơ khi giảm cân.</p>
            </div>
            <div className="bg-amber-900/20 border border-amber-800/30 rounded-lg p-3">
              <h3 className="text-amber-300 font-semibold mb-1">Carb (Tinh Bột) — Nhiên liệu vận động</h3>
              <p className="text-gray-400 leading-relaxed">Nguồn năng lượng chính cho não và cơ bắp khi tập. Carb phức tạp (gạo lứt, yến mạch, khoai lang) giải phóng năng lượng chậm, bền. Carb đơn (trái cây, mật ong) hấp thu nhanh — ăn trước/sau tập.</p>
            </div>
            <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3">
              <h3 className="text-red-300 font-semibold mb-1">Béo (Fat) — Nội tiết & hấp thu</h3>
              <p className="text-gray-400 leading-relaxed">Duy trì hormone (testosterone, estrogen), hấp thu vitamin A-D-E-K, bảo vệ khớp. Ưu tiên béo lành mạnh: dầu olive, cá hồi, bơ, hạnh nhân. Hạn chế đồ chiên rán, mỡ động vật chế biến.</p>
            </div>
            <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3">
              <h3 className="text-blue-300 font-semibold mb-1">Nước — Vận chuyển & thải độc</h3>
              <p className="text-gray-400 leading-relaxed">Chiếm ~60% cơ thể. Vận chuyển dinh dưỡng đến cơ, thải độc qua thận, điều hòa nhiệt độ. Uống đều trong ngày, không chờ khát. Tập nặng → bù thêm 500-1000ml.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">{isSuggested ? 'Thực Đơn Hôm Nay (AI Gợi Ý)' : 'Bữa Ăn Gợi Ý'}</h2>
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
          <p className="text-xs text-emerald-400 mb-3">🤖 Thực đơn được AI tạo riêng cho hôm nay. Mỗi ngày bấm "Gợi ý món mới" để nhận thực đơn khác.</p>
        )}

        {displayMeals.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-4">
            {displayMeals.map((m: any, i: number) => (
              <div key={m.id || i} className={`rounded-lg p-4 border ${isSuggested ? 'bg-emerald-900/20 border-emerald-700/30' : 'bg-gray-800/50 border-gray-700/50'}`}>
                <div className="flex items-center justify-between mb-2"><span className={`text-xs font-medium uppercase ${isSuggested ? 'text-emerald-300' : 'text-emerald-400'}`}>{mealTypeLabels[m.mealType] || m.mealType}</span><span className="text-xs text-gray-500">{m.calories} cal</span></div>
                <h3 className="text-sm font-semibold text-white mb-1">{m.name}</h3>
                <div className="flex gap-3 text-xs text-gray-400"><span>Đ: {m.protein}g</span><span>C: {m.carbs}g</span><span>B: {m.fat}g</span></div>
                {m.ingredients && <p className="text-xs text-gray-500 mt-2"><strong>Nguyên liệu:</strong> {m.ingredients}</p>}
                {m.instructions && <p className="text-xs text-gray-500 mt-1"><strong>Cách làm:</strong> {m.instructions}</p>}
              </div>
            ))}
          </div>
        ) : <p className="text-gray-400 text-sm">Chưa có kế hoạch bữa ăn. Hoàn thành onboarding để nhận gợi ý.</p>}
      </div>
    </div>
  );
}
