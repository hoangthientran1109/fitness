'use client';
import { useEffect, useState } from 'react';
import MuscleMap from '@/components/MuscleMap';

const categoryLabels: Record<string, string> = {
  All: 'Tất Cả', chest: 'Ngực', back: 'Lưng', shoulder: 'Vai', biceps: 'Tay Trước',
  triceps: 'Tay Sau', legs: 'Chân', glutes: 'Mông', core: 'Bụng', cardio: 'Cardio', mobility: 'Linh Hoạt',
};
const diffLabels: Record<string, string> = { beginner: 'Cơ bản', intermediate: 'TB', advanced: 'Nâng cao' };

export default function ExerciseLibraryPage() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch('/api/exercises').then(r => r.json()).then(d => { setExercises(d.exercises || []); setLoading(false); }); }, []);

  const filtered = exercises.filter(e => {
    if (filter !== 'All' && e.category !== filter) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.mainMuscle.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped: Record<string, typeof exercises> = {};
  filtered.forEach(e => {
    const cat = categoryLabels[e.category] || e.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(e);
  });

  const handleSelect = (ex: any) => {
    setSelected(ex);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Thư Viện Bài Tập</h1><p className="text-gray-400 text-sm mt-1">{exercises.length} bài tập trong thư viện</p></div>

      <div className="flex flex-wrap gap-3">
        <input className="input-field flex-1 min-w-[180px] max-w-xs" placeholder="Tìm bài tập..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="flex gap-1 overflow-x-auto pb-1">
          {Object.entries(categoryLabels).filter(([k]) => k !== 'All').map(([k, v]) => (
            <button key={k} onClick={() => setFilter(k)} className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === k ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>{v}</button>
          ))}
          <button onClick={() => setFilter('All')} className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === 'All' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>{categoryLabels['All']}</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
          {Object.entries(grouped).map(([category, exs]) => (
            <div key={category}><h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">{category}</h3>
              <div className="space-y-1">
                {exs.map(ex => (
                  <button key={ex.id} onClick={() => handleSelect(ex)} className={`w-full text-left p-3 rounded-lg transition-all ${selected?.id === ex.id ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-gray-800/30 hover:bg-gray-800/50 border border-transparent'}`}>
                    <div className="flex items-center justify-between"><span className="text-sm text-gray-200 font-medium">{ex.name}</span><span className={`text-xs px-2 py-0.5 rounded-full ${ex.difficulty === 'beginner' ? 'bg-emerald-500/10 text-emerald-400' : ex.difficulty === 'intermediate' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>{diffLabels[ex.difficulty] || ex.difficulty}</span></div>
                    <p className="text-xs text-gray-500 mt-1">{ex.mainMuscle}{ex.secondaryMuscle ? ' + ' + ex.secondaryMuscle : ''} · {ex.equipment}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 h-fit sticky top-6 max-h-[80vh] overflow-y-auto space-y-5">
          {selected ? (
            <>
              <div>
                <h2 className="text-xl font-bold text-white">{selected.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">{categoryLabels[selected.category] || selected.category}</span>
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{diffLabels[selected.difficulty] || selected.difficulty}</span>
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full capitalize">{selected.equipment}</span>
                </div>
              </div>

              {/* Exercise demo image */}
              <div className="bg-gray-950 rounded-lg overflow-hidden border border-gray-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={selected.id}
                  src={`/api/exercise-img?name=${encodeURIComponent(selected.name)}`}
                  alt={selected.name}
                  className="w-full object-contain bg-black"
                  style={{ minHeight: '260px', maxHeight: '380px' }}
                  crossOrigin="anonymous"
                />
              </div>

              {/* Muscle map */}
              <MuscleMap mainMuscle={selected.mainMuscle} secondaryMuscle={selected.secondaryMuscle} category={selected.category} />

              {/* Source link */}
              <button
                onClick={async () => {
                  const r = await fetch(`/api/exercise-url?name=${encodeURIComponent(selected.name)}`);
                  const d = await r.json();
                  if (d.imageUrl) window.open(d.imageUrl, '_blank');
                  else window.open(d.repoUrl, '_blank');
                }}
                className="flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-emerald-400 transition-colors py-2 mx-auto"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                Xem Hình Gốc
              </button>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800/50 rounded-lg p-3"><p className="text-xs text-gray-500">Cơ Chính</p><p className="text-sm text-white font-medium">{selected.mainMuscle}</p></div>
                <div className="bg-gray-800/50 rounded-lg p-3"><p className="text-xs text-gray-500">Cơ Phụ</p><p className="text-sm text-white font-medium">{selected.secondaryMuscle || 'Không'}</p></div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2"><div className="w-1 h-4 rounded-full bg-emerald-500" /><h3 className="text-sm font-semibold text-gray-300">Hướng Dẫn</h3></div>
                <p className="text-sm text-gray-400 leading-relaxed">{selected.instruction}</p>
              </div>
              {selected.commonMistakes && (
                <div>
                  <div className="flex items-center gap-2 mb-2"><div className="w-1 h-4 rounded-full bg-red-500" /><h3 className="text-sm font-semibold text-red-400">Lỗi Thường Gặp</h3></div>
                  <p className="text-sm text-gray-400 leading-relaxed">{selected.commonMistakes}</p>
                </div>
              )}
              {selected.alternatives && (
                <div>
                  <div className="flex items-center gap-2 mb-2"><div className="w-1 h-4 rounded-full bg-blue-500" /><h3 className="text-sm font-semibold text-blue-400">Bài Tập Thay Thế</h3></div>
                  <p className="text-sm text-gray-400 leading-relaxed">{selected.alternatives}</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <p className="text-gray-500 text-sm">Chọn bài tập để xem chi tiết</p>
              <p className="text-gray-600 text-xs mt-1">Sơ đồ cơ thể + hướng dẫn + lỗi thường gặp</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
