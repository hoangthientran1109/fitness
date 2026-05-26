import { prisma } from './prisma';

const API_KEY = process.env.OLLAMA_API_KEY || '';
const ENDPOINT = process.env.OLLAMA_ENDPOINT || 'https://ollama.com/v1';
const MODEL = process.env.OLLAMA_MODEL || 'deepseek-v4-pro';

const SYSTEM_PROMPT = `Bạn là Huấn Luyện Viên cá nhân (Personal Trainer) 10+ năm kinh nghiệm, đồng thời là Chuyên Gia Dinh Dưỡng. Bạn nói tiếng Việt, giọng chuyên nghiệp nhưng gần gũi, dễ hiểu.

**NGUYÊN TẮC QUAN TRỌNG NHẤT: KHÔNG DÙNG THUẬT NGỮ CHUYÊN NGÀNH.**
- Không dùng: RPE, deload, progressive overload, volume, intensity, PR, periodization, macro, compound, isolation, bulking, cutting, CNS, cortisol, adherence.
- Thay bằng tiếng Việt đời thường: "mức nặng cảm nhận", "tuần tập nhẹ", "tăng dần sức nặng", "tổng số bài", "mức cố gắng", "mức tạ cao nhất", "các chất dinh dưỡng", "bài nhiều nhóm cơ", "phục hồi", "căng thẳng".

**MỨC ĐỘ GẮNG SỨC (thay cho RPE):**
- 9-10: Gắng hết sức, không thể thêm rep nào nữa
- 7-8: Nặng nhưng vẫn kiểm soát được, còn 1-2 rep trong tank
- 5-6: Vừa phải, thoải mái, tập trung form đúng
- 3-4: Nhẹ nhàng, hồi phục, vận động không áp lực

KHUNG PHÂN TÍCH BẮT BUỘC:
1. TỔNG QUAN: 1-2 câu đánh giá tình trạng hôm nay
2. CHUYÊN SÂU:
   - GIẤC NGỦ: <7 tiếng = CẢNH BÁO. <6 tiếng = tập nhẹ hơn 1/5. Giải thích nguyên nhân & cách khắc phục.
   - CĂNG THẲNG: >7 = CẢNH BÁO. Ưu tiên nghỉ ngơi, không nên tập nặng. Gợi ý cụ thể.
   - ĐAU CƠ: >7 hai ngày liên tiếp = cơ thể đang quá tải. Cân nhắc tập nhẹ hoặc nghỉ.
   - NĂNG LƯỢNG: <4 = tập nhẹ; >8 + ít đau cơ = xanh lá, có thể đẩy mức tạ lên.
   - DINH DƯỠNG: đạm <1.6g/kg = ưu tiên SỐ 1. Ăn lệch >20% calo 3 ngày liên tiếp = điều chỉnh ngay.
3. CHẤN THƯƠNG: Nếu có ghi chú đau/chấn thương, ĐỀ XUẤT CỤ THỂ:
   - Bài tập thay thế (ví dụ: "đau gối khi squat" → đổi sang đạp máy hoặc tập chân từng bên + hướng dẫn tư thế đúng)
   - Có nên tập hôm nay hay nghỉ/tập nhẹ
4. HƯỚNG DẪN BUỔI TẬP (thay cho RPE guidance):
   - Cực khỏe (năng lượng 8+, ít đau, stress thấp): Tập nặng hết sức, có thể thử mức tạ mới
   - Khỏe (năng lượng 6-7): Tập mức bình thường
   - Trung bình (năng lượng 4-5): Giữ form đúng, không tăng tạ
   - Mệt/Thiếu ngủ/Căng thẳng cao: Tập nhẹ 1/5, hoặc đổi sang đi bộ/giãn cơ
5. KHUYẾN NGHỊ: Cụ thể, đo lường được, ưu tiên theo thứ tự.

LUÔN trả về JSON hợp lệ, không text ngoài JSON:
{"type":"daily_suggestion","title":"tiêu đề ngắn, truyền cảm hứng","content":"phân tích chuyên sâu 3-5 câu, dùng tiếng Việt đời thường","recommendation":"khuyến nghị theo thứ tự ưu tiên, KHÔNG dùng thuật ngữ","status":"ON_TRACK|NEED_ADJUSTMENT|OFF_TRACK|RECOVERY_NEEDED"}`;

// ============== TYPES ==============

export interface AICoachOutput {
  type: 'daily_suggestion' | 'weekly_review' | 'warning' | 'adjustment' | 'encouragement';
  title: string;
  content: string;
  recommendation: string;
  status: 'ON_TRACK' | 'NEED_ADJUSTMENT' | 'OFF_TRACK' | 'RECOVERY_NEEDED';
}

