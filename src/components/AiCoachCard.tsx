interface AiCoachCardProps {
  title: string;
  content: string;
  recommendation?: string;
  className?: string;
}

export default function AiCoachCard({ title, content, recommendation, className = '' }: AiCoachCardProps) {
  return (
    <div className={`bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-violet-500/10 to-emerald-500/10 px-5 py-4 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-emerald-500 p-0.5">
            <div className="flex items-center justify-center w-full h-full rounded-lg bg-gray-900">
              <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">HLV AI</h3>
            <p className="text-xs text-gray-500">Phân tích cá nhân</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs text-emerald-400 font-medium">Hoạt Động</span>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <h4 className="text-base font-semibold text-white mb-2">{title}</h4>
          <p className="text-sm text-gray-400 leading-relaxed">{content}</p>
        </div>

        {recommendation && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
            <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-sm text-emerald-300/80 leading-relaxed">{recommendation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
