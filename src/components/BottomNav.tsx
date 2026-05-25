'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Trang Chủ', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/today', label: 'Hôm Nay', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { href: '/workout', label: 'Lịch Tập', icon: 'M4 6h16M4 12h16M4 18h16' },
  { href: '/nutrition', label: 'Dinh Dưỡng', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
  { href: '/progress', label: 'Tiến Độ', icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-gray-900/95 backdrop-blur-sm border-t border-gray-800" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-1.5 min-h-[44px] min-w-[44px] rounded-lg transition-colors duration-200 relative ${
                isActive
                  ? 'text-emerald-400'
                  : 'text-gray-500 hover:text-gray-300 active:text-gray-200'
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={isActive ? 2 : 1.5}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span className="text-[11px] font-medium leading-tight">{item.label}</span>
              {isActive && (
                <span className="absolute top-0 w-6 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
