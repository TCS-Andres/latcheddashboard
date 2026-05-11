import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number, opts: Intl.NumberFormatOptions = {}) {
  return new Intl.NumberFormat('en-US', opts).format(n);
}

export function formatCurrency(n: number, opts: Intl.NumberFormatOptions = {}) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    ...opts,
  }).format(n);
}

export function formatPercent(n: number, digits = 1) {
  return `${(n * 100).toFixed(digits)}%`;
}

export function formatDelta(current: number, prior: number) {
  if (prior === 0) return { value: 0, label: '—', positive: true };
  const value = (current - prior) / prior;
  return {
    value,
    label: `${value >= 0 ? '+' : ''}${(value * 100).toFixed(1)}%`,
    positive: value >= 0,
  };
}

// Seeded PRNG — mulberry32. Stable values within a window.
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rand(rng: () => number, min: number, max: number) {
  return Math.round(min + rng() * (max - min));
}

export function randFloat(rng: () => number, min: number, max: number, digits = 2) {
  const v = min + rng() * (max - min);
  return Number(v.toFixed(digits));
}
