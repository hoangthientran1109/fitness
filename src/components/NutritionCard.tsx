import ProgressBar from './ProgressBar';

interface NutritionTargets {
  calories: { current: number; target: number };
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat: { current: number; target: number };
  water: { current: number; target: number };
}

interface NutritionCardProps {
  targets?: NutritionTargets;
  date?: string;
}

const defaultTargets: NutritionTargets = {
  calories: { current: 0, target: 2200 },
  protein: { current: 0, target: 160 },
  carbs: { current: 0, target: 220 },
  fat: { current: 0, target: 65 },
  water: { current: 0, target: 8 },
};

export default function NutritionCard({ targets = defaultTargets, date }: NutritionCardProps) {
  const t = targets;
  const totalCalories = t.calories.current;
  const calPercent = Math.min(Math.round((totalCalories / t.calories.target) * 100), 100);

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Dinh Dưỡng</h3>
            {date && <p className="text-xs text-gray-500">{date}</p>}
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-white">{totalCalories}</span>
          <span className="text-sm text-gray-500"> / {t.calories.target} kcal</span>
          <div className="flex items-center justify-end gap-1 mt-0.5">
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
              calPercent > 100 ? 'bg-red-500/10 text-red-400' : 'bg-gray-700 text-gray-300'
            }`}>
              {calPercent}%
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <ProgressBar
          label="Protein"
          current={t.protein.current}
          target={t.protein.target}
          color="blue"
          unit="g"
        />
        <ProgressBar
          label="Carbs"
          current={t.carbs.current}
          target={t.carbs.target}
          color="amber"
          unit="g"
        />
        <ProgressBar
          label="Fat"
          current={t.fat.current}
          target={t.fat.target}
          color="purple"
          unit="g"
        />
      </div>

      <div className="mt-5 pt-4 border-t border-gray-700/50">
        <div className="flex items-center gap-3 mb-2">
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <span className="text-sm text-gray-300">Water</span>
          <span className="ml-auto text-sm text-gray-400">
            {t.water.current} / {t.water.target} glasses
          </span>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: t.water.target }).map((_, i) => (
            <div
              key={i}
              className={`h-7 flex-1 rounded-md transition-colors duration-200 ${
                i < t.water.current
                  ? 'bg-blue-500/40 border border-blue-500/60'
                  : 'bg-gray-700/50 border border-gray-600/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
