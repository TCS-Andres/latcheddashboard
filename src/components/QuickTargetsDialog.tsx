import { type ReactNode, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTargets, type MetricKey } from '@/lib/store/targets';

const FIELDS: { key: MetricKey; label: string; prefix?: string; suffix?: string }[] = [
  { key: 'consultationsBooked', label: 'Consultations booked / month' },
  { key: 'consultationsAttended', label: 'Consultations attended / month' },
  { key: 'procedures', label: 'Releases performed / month' },
  { key: 'revenue', label: 'Revenue / month', prefix: '$' },
  { key: 'providerReferrals', label: 'Provider referrals / month' },
  { key: 'leadMagnetDownloads', label: 'Lead magnet downloads / month' },
  { key: 'instagramFollowers', label: 'Instagram followers (total)' },
  { key: 'googleReviewsCount', label: 'New Google reviews / month' },
  { key: 'nps', label: 'NPS / satisfaction', suffix: '/100' },
];

export function QuickTargetsDialog({ children }: { children: ReactNode }) {
  const { targets, updateTarget, resetTargets } = useTargets();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Monthly targets</DialogTitle>
          <DialogDescription>
            Used for pacing on every tab. Stored locally — never sent off-device.
          </DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[60vh] gap-3 overflow-y-auto pr-1 scrollbar-thin">
          {FIELDS.map(f => (
            <label key={f.key} className="grid gap-1.5 text-sm">
              <span className="text-muted-foreground">{f.label}</span>
              <div className="relative">
                {f.prefix && (
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {f.prefix}
                  </span>
                )}
                <Input
                  type="number"
                  value={targets[f.key]}
                  onChange={e => updateTarget(f.key, Number(e.target.value) || 0)}
                  className={f.prefix ? 'pl-6' : ''}
                />
                {f.suffix && (
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {f.suffix}
                  </span>
                )}
              </div>
            </label>
          ))}
        </div>
        <div className="flex justify-between border-t pt-3">
          <Button variant="ghost" size="sm" onClick={resetTargets}>
            Reset to defaults
          </Button>
          <Button size="sm" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
