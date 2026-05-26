'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';

const muscleMap: Record<string, string> = {
  'Push - Chest & Shoulder Focus': 'Đẩy - Ngực & Vai',
  'Pull - Back & Biceps Focus': 'Kéo - Lưng & Tay Trước',
  'Legs - Quads & Glutes Focus': 'Chân - Đùi Trước & Mông',
  'Push - Shoulder & Triceps Focus': 'Đẩy - Vai & Tay Sau',
  'Pull - Lats & Rear Delts Focus': 'Kéo - Xô & Vai Sau',
  'Upper Body - Push Focus': 'Thân Trên - Đẩy',
  'Lower Body - Quads Focus': 'Thân Dưới - Đùi Trước',
  'Upper Body - Pull Focus': 'Thân Trên - Kéo',
  'Lower Body - Posterior Chain': 'Thân Dưới - Chuỗi Sau',
};

const sliders = [
  { key: 'energy', label: 'Năng Lượng' },
  { key: 'stress', label: 'Căng Thẳng' },
  { key: 'mood', label: 'Tâm Trạng' },
  { key: 'soreness', label: 'Đau Cơ' },
  { key: 'hunger', label: 'Đói' },
  { key: 'motivation', label: 'Động Lực' },
];

export default function TodayPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logForm, setLogForm] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 });
  const [nutritionDesc, setNutritionDesc] = useState('');
  const [estimating, setEstimating] = useState(false);
  const [checkIn, setCheckIn] = useState({ sleepHours: '', energy: 7, stress: 4, mood: 7, soreness: 4, hunger: 5, motivation: 8, painNote: '', dailyNote: '' });
  const [checkInSubmitted, setCheckInSubmitted] = useState(false);
  const [loggedExercises, setLoggedExercises] = useState<Record<string, { weight: string; reps: string; sets: string; rpe: string }>>({});
  const [showLogForm, setShowLogForm] = useState(false);
  const [showSkipInput, setShowSkipInput] = useState(false);
  const [skipReason, setSkipReason] = useState('');

  useEffect(() => {
    fetch('/api/today').then(r => r.json()).then(d => {
      if (d.error) { router.push('/onboarding'); return; }
      setData(d);
      if (d.todayLog) setLogForm({ calories: d.todayLog.calories, protein: d.todayLog.protein, carbs: d.todayLog.carbs, fat: d.todayLog.fat, water: d.todayLog.water });
      if (d.todayCheckIn) {
        setCheckIn({
          sleepHours: String(d.todayCheckIn.sleepHours || ''),
          energy: d.todayCheckIn.energy || 7, stress: d.todayCheckIn.stress || 4,
          mood: d.todayCheckIn.mood || 7, soreness: d.todayCheckIn.soreness || 4,
          hunger: d.todayCheckIn.hunger || 5, motivation: d.todayCheckIn.motivation || 8,
          painNote: d.todayCheckIn.painNote || '', dailyNote: d.todayCheckIn.dailyNote || ''
        });
        setCheckInSubmitted(true);
      }
      setLoading(false);
    });
  }, [router]);

  const estimateNutrition = async () => {
    if (!nutritionDesc.trim()) return;
    setEstimating(true);
    try {
      const r = await fetch('/api/nutrition/estimate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: nutritionDesc }),
      });
      const d = await r.json();
      if (d.estimate) {
        setLogForm({
          calories: d.estimate.calories || 0, protein: d.estimate.protein || 0,
          carbs: d.estimate.carbs || 0, fat: d.estimate.fat || 0, water: d.estimate.water || 0,
        });
        setEstimating(false);
        return;
      }
      if (d.error) alert(d.error);
    } catch {
      alert('Không thể kết nối AI. Kiểm tra kết nối hoặc thử lại sau.');
    }
    setEstimating(false);
  };

  const logNutrition = async () => { await fetch('/api/nutrition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(logForm) }); };

  const logWorkout = async (completed: boolean, skippedReason?: string) => {
    if (!data?.todayWorkout) return;
    await fetch('/api/workout/log', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workoutDayId: data.todayWorkout.id, completed, skippedReason: skippedReason || null,
        exercises: data.todayWorkout.exercises?.map((we: any) => {
          const logged = loggedExercises[we.exerciseId] || {};
          return {
            exerciseId: we.exerciseId,
            setsCompleted: completed ? (parseInt(logged.sets) || we.sets) : 0,
            reps: completed ? (logged.reps || we.reps) : we.reps,
            weight: completed ? (parseFloat(logged.weight) || null) : null,
            rpe: completed ? (parseInt(logged.rpe) || we.rpe || null) : null,
          };
        }) || [] }) });
    window.location.reload();
  };

  const submitCheckIn = async () => {
    await fetch('/api/checkin', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sleepHours: parseFloat(checkIn.sleepHours) || 0, energy: checkIn.energy, stress: checkIn.stress,
        mood: checkIn.mood, soreness: checkIn.soreness, hunger: checkIn.hunger, motivation: checkIn.motivation,
        painNote: checkIn.painNote || null, digestionNote: null, dailyNote: checkIn.dailyNote || null
      })
    });
    setCheckInSubmitted(true);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return null;
  const { todayWorkout, nutritionPlan } = data;

  const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const today = new Date();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Kế Hoạch Hôm Nay</h1>
        <p className="text-gray-400 text-sm mt-1">{dayNames[today.getDay()]}, {today.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })}</p>
      </div>

      {/* CHECK-IN QUICK */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            </div>
            <h2 className="text-lg font-semibold text-white">Điểm Danh Nhanh</h2>
          </div>
          {checkInSubmitted && <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">Đã Gửi</span>}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="text-xs text-gray-500 mb-1 block">Giờ Ngủ</label><input className="input-field" type="number" step={0.5} min={0} max={12} value={checkIn.sleepHours} onChange={e => setCheckIn(c => ({ ...c, sleepHours: e.target.value }))} placeholder="7.5" /></div>
          {sliders.map(s => (
            <div key={s.key}>
              <div className="flex items-center justify-between mb-1"><span className="text-xs text-gray-400">{s.label}</span><span className={`text-xs font-bold ${(checkIn as any)[s.key] >= 7 ? 'text-emerald-400' : (checkIn as any)[s.key] <= 3 ? 'text-red-400' : 'text-amber-400'}`}>{(checkIn as any)[s.key]}/10</span></div>
              <input type="range" min={1} max={10} value={(checkIn as any)[s.key]} onChange={e => setCheckIn(c => ({ ...c, [s.key]: parseInt(e.target.value) }))} className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
            </div>
          ))}
          <div className="md:col-span-2"><label className="text-xs text-gray-500 mb-1 block">Ghi Chú Đau / Khó Chịu</label><input className="input-field" value={checkIn.painNote} onChange={e => setCheckIn(c => ({ ...c, painNote: e.target.value }))} placeholder="Ví dụ: Đau gối nhẹ" /></div>
          <div className="md:col-span-2"><label className="text-xs text-gray-500 mb-1 block">Ghi Chú Hôm Nay</label><input className="input-field" value={checkIn.dailyNote} onChange={e => setCheckIn(c => ({ ...c, dailyNote: e.target.value }))} placeholder="Cảm xúc, tình trạng, bất cứ điều gì..." /></div>
        </div>
        <button onClick={submitCheckIn} className="btn-primary w-full mt-4 text-sm">{checkInSubmitted ? 'Cập Nhật Điểm Danh' : 'Gửi Điểm Danh'}</button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Tập Luyện</h2>
            {todayWorkout && <span className={`text-xs font-medium px-2 py-1 rounded-full ${todayWorkout.completed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{todayWorkout.completed ? 'Đã Xong' : 'Chưa Tập'}</span>}
          </div>
          {data?.deloadSuggested && !todayWorkout?.completed && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
              <p className="text-amber-400 text-xs font-medium">Tuần Tập Nhẹ Khuyến Nghị</p>
              <p className="text-amber-300/70 text-xs mt-1">Bạn đã tập nặng {data.consecutiveHeavyWeeks} tuần liên tiếp. Cân nhắc giảm 40-50% mức tạ tuần này để cơ và thần kinh phục hồi, sau đó quay lại mức cũ và tiếp tục tăng.</p>
            </div>
          )}
          {todayWorkout ? (<>
            <p className="text-sm font-medium text-emerald-400 mb-3">{muscleMap[todayWorkout.focus] || todayWorkout.focus}</p>
            {!showLogForm && !todayWorkout.completed ? (
              <>
                <div className="space-y-2 mb-4">
                  {todayWorkout.exercises?.map((we: any, i: number) => (<div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800/50"><span className="text-sm text-gray-300">{i + 1}. {we.exercise?.name}</span><span className="text-xs text-gray-500">{we.sets} x {we.reps}</span></div>))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowLogForm(true)} className="btn-primary flex-1 text-sm">Bắt Đầu Tập</button>
                  <button onClick={() => { setShowSkipInput(true); setSkipReason(''); }} className="btn-secondary text-sm">Nghỉ</button>
                </div>
                {showSkipInput && (
                  <div className="mt-3 flex gap-2">
                    <input className="input-field flex-1 text-sm" placeholder="Lý do bỏ tập..." value={skipReason} onChange={e => setSkipReason(e.target.value)} autoFocus onKeyDown={e => { if (e.key === 'Enter') logWorkout(false, skipReason || undefined); }} />
                    <button onClick={() => logWorkout(false, skipReason || undefined)} className="btn-primary text-sm px-4">Xác Nhận</button>
                    <button onClick={() => setShowSkipInput(false)} className="btn-secondary text-sm px-3">Hủy</button>
                  </div>
                )}
              </>
            ) : !todayWorkout.completed ? (
              <>
                <div className="space-y-3 mb-4">
                  {todayWorkout.exercises?.map((we: any, i: number) => (
                    <LogExerciseRow key={i} index={i} we={we} logged={loggedExercises} setLogged={setLoggedExercises} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => logWorkout(true)} className="btn-primary flex-1 text-sm">Ghi Nhận Buổi Tập</button>
                  <button onClick={() => setShowLogForm(false)} className="btn-secondary text-sm">Quay Lại</button>
                </div>
              </>
            ) : <p className="text-emerald-400 text-sm text-center">Tuyệt vời! Đã hoàn thành buổi tập hôm nay!</p>}
          </>) : <p className="text-gray-500 text-sm">Hôm nay là ngày nghỉ hoặc cardio!</p>}
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Dinh Dưỡng</h2>
          {nutritionPlan ? (<>
            <div className="space-y-4 mb-4">
              <ProgressBar label="Calo" current={logForm.calories} target={nutritionPlan.caloriesTarget} color="emerald" />
              <ProgressBar label="Đạm" current={logForm.protein} target={nutritionPlan.proteinTarget} unit="g" color="blue" />
              <ProgressBar label="Carb" current={logForm.carbs} target={nutritionPlan.carbTarget} unit="g" color="amber" />
              <ProgressBar label="Béo" current={logForm.fat} target={nutritionPlan.fatTarget} unit="g" color="red" />
              <ProgressBar label="Nước" current={logForm.water} target={nutritionPlan.waterTarget} unit="ml" color="blue" />
            </div>

            <div className="mb-3">
              <label className="text-xs text-gray-500 mb-1 block">Mô tả đồ ăn hôm nay (tiếng Việt)</label>
              <textarea
                className="input-field w-full"
                rows={3}
                value={nutritionDesc}
                onChange={e => setNutritionDesc(e.target.value)}
                placeholder="Ví dụ: Sáng 2 trứng + bánh mì, trưa cơm gà + bông cải, chiều whey protein + chuối..."
              />
            </div>
            <button onClick={estimateNutrition} disabled={estimating || !nutritionDesc.trim()} className="btn-primary w-full text-sm mb-4 flex items-center justify-center gap-2 disabled:opacity-50">
              {estimating ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Đang tính AI...</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>AI Tính Macro</>
              )}
            </button>

            <div className="bg-gray-800/40 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Calo</span>
                <span className="text-sm font-bold text-white">{logForm.calories}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Đạm</span>
                <span className="text-sm font-bold text-blue-400">{logForm.protein}g</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Carb</span>
                <span className="text-sm font-bold text-amber-400">{logForm.carbs}g</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Béo</span>
                <span className="text-sm font-bold text-red-400">{logForm.fat}g</span>
              </div>
            </div>
            <button onClick={logNutrition} className="btn-primary w-full text-sm">Ghi Nhận Dinh Dưỡng</button>
          </>) : <p className="text-gray-500 text-sm">Chưa có kế hoạch dinh dưỡng.</p>}
        </div>
      </div>
    </div>
  );
}

function LogExerciseRow({ index, we, logged, setLogged }: {
  index: number;
  we: any;
  logged: Record<string, { weight: string; reps: string; sets: string; rpe: string }>;
  setLogged: React.Dispatch<React.SetStateAction<Record<string, { weight: string; reps: string; sets: string; rpe: string }>>>;
}) {
  const prev = we.previousLog;
  const current = logged[we.exerciseId] || { weight: '', reps: String(we.reps?.split('-').pop() || '10'), sets: String(we.sets), rpe: String(we.rpe || '') };

  return (
    <div className="bg-gray-800/50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-white font-medium">{index + 1}. {we.exercise?.name}</span>
        {prev?.weight > 0 && (
          <span className="text-[10px] text-gray-500">
            Lần trước <span className="text-gray-400 font-medium">{prev.weight}kg x {prev.reps}</span>
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-[10px] text-gray-500 block mb-0.5">Tạ (kg)</label>
          <input
            className="input-field text-xs py-1.5"
            type="number"
            step={1.25}
            min={0}
            placeholder={prev?.weight ? String(prev.weight) : '...'}
            value={current.weight}
            onChange={e => setLogged(l => ({ ...l, [we.exerciseId]: { ...current, weight: e.target.value } }))}
          />
          {prev?.weight > 0 && (
            <p className="text-[10px] mt-0.5">
              {current.weight && parseFloat(current.weight) > prev.weight
                ? <span className="text-emerald-400">+{(parseFloat(current.weight) - prev.weight).toFixed(1)}kg</span>
                : current.weight && parseFloat(current.weight) < prev.weight
                  ? <span className="text-red-400">{(parseFloat(current.weight) - prev.weight).toFixed(1)}kg</span>
                  : null}
            </p>
          )}
        </div>
        <div>
          <label className="text-[10px] text-gray-500 block mb-0.5">Reps</label>
          <input
            className="input-field text-xs py-1.5"
            type="number"
            step={1}
            min={0}
            placeholder={we.reps}
            value={current.reps}
            onChange={e => setLogged(l => ({ ...l, [we.exerciseId]: { ...current, reps: e.target.value } }))}
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-500 block mb-0.5">Sets</label>
          <input
            className="input-field text-xs py-1.5"
            type="number"
            step={1}
            min={0}
            placeholder={String(we.sets)}
            value={current.sets}
            onChange={e => setLogged(l => ({ ...l, [we.exerciseId]: { ...current, sets: e.target.value } }))}
          />
        </div>
      </div>
    </div>
  );
}