interface UserContext {
  userName: string;
  age: number;
  gender: string;
  weight: number;
  height: number;
  bodyFat?: number;
  goal: string;
  targetWeight?: number;
  targetBodyFat?: number;
  experienceLevel: string;
  activityLevel: string;
  rules: string[];
  nutritionTargets: { calories: number; protein: number; carbs: number; fat: number; water: number };
  todayWorkout?: { focus: string; exercises: string[] };
  checkIn?: { sleep: number; energy: number; stress: number; mood: number; soreness: number; motivation: number; painNote?: string; dailyNote?: string };
  yesterdayNutrition?: { calories: number; protein: number; carbs: number; fat: number; water: number; calTarget: number; proTarget: number };
  yesterdayWorkout?: { completed: boolean; exercises: string[] };
  weekTrends?: { avgSleep: number; avgEnergy: number; avgStress: number; avgMood: number; avgSoreness: number };
  weekStats?: { workoutsCompleted: number; workoutsPlanned: number; calorieAdherence: number; proteinAdherence: number; weightChange: number };
}

// ============== OLLAMA API CALL ==============

async function callOllama(systemPrompt: string, userPrompt: string): Promise<string | null> {
  if (!API_KEY) {
    console.warn('[AI Coach] No API key configured, using rule-based fallback');
    return null;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);

    const res = await fetch(`${ENDPOINT}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
      body: JSON.stringify({ model: MODEL, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }], temperature: 0.7, max_tokens: 8000 }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[AI Coach] API error ${res.status}: ${await res.text().catch(() => '')}`);
      return null;
    }

    const data = await res.json();
    const msg = data.choices?.[0]?.message;
    if (!msg) { console.warn('[AI Coach] No message in response'); return null; }

    console.log('[AI Coach] Response keys:', Object.keys(msg).join(', '));
    console.log('[AI Coach] content:', (msg.content || '').substring(0, 200));
    console.log('[AI Coach] reasoning:', (msg.reasoning || '').substring(0, 200));
    console.log('[AI Coach] reasoning_content:', (msg.reasoning_content || '').substring(0, 200));

    let content = msg.content || '';
    if (!content && msg.reasoning) content = msg.reasoning;
    if (!content && msg.reasoning_content) content = msg.reasoning_content;

    if (content) {
      console.log(`[AI Coach] Got content (${content.length} chars)`);
      return content;
    }
    console.warn('[AI Coach] All message fields empty, JSON:', JSON.stringify(msg).substring(0, 300));
    return null;
  } catch (err: any) {
    console.warn(`[AI Coach] API call failed: ${err.message}`);
    return null;
  }
}

function parseJsonResponse(text: string): AICoachOutput | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    if (parsed.title && parsed.content && parsed.recommendation) {
      return {
        type: parsed.type || 'daily_suggestion',
        title: parsed.title,
        content: parsed.content,
        recommendation: parsed.recommendation,
        status: parsed.status || 'ON_TRACK',
      };
    }
    return null;
  } catch {
    return null;
  }
}

// ============== CONTEXT BUILDERS ==============

async function buildUserContext(): Promise<UserContext | null> {
  const user = await prisma.userProfile.findFirst({ include: { goals: true, rules: true } });
  if (!user) return null;

  const nutritionPlan = await prisma.nutritionPlan.findFirst({ where: { userId: user.id }, orderBy: { startDate: 'desc' } });
  const goal = user.goals[0];

  return {
    userName: user.name || 'Học viên',
    age: user.age, gender: user.gender,
    weight: user.weight, height: user.height,
    bodyFat: user.bodyFat || undefined,
    goal: goal ? `${goal.goalType.replace(/_/g, ' ')}` : 'general_health',
    targetWeight: goal?.targetWeight || undefined,
    targetBodyFat: goal?.targetBodyFat || undefined,
    experienceLevel: user.experienceLevel,
    activityLevel: user.activityLevel,
    rules: user.rules.filter(r => r.isActive).map(r => r.description),
    nutritionTargets: {
      calories: nutritionPlan?.caloriesTarget || 2500,
      protein: nutritionPlan?.proteinTarget || 150,
      carbs: nutritionPlan?.carbTarget || 300,
      fat: nutritionPlan?.fatTarget || 70,
      water: nutritionPlan?.waterTarget || 2500,
    },
  };
}

