# Personal Fitness OS — Tài Liệu Dự Án

> **Hệ điều hành fitness cá nhân cho vận động viên Việt Nam**
>
> App: [https://personal-fitness-os.onrender.com](https://personal-fitness-os.onrender.com)
>
> Repo: [https://github.com/hoangthientran1109/fitness](https://github.com/hoangthientran1109/fitness)

---

## Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Công Nghệ](#công-nghệ)
3. [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
4. [Database Schema](#database-schema)
5. [API Routes](#api-routes)
6. [Pages & Tính Năng](#pages--tính-năng)
7. [AI Coach](#ai-coach)
8. [Deploy (Render.com)](#deploy-rendercom)
9. [Biến Môi Trường](#biến-môi-trường)
10. [Scripts](#scripts)
11. [Luồng Sử Dụng](#luồng-sử-dụng)

---

## Tổng Quan

Personal Fitness OS là ứng dụng web fitness toàn diện dành riêng cho vận động viên Việt Nam. App hỗ trợ:

- **Quản lý lịch tập** 5 ngày PPL (Push-Pull-Legs) tự động generate
- **Theo dõi dinh dưỡng** với AI ước lượng macro từ mô tả món ăn tiếng Việt
- **HLV AI** phân tích hàng ngày/tuần bằng tiếng Việt (qua Ollama/DeepSeek v4-pro)
- **Theo dõi tiến độ** cân nặng, số đo cơ thể, body fat
- **Cảnh báo tự động** khi giảm cân quá nhanh, mất cơ, stress cao, thiếu ngủ
- **Deload detection** tự động sau 5+ tuần tập nặng
- **Progressive overload** tracking — so sánh mức tạ hiện tại với lần trước

---

## Công Nghệ

| Layer | Công Nghệ |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + TailwindCSS 3 |
| Database | Prisma ORM + PostgreSQL (Render free tier) |
| Charts | Recharts 2 |
| Dates | date-fns 3 |
| AI | Ollama API (DeepSeek v4-pro) |
| Deploy | Render.com Blueprint (free, Singapore) |
| Runtime | Node.js |

---

## Cấu Trúc Dự Án

```
personal-fitness-os/
├── prisma/
│   ├── schema.prisma          # 16 models (User, Workout, Nutrition, AI...)
│   ├── seed.ts                # Seed demo data cho user "Thien"
│   └── dev.db                 # SQLite local (dev only)
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout (viewport meta, sidebar, bottom nav)
│   │   ├── globals.css        # Dark theme, custom range slider, 44px touch targets
│   │   ├── page.tsx           # Dashboard / Home
│   │   ├── today/             # Bài tập hôm nay + log dinh dưỡng + check-in nhanh
│   │   ├── workout/           # Lịch tập (daily/weekly/monthly views)
│   │   ├── nutrition/         # Kế hoạch dinh dưỡng + AI gợi ý món
│   │   ├── progress/          # Nhập chỉ số cơ thể + cảnh báo + nhật ký tập
│   │   ├── weekly-review/     # Tổng kết tuần (tập, dinh dưỡng, cân nặng, điểm danh)
│   │   ├── check-in/          # Form điểm danh đầy đủ 7 chỉ số
│   │   ├── exercises/         # Thư viện 50 bài tập (có ảnh)
│   │   ├── onboarding/        # Form khởi tạo kế hoạch cá nhân
│   │   ├── settings/          # Cài đặt (rules, goal, profile)
│   │   └── api/               # 20 API endpoints (xem chi tiết bên dưới)
│   ├── components/
│   │   ├── AiCoachCard.tsx    # Card hiển thị phân tích AI
│   │   ├── BottomNav.tsx      # Bottom navigation (mobile)
│   │   ├── MetricChart.tsx    # Biểu đồ (Recharts wrapper)
│   │   ├── MuscleMap.tsx      # Bản đồ nhóm cơ
│   │   ├── ProgressBar.tsx    # Thanh progress (calo, protein...)
│   │   ├── Sidebar.tsx        # Sidebar navigation (desktop)
│   │   ├── StatCard.tsx       # Ô thống kê
│   │   ├── StatusBadge.tsx    # Badge trạng thái (ON_TRACK, NEED_ADJUSTMENT...)
│   │   └── WorkoutCard.tsx    # Card bài tập
│   └── lib/
│       ├── ai-coach.ts        # AI core: callOllama, estimate, generate meals/insights
│       ├── api-handlers.ts    # API handler utilities
│       ├── exercise-images.ts # Tra cứu ảnh bài tập từ free-exercise-db
│       ├── fitness-calculator.ts # Tính toán TDEE, macros, calorie targets
│       ├── plan-generators.ts # Generate workout plan + nutrition meal templates
│       ├── prisma.ts          # Prisma client singleton
│       └── types.ts           # TypeScript type definitions
├── render.yaml                # Render.com Blueprint deploy config
├── package.json
├── tailwind.config.js
├── next.config.js
├── tsconfig.json
├── .env.example               # Template biến môi trường
└── QUY-TRINH-SU-DUNG-HANG-NGAY.txt  # Hướng dẫn sử dụng hàng ngày
```

---

## Database Schema

16 models, quan hệ chính:

```
UserProfile (1) ────< FitnessGoal
       │             < PersonalRule
       │             < WorkoutPlan ──< WorkoutDay ──< WorkoutExercise ── Exercise
       │             < NutritionPlan ──< Meal
       │             < WorkoutLog ──< ExerciseLog
       │             < NutritionLog
       │             < BodyMetric
       │             < DailyCheckIn
       │             < ProgressRecord
       │             < AiCoachInsight
```

### Chi tiết Models

| Model | Fields chính |
|---|---|
| **UserProfile** | name, gender, age, height, weight, bodyFat, activityLevel, experienceLevel |
| **FitnessGoal** | goalType, startWeight, targetWeight, targetBodyFat, priority, status |
| **PersonalRule** | ruleType (training/nutrition/recovery/lifestyle), description, isActive |
| **WorkoutPlan** | name, type (push_pull_legs/upper_lower/full_body...), startDate, daysPerWeek, status |
| **WorkoutDay** | planId, dayIndex, date, focus, notes, completed |
| **WorkoutExercise** | workoutDayId, exerciseId, sets, reps, restSeconds, rpe, tempo, order |
| **Exercise** | name, category, mainMuscle, secondaryMuscle, equipment, difficulty, instruction, imageUrl |
| **WorkoutLog** | userId, workoutDayId, date, completed, skippedReason, notes |
| **ExerciseLog** | workoutLogId, exerciseId, setsCompleted, reps, weight, rpe |
| **NutritionPlan** | userId, caloriesTarget, proteinTarget, carbTarget, fatTarget, waterTarget |
| **Meal** | nutritionPlanId, name, mealType, calories, protein, carbs, fat, ingredients, instructions |
| **NutritionLog** | userId, date, calories, protein, carbs, fat, water, notes |
| **BodyMetric** | userId, date, weight, bodyFat, waist, chest, arm, thigh, hip, shoulder |
| **DailyCheckIn** | userId, date, sleepHours, energy, stress, mood, soreness, hunger, motivation |
| **ProgressRecord** | userId, date, adherenceScore, workoutCompletionRate, caloriesAdherence, proteinAdherence |
| **AiCoachInsight** | userId, type, title, content, recommendation |

**Enum values trong code:**
- `goalType`: fat_loss, muscle_gain, body_recomposition, strength, general_health
- `ruleType`: training, nutrition, recovery, lifestyle
- `mealType`: breakfast, lunch, dinner, snack, pre_workout, post_workout
- `insightType`: daily_suggestion, weekly_review, warning, adjustment, encouragement
- `status`: ON_TRACK, NEED_ADJUSTMENT, OFF_TRACK, RECOVERY_NEEDED
- `workoutType`: push_pull_legs, upper_lower, full_body, strength, hypertrophy, custom

---

## API Routes

20 endpoints, tất cả đều `export const dynamic = 'force-dynamic'`:

### User & Onboarding

| Method | Endpoint | Chức năng |
|---|---|---|
| `POST` | `/api/onboarding` | Khởi tạo user mới, generate workout + nutrition plan |
| `GET` | `/api/user` | Lấy thông tin user + goals + rules |
| `GET/PATCH` | `/api/user-profile` | Đọc/cập nhật profile |

### Workout

| Method | Endpoint | Chức năng |
|---|---|---|
| `GET` | `/api/today` | Lấy bài tập hôm nay + nutrition log + check-in + deload detection |
| `GET` | `/api/workout-plan` | Lấy kế hoạch tập (có exercises trong mỗi ngày) |
| `POST` | `/api/workout/log` | Ghi nhật ký buổi tập (sets, reps, weight, rpe) |

### Nutrition

| Method | Endpoint | Chức năng |
|---|---|---|
| `POST` | `/api/nutrition` | Ghi/cập nhật nutrition log hàng ngày |
| `POST` | `/api/nutrition/estimate` | AI ước lượng macro từ mô tả món ăn tiếng Việt |
| `POST` | `/api/nutrition/suggest` | AI tạo thực đơn mới mỗi ngày |

### Progress & Metrics

| Method | Endpoint | Chức năng |
|---|---|---|
| `POST` | `/api/body-metrics` | Ghi chỉ số cơ thể + auto warning (giảm >1kg, tăng >0.5kg, mất cơ) |
| `GET` | `/api/progress` | Lấy toàn bộ dữ liệu tiến độ (body metrics, workout/nutrition logs) |

### Check-in & Dashboard

| Method | Endpoint | Chức năng |
|---|---|---|
| `POST` | `/api/checkin` | Điểm danh hàng ngày (7 chỉ số) |
| `GET` | `/api/dashboard` | Dashboard data (stats, charts, AI insight mới nhất) |
| `GET` | `/api/weekly-review` | Tổng kết tuần (7 ngày) |

### Exercises

| Method | Endpoint | Chức năng |
|---|---|---|
| `GET` | `/api/exercises` | Lấy danh sách 50 bài tập |
| `GET` | `/api/exercise-url` | Tra URL ảnh bài tập từ free-exercise-db |
| `GET` | `/api/exercise-img` | Proxy ảnh JPG / SVG anatomy fallback |

### AI & Rules

| Method | Endpoint | Chức năng |
|---|---|---|
| `GET/POST` | `/api/ai-insights` | Đọc/tạo AI insight |
| `POST` | `/api/ai-insights/generate` | Generate AI insight tự động (daily/weekly) |
| `GET/POST/DELETE/PATCH` | `/api/rules` | CRUD personal rules |

---

## Pages & Tính Năng

### 1. Bảng Điều Khiển (Home — `/`)
- Dashboard stats: cân nặng, % hoàn thành tập, calo, protein, giấc ngủ, stress
- Check-in nhanh inline
- AI phân tích: nút "Phân Tích AI" gọi DeepSeek v4-pro
- Nutrition: input mô tả món ăn → AI ước lượng macro
- Log form: progressive overload + so sánh lần tập trước
- Deload banner: tự detect 5+ tuần tập nặng

### 2. Hôm Nay (Today — `/today`)
- Bài tập hôm nay với form log per-exercise
- Progressive overload: so sánh mức tạ với lần trước (tag xanh +2.5kg)
- Input mô tả đồ ăn + AI tính macro (có fallback keyword matching)
- Deload banner

### 3. Lịch Tập (Workout — `/workout`)
- 3 view: Ngày / Tuần / Tháng
- Grid 3 cột (desktop), hiển thị bài tập mỗi ngày
- Trạng thái: Xong / Chưa

### 4. Dinh Dưỡng (Nutrition — `/nutrition`)
- Chỉ tiêu macro với progress bars
- **Kiến Thức Dinh Dưỡng**: giải thích Đạm, Carb, Béo, Nước và tác dụng
- **Bữa Ăn Gợi Ý**: hiển thị meals từ kế hoạch
- Nút **"✨ Gợi ý món mới"**: AI generate thực đơn mới mỗi ngày (fallback 7 bộ xoay vòng)

### 5. Điểm Danh (Check-in — `/check-in`)
- Form đầy đủ: sleep, energy, stress, mood, soreness, hunger, motivation
- Ghi chú đau/chấn thương

### 6. Tiến Độ (Progress — `/progress`)
- **Form nhập chỉ số**: cân nặng, body fat, vòng eo/ngực/tay/đùi/hông/vai
- **Cảnh báo tự động**: 🔴 giảm >1kg, 🟡 tăng >0.5kg, 🔴 mất cơ
- **Stat cards**: tổng buổi tập, hoàn thành, tỷ lệ, tuân thủ
- **Nhật ký tập gần đây**

### 7. Tổng Kết Tuần (Weekly Review — `/weekly-review`)
- Tổng hợp 9 chỉ số: tập, calo, đạm, ngủ, stress, năng lượng, mood, đau cơ, cân nặng
- "Điểm Tốt" + "Cần Cải Thiện" với gợi ý hành động
- 3 khuyến nghị: tập luyện, dinh dưỡng, phục hồi
- Trạng thái: ON_TRACK / NEED_ADJUSTMENT / OFF_TRACK

### 8. Thư Viện Bài Tập (Exercises — `/exercises`)
- 50 bài tập với ảnh minh họa (JPG từ free-exercise-db hoặc SVG fallback)
- Filter: danh mục, nhóm cơ, thiết bị
- Chi tiết: instruction, common mistakes, alternatives

### 9. Cài Đặt (Settings — `/settings`)
- Thông tin cá nhân
- Fitness Goal (loại mục tiêu, target weight, body fat)
- Personal Rules (8 quy tắc mặc định)

### 10. Onboarding (— `/onboarding`)
- Multi-step form: thông tin cá nhân → mục tiêu → lịch tập → dinh dưỡng → rules
- Tự động generate workout plan + nutrition plan dựa trên input

---

## AI Coach

### Model & API
- **Model**: DeepSeek v4-pro (qua Ollama API)
- **Endpoint**: `https://ollama.com/v1/chat/completions`
- **Timeout**: 30 giây (có fallback nếu timeout)
- **Max tokens**: 8000

### System Prompt
- Role: HLV 10+ năm + Chuyên Gia Dinh Dưỡng
- **Quy tắc**: KHÔNG dùng thuật ngữ chuyên ngành (RPE, deload, progressive overload...)
- Thay thế bằng tiếng Việt đời thường
- Phân tích 5 phần: Tổng quan, Chuyên sâu (ngủ/stress/đau cơ/năng lượng/dinh dưỡng), Chấn thương, Hướng dẫn tập, Khuyến nghị

### AI Functions

| Function | Mô tả | Fallback |
|---|---|---|
| `generateDailyInsight()` | Phân tích hàng ngày dựa trên check-in + log | Rule-based logic |
| `generateWeeklyInsight()` | Tổng kết tuần | Rule-based logic |
| `estimateMacrosFromDescription()` | Ước lượng calo/protein/carbs/fat từ mô tả món ăn | Keyword matching 30+ món Việt |
| `generateDailyMeals()` | Tạo thực đơn mới mỗi ngày | 7 bộ meals xoay theo thứ |

---

## Deploy (Render.com)

### Blueprint Config (`render.yaml`)

```yaml
services:
  - type: web
    name: personal-fitness-os
    env: node
    region: singapore
    plan: free
    buildCommand: npm install && npx prisma generate && npm run build
    startCommand: npx prisma db push && next start -p ${PORT:-3000}
    envVars:
      - key: DATABASE_URL        # PostgreSQL URL (set thủ công)
      - key: OLLAMA_API_KEY      # Ollama API key
      - key: OLLAMA_ENDPOINT     # https://ollama.com/v1
      - key: OLLAMA_MODEL        # deepseek-v4-pro
```

### Infrastructure
- **Web Service**: Render free tier, Singapore region
- **Database**: PostgreSQL free tier (1GB, 90 ngày)
- **Build**: `npm install` → `prisma generate` → `next build`
- **Start**: `prisma db push` → `next start`
- **No persistent disk**: data lưu trên PostgreSQL instance riêng
- **Spin down**: Free tier ngủ sau 15 phút không request (~50s wake up)

### Deploy Process
1. Push code lên GitHub (`git push origin master`)
2. Render Blueprint auto-sync hoặc Manual Deploy
3. Build → DB push → Start
4. Data KHÔNG bị reset khi deploy (đã bỏ `db seed` khỏi start command)

---

## Biến Môi Trường

| Key | Mô tả | Giá trị |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/db` |
| `OLLAMA_API_KEY` | Ollama API key | `f68cb127fe8c...` (sync: false) |
| `OLLAMA_ENDPOINT` | Ollama API endpoint | `https://ollama.com/v1` |
| `OLLAMA_MODEL` | Model name | `deepseek-v4-pro` |

**Local dev**: `.env.local` chứa DATABASE_URL + Ollama credentials (không push lên Git)
**Production**: Render dashboard → Environment tab → set thủ công

---

## Scripts

```json
{
  "dev": "next dev -H 0.0.0.0",
  "build": "next build",
  "start": "npx prisma db push --accept-data-loss && next start -p ${PORT:-3000}",
  "db:generate": "prisma generate",
  "db:push": "prisma db push",
  "db:seed": "tsx prisma/seed.ts",
  "db:setup": "prisma db push && tsx prisma/seed.ts",
  "postinstall": "prisma generate"
}
```

| Script | Dùng khi |
|---|---|
| `npm run dev` | Chạy local dev server (port 3000, bind 0.0.0.0) |
| `npm run build` | Build production |
| `npm run db:seed` | Seed demo data cho user "Thien" (50 exercises, 4-week plan) |
| `npm run db:setup` | Setup DB + seed (local) |
| `npm start` | Production start (dùng trên Render) |

---

## Luồng Sử Dụng

### Hàng Ngày (6 bước)

1. **Check-in buổi sáng** (tab Điểm Danh) — sleep, energy, stress, mood, soreness
2. **Xem HLV AI** (tab Home) — phân tích dựa trên dữ liệu hôm qua
3. **Tập theo lịch** (tab Hôm Nay) — log sets, reps, weight. So sánh progressive overload
4. **Log dinh dưỡng** (tab Home — mô tả món → AI tính macro; tab Dinh Dưỡng — xem thực đơn AI gợi ý)
5. **Kiểm tra cuối ngày** (tab Home) — dashboard stats
6. **Đo chỉ số** (tab Tiến Độ, 1-2 lần/tuần) — cân nặng, body fat, số đo. Auto warning nếu vượt ngưỡng

### Hàng Tuần (Chủ nhật)

- Tab Tổng Kết Tuần → bấm "Tạo Tổng Kết"
- Xem: % hoàn thành tập, calo/protein adherence, thay đổi cân nặng, ngủ/stress/năng lượng TB
- Điểm Tốt + Cần Cải Thiện với gợi ý cụ thể

### Chỉ Số Quan Trọng (User: Thien)

| Chỉ số | Ngưỡng cảnh báo | Hành động |
|---|---|---|
| Cân nặng giảm >1kg/tuần | 🔴 Banner + Tổng Kết Tuần | Tăng calo 200-300/ngày |
| Cân nặng tăng >0.5kg/tuần | 🟡 Banner + Tổng Kết Tuần | Giảm calo 200-300/ngày |
| Mất cơ (giảm cân + tăng mỡ) | 🔴 Banner | Ưu tiên đạm 2g/kg + tập compound |
| Đạm <140g/ngày | Tổng Kết Tuần | Mỗi bữa thêm nguồn đạm nạc |
| Ngủ <6 tiếng | HLV AI | Giảm intensity 20% |
| Stress >7 | HLV AI | Thêm recovery day |
| Đau gối | HLV AI | Thay squat = leg press |

---

## Lịch Sử Phát Triển

### Commit Gần Đây

| Commit | Nội dung |
|---|---|
| `d47a992` | fix(deploy): remove auto-seed from start to prevent data reset |
| `4977b0b` | refactor(progress): remove 4 chart sections |
| `3297f2b` | fix(nutrition): add keyword fallback estimator |
| `4ca5f81` | refactor(workout): wider grids from 5-col to 3-col |
| `2e899f3` | refactor(nutrition): replace input form with knowledge cards |
| `604c622` | docs: update guide with auto warning system |
| `7ee2818` | feat(weekly-review): add weight change analysis |
| `42c225c` | feat(progress): auto warning when weight changes |
| `53188d8` | feat(progress): add body metrics input form |
| `4658bf6` | feat(nutrition): AI daily meal suggestions |
| `520ce4c` | fix(ai): stop adding default 2000ml water |
| `85a3acf` | fix(build): force-dynamic on all API routes |

---

> **File tạo**: 2026-05-26
>
> **App URL**: [https://personal-fitness-os.onrender.com](https://personal-fitness-os.onrender.com)
>
> **Repo**: [https://github.com/hoangthientran1109/fitness](https://github.com/hoangthientran1109/fitness)
