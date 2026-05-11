export interface DateRange {
  from: Date;
  to: Date;
}

export interface MonthlyPoint {
  month: string;       // 'YYYY-MM'
  label: string;       // 'Jan 2026'
  value: number;
}

export interface MonthlySeries {
  key: string;
  label: string;
  data: MonthlyPoint[];
}

export interface KpiSummary {
  consultationsBooked: number;
  consultationsAttended: number;
  procedures: number;
  revenue: number;
  cpa: number;
  inquiries: number;
  providerReferrals: number;
  consultToProcedure: number;        // 0..1
  inquiryToConsult: number;          // 0..1
  averageCaseValue: number;
  reach: number;
}

export interface DeltaKpi {
  current: number;
  prior: number;
}

export interface FunnelDatum {
  key: string;
  label: string;
  value: number;
  rate?: number; // conversion rate vs prior step (0..1)
}

export interface SourceMixDatum {
  key: string;
  label: string;
  value: number;
}

export interface CampaignRow {
  id: string;
  name: string;
  status: 'active' | 'paused';
  channel: 'meta' | 'google' | 'tiktok';
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  inquiries: number;
  consultations: number;
  cpi: number;  // cost per inquiry
  cpc: number;
  roas: number;
}

export interface SocialChannelMetrics {
  channel: 'instagram' | 'facebook' | 'tiktok' | 'youtube';
  followers: number;
  followersDelta: number;     // vs prior period
  reach: number;
  impressions: number;
  engagementRate: number;     // 0..1
  posts: number;
}

export interface TopPost {
  id: string;
  channel: 'instagram' | 'facebook';
  date: string;               // YYYY-MM-DD
  snippet: string;
  reach: number;
  engagementRate: number;
  engagements: number;
  // No commenter handles, no per-user identifiers. Aggregated only.
}

export interface RevenuePoint {
  month: string;
  label: string;
  revenue: number;
  procedures: number;
  averageCaseValue: number;
}

export interface PacingResult {
  monthLabel: string;
  target: number;
  actualToDate: number;
  projectedEndOfMonth: number;
  daysElapsed: number;
  daysInMonth: number;
  onPace: boolean;
}
