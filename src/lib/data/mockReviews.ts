import { generateSeries, seededRng } from './mockUtils';
import type { MonthlySeries } from './types';

export async function fetchReviewsMonthly(months = 12): Promise<MonthlySeries> {
  const data = generateSeries({
    seedKey: 'reviews-monthly',
    months,
    base: 5,
    drift: 0.03,
    seasonality: 0.15,
  });
  return { key: 'reviews', label: 'New Google Reviews', data };
}

export async function fetchReviewsSummary() {
  const rng = seededRng('reviews-summary');
  return {
    total: 142 + Math.floor(rng() * 8),
    average: Number((4.9 - rng() * 0.05).toFixed(2)),
    last30Days: 5 + Math.floor(rng() * 3),
  };
}
