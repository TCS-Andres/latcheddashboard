import { activeClient } from '@/config/clients';
import { generateSeries, seededRng } from './mockUtils';
import type { FunnelDatum, MonthlySeries, SourceMixDatum } from './types';

// Aggregated counts only. No per-family identifiers, no PHI.

export async function fetchNewFamiliesMonthly(months = 12): Promise<MonthlySeries> {
  const data = generateSeries({
    seedKey: 'families.new',
    months,
    base: 22,
    drift: 0.025,
    seasonality: 0.12,
  });
  return { key: 'new_families', label: `New ${activeClient.vocabulary.customerPlural}`, data };
}

export async function fetchConsultationsMonthly(months = 12): Promise<MonthlySeries> {
  const data = generateSeries({
    seedKey: 'consultations.booked',
    months,
    base: 32,
    drift: 0.022,
    seasonality: 0.10,
  });
  return { key: 'consultations', label: 'Consultations Booked', data };
}

export async function fetchProceduresMonthly(months = 12): Promise<MonthlySeries> {
  const data = generateSeries({
    seedKey: 'procedures.completed',
    months,
    base: 16,
    drift: 0.02,
    seasonality: 0.09,
  });
  return { key: 'procedures', label: 'Releases Performed', data };
}

export async function fetchInquiriesMonthly(months = 12): Promise<MonthlySeries> {
  const data = generateSeries({
    seedKey: 'inquiries',
    months,
    base: 78,
    drift: 0.03,
    seasonality: 0.15,
  });
  return { key: 'inquiries', label: 'Inquiries', data };
}

export async function fetchAcquisitionFunnel(): Promise<FunnelDatum[]> {
  // Last-30-days snapshot. Real implementation: aggregate from CRM + analytics.
  const rng = seededRng('funnel');
  const reach = 42_500 + Math.floor(rng() * 5000);
  const engaged = Math.round(reach * (0.16 + rng() * 0.04));
  const inquiries = Math.round(engaged * (0.085 + rng() * 0.02));
  const booked = Math.round(inquiries * (0.45 + rng() * 0.05));
  const attended = Math.round(booked * (0.85 + rng() * 0.06));
  const procedures = Math.round(attended * (0.62 + rng() * 0.06));

  const stages = [
    { key: 'reach', label: 'Reach (IG + Web)', value: reach },
    { key: 'engagement', label: 'Engaged Sessions', value: engaged },
    { key: 'inquiry', label: 'Inquiries', value: inquiries },
    { key: 'booked', label: 'Consultations Booked', value: booked },
    { key: 'attended', label: 'Consultations Attended', value: attended },
    { key: 'procedure', label: 'Releases Performed', value: procedures },
  ];

  return stages.map((s, i) => ({
    ...s,
    rate: i === 0 ? undefined : s.value / stages[i - 1].value,
  }));
}

export async function fetchSourceMix(): Promise<SourceMixDatum[]> {
  const rng = seededRng('source-mix');
  const weights: Record<string, number> = {
    referral_provider: 0.32,
    referral_word_of_mouth: 0.22,
    instagram: 0.18,
    google: 0.14,
    facebook: 0.06,
    quiz: 0.05,
    other: 0.03,
  };
  const total = 132 + Math.floor(rng() * 18);
  return activeClient.acquisitionSources.map(s => ({
    ...s,
    value: Math.round(total * (weights[s.key] ?? 0.02)),
  }));
}

export async function fetchProviderReferrals(months = 12): Promise<MonthlySeries> {
  const data = generateSeries({
    seedKey: 'provider-referrals',
    months,
    base: 11,
    drift: 0.04,
    seasonality: 0.1,
  });
  return { key: 'provider_referrals', label: 'Provider Referrals', data };
}
