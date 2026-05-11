import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CalendarClock, Target as TargetIcon } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { KpiCard } from '@/components/KpiCard';
import { useAsyncData } from '@/hooks/useAsyncData';
import {
  fetchAverageCaseValueMonthly,
  fetchCurrentMonthPacing,
  fetchRevenueBySource,
  fetchRevenueMonthly,
} from '@/lib/data';
import { useActuals, overlayActuals, useTargets } from '@/lib/store/targets';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';

export function Revenue() {
  const { data: revenue } = useAsyncData(() => fetchRevenueMonthly(), []);
  const { data: bySource } = useAsyncData(() => fetchRevenueBySource(), []);
  const { data: acv } = useAsyncData(() => fetchAverageCaseValueMonthly(), []);
  const { data: pacing } = useAsyncData(() => fetchCurrentMonthPacing(), []);
  const { actuals } = useActuals();
  const { targets } = useTargets();

  const lastRevenue = revenue?.at(-1)?.revenue ?? 0;
  const prevRevenue = revenue?.at(-2)?.revenue ?? 0;
  const ttm = revenue ? revenue.reduce((s, r) => s + r.revenue, 0) : 0;
  const ttmProcedures = revenue ? revenue.reduce((s, r) => s + r.procedures, 0) : 0;
  const blendedAcv = ttmProcedures > 0 ? ttm / ttmProcedures : 0;

  // ACV overlay
  const acvOverlay = acv ? overlayActuals(acv.data, actuals, 'procedures') : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue & Financials"
        description="Cash-pay specialty practice — revenue, average case value, and month-to-date pacing."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Revenue this month"
          value={formatCurrency(lastRevenue)}
          delta={{ current: lastRevenue, prior: prevRevenue }}
          helper={`Target ${formatCurrency(targets.revenue)} / month`}
          sparkData={revenue?.map(r => ({ value: r.revenue })) ?? []}
        />
        <KpiCard
          label="Trailing 12-mo revenue"
          value={formatCurrency(ttm)}
          helper={`${formatNumber(ttmProcedures)} releases performed`}
        />
        <KpiCard
          label="Average case value"
          value={formatCurrency(blendedAcv)}
          helper="Consultation + release + post-op"
          sparkData={acv?.data.map(d => ({ value: d.value })) ?? []}
        />
        <KpiCard
          label="MTD pacing"
          value={pacing ? formatPercent(pacing.revenue.actualToDate / pacing.revenue.target, 0) : '—'}
          helper={
            pacing
              ? `${formatCurrency(pacing.revenue.actualToDate)} of ${formatCurrency(pacing.revenue.target)}`
              : 'Loading'
          }
        />
      </div>

      {/* Pacing card */}
      <SectionCard
        title={pacing ? `${pacing.revenue.monthLabel} pacing` : 'Month-to-date pacing'}
        description="Edit monthly targets via the Targets button in the top bar."
        actions={<CalendarClock className="h-4 w-4 text-muted-foreground" />}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {pacing && (
            <>
              <PacingTile label="Revenue" p={pacing.revenue} formatter={formatCurrency} />
              <PacingTile label="Consultations booked" p={pacing.consultations} formatter={formatNumber} />
              <PacingTile label="Releases performed" p={pacing.procedures} formatter={formatNumber} />
            </>
          )}
        </div>
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Monthly revenue — Last 12 months"
          description="Bars highlight months where you have entered actual numbers."
          className="lg:col-span-2"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue ?? []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => formatCurrency(v)}
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                  {(revenue ?? []).map((r, i) => {
                    const hasActual = actuals[r.month]?.revenue !== undefined;
                    return <Cell key={i} fill={hasActual ? 'hsl(5, 80%, 55%)' : 'hsl(var(--primary))'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Revenue by source — Last 30 days">
          <ul className="space-y-2.5">
            {bySource?.map((row, i) => {
              const max = bySource[0].revenue;
              return (
                <li key={row.source}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>{row.source}</span>
                    <span className="font-medium">{formatCurrency(row.revenue)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(row.revenue / max) * 100}%`, opacity: 1 - i * 0.08 }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </SectionCard>
      </div>

      <SectionCard
        title="Average case value trend"
        description="Including consult, release, and post-op care."
      >
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={acvOverlay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickFormatter={v => `$${(v / 1000).toFixed(1)}k`}
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 100', 'dataMax + 100']}
              />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => formatCurrency(v)}
              />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>
    </div>
  );
}

function PacingTile({
  label,
  p,
  formatter,
}: {
  label: string;
  p: { target: number; actualToDate: number; projectedEndOfMonth: number; daysElapsed: number; daysInMonth: number; onPace: boolean };
  formatter: (n: number) => string;
}) {
  const pct = Math.min(1, p.actualToDate / Math.max(1, p.target));
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="uppercase tracking-wide">{label}</span>
        <span className={p.onPace ? 'text-emerald-600' : 'text-amber-600'}>
          {p.onPace ? 'On pace' : 'Behind'}
        </span>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-2">
        <p className="font-display text-2xl leading-none">{formatter(p.actualToDate)}</p>
        <span className="text-xs text-muted-foreground">of {formatter(p.target)}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${p.onPace ? 'bg-emerald-500' : 'bg-amber-500'}`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          <TargetIcon className="mr-1 inline h-3 w-3" />
          Projected: <strong className="text-foreground">{formatter(p.projectedEndOfMonth)}</strong>
        </span>
        <span>
          Day {p.daysElapsed}/{p.daysInMonth}
        </span>
      </div>
    </div>
  );
}
