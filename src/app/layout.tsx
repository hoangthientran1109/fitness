import type { Metadata, Viewport } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'Personal Fitness OS',
  description: 'Your personal AI-powered fitness companion',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="dark">
      <body className="min-h-screen overflow-x-hidden">
        <Sidebar />
        <main className="flex-1 pb-24 md:pb-0 md:ml-64" style={{ paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))' }}>
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
