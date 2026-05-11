import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Heart,
  Megaphone,
  NotebookPen,
  Database,
  ExternalLink,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { activeClient } from '@/config/clients';
import { cn } from '@/lib/utils';

const nav = [
  { to: '/', label: 'Executive Overview', icon: LayoutDashboard, end: true },
  { to: '/acquisition', label: 'Family Acquisition', icon: Users },
  { to: '/revenue', label: 'Revenue & Financials', icon: DollarSign },
  { to: '/social', label: 'Social Media', icon: Heart },
  { to: '/ads', label: 'Paid Ads', icon: Megaphone },
  { to: '/notes', label: 'Strategy & Notes', icon: NotebookPen },
  { to: '/data', label: 'Data', icon: Database },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Logo size="md" />
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-4">
        <a
          href={activeClient.privacy.crmDeepLink}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <span>{activeClient.privacy.crmDeepLinkLabel}</span>
          <ExternalLink className="h-3 w-3" />
        </a>
        <p className="mt-3 px-1 text-[10px] leading-relaxed text-muted-foreground">
          Aggregation-only view. No PHI stored.<br />
          Per-family detail lives in {activeClient.privacy.crmName}.
        </p>
      </div>
    </aside>
  );
}
