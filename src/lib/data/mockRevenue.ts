import { generateSeries, seededRng } from './mockUtils';
import type { MonthlySeries, PacingResult, RevenuePoint } from './types';
import { activeClient } from '@/config/clients';

// Per-procedure average case value (consultation + CO2 laser release + post-op).
// Believable band for a specialty cash-pay practice. Adjustable via Data tab.
export const DEFAULT_AVERAGE_CASE_VALUE = 2400;

export async function fetchRevenueMonthly(months = 12): Promise<RevenuePoint[]> {
  const procedures = generateSeries({
    seedKey: 'revenue.procedures',
    months,
    base: 16,
    drift: 0.022,
    seasonality: 0.09,
  });
  const rng = seededRng('revenue.acv');
  return procedures.map(p => {
    const acv = DEFAULT_AVERAGE_CASE_VALUE * (1 + (rng() * 0.12 - 0.04));
    return {
      month: p.month,
      label: p.label,
      procedures: p.value,
      averageCaseValue: Math.round(acv),
      revenue: Math.round(p.value * acv),
    };
  });
}

export async function fetchRevenueBySource(): Promise<{ source: string; revenue: number }[]> {
  const rng = seededRng('revenue.by-source');
  const mix = [
    { source: 'Provider Referral', weight: 0.34 },
    { source: 'Word of Mouth', weight: 0.24 },
    { source: 'Instagram (organic)', weight: 0.16 },
    { source: 'Google Search', weight: 0.13 },
    { source: 'Meta Ads', weight: 0.08 },
    { source: 'Other', weight: 0.05 },
  ];
  const total = 42_000 + Math.floor(rng() * 8_000);
  return mix.map(m => ({ source: m.source, revenue: Math.round(total * m.weight) }));
}

export async function fetchAverageCaseValueMonthly(months = 12): Promise<MonthlySeries> {
  const data = generateSeries({
    seedKey: 'avg-case-value',
    months,
    base: DEFAULT_AVERAGE_CASE_VALUE,
    drift: 0.006,
    seasonality: 0.03,
    noise: 0.04,
  });
  return { key: 'avg_case_value', label: 'Average Case Value', data };
}

// Month-to-date pacing for a target. Wires through to user-entered actuals later.
export function computePacing(
  actualToDate: number,
  monthlyTarget: number,
  now: Date = new Date()
): PacingResult {
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysElapsed = Math.min(now.getDate(), daysInMonth);
  const projectedEndOfMonth = daysElapsed === 0
    ? 0
    : Math.round((actualToDate / daysElapsed) * daysInMonth);
  return {
    monthLabel: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    target: monthlyTarget,
    actualToDate,
    projectedEndOfMonth,
    daysElapsed,
    daysInMonth,
    onPace: projectedEndOfMonth >= monthlyTarget,
  };
}

export async function fetchCurrentMonthPacing(): Promise<{
  revenue: PacingResult;
  consultations: PacingResult;
  procedures: PacingResult;
}> {
  // Mock "actual-to-date" — a partial run through the month.
  const now = new Date();
  const fraction = (now.getDate() / new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate());
  const rng = seededRng('pacing');
  const variance = 0.92 + rng() * 0.15; // a touch ahead or behind pace
  return {
    revenue: computePacing(
      Math.round(activeClient.targets.revenue * fraction * variance),
      activeClient.targets.revenue,
      now
    ),
    consultations: computePacing(
      Math.round(activeClient.targets.consultationsBooked * fraction * variance),
      activeClient.targets.consultationsBooked,
      now
    ),
    procedures: computePacing(
      Math.round(activeClient.targets.procedures * fraction * (variance + 0.02)),
      activeClient.targets.procedures,
      now
    ),
  };
}
