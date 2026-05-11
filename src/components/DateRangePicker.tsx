import { useState } from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';

const PRESETS = [
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: 'mtd', label: 'Month to date' },
  { key: '90d', label: 'Last 90 days' },
  { key: '12m', label: 'Last 12 months' },
  { key: 'ytd', label: 'Year to date' },
] as const;

export function DateRangePicker() {
  const [active, setActive] = useState<(typeof PRESETS)[number]['key']>('30d');
  const label = PRESETS.find(p => p.key === active)?.label ?? 'Last 30 days';

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span>{label}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="z-50 w-48 rounded-lg border bg-card p-1 shadow-md"
        >
          <ul className="space-y-1 text-sm">
            {PRESETS.map(p => (
              <li key={p.key}>
                <button
                  onClick={() => setActive(p.key)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-3 py-2 transition-colors hover:bg-accent',
                    active === p.key && 'bg-accent text-accent-foreground'
                  )}
                >
                  {p.label}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-1 border-t px-3 py-2 text-[10px] text-muted-foreground">
            Mock data — same numbers across ranges in MVP.
          </p>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
