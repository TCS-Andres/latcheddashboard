import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  ComposedChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Heart, Sparkles, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { KpiCard } from '@/components/KpiCard';
import { SectionCard } from '@/components/SectionCard';
import { Badge } from '@/components/ui/Badge';
import { useAsyncData } from '@/hooks/useAsyncData';
import {
  fetchConsultationsMonthly,
  fetchAcquisitionFunnel,
  fetchSourceMix,
  fetchRevenueMonthly,
  fetchProviderReferrals,
  fetchReviewsSummary,
} from '@/lib/data';
import { activeClient } from '@/config/clients';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';
import { useActuals, useTargets, overlayActuals } from '@/lib/store/targets';

const SOURCE_COLORS = [
  'hsl(5, 73%, 65%)',
  'hsl(20, 14%, 30%)',
  'hsl(5, 60%, 80%)',
  'hsl(200, 30%, 55%)',
  'hsl(40, 60%, 60%)',
  'hsl(280, 30%, 60%)',
  'hsl(160, 30%, 55%)',
];

export function ExecutiveOverview() {
  const { data: consultations } = useAsyncData(() => fetchConsultationsMonthly(), []);
  const { data: funnel } = useAsyncData(() => fetchAcquisitionFunnel(), []);
  const { data: sourceMix } = useAsyncData(() => fetchSourceMix(), []);
  const { data: revenue } = useAsyncData(() => fetchRevenueMonthly(), []);
  const { data: referrals } = useAsyncData(() => fetchProviderReferrals(), []);
  const { data: reviews } = useAsyncData(() => fetchReviewsSummary(), []);

  const { targets } = useTargets();
  const { actuals } = useActuals();

  const consultationsWithActuals = consultations
    ? overlayActuals(consultations.data, actuals, 'consultationsBooked')
    : [];

  const last = consultationsWithActuals.at(-1)?.value ?? 0;
  const prev = consultationsWithActuals.at(-2)?.value ?? 0;

  const lastRevenue = revenue?.at(-1)?.revenue ?? 0;
  const prevRevenue = revenue?.at(-2)?.revenue ?? 0;
  const ttmRevenue = revenue ? revenue.reduce((s, p) => s + p.revenue, 0) : 0;

  const lastReferrals = referrals?.data.at(-1)?.value ?? 0;
  const prevReferrals = referrals?.data.at(-2)?.value ?? 0;

  const totalConsults = funnel?.find(f => f.key === 'booked')?.value ?? 0;
  const totalProcedures = funnel?.find(f => f.key === 'procedure')?.value ?? 0;
  const consultToProcedure = totalConsults > 0 ? totalProcedures / totalConsults : 0;

  // Combined chart: revenue (bar) + consultations (line) for the last 12 months.
  const trendData =
    revenue && consultations
      ? revenue.map((r, i) => ({
          label: r.label,
          revenue: r.revenue,
          consultations: consultations.data[i]?.value ?? 0,
        }))
      : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Overview"
        description={`How is marketing working for ${activeClient.name} this month?`}
        actions={
          <Badge variant="default" className="gap-1">
            <Sparkles className="h-3 w-3" /> Mock data — ready for real integrations
          </Badge>
        }
      />

      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Consultations booked"
          value={formatNumber(last)}
          delta={{ current: last, prior: prev }}
          helper={`Target ${formatNumber(targets.consultationsBooked)} / month`}
          sparkData={consultationsWithActuals.slice(-12).map(d => ({ value: d.value }))}
        />
        <KpiCard
          label="Monthly revenue"
          value={formatCurrency(lastRevenue)}
          delta={{ current: lastRevenue, prior: prevRevenue }}
          helper={`Target ${formatCurrency(targets.revenue)} / month`}
          sparkData={revenue?.slice(-12).map(d => ({ value: d.revenue })) ?? []}
        />
        <KpiCard
          label="Provider referrals"
          value={formatNumber(lastReferrals)}
          delta={{ current: lastReferrals, prior: prevReferrals }}
          helper={`Target ${formatNumber(targets.providerReferrals)} / month`}
          sparkData={referrals?.data.slice(-12).map(d => ({ value: d.value })) ?? []}
        />
        <KpiCard
          label="Consult → Release rate"
          value={formatPercent(consultToProcedure, 0)}
          helper={`${formatNumber(totalProcedures)} of ${formatNumber(totalConsults)} consults`}
        />
      </div>

      {/* Trend chart + Signals */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Revenue + Consultations — Last 12 months"
          description="Bars = monthly revenue · Line = consultations booked"
          className="lg:col-span-2"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <YAxis
                  yAxisId="left"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number, name) =>
                    name === 'revenue' ? formatCurrency(v) : formatNumber(v)
                  }
                />
                <Bar yAxisId="left" dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="consultations"
                  stroke="hsl(20, 14%, 25%)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: 'hsl(20, 14%, 25%)' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Trailing-12-month revenue: <strong className="text-foreground">{formatCurrency(ttmRevenue)}</strong></span>
            <span>{reviews && <>★ {reviews.average} ({formatNumber(reviews.total)} Google reviews)</>}</span>
          </div>
        </SectionCard>

        <SectionCard
          title="Signals"
          description="Where to focus this week"
          actions={<Heart className="h-4 w-4 text-primary" />}
        >
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                Provider referrals are the #1 source of consults. Keep the lactation-consultant
                outreach cadence on a weekly drumbeat.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                Quiz funnel completions convert at <strong>~45%</strong> to a consult booking — best in class.
                Push it harder in the Meta ad rotation.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                Pacifier workshop attendees show low downstream conversion. Tighten the post-attend
                ManyChat sequence with a clear next step.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                Google reviews are growing but post-procedure ask rate is inconsistent. Build it
                into the post-op check-in.
              </span>
            </li>
          </ul>
        </SectionCard>
      </div>

      {/* Funnel + Source mix */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Acquisition funnel — Last 30 days"
          description="Aggregate counts. Per-family detail lives in ClientSecure."
          className="lg:col-span-2"
        >
          <div className="space-y-2">
            {funnel?.map((stage, i) => {
              const max = funnel[0].value;
              const width = (stage.value / max) * 100;
              return (
                <div key={stage.key} className="rounded-md border bg-card/60 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{stage.label}</span>
                    <span className="text-muted-foreground">
                      {formatNumber(stage.value)}
                      {stage.rate !== undefined && (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs">
                          <TrendingUp className="h-3 w-3" />
                          {formatPercent(stage.rate, 1)} conv.
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${width}%`, opacity: 1 - i * 0.1 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          title="Source mix"
          description="Where new families are coming from"
        >
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceMix ?? []}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                  stroke="hsl(var(--card))"
                  strokeWidth={2}
                >
                  {(sourceMix ?? []).map((_, i) => (
                    <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => formatNumber(v)}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
