# Personal Fitness OS

Your personal AI-powered fitness companion. A local-first web app that acts as your PT, training journal, nutrition tracker, and progress dashboard.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS** (dark theme default)
- **Prisma** (SQLite)
- **Recharts** (charts)
- **date-fns** (date utilities)

## Quick Start

```bash
# Install dependencies
npm install

# Push database schema + seed demo data
npm run db:setup

# Or step by step:
npm run db:push    # Create SQLite database
npm run db:seed    # Seed demo data

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

The app comes pre-seeded with demo data for user **Thien** (intermediate, body recomposition goal) including:
- 50 exercises across 10 categories
- 4-week workout plan (5-day PPL split)
- 7-day meal plan with macros
- 14 days of nutrition logs, body metrics, workout logs
- 7 daily check-ins
- AI coach insights
- Personal rules

If you visit without seed data, you'll be redirected to the onboarding flow.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes
│   │   ├── user/           # GET user profile
│   │   ├── onboarding/     # POST create profile
│   │   ├── dashboard/      # GET dashboard data
│   │   ├── today/          # GET today's plan
│   │   ├── checkin/        # POST daily check-in
│   │   ├── nutrition/      # POST log nutrition
│   │   ├── workout/        # POST log workout
│   │   ├── progress/       # GET progress data
│   │   ├── weekly-review/  # GET weekly data
│   │   ├── ai-insights/    # GET/POST insights
│   │   ├── rules/          # CRUD personal rules
│   │   └── exercises/      # GET exercise library
│   ├── page.tsx            # Dashboard
│   ├── onboarding/         # Onboarding flow
│   ├── today/              # Today's plan
│   ├── workout/            # Workout plan (daily/weekly/monthly)
│   ├── nutrition/          # Nutrition plan & tracking
│   ├── check-in/           # Daily check-in form
│   ├── progress/           # Progress tracking & charts
│   ├── weekly-review/      # Weekly review generator
│   ├── exercises/          # Exercise library
│   └── settings/           # Profile & personal rules
├── components/
│   ├── BottomNav.tsx       # Mobile bottom navigation
│   ├── Sidebar.tsx         # Desktop sidebar
│   ├── StatCard.tsx        # Metric card with trend
│   ├── ProgressBar.tsx     # Progress bar with percentage
│   ├── WorkoutCard.tsx     # Workout day card
│   ├── NutritionCard.tsx   # Nutrition tracking card
│   ├── AiCoachCard.tsx     # AI coach insight card
│   ├── StatusBadge.tsx     # Status indicator badge
│   └── MetricChart.tsx     # Recharts line chart wrapper
├── lib/
│   ├── prisma.ts           # Prisma client singleton
│   ├── types.ts            # TypeScript type definitions
│   ├── fitness-calculator.ts # BMR, TDEE, macro calculators
│   ├── plan-generators.ts  # Workout & nutrition plan generators
│   └── ai-coach.ts         # Rule-based AI coach engine
└── app/globals.css         # Global styles with Tailwind
prisma/
├── schema.prisma           # Database schema (16 models)
├── seed.ts                 # Demo data seeder
└── dev.db                  # SQLite database (gitignored)
```

## Features Built (MVP)

| Feature | Status |
|---------|--------|
| Onboarding flow (4-step wizard) | Done |
| Dashboard with stat cards & weight chart | Done |
| Today Plan (workout + nutrition) | Done |
| Workout Plan (daily/weekly/monthly views) | Done |
| Nutrition Plan (macro targets, meal suggestions) | Done |
| Log workout (complete/skip with reason) | Done |
| Log nutrition (calories, protein, carbs, fat, water) | Done |
| Log body metrics (weight, measurements) | Done |
| Daily check-in (sleep, energy, stress, mood, etc.) | Done |
| Progress charts (weight, measurements, calories, adherence) | Done |
| Weekly review generator | Done |
| AI Coach (rule-based mock insights) | Done |
| Exercise Library (50 exercises, filterable) | Done |
| Personal Rules (CRUD, enable/disable) | Done |
| Settings (profile editing) | Done |
| Mobile-first responsive UI | Done |
| Dark theme | Done |
| Pre-seeded demo data | Done |

## AI Coach Architecture

The AI Coach is currently rule-based (mock). It analyzes:
- Workout completion rate
- Calorie & protein adherence
- Weight trend
- Sleep, stress, energy, soreness, mood
- Personal rules

To integrate OpenAI API:

1. Add `OPENAI_API_KEY` to `.env.local`
2. Install `openai` npm package
3. Create `src/lib/ai-coach-openai.ts` with OpenAI client
4. Replace the deterministic logic in `ai-coach.ts` with GPT API calls
5. Pass structured data (check-ins, logs, rules) as context in the prompt

The data model already supports `AiCoachInsight` with all needed fields (`type`, `title`, `content`, `recommendation`).

## Database Models (16 tables)

UserProfile, FitnessGoal, PersonalRule, WorkoutPlan, WorkoutDay, WorkoutExercise, Exercise, WorkoutLog, ExerciseLog, NutritionPlan, Meal, NutritionLog, BodyMetric, DailyCheckIn, ProgressRecord, AiCoachInsight

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run db:push      # Sync Prisma schema to SQLite
npm run db:seed      # Seed demo data
npm run db:setup     # Push + Seed in one command
```
