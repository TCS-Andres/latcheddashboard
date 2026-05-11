import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { KpiCard } from '@/components/KpiCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAsyncData } from '@/hooks/useAsyncData';
import {
  fetchAdInquiriesMonthly,
  fetchAdSpendMonthly,
  fetchCampaigns,
} from '@/lib/data';
import { activeClient } from '@/config/clients';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';

export function Ads() {
  const { data: campaigns } = useAsyncData(() => fetchCampaigns(), []);
  const { data: spend } = useAsyncData(() => fetchAdSpendMonthly(), []);
  const { data: inquiries } = useAsyncData(() => fetchAdInquiriesMonthly(), []);

  const lastSpend = spend?.data.at(-1)?.value ?? 0;
  const prevSpend = spend?.data.at(-2)?.value ?? 0;
  const lastInquiries = inquiries?.data.at(-1)?.value ?? 0;
  const prevInquiries = inquiries?.data.at(-2)?.value ?? 0;
  const cpi = lastInquiries > 0 ? lastSpend / lastInquiries : 0;

  const totalSpend = campaigns?.reduce((s, c) => s + c.spend, 0) ?? 0;
  const totalConsults = campaigns?.reduce((s, c) => s + c.consultations, 0) ?? 0;
  const cpc =
    campaigns && campaigns.reduce((s, c) => s + c.clicks, 0) > 0
      ? totalSpend / campaigns.reduce((s, c) => s + c.clicks, 0)
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paid Ads"
        description="Meta-only for now — structured to add Google / TikTok later."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Ad spend / month"
          value={formatCurrency(lastSpend)}
          delta={{ current: lastSpend, prior: prevSpend }}
          sparkData={spend?.data.map(d => ({ value: d.value })) ?? []}
        />
        <KpiCard
          label="Inquiries from ads"
          value={formatNumber(lastInquiries)}
          delta={{ current: lastInquiries, prior: prevInquiries }}
          sparkData={inquiries?.data.map(d => ({ value: d.value })) ?? []}
        />
        <KpiCard
          label="Cost per inquiry"
          value={formatCurrency(cpi)}
          helper="Spend ÷ inquiries"
          invertDelta
        />
        <KpiCard
          label="Blended CPC"
          value={`$${cpc.toFixed(2)}`}
          helper={`${formatNumber(campaigns?.reduce((s, c) => s + c.clicks, 0) ?? 0)} clicks across campaigns`}
        />
      </div>

      <SectionCard
        title="Spend over time"
        description="Monthly Meta ad spend across all campaigns"
      >
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spend?.data ?? []} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="spend-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickFormatter={v => `$${(v / 1000).toFixed(1)}k`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => formatCurrency(v)}
              />
              <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#spend-grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <SectionCard
        title="Campaigns"
        description="Meta · last 30 days"
        actions={
          <Button variant="outline" size="sm" asChild>
            <a
              href={activeClient.privacy.crmDeepLink}
              target="_blank"
              rel="noreferrer"
              className="gap-1"
            >
              View leads in {activeClient.privacy.crmName}
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        }
        bodyClassName="px-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-2 font-medium">Campaign</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 text-right font-medium">Spend</th>
                <th className="px-3 py-2 text-right font-medium">Impr.</th>
                <th className="px-3 py-2 text-right font-medium">CTR</th>
                <th className="px-3 py-2 text-right font-medium">Inquiries</th>
                <th className="px-3 py-2 text-right font-medium">CPI</th>
                <th className="px-3 py-2 text-right font-medium">Consults</th>
                <th className="px-5 py-2 text-right font-medium">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {campaigns?.map(c => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/40">
                  <td className="px-5 py-3 font-medium">{c.name}</td>
                  <td className="px-3 py-3">
                    <Badge variant={c.status === 'active' ? 'success' : 'muted'}>
                      {c.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(c.spend)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatNumber(c.impressions)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatPercent(c.ctr, 2)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatNumber(c.inquiries)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(c.cpi)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatNumber(c.consultations)}</td>
                  <td className="px-5 py-3 text-right tabular-nums font-medium">
                    {c.roas > 0 ? `${c.roas.toFixed(2)}x` : '—'}
                  </td>
                </tr>
              ))}
              {campaigns && (
                <tr className="border-t bg-muted/30 text-xs font-medium">
                  <td className="px-5 py-3">Totals</td>
                  <td className="px-3 py-3" />
                  <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(totalSpend)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {formatNumber(campaigns.reduce((s, c) => s + c.impressions, 0))}
                  </td>
                  <td className="px-3 py-3" />
                  <td className="px-3 py-3 text-right tabular-nums">
                    {formatNumber(campaigns.reduce((s, c) => s + c.inquiries, 0))}
                  </td>
                  <td className="px-3 py-3" />
                  <td className="px-3 py-3 text-right tabular-nums">{formatNumber(totalConsults)}</td>
                  <td className="px-5 py-3" />
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="px-5 pt-3 text-[11px] text-muted-foreground">
          Inquiry detail (names, contact info) lives in {activeClient.privacy.crmName} per the
          dashboard's aggregation-only privacy posture.
        </p>
      </SectionCard>
    </div>
  );
}
