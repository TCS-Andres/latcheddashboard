import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { KpiCard } from '@/components/KpiCard';
import { useAsyncData } from '@/hooks/useAsyncData';
import {
  fetchAcquisitionFunnel,
  fetchConsultationsMonthly,
  fetchInquiriesMonthly,
  fetchProceduresMonthly,
  fetchProviderReferrals,
  fetchSourceMix,
} from '@/lib/data';
import { activeClient } from '@/config/clients';
import { formatNumber, formatPercent } from '@/lib/utils';
import { useActuals, overlayActuals } from '@/lib/store/targets';

const SOURCE_COLORS = [
  'hsl(5, 73%, 65%)',
  'hsl(20, 14%, 30%)',
  'hsl(5, 60%, 80%)',
  'hsl(200, 30%, 55%)',
  'hsl(40, 60%, 60%)',
  'hsl(280, 30%, 60%)',
  'hsl(160, 30%, 55%)',
];

export function Acquisition() {
  const { data: consultations } = useAsyncData(() => fetchConsultationsMonthly(), []);
  const { data: inquiries } = useAsyncData(() => fetchInquiriesMonthly(), []);
  const { data: procedures } = useAsyncData(() => fetchProceduresMonthly(), []);
  const { data: referrals } = useAsyncData(() => fetchProviderReferrals(), []);
  const { data: sourceMix } = useAsyncData(() => fetchSourceMix(), []);
  const { data: funnel } = useAsyncData(() => fetchAcquisitionFunnel(), []);
  const { actuals } = useActuals();

  const consultationsOverlay = consultations
    ? overlayActuals(consultations.data, actuals, 'consultationsBooked')
    : [];
  const proceduresOverlay = procedures
    ? overlayActuals(procedures.data, actuals, 'procedures')
    : [];

  const lastInquiries = inquiries?.data.at(-1)?.value ?? 0;
  const prevInquiries = inquiries?.data.at(-2)?.value ?? 0;
  const lastConsults = consultationsOverlay.at(-1)?.value ?? 0;
  const prevConsults = consultationsOverlay.at(-2)?.value ?? 0;
  const lastRefs = referrals?.data.at(-1)?.value ?? 0;
  const prevRefs = referrals?.data.at(-2)?.value ?? 0;

  const inquiryToConsult =
    funnel
      ? (funnel.find(f => f.key === 'booked')?.value ?? 0) /
        Math.max(1, funnel.find(f => f.key === 'inquiry')?.value ?? 1)
      : 0;

  // Stacked composition chart — synthetic, weights per month for a realistic mix.
  const stackedData = consultationsOverlay.map((m, i) => {
    const weights = [0.32, 0.22, 0.18, 0.14, 0.06, 0.05, 0.03];
    const noise = ((i % 5) - 2) * 0.01;
    return {
      label: m.label,
      ...Object.fromEntries(
        activeClient.acquisitionSources.map((s, j) => [
          s.key,
          Math.round(m.value * Math.max(0, weights[j] + (j === 0 ? noise : -noise / 2))),
        ])
      ),
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Family Acquisition"
        description="From first touch to consultation booking — where are new families coming from?"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="New inquiries / mo"
          value={formatNumber(lastInquiries)}
          delta={{ current: lastInquiries, prior: prevInquiries }}
          sparkData={inquiries?.data.map(d => ({ value: d.value })) ?? []}
        />
        <KpiCard
          label="Consultations booked"
          value={formatNumber(lastConsults)}
          delta={{ current: lastConsults, prior: prevConsults }}
          sparkData={consultationsOverlay.map(d => ({ value: d.value }))}
        />
        <KpiCard
          label="Inquiry → Consult rate"
          value={formatPercent(inquiryToConsult, 0)}
          helper="Top-funnel quality"
        />
        <KpiCard
          label="Provider referrals / mo"
          value={formatNumber(lastRefs)}
          delta={{ current: lastRefs, prior: prevRefs }}
          sparkData={referrals?.data.map(d => ({ value: d.value })) ?? []}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Monthly new consultations — Last 12 months"
          description="Bars darken where you've entered actual numbers in the Data tab."
          className="lg:col-span-2"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consultationsOverlay} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => formatNumber(v)}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {consultationsOverlay.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d._isActual ? 'hsl(5, 80%, 55%)' : 'hsl(var(--primary))'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Source mix" description="Trailing 30 days">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceMix ?? []}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={40}
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
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => formatNumber(v)}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Composition over time"
          description="Stacked source mix per month"
          className="lg:col-span-2"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stackedData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => formatNumber(v)}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                {activeClient.acquisitionSources.map((s, i) => (
                  <Area
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    stackId="src"
                    name={s.label}
                    stroke={SOURCE_COLORS[i % SOURCE_COLORS.length]}
                    fill={SOURCE_COLORS[i % SOURCE_COLORS.length]}
                    fillOpacity={0.85}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="Releases performed / month"
          description="Procedures following consultations"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={proceduresOverlay} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => formatNumber(v)}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
