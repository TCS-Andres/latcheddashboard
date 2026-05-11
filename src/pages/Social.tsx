import { useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Heart, Instagram, Facebook } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { KpiCard } from '@/components/KpiCard';
import { Badge } from '@/components/ui/Badge';
import { cn, formatNumber, formatPercent } from '@/lib/utils';
import { useAsyncData } from '@/hooks/useAsyncData';
import {
  fetchEngagementMonthly,
  fetchFollowersMonthly,
  fetchLeadMagnetDownloads,
  fetchManychatEngagement,
  fetchSocialChannelMetrics,
  fetchTopPosts,
} from '@/lib/data';

const CHANNELS = [
  { key: 'instagram', label: 'Instagram', icon: Instagram },
  { key: 'facebook', label: 'Facebook', icon: Facebook },
  { key: 'all', label: 'All channels', icon: Heart },
] as const;

export function Social() {
  const [channel, setChannel] = useState<(typeof CHANNELS)[number]['key']>('instagram');
  const { data: channels } = useAsyncData(() => fetchSocialChannelMetrics(), []);
  const activeMetric = channels?.find(c => c.channel === channel);

  const { data: followers } = useAsyncData(
    () => fetchFollowersMonthly(channel === 'all' ? 'instagram' : channel),
    [channel]
  );
  const { data: engagement } = useAsyncData(
    () => fetchEngagementMonthly(channel === 'all' ? 'instagram' : channel),
    [channel]
  );

  const { data: manychat } = useAsyncData(() => fetchManychatEngagement(), []);
  const { data: leadMagnets } = useAsyncData(() => fetchLeadMagnetDownloads(), []);
  const { data: posts } = useAsyncData(() => fetchTopPosts(), []);
  const channelPosts = posts?.filter(p => channel === 'all' || p.channel === channel) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Social Media"
        description="Instagram is the primary content engine. Facebook is secondary."
      />

      <div className="flex flex-wrap gap-2">
        {CHANNELS.map(c => (
          <button
            key={c.key}
            onClick={() => setChannel(c.key)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors',
              channel === c.key
                ? 'border-primary bg-primary/10 text-primary'
                : 'bg-card text-muted-foreground hover:bg-accent'
            )}
          >
            <c.icon className="h-3.5 w-3.5" />
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={channel === 'all' ? 'Total followers' : 'Followers'}
          value={formatNumber(
            channel === 'all'
              ? (channels?.reduce((s, c) => s + c.followers, 0) ?? 0)
              : (activeMetric?.followers ?? 0)
          )}
          helper={
            channel === 'all'
              ? `Across ${channels?.length ?? 0} channels`
              : `+${formatNumber(activeMetric?.followersDelta ?? 0)} this month`
          }
        />
        <KpiCard
          label="Reach"
          value={formatNumber(activeMetric?.reach ?? channels?.reduce((s, c) => s + c.reach, 0) ?? 0)}
          helper="Unique accounts reached, last 30 days"
        />
        <KpiCard
          label="Engagement rate"
          value={formatPercent(activeMetric?.engagementRate ?? 0.034, 1)}
          helper="Industry healthy band: 1-3%"
        />
        <KpiCard
          label="Posts published"
          value={formatNumber(activeMetric?.posts ?? channels?.reduce((s, c) => s + c.posts, 0) ?? 0)}
          helper="Last 30 days"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Follower growth — Last 12 months"
          description={channel === 'all' ? 'Instagram trend shown' : undefined}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={followers?.data ?? []} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => formatNumber(v)}
                />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="Engagement rate trend"
          description="Engagements / reach, monthly"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagement?.data ?? []} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickFormatter={v => `${v.toFixed(1)}%`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => `${v.toFixed(2)}%`}
                />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Top posts — last 30 days"
          description="Aggregated counts only · No commenter handles shown"
        >
          <ul className="space-y-3">
            {channelPosts.map(post => (
              <li key={post.id} className="rounded-md border bg-card/60 p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {post.channel === 'instagram' ? (
                    <Instagram className="h-3 w-3" />
                  ) : (
                    <Facebook className="h-3 w-3" />
                  )}
                  <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
                <p className="mt-1.5 text-sm leading-snug">{post.snippet}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant="muted">Reach {formatNumber(post.reach)}</Badge>
                  <Badge variant="muted">{formatPercent(post.engagementRate, 1)} engagement</Badge>
                  <Badge variant="muted">{formatNumber(post.engagements)} engagements</Badge>
                </div>
              </li>
            ))}
            {channelPosts.length === 0 && (
              <li className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                No top posts in this view.
              </li>
            )}
          </ul>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard
            title="ManyChat keyword triggers"
            description="Resource delivery from Instagram DMs"
          >
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={manychat?.data ?? []} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                  />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard
            title="Lead magnet downloads"
            description="Checklist + pacifier workshop"
          >
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={leadMagnets?.data ?? []} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                  />
                  <Line type="monotone" dataKey="value" stroke="hsl(20, 14%, 30%)" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