async function getTodayData(userId: string): Promise<{
  todayWorkout?: UserContext['todayWorkout'];
  checkIn?: UserContext['checkIn'];
  yesterdayNutrition?: UserContext['yesterdayNutrition'];
  yesterdayWorkout?: UserContext['yesterdayWorkout'];
}> {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);

  const [todayWorkout, todayCheckIn, yesterdayNutrition, yesterdayLog] = await Promise.all([
    prisma.workoutDay.findFirst({
      where: { plan: { userId, status: 'active' }, date: { gte: today, lt: tomorrow } },
      include: { exercises: { include: { exercise: true }, orderBy: { order: 'asc' } } },
    }),
    prisma.dailyCheckIn.findFirst({ where: { userId, date: { gte: today, lt: tomorrow } } }),
    prisma.nutritionLog.findFirst({ where: { userId, date: { gte: yesterday, lt: today } } }),
    prisma.workoutLog.findFirst({ where: { userId, date: { gte: yesterday, lt: today } }, include: { exercises: { include: { exercise: true } } } }),
  ]);

  const nutritionPlan = await prisma.nutritionPlan.findFirst({ where: { userId }, orderBy: { startDate: 'desc' } });

  return {
    todayWorkout: todayWorkout ? {
      focus: todayWorkout.focus || 'Không có',
      exercises: todayWorkout.exercises.map(e => `${e.exercise?.name || 'Bài tập'} (${e.sets}x${e.reps}, RPE ${e.rpe || '?'})`),
    } : undefined,
    checkIn: todayCheckIn ? {
      sleep: todayCheckIn.sleepHours || 0, energy: todayCheckIn.energy || 0,
      stress: todayCheckIn.stress || 0, mood: todayCheckIn.mood || 0,
      soreness: todayCheckIn.soreness || 0, motivation: todayCheckIn.motivation || 0,
      painNote: todayCheckIn.painNote || undefined, dailyNote: todayCheckIn.dailyNote || undefined,
    } : undefined,
    yesterdayNutrition: yesterdayNutrition ? {
      calories: yesterdayNutrition.calories, protein: yesterdayNutrition.protein,
      carbs: yesterdayNutrition.carbs, fat: yesterdayNutrition.fat, water: yesterdayNutrition.water,
      calTarget: nutritionPlan?.caloriesTarget || 2500, proTarget: nutritionPlan?.proteinTarget || 150,
    } : undefined,
    yesterdayWorkout: yesterdayLog ? {
      completed: yesterdayLog.completed,
      exercises: yesterdayLog.exercises.map(e => `${e.exercise?.name || 'Bài tập'}: ${e.weight}kg x ${e.setsCompleted} x ${e.reps}`),
    } : undefined,
  };
}

async function getWeekData(userId: string): Promise<{ weekTrends: UserContext['weekTrends']; weekStats: UserContext['weekStats'] }> {
  const today = new Date(); today.setHours(23, 59, 59, 999);
  const startDate = new Date(today); startDate.setDate(startDate.getDate() - 6); startDate.setHours(0, 0, 0, 0);

  const [checkIns, nutritionLogs, workoutDays, bodyMetrics, nutritionPlan] = await Promise.all([
    prisma.dailyCheckIn.findMany({ where: { userId, date: { gte: startDate, lte: today } } }),
    prisma.nutritionLog.findMany({ where: { userId, date: { gte: startDate, lte: today } } }),
    prisma.workoutDay.findMany({ where: { plan: { userId, status: 'active' }, date: { gte: startDate, lte: today } } }),
    prisma.bodyMetric.findMany({ where: { userId, date: { gte: startDate, lte: today } }, orderBy: { date: 'asc' } }),
    prisma.nutritionPlan.findFirst({ where: { userId }, orderBy: { startDate: 'desc' } }),
  ]);

  const n = (arr: any[], fn: string) => arr.length > 0 ? Math.round((arr.reduce((s: number, x: any) => s + (x[fn] || 0), 0) / arr.length) * 10) / 10 : 0;

  const completed = workoutDays.filter(d => d.completed).length;
  const avgCals = nutritionLogs.length > 0 ? Math.round(nutritionLogs.reduce((s, l) => s + l.calories, 0) / nutritionLogs.length) : 0;
  const avgProtein = nutritionLogs.length > 0 ? Math.round(nutritionLogs.reduce((s, l) => s + l.protein, 0) / nutritionLogs.length) : 0;
  const weightChange = bodyMetrics.length >= 2 ? Math.round(((bodyMetrics[bodyMetrics.length - 1].weight || 0) - (bodyMetrics[0].weight || 0)) * 10) / 10 : 0;

  return {
    weekTrends: { avgSleep: n(checkIns, 'sleepHours'), avgEnergy: n(checkIns, 'energy'), avgStress: n(checkIns, 'stress'), avgMood: n(checkIns, 'mood'), avgSoreness: n(checkIns, 'soreness') },
    weekStats: {
      workoutsCompleted: completed, workoutsPlanned: workoutDays.length,
      calorieAdherence: nutritionPlan ? Math.round((avgCals / nutritionPlan.caloriesTarget) * 100) : 0,
      proteinAdherence: nutritionPlan ? Math.round((avgProtein / nutritionPlan.proteinTarget) * 100) : 0,
      weightChange,
    },
  };
}

// ============== MAIN GENERATORS ==============

