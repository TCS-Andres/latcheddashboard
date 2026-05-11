import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        <footer className="border-t px-6 py-4 text-center text-[11px] text-muted-foreground">
          Latched Beginnings · Marketing dashboard · Prepared by The Creative Strategist
        </footer>
      </div>
    </div>
  );
}
