import { Moon, Sun, Target } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { activeClient } from '@/config/clients';
import { useTheme } from '@/lib/store/theme';
import { QuickTargetsDialog } from '@/components/QuickTargetsDialog';
import { DateRangePicker } from '@/components/DateRangePicker';

export function Topbar() {
  const { theme, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="font-display text-lg leading-none">{activeClient.name}</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {activeClient.location} · {activeClient.ownerName}
          </p>
        </div>
        <Badge variant="muted" className="ml-2 hidden sm:inline-flex">
          HIPAA · Aggregation only
        </Badge>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <DateRangePicker />
        <QuickTargetsDialog>
          <Button variant="outline" size="sm" className="gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Targets</span>
          </Button>
        </QuickTargetsDialog>
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
}