export async function estimateMacrosFromDescription(description: string): Promise<{ calories: number; protein: number; carbs: number; fat: number; water: number; items: { name: string; calories: number; protein: number; carbs: number; fat: number }[] }> {
  const prompt = `Bạn là Certified Sports Nutritionist (CISSN) chuyên dinh dưỡng thể thao. Ước lượng macro từ mô tả bữa ăn sau (tiếng Việt).

Mô tả: "${description}"

DATABASE DINH DƯỠNG VIỆT NAM (dùng để estimate):
- 1 trứng gà (50g) ≈ 70 calo, 6g đạm, 5g béo, 0g carb
- 100g ức gà luộc ≈ 165 calo, 31g đạm, 3.6g béo, 0g carb
- 100g thịt heo nạc ≈ 140 calo, 21g đạm, 7g béo
- 100g cá hồi ≈ 208 calo, 20g đạm, 13g béo
- 1 bát cơm trắng (200g) ≈ 260 calo, 58g carb, 6g đạm, 0g béo
- 1 lát bánh mì trắng ≈ 80 calo, 15g carb, 3g đạm
- 1 muỗng dầu olive (15ml) ≈ 120 calo, 14g béo
- 1 ly sữa (250ml) ≈ 150 calo, 8g đạm, 12g carb, 8g béo
- 1 muỗng whey protein (30g) ≈ 120 calo, 25g đạm, 3g carb, 2g béo
- 250g sữa chua Hy Lạp ≈ 150 calo, 25g đạm, 10g carb, 0g béo
- 1 quả chuối (120g) ≈ 105 calo, 1.3g đạm, 27g carb
- 100g bông cải xanh ≈ 35 calo, 3g đạm, 7g carb
- 100g khoai lang ≈ 86 calo, 20g carb, 1.6g đạm
- 100g yến mạch ≈ 389 calo, 66g carb, 17g đạm, 7g béo
- 30g hạnh nhân ≈ 170 calo, 6g đạm, 6g carb, 15g béo
- 1 phần cơm gà xối mỡ ≈ 700 calo, 35g đạm, 90g carb, 25g béo
- 1 tô phở bò ≈ 500 calo, 25g đạm, 70g carb, 15g béo
- 1 phần bún thịt nướng ≈ 550 calo, 20g đạm, 80g carb, 18g béo
- Nước: chỉ tính nước có trong mô tả (nước canh, nước phở, trà, cafe, sinh tố...). KHÔNG thêm nước lọc mặc định. Nếu mô tả không có món chứa nước thì water = 0.

Trả về JSON (KHÔNG text ngoài JSON): {"calories":tổng_calo,"protein":g,"carbs":g,"fat":g,"water":ml,"items":[{"name":"tên món","calories":calo_món,"protein":g,"carbs":g,"fat":g}]}`;

  const res = await callOllama('Bạn là chuyên gia dinh dưỡng fitness. Trả về JSON ước lượng macro từ mô tả bữa ăn tiếng Việt. KHÔNG thêm text ngoài JSON.', prompt);
  if (!res) return { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0, items: [] };

  const match = res.match(/\{[\s\S]*\}/);
  if (!match) return { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0, items: [] };
  try {
    const parsed = JSON.parse(match[0]);
    return {
      calories: parsed.calories || 0,
      protein: parsed.protein || 0,
      carbs: parsed.carbs || 0,
      fat: parsed.fat || 0,
      water: parsed.water || 0,
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
  } catch {
    return { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0, items: [] };
  }
}

export async function generateDailyInsight(): Promise<AICoachOutput> {
  const ctx = await buildUserContext();
  if (!ctx) return emptyOutput();

  const todayData = await getTodayData(await getUserId());
  const fullCtx = { ...ctx, ...todayData };

  const userPrompt = buildDailyPrompt(fullCtx);
  const aiText = await callOllama(SYSTEM_PROMPT, userPrompt);
  const aiResult = aiText ? parseJsonResponse(aiText) : null;

  if (aiResult) {
    console.log('[AI Coach] Generated daily insight via API');
    return aiResult;
  }

  console.log('[AI Coach] Using rule-based fallback for daily insight');
  return ruleBasedDaily(fullCtx);
}

export async function generateWeeklyInsight(): Promise<AICoachOutput> {
  const ctx = await buildUserContext();
  if (!ctx) return emptyOutput();

  const weekData = await getWeekData(await getUserId());
  const fullCtx = { ...ctx, ...weekData };

  const userPrompt = buildWeeklyPrompt(fullCtx);
  const aiText = await callOllama(SYSTEM_PROMPT, userPrompt);
  const aiResult = aiText ? parseJsonResponse(aiText) : null;

  if (aiResult) {
    console.log('[AI Coach] Generated weekly review via API');
    return { ...aiResult, type: 'weekly_review' };
  }

  console.log('[AI Coach] Using rule-based fallback for weekly review');
  return ruleBasedWeekly(fullCtx);
}

// ============== PROMPT CONSTRUCTION ==============

function buildDailyPrompt(ctx: UserContext): string {
  const bmi = ctx.height > 0 ? Math.round((ctx.weight / ((ctx.height / 100) ** 2)) * 10) / 10 : 0;
  const proteinPerKg = ctx.weight > 0 ? Math.round((ctx.nutritionTargets.protein / ctx.weight) * 10) / 10 : 0;

  const parts = [
    `=== HỌC VIÊN ===`,
    `${ctx.userName}, ${ctx.age}t, ${ctx.gender === 'male' ? 'nam' : 'nữ'}, ${ctx.weight}kg/${ctx.height}cm, BMI ${bmi}${ctx.bodyFat ? `, BF ${ctx.bodyFat}%` : ''}`,
    `Mục tiêu: ${ctx.goal}${ctx.targetWeight ? ` (target ${ctx.targetWeight}kg)` : ''}${ctx.targetBodyFat ? ` (body fat ${ctx.targetBodyFat}%)` : ''}`,
    `Trình độ: ${ctx.experienceLevel} | Hoạt động: ${ctx.activityLevel}`,
    `Đạm mục tiêu: ${ctx.nutritionTargets.protein}g (${proteinPerKg}g/kg) | Calo: ${ctx.nutritionTargets.calories} | Carbs: ${ctx.nutritionTargets.carbs}g | Fat: ${ctx.nutritionTargets.fat}g | Nước: ${ctx.nutritionTargets.water}ml`,
    ctx.rules.length > 0 ? `Quy tắc cá nhân: ${ctx.rules.join('; ')}` : '',
  ];

  if (ctx.checkIn) {
    parts.push('');
    parts.push(`=== ĐIỂM DANH HÔM NAY ===`);
    parts.push(`Ngủ: ${ctx.checkIn.sleep}h | Năng lượng: ${ctx.checkIn.energy}/10 | Stress: ${ctx.checkIn.stress}/10 | Tâm trạng: ${ctx.checkIn.mood}/10 | Đau cơ: ${ctx.checkIn.soreness}/10 | Động lực: ${ctx.checkIn.motivation}/10`);
    if (ctx.checkIn.painNote) parts.push(`CHẤN THƯƠNG/ĐAU: "${ctx.checkIn.painNote}" ← PHẢI xử lý mục này! Đề xuất bài thay thế cụ thể nếu cần.`);
    if (ctx.checkIn.dailyNote) parts.push(`Ghi chú: ${ctx.checkIn.dailyNote}`);
  } else {
    parts.push('');
    parts.push('CHƯA điểm danh hôm nay ← nhắc nhở điểm danh ngay.');
  }

  if (ctx.yesterdayNutrition) {
    const ca = Math.round((ctx.yesterdayNutrition.calories / ctx.yesterdayNutrition.calTarget) * 100);
    const pa = Math.round((ctx.yesterdayNutrition.protein / ctx.yesterdayNutrition.proTarget) * 100);
    parts.push('');
    parts.push(`=== DINH DƯỠNG HÔM QUA ===`);
    parts.push(`Calo: ${ctx.yesterdayNutrition.calories}/${ctx.yesterdayNutrition.calTarget} (${ca}%) | Đạm: ${ctx.yesterdayNutrition.protein}/${ctx.yesterdayNutrition.proTarget}g (${pa}%) | Carbs: ${ctx.yesterdayNutrition.carbs}g | Fat: ${ctx.yesterdayNutrition.fat}g | Nước: ${ctx.yesterdayNutrition.water}ml`);
    if (ca < 80) parts.push('← CALO THẤP, cần can thiệp.');
    if (pa < 80) parts.push('← ĐẠM THẤP, ưu tiên số 1.');
    if (ca > 120) parts.push('← CALO VƯỢT, kiểm tra snack.');
  }

  if (ctx.yesterdayWorkout) {
    parts.push('');
    parts.push(`=== TẬP HÔM QUA ===`);
    parts.push(ctx.yesterdayWorkout.completed
      ? `ĐÃ TẬP: ${ctx.yesterdayWorkout.exercises.join(' | ')}`
      : 'KHÔNG TẬP hôm qua.');
  }

  if (ctx.todayWorkout) {
    parts.push('');
    parts.push(`=== LỊCH TẬP HÔM NAY ===`);
    parts.push(`Focus: ${ctx.todayWorkout.focus} | ${ctx.todayWorkout.exercises.length} bài: ${ctx.todayWorkout.exercises.join(', ')}`);
  } else {
    parts.push('');
    parts.push('Hôm nay NGHỈ TẬP → gợi ý active recovery hoặc mobility.');
  }

  return parts.filter(Boolean).join('\n');
}

function buildWeeklyPrompt(ctx: UserContext): string {
  const bmi = ctx.height > 0 ? Math.round((ctx.weight / ((ctx.height / 100) ** 2)) * 10) / 10 : 0;
  const proteinPerKg = ctx.weight > 0 ? Math.round((ctx.nutritionTargets.protein / ctx.weight) * 10) / 10 : 0;

  const parts = [
    `=== HỌC VIÊN ===`,
    `${ctx.userName}, ${ctx.age}t, ${ctx.gender === 'male' ? 'nam' : 'nữ'}, ${ctx.weight}kg/${ctx.height}cm, BMI ${bmi}`,
    `Mục tiêu: ${ctx.goal}${ctx.targetWeight ? ` → ${ctx.targetWeight}kg` : ''}${ctx.targetBodyFat ? ` → ${ctx.targetBodyFat}% BF` : ''}`,
    `Trình độ: ${ctx.experienceLevel} | Đạm: ${ctx.nutritionTargets.protein}g (${proteinPerKg}g/kg) | Calo: ${ctx.nutritionTargets.calories}`,
  ];

  if (ctx.weekTrends) {
    parts.push('');
    parts.push(`=== XU HƯỚNG 7 NGÀY ===`);
    parts.push(`Ngủ TB: ${ctx.weekTrends.avgSleep}h | Năng lượng TB: ${ctx.weekTrends.avgEnergy}/10 | Stress TB: ${ctx.weekTrends.avgStress}/10 | Tâm trạng TB: ${ctx.weekTrends.avgMood}/10 | Đau cơ TB: ${ctx.weekTrends.avgSoreness}/10`);
    if (ctx.weekTrends.avgSleep < 6.5) parts.push('← THIẾU NGỦ nghiêm trọng, ưu tiên can thiệp');
    if (ctx.weekTrends.avgStress > 6) parts.push('← CĂNG THẲNG MÃN TÍNH, ảnh hưởng phục hồi và hormone stress');
    if (ctx.weekTrends.avgSoreness > 6.5) parts.push('← CẢNH BÁO QUÁ TẢI: đau cơ kéo dài, cân nhắc tuần tập nhẹ');
  }

  if (ctx.weekStats) {
    parts.push('');
    parts.push(`=== THỐNG KÊ TUẦN ===`);
    parts.push(`Tập: ${ctx.weekStats.workoutsCompleted}/${ctx.weekStats.workoutsPlanned} buổi (${ctx.weekStats.workoutsPlanned > 0 ? Math.round((ctx.weekStats.workoutsCompleted / ctx.weekStats.workoutsPlanned) * 100) : 0}%)`);
    parts.push(`Calo adherence: ${ctx.weekStats.calorieAdherence}% | Đạm adherence: ${ctx.weekStats.proteinAdherence}%`);
    parts.push(`Cân nặng thay đổi: ${ctx.weekStats.weightChange > 0 ? '+' : ''}${ctx.weekStats.weightChange}kg`);
    if (ctx.weekStats.workoutsPlanned > 0) {
      const cr = Math.round((ctx.weekStats.workoutsCompleted / ctx.weekStats.workoutsPlanned) * 100);
      if (cr < 60) parts.push('← TUÂN THỦ RẤT THẤP: <60% hoàn thành. Phân tích nguyên nhân & đề xuất lịch tập khả thi hơn.');
      else if (cr < 80) parts.push('← Cần cải thiện đều đặn. Gợi ý giải pháp sắp xếp lịch tập.');
    }
    if (ctx.weekStats.calorieAdherence < 80 || ctx.weekStats.calorieAdherence > 120) parts.push('← CALO LỆCH >20%. Phân tích nguyên nhân & đề xuất chuẩn bị bữa ăn trước.');
  }

  parts.push('');
  parts.push(`=== YÊU CẦU PHÂN TÍCH ===`);
  parts.push('1. Đánh giá tiến độ so với mục tiêu (giảm mỡ / tăng cơ / tái cấu trúc cơ thể)');
  parts.push('2. Phân tích xu hướng tuân thủ: đang cải thiện hay xấu đi?');
  parts.push('3. Nếu stress TB >6 hoặc ngủ <6.5h → ưu tiên phục hồi');
  parts.push('4. Nếu đau cơ TB >6.5 → đánh giá giảm tải / quản lý khối lượng tập');
  parts.push('5. Điều chỉnh dinh dưỡng nếu cân nặng thay đổi lệch với mục tiêu');
  parts.push('6. Khuyến nghị cụ thể tuần tới: tập, dinh dưỡng, phục hồi');

  parts.push('Trả về JSON: {"type":"weekly_review","title":"Tổng Kết Tuần","content":"phân tích chuyên sâu","recommendation":"khuyến nghị tuần tới","status":"ON_TRACK|NEED_ADJUSTMENT|OFF_TRACK|RECOVERY_NEEDED"}');

  return parts.filter(Boolean).join('\n');
}

// ============== RULE-BASED FALLBACK ==============

function ruleBasedDaily(ctx: UserContext): AICoachOutput {
  const issues: string[] = [];
  const recs: string[] = [];
  let status: AICoachOutput['status'] = 'ON_TRACK';

  if (ctx.checkIn) {
    if (ctx.checkIn.sleep < 6) { issues.push('bạn ngủ dưới 6 tiếng đêm qua, cơ thể chưa phục hồi đủ'); recs.push('Tập nhẹ hơn bình thường khoảng 1/5. Tập trung vào kỹ thuật và giãn cơ. Tối nay cố gắng ngủ sớm.'); status = 'NEED_ADJUSTMENT'; }
    if (ctx.checkIn.stress > 7) { issues.push('căng thẳng đang ở mức cao, ảnh hưởng đến khả năng hồi phục'); recs.push('Hôm nay ưu tiên nghỉ ngơi. Đi bộ nhẹ 15 phút hoặc tập thở. Đừng ép bản thân tập nặng.'); status = 'RECOVERY_NEEDED'; }
    if (ctx.checkIn.soreness > 7) { issues.push('bạn đang đau cơ nhiều, dấu hiệu cơ thể quá tải'); recs.push('Giảm bớt số hiệp. Nếu đau quá thì tập nhẹ hoặc nghỉ 1 ngày.'); }
    if (ctx.checkIn.energy <= 3) { issues.push('năng lượng hôm nay rất thấp'); recs.push('Buổi tập ngắn thôi (30-40 phút). Chỉ tập vài bài chính, bỏ bớt bài phụ.'); status = 'NEED_ADJUSTMENT'; }
    if (ctx.checkIn.energy >= 8 && ctx.checkIn.soreness <= 4 && ctx.checkIn.stress <= 4) {
      issues.push('hôm nay bạn đang rất sung sức');
      recs.push('Đây là ngày tốt để đẩy sức. Tập nặng hết khả năng ở bài chính. Có thể thử thêm 1 hiệp hoặc tăng tạ lên chút.');
    }
  } else {
    issues.push('bạn chưa điểm danh hôm nay');
    recs.push('Điểm danh ngay để nhận hướng dẫn cá nhân hóa.');
  }

  if (ctx.yesterdayNutrition) {
    const ca = Math.round((ctx.yesterdayNutrition.calories / ctx.yesterdayNutrition.calTarget) * 100);
    const pa = Math.round((ctx.yesterdayNutrition.protein / ctx.yesterdayNutrition.proTarget) * 100);
    if (ca < 80) { issues.push(`hôm qua bạn ăn ít, chỉ đạt ${ca}% calo so với mục tiêu`); recs.push(`Hôm nay cố gắng ăn đủ ${ctx.yesterdayNutrition.calTarget} calo. Thêm 1 bữa phụ nếu thấy đói.`); }
    if (pa < 80) { issues.push(`hôm qua đạm chưa đủ, chỉ đạt ${pa}%`); recs.push(`Đạm rất quan trọng để cơ phục hồi. Mỗi bữa nên có thịt/cá/trứng. Mục tiêu hôm nay: ${ctx.yesterdayNutrition.proTarget}g.`); }
  }

  if (!ctx.yesterdayWorkout?.completed && ctx.todayWorkout) {
    recs.push('Hôm qua nghỉ tập. Hôm nay quay lại với tinh thần mới!');
  }

  if (ctx.todayWorkout && ctx.todayWorkout.exercises.length > 0) {
    const focusVn = ctx.todayWorkout.focus.replace('Push', 'Đẩy').replace('Pull', 'Kéo').replace('Legs', 'Chân').replace('Focus', '').replace(/-/g, '');
    recs.push(`Hôm nay tập ${focusVn}. Nhớ khởi động kỹ, tập đúng tư thế, đừng vội tăng tạ nếu chưa vững form.`);
  }

  if (ctx.checkIn?.painNote) {
    recs.push(`Bạn có ghi chú đau: "${ctx.checkIn.painNote}". Nếu thấy khó chịu khi tập thì dừng lại, không cố. Ưu tiên an toàn.`);
  }

  const issuesText = issues.length > 0 ? issues.join(', và ') : 'các chỉ số hôm nay đang rất cân bằng';
  const recText = recs.length > 0 ? recs.join(' ') : 'Duy trì thói quen hiện tại. Bạn đang đi đúng hướng!';

  return {
    type: 'daily_suggestion',
    title: ctx.checkIn ? 'Phân Tích HLV Hôm Nay' : 'Chưa Có Điểm Danh',
    content: `Dựa trên dữ liệu của bạn, ${issuesText}.${ctx.checkIn ? ` Ngủ ${ctx.checkIn.sleep}h, năng lượng ${ctx.checkIn.energy}/10, đau cơ ${ctx.checkIn.soreness}/10, căng thẳng ${ctx.checkIn.stress}/10.` : ''}`,
    recommendation: recText,
    status,
  };
}

function ruleBasedWeekly(ctx: UserContext): AICoachOutput {
  const stats = ctx.weekStats;
  const trends = ctx.weekTrends;
  if (!stats || !trends) return { type: 'weekly_review', title: 'Chưa Đủ Dữ Liệu', content: 'Cần ít nhất 7 ngày dữ liệu để phân tích.', recommendation: 'Duy trì điểm danh hàng ngày.', status: 'ON_TRACK' };

  const cr = stats.workoutsPlanned > 0 ? Math.round((stats.workoutsCompleted / stats.workoutsPlanned) * 100) : 0;
  const wentWell: string[] = [];
  const wentWrong: string[] = [];

  if (cr >= 90) wentWell.push(`Hoàn thành ${stats.workoutsCompleted}/${stats.workoutsPlanned} buổi tập (${cr}%)`);
  else if (cr < 70) wentWrong.push(`Chỉ hoàn thành ${stats.workoutsCompleted}/${stats.workoutsPlanned} buổi (${cr}%). Sắp xếp giờ tập cố định hơn.`);

  if (stats.calorieAdherence >= 90 && stats.calorieAdherence <= 110) wentWell.push(`Calo đạt ${stats.calorieAdherence}% mục tiêu`);
  else if (stats.calorieAdherence < 80) wentWrong.push(`Calo chỉ đạt ${stats.calorieAdherence}%. Chuẩn bị bữa ăn trước sẽ giúp.`);
  else if (stats.calorieAdherence > 120) wentWrong.push(`Calo vượt mục tiêu. Chú ý đồ ăn vặt.`);

  if (stats.proteinAdherence >= 90) wentWell.push(`Đạm đạt ${stats.proteinAdherence}% mục tiêu`);
  else wentWrong.push(`Đạm chỉ đạt ${stats.proteinAdherence}%. Mỗi bữa cần nguồn đạm nạc.`);

  if (trends.avgSleep >= 7) wentWell.push(`Ngủ TB ${trends.avgSleep}h tốt cho phục hồi`);
  else wentWrong.push(`Ngủ TB ${trends.avgSleep}h. Đi ngủ sớm hơn 30 phút.`);

  if (trends.avgStress <= 4) wentWell.push('Stress được kiểm soát tốt');
  else if (trends.avgStress > 6) wentWrong.push('Stress cao ảnh hưởng phục hồi. Thêm recovery day.');

  let status: AICoachOutput['status'] = 'ON_TRACK';
  if (cr < 60 || stats.proteinAdherence < 60) status = 'OFF_TRACK';
  else if (cr < 80 || stats.proteinAdherence < 75 || trends.avgSleep < 6 || trends.avgStress > 7) status = 'NEED_ADJUSTMENT';

  return {
    type: 'weekly_review',
    title: 'Tổng Kết Tuần',
    content: `${stats.workoutsCompleted}/${stats.workoutsPlanned} buổi tập (${cr}%). Cân nặng: ${stats.weightChange > 0 ? '+' : ''}${stats.weightChange}kg. Ngủ TB: ${trends.avgSleep}h.`,
    recommendation: getWeeklyRec(wentWell, wentWrong, cr, stats, trends, status),
    status,
  };
}

function getWeeklyRec(wentWell: string[], wentWrong: string[], cr: number, stats: any, trends: any, status: string): string {
  const recs: string[] = [];
  if (cr < 50) recs.push('Giảm xuống 3 buổi/tuần để cải thiện tuân thủ.');
  if (stats.calorieAdherence > 120) recs.push('Giảm khẩu phần và theo dõi calo từ đồ uống.');
  if (stats.proteinAdherence < 70) recs.push('Thêm whey protein sau tập. Mỗi bữa phải có nguồn đạm.');
  if (trends.avgSleep < 6.5) recs.push('Ưu tiên giấc ngủ - ngủ 7h+, không màn hình 1h trước ngủ.');
  if (trends.avgStress > 6) recs.push('Thêm 2 buổi thiền hoặc đi bộ 10 phút.');
  if (status === 'ON_TRACK') recs.push('Tiếp tục duy trì! Bạn đang đi đúng hướng.');
  return recs.length > 0 ? recs.join(' ') : 'Duy trì thói quen hiện tại.';
}

// ============== HELPERS ==============

async function getUserId(): Promise<string> {
  const user = await prisma.userProfile.findFirst();
  return user?.id || '';
}

function emptyOutput(): AICoachOutput {
  return { type: 'daily_suggestion', title: 'Chưa Có Dữ Liệu', content: 'Hoàn thành onboarding để nhận gợi ý cá nhân hóa.', recommendation: 'Bắt đầu bằng việc thiết lập hồ sơ của bạn.', status: 'ON_TRACK' };
}

// Legacy exports for backward compatibility
export function generateDailySuggestion(checkIn: any, log: any) {
  return { title: 'Gợi Ý AI', content: 'Sử dụng AI Coach mới để có phân tích sâu hơn.', recommendation: 'Gọi generateDailyInsight() để có AI thực.' };
}
export function generateWeeklyReview(weekData: any) {
  return { summary: 'Sử dụng AI Coach mới', wentWell: [], wentWrong: [], adjustment: '', trainingRec: '', nutritionRec: '', recoveryRec: '', status: 'ON_TRACK' };
}
export function getStatus() { return 'ON_TRACK'; }
