'use client';
import { useState } from 'react';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  notes?: string;
}

interface WorkoutDay {
  id: string;
  focus: string;
  day: string;
  exercises: Exercise[];
  completed?: boolean;
  duration?: string;
}

interface WorkoutCardProps {
  workout: WorkoutDay;
  onComplete?: (id: string) => void;
  onSkip?: (id: string) => void;
  onLog?: (id: string) => void;
}

export default function WorkoutCard({ workout, onComplete, onSkip, onLog }: WorkoutCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`bg-gray-800/50 rounded-xl border transition-all duration-200 ${
      workout.completed
        ? 'border-emerald-500/30 ring-1 ring-emerald-500/10'
        : 'border-gray-700/50 hover:border-gray-600/50'
    }`}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
              workout.completed
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-gray-700/50 text-gray-400'
            }`}>
              {workout.completed ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{workout.focus}</h3>
              <p className="text-sm text-gray-500">{workout.day}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {workout.duration && (
              <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-0.5 rounded-full">
                {workout.duration}
              </span>
            )}
              {workout.completed && (
              <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Đã Xong
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {workout.exercises.slice(0, expanded ? workout.exercises.length : 2).map((exercise, idx) => (
            <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-900/50">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-5">{idx + 1}</span>
                <span className="text-sm text-gray-300">{exercise.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{exercise.sets} x {exercise.reps}</span>
                {exercise.weight && (
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    {exercise.weight}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {workout.exercises.length > 2 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-gray-500 hover:text-emerald-400 transition-colors mb-4"
          >
            {expanded ? `Ẩn bớt` : `+${workout.exercises.length - 2} bài nữa`}
          </button>
        )}

        {!workout.completed && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-700/50">
            <button
              onClick={() => onComplete?.(workout.id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Complete
            </button>
            <button
              onClick={() => onLog?.(workout.id)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gray-700/50 text-gray-300 text-sm font-medium hover:bg-gray-600/50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Log
            </button>
            <button
              onClick={() => onSkip?.(workout.id)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-gray-500 text-sm font-medium hover:bg-gray-700/30 hover:text-gray-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
              Skip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
