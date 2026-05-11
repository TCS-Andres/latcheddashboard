import { mulberry32 } from '@/lib/utils';

// Stable PRNG keyed by metric name so re-renders produce same numbers.
export function seededRng(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return mulberry32(Math.abs(hash));
}

export function trailingMonths(count: number, endDate = new Date()) {
  const months: { date: Date; key: string; label: string }[] = [];
  const cursor = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(cursor.getFullYear(), cursor.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    months.push({ date: d, key, label });
  }
  return months;
}

// Produces a believable monthly series with mild upward drift + seasonality + noise.
export function generateSeries(opts: {
  seedKey: string;
  months: number;
  base: number;        // center value
  drift?: number;      // monthly growth rate, e.g. 0.02
  seasonality?: number; // amplitude of sinusoidal, e.g. 0.1 = ±10%
  noise?: number;       // ±noise * base
  round?: boolean;
}): { month: string; label: string; value: number }[] {
  const rng = seededRng(opts.seedKey);
  const series = trailingMonths(opts.months);
  const drift = opts.drift ?? 0.015;
  const seasonality = opts.seasonality ?? 0.08;
  const noise = opts.noise ?? 0.08;

  return series.map((m, i) => {
    const driftFactor = 1 + drift * (i - series.length + 1);
    const season = 1 + Math.sin((i / 12) * Math.PI * 2 + Math.PI / 3) * seasonality;
    const jitter = 1 + (rng() * 2 - 1) * noise;
    let value = opts.base * driftFactor * season * jitter;
    if (opts.round !== false) value = Math.round(value);
    return { month: m.key, label: m.label, value };
  });
}

export function sumLastN(series: { value: number }[], n: number) {
  return series.slice(-n).reduce((acc, p) => acc + p.value, 0);
}
