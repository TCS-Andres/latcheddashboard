import { generateSeries, seededRng } from './mockUtils';
import type { MonthlySeries, SocialChannelMetrics, TopPost } from './types';

export async function fetchSocialChannelMetrics(): Promise<SocialChannelMetrics[]> {
  const rng = seededRng('social-channels');
  const base: SocialChannelMetrics[] = [
    {
      channel: 'instagram',
      followers: 8240,
      followersDelta: 312,
      reach: 84_500,
      impressions: 124_300,
      engagementRate: 0.046,
      posts: 22,
    },
    {
      channel: 'facebook',
      followers: 2180,
      followersDelta: 41,
      reach: 18_200,
      impressions: 26_700,
      engagementRate: 0.022,
      posts: 14,
    },
  ];
  return base.map(c => ({
    ...c,
    reach: Math.round(c.reach * (1 + (rng() - 0.5) * 0.04)),
  }));
}

export async function fetchFollowersMonthly(channel: 'instagram' | 'facebook', months = 12): Promise<MonthlySeries> {
  const base = channel === 'instagram' ? 7100 : 1980;
  const data = generateSeries({
    seedKey: `followers.${channel}`,
    months,
    base,
    drift: 0.018,
    seasonality: 0.01,
    noise: 0.005,
  });
  return {
    key: `followers_${channel}`,
    label: `${channel === 'instagram' ? 'Instagram' : 'Facebook'} Followers`,
    data,
  };
}

export async function fetchEngagementMonthly(channel: 'instagram' | 'facebook', months = 12): Promise<MonthlySeries> {
  const base = channel === 'instagram' ? 4.6 : 2.2;
  const data = generateSeries({
    seedKey: `engagement.${channel}`,
    months,
    base,
    drift: 0.005,
    seasonality: 0.08,
    noise: 0.12,
    round: false,
  });
  return {
    key: `engagement_${channel}`,
    label: 'Engagement Rate (%)',
    data: data.map(d => ({ ...d, value: Number(d.value.toFixed(2)) })),
  };
}

// Top posts — content snippets + aggregated metrics only.
// No commenter handles, no per-user identifiers (per privacy posture).
export async function fetchTopPosts(): Promise<TopPost[]> {
  return [
    {
      id: 'p1',
      channel: 'instagram',
      date: '2026-04-18',
      snippet: '5 signs your baby may have a tongue tie — what to look for at feeding time…',
      reach: 18_400,
      engagementRate: 0.082,
      engagements: 1_509,
    },
    {
      id: 'p2',
      channel: 'instagram',
      date: '2026-04-09',
      snippet: 'A mom\'s real story: from latch pain to a happy, well-fed baby.',
      reach: 14_100,
      engagementRate: 0.071,
      engagements: 1_001,
    },
    {
      id: 'p3',
      channel: 'instagram',
      date: '2026-03-27',
      snippet: 'Why we use the LightScalpel CO2 laser — the gold standard for releases.',
      reach: 11_800,
      engagementRate: 0.058,
      engagements: 684,
    },
    {
      id: 'p4',
      channel: 'facebook',
      date: '2026-04-12',
      snippet: 'Free pacifier workshop replay — when pacifiers help and when they hurt.',
      reach: 6_900,
      engagementRate: 0.041,
      engagements: 283,
    },
    {
      id: 'p5',
      channel: 'instagram',
      date: '2026-03-15',
      snippet: 'Moms helping moms — meet our all-mom team behind every visit.',
      reach: 9_700,
      engagementRate: 0.063,
      engagements: 611,
    },
  ];
}

export async function fetchManychatEngagement(months = 12): Promise<MonthlySeries> {
  const data = generateSeries({
    seedKey: 'manychat',
    months,
    base: 380,
    drift: 0.05,
    seasonality: 0.08,
  });
  return { key: 'manychat', label: 'ManyChat Triggers', data };
}

export async function fetchLeadMagnetDownloads(months = 12): Promise<MonthlySeries> {
  const data = generateSeries({
    seedKey: 'lead-magnets',
    months,
    base: 92,
    drift: 0.04,
    seasonality: 0.1,
  });
  return { key: 'lead_magnets', label: 'Resource Downloads', data };
}
