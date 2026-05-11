import { generateSeries, seededRng } from './mockUtils';
import type { CampaignRow, MonthlySeries } from './types';

// Meta-only for MVP. Structure supports adding Google/TikTok later.
export async function fetchCampaigns(): Promise<CampaignRow[]> {
  const rng = seededRng('campaigns');
  const campaigns: Omit<CampaignRow, 'cpi' | 'cpc' | 'ctr' | 'roas'>[] = [
    {
      id: 'meta-awareness-q1',
      name: 'Oral-Tie Awareness — Austin Moms',
      status: 'active',
      channel: 'meta',
      spend: 1850,
      impressions: 142_300,
      clicks: 2_180,
      inquiries: 78,
      consultations: 24,
    },
    {
      id: 'meta-quiz-lead',
      name: 'Quiz Funnel — Symptom Checker',
      status: 'active',
      channel: 'meta',
      spend: 1240,
      impressions: 88_700,
      clicks: 1_640,
      inquiries: 92,
      consultations: 31,
    },
    {
      id: 'meta-pacifier-webinar',
      name: 'Pacifier Workshop — Lead Magnet',
      status: 'active',
      channel: 'meta',
      spend: 680,
      impressions: 54_100,
      clicks: 980,
      inquiries: 41,
      consultations: 11,
    },
    {
      id: 'meta-retarget',
      name: 'Retargeting — Website Visitors',
      status: 'active',
      channel: 'meta',
      spend: 420,
      impressions: 32_900,
      clicks: 720,
      inquiries: 28,
      consultations: 14,
    },
    {
      id: 'meta-provider-coaching',
      name: 'Provider Coaching — Lookalike',
      status: 'paused',
      channel: 'meta',
      spend: 310,
      impressions: 22_100,
      clicks: 280,
      inquiries: 9,
      consultations: 2,
    },
  ];

  const avgCaseValue = 2400;
  return campaigns.map(c => {
    const ctr = c.clicks / c.impressions;
    const cpi = c.inquiries > 0 ? c.spend / c.inquiries : 0;
    const cpc = c.clicks > 0 ? c.spend / c.clicks : 0;
    // ROAS uses consultation→procedure assumption of ~60% for booking-channel revenue.
    const revenue = c.consultations * 0.6 * avgCaseValue;
    const roas = c.spend > 0 ? revenue / c.spend : 0;
    // tiny jitter to keep numbers stable but non-flat
    const jitter = 1 + (rng() - 0.5) * 0.04;
    return {
      ...c,
      ctr: Number((ctr * jitter).toFixed(4)),
      cpi: Math.round(cpi * jitter),
      cpc: Number((cpc * jitter).toFixed(2)),
      roas: Number((roas / c.spend > 0 ? roas * jitter : 0).toFixed(2)),
    };
  });
}

export async function fetchAdSpendMonthly(months = 12): Promise<MonthlySeries> {
  const data = generateSeries({
    seedKey: 'ad-spend',
    months,
    base: 4200,
    drift: 0.03,
    seasonality: 0.06,
  });
  return { key: 'ad_spend', label: 'Meta Spend', data };
}

export async function fetchAdInquiriesMonthly(months = 12): Promise<MonthlySeries> {
  const data = generateSeries({
    seedKey: 'ad-inquiries',
    months,
    base: 210,
    drift: 0.035,
    seasonality: 0.1,
  });
  return { key: 'ad_inquiries', label: 'Inquiries from Ads', data };
}
