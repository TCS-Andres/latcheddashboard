import { useMemo, useState } from 'react';
import { Eraser, Info } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { trailingMonths } from '@/lib/data/mockUtils';
import {
  useActuals,
  useTargets,
  useTargetOverrides,
  type MetricKey,
} from '@/lib/store/targets';

const METRICS: { key: MetricKey; label: string; prefix?: string }[] = [
  { key: 'consultationsBooked', label: 'Consults booked' },
  { key: 'consultationsAttended', label: 'Consults attended' },
  { key: 'procedures', label: 'Releases performed' },
  { key: 'revenue', label: 'Revenue', prefix: '$' },
  { key: 'providerReferrals', label: 'Provider referrals' },
  { key: 'leadMagnetDownloads', label: 'Lead downloads' },
  { key: 'googleReviewsCount', label: 'New reviews' },
];

const PAGE_SIZE = 12;

export function Data() {
  const { targets, updateTarget, resetTargets } = useTargets();
  const { actuals, setActual, resetActuals } = useActuals();
  const { overrides, setOverride } = useTargetOverrides();
  const [page, setPage] = useState(0);

  const months = useMemo(() => {
    const totalMonths = PAGE_SIZE + page * PAGE_SIZE;
    const all = trailingMonths(totalMonths + PAGE_SIZE);
    return all.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE).reverse();
  }, [page]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data"
        description="Enter your real numbers as they come in. Charts overlay your entries on top of mock data."
        actions={
          <Badge variant="muted" className="gap-1">
            <Info className="h-3 w-3" />
            Stored locally on this device
          </Badge>
        }
      />

      <SectionCard
        title="Default monthly targets"
        description="Used everywhere the dashboard says ‘target’ — unless overridden per month below."
        actions={
          <Button variant="ghost" size="sm" onClick={resetTargets}>
            Reset
          </Button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {METRICS.map(m => (
            <label key={m.key} className="grid gap-1.5 text-sm">
              <span className="text-muted-foreground">{m.label}</span>
              <div className="relative">
                {m.prefix && (
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {m.prefix}
                  </span>
                )}
                <Input
                  type="number"
                  value={targets[m.key]}
                  onChange={e => updateTarget(m.key, Number(e.target.value) || 0)}
                  className={m.prefix ? 'pl-6' : ''}
                />
              </div>
            </label>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Monthly actuals"
        description="Enter the real number for any month you have it. Blanks keep mock data so charts never empty out."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page > 5}
            >
              ← Older
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Newer →
            </Button>
            <Button variant="outline" size="sm" onClick={resetActuals} className="gap-1">
              <Eraser className="h-3.5 w-3.5" />
              Clear
            </Button>
          </div>
        }
        bodyClassName="px-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="sticky left-0 z-10 bg-muted/30 px-5 py-2 font-medium">Month</th>
                {METRICS.map(m => (
                  <th key={m.key} className="px-3 py-2 text-right font-medium">
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {months.map(month => (
                <tr key={month.key} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="sticky left-0 z-10 bg-card px-5 py-2 font-medium">{month.label}</td>
                  {METRICS.map(m => {
                    const val = actuals[month.key]?.[m.key];
                    return (
                      <td key={m.key} className="px-3 py-2 text-right">
                        <Input
                          type="number"
                          value={val ?? ''}
                          placeholder="—"
                          onChange={e =>
                            setActual(
                              month.key,
                              m.key,
                              e.target.value === '' ? undefined : Number(e.target.value)
                            )
                          }
                          className="h-8 text-right tabular-nums"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard
        title="Per-month target overrides"
        description="Optional. Override the default monthly target for specific months (e.g. holiday slow-downs, launch ramps)."
        bodyClassName="px-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="sticky left-0 z-10 bg-muted/30 px-5 py-2 font-medium">Month</th>
                {METRICS.map(m => (
                  <th key={m.key} className="px-3 py-2 text-right font-medium">
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {months.map(month => (
                <tr key={month.key} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="sticky left-0 z-10 bg-card px-5 py-2 font-medium">{month.label}</td>
                  {METRICS.map(m => {
                    const val = overrides[month.key]?.[m.key];
                    return (
                      <td key={m.key} className="px-3 py-2 text-right">
                        <Input
                          type="number"
                          value={val ?? ''}
                          placeholder={String(targets[m.key])}
                          onChange={e =>
                            setOverride(
                              month.key,
                              m.key,
                              e.target.value === '' ? undefined : Number(e.target.value)
                            )
                          }
                          className="h-8 text-right tabular-nums"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
