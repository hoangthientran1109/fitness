'use client';
import { useEffect, useState } from 'react';
import StatusBadge from '@/components/StatusBadge';

export default function WeeklyReviewPage() {
  const [data, setData] = useState<any>(null);
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    fetch(`/api/weekly-review?date=${today}`).then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, []);

  const generateReview = async () => {
    if (!data) return;
    setGenerating(true);
    const { workoutsCompleted, workoutsPlanned, avgCalories, avgProtein, caloriesTarget, proteinTarget, weightChange, avgSleep, avgEnergy, avgStress, avgMood, avgSoreness, completionRate, calorieAdherence, proteinAdherence } = data;

    const rd: any = { summary: '', wentWell: [] as string[], wentWrong: [] as string[], adjustment: '', trainingRec: '', nutritionRec: '', recoveryRec: '', status: 'ON_TRACK' };

    rd.summary = `Tuần này bạn hoàn thành ${workoutsCompleted}/${workoutsPlanned} buổi tập (${completionRate}%). Thay đổi cân nặng: ${weightChange > 0 ? '+' : ''}${weightChange}kg. Ngủ trung bình: ${avgSleep}h. Năng lượng trung bình: ${avgEnergy}/10.`;

    if (completionRate >= 80) rd.wentWell.push(`Tuân thủ tập luyện xuất sắc ở mức ${completionRate}% - bạn rất kiên trì.`);
    else if (completionRate < 70) rd.wentWrong.push(`Hoàn thành tập luyện ở mức ${completionRate}%. Hãy sắp xếp lịch tập cố định mỗi ngày.`);

    if (calorieAdherence >= 85 && calorieAdherence <= 115) rd.wentWell.push(`Theo dõi calo tốt ở mức ${calorieAdherence}% mục tiêu.`);
    else if (calorieAdherence < 80) rd.wentWrong.push(`Calo chỉ đạt ${calorieAdherence}% mục tiêu. Chuẩn bị bữa ăn trước sẽ giúp ích.`);

    if (proteinAdherence >= 80) rd.wentWell.push(`Lượng đạm ở mức ${proteinAdherence}% mục tiêu - tốt cho phục hồi.`);
    else rd.wentWrong.push(`Đạm chỉ đạt ${proteinAdherence}%. Mỗi bữa nên có nguồn đạm nạc.`);

    if (avgSleep >= 7) rd.wentWell.push(`Ngủ trung bình ${avgSleep}h rất tốt cho phục hồi.`);
    else rd.wentWrong.push(`Ngủ chỉ ${avgSleep}h. Cố gắng ngủ 7h+. Không dùng màn hình 1h trước ngủ.`);

    if (avgStress <= 4) rd.wentWell.push('Mức căng thẳng được kiểm soát tốt.');
    else if (avgStress > 6) rd.wentWrong.push('Căng thẳng cao ảnh hưởng đến phục hồi. Thêm thiền hoặc đi bộ nhẹ.');

    if (avgMood >= 7) rd.wentWell.push(`Tâm trạng ${avgMood}/10 - trạng thái tinh thần tốt.`);
    if (avgEnergy >= 7) rd.wentWell.push(`Năng lượng ${avgEnergy}/10 - sẵn sàng tập nặng.`);
    else if (avgEnergy <= 4) rd.wentWrong.push(`Năng lượng thấp ${avgEnergy}/10. Kiểm tra giấc ngủ và calo.`);

    if (avgSoreness > 7) rd.wentWrong.push(`Đau cơ cao ${avgSoreness}/10. Giảm nhẹ volume tập.`);

    rd.trainingRec = completionRate >= 85 ? 'Giữ nguyên lịch tập. Cân nhắc tăng tạ dần trên các bài chính.' : 'Tập trung vào sự đều đặn. 3 buổi chất lượng hơn 5 buổi bỏ dở.';
    rd.nutritionRec = proteinAdherence >= 80 ? 'Theo dõi macro đang tốt. Tiếp tục nhé.' : 'Ưu tiên đạm. Mỗi bữa nên có nguồn đạm nạc.';
    rd.recoveryRec = avgSleep < 7 ? 'Ưu tiên giấc ngủ. Không màn hình trước ngủ, giờ ngủ/thức đều đặn.' : 'Phục hồi đang tốt.';

    if (completionRate < 60 || proteinAdherence < 60) rd.status = 'OFF_TRACK';
    else if (completionRate < 80 || proteinAdherence < 75 || avgSleep < 6 || avgStress > 7) rd.status = 'NEED_ADJUSTMENT';

    setReview(rd);

    await fetch('/api/ai-insights', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'weekly_review', title: `Tổng Kết Tuần - ${rd.status === 'ON_TRACK' ? 'Đúng Tiến Độ' : 'Cần Chú Ý'}`, content: rd.summary, recommendation: `${rd.trainingRec} ${rd.nutritionRec} ${rd.recoveryRec}` }) });
    setGenerating(false);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <div className="p-8 text-center text-gray-400">Không có dữ liệu.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Tổng Kết Tuần</h1><p className="text-gray-400 text-sm mt-1">{new Date(data.startDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })} - {new Date(data.endDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })}</p></div>
        <button onClick={generateReview} disabled={generating || !!review} className="btn-primary text-sm">{generating ? 'Đang tạo...' : review ? 'Đã Tạo' : 'Tạo Tổng Kết'}</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card text-center"><p className="text-xs text-gray-500">Buổi Tập</p><p className="text-2xl font-bold text-white mt-1">{data.workoutsCompleted}/{data.workoutsPlanned}</p></div>
        <div className="stat-card text-center"><p className="text-xs text-gray-500">Calo</p><p className="text-2xl font-bold text-white mt-1">{data.calorieAdherence}%</p></div>
        <div className="stat-card text-center"><p className="text-xs text-gray-500">Đạm</p><p className="text-2xl font-bold text-white mt-1">{data.proteinAdherence}%</p></div>
        <div className="stat-card text-center"><p className="text-xs text-gray-500">Cân Nặng</p><p className={`text-2xl font-bold mt-1 ${data.weightChange < 0 ? 'text-emerald-400' : data.weightChange > 0 ? 'text-amber-400' : 'text-white'}`}>{data.weightChange > 0 ? '+' : ''}{data.weightChange}kg</p></div>
      </div>

      {review && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
          <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-white">Kết Quả Tổng Kết</h2><StatusBadge status={review.status} /></div>

          <div><h3 className="text-sm font-semibold text-gray-400 mb-2">Tổng Quan</h3><p className="text-sm text-gray-300 leading-relaxed">{review.summary}</p></div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-4"><h3 className="text-sm font-semibold text-emerald-400 mb-2">Điểm Tốt</h3><ul className="space-y-1">{review.wentWell.map((item: string, i: number) => (<li key={i} className="text-sm text-gray-300 flex gap-2"><span className="text-emerald-400">+</span>{item}</li>))}</ul></div>
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-4"><h3 className="text-sm font-semibold text-amber-400 mb-2">Cần Cải Thiện</h3><ul className="space-y-1">{review.wentWrong.map((item: string, i: number) => (<li key={i} className="text-sm text-gray-300 flex gap-2"><span className="text-amber-400">-</span>{item}</li>))}</ul></div>
          </div>

          <div className="space-y-2">
            <p className="text-sm"><span className="text-gray-400">Tập luyện:</span> <span className="text-gray-300">{review.trainingRec}</span></p>
            <p className="text-sm"><span className="text-gray-400">Dinh dưỡng:</span> <span className="text-gray-300">{review.nutritionRec}</span></p>
            <p className="text-sm"><span className="text-gray-400">Phục hồi:</span> <span className="text-gray-300">{review.recoveryRec}</span></p>
          </div>
        </div>
      )}
    </div>
  );
}
