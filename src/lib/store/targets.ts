import { useCallback, useEffect, useState } from 'react';
import { activeClient } from '@/config/clients';
import type { Targets } from '@/config/clients/types';

// User-editable targets + actuals. localStorage-backed.
// Stores ONLY aggregated operational numbers — never PII/PHI.

const TARGETS_KEY = `lb.${activeClient.slug}.targets`;
const ACTUALS_KEY = `lb.${activeClient.slug}.actuals`;
const TARGET_OVERRIDES_KEY = `lb.${activeClient.slug}.target_overrides`;

export type MetricKey = keyof Targets;

export interface MonthlyActuals {
  // map: 'YYYY-MM' -> per-metric value
  [month: string]: Partial<Record<MetricKey, number>>;
}

export interface MonthlyTargetOverrides {
  [month: string]: Partial<Record<MetricKey, number>>;
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded — silently drop */
  }
}

export function useTargets() {
  const [targets, setTargets] = useState<Targets>(() =>
    readJSON<Targets>(TARGETS_KEY, activeClient.targets)
  );

  useEffect(() => {
    writeJSON(TARGETS_KEY, targets);
  }, [targets]);

  const updateTarget = useCallback(
    <K extends MetricKey>(key: K, value: Targets[K]) =>
      setTargets(prev => ({ ...prev, [key]: value })),
    []
  );

  const resetTargets = useCallback(() => setTargets(activeClient.targets), []);

  return { targets, setTargets, updateTarget, resetTargets };
}

export function useActuals() {
  const [actuals, setActuals] = useState<MonthlyActuals>(() =>
    readJSON<MonthlyActuals>(ACTUALS_KEY, {})
  );

  useEffect(() => {
    writeJSON(ACTUALS_KEY, actuals);
  }, [actuals]);

  const setActual = useCallback((month: string, metric: MetricKey, value: number | undefined) => {
    setActuals(prev => {
      const next = { ...prev };
      const monthRow = { ...(next[month] ?? {}) };
      if (value === undefined || Number.isNaN(value)) {
        delete monthRow[metric];
      } else {
        monthRow[metric] = value;
      }
      if (Object.keys(monthRow).length === 0) {
        delete next[month];
      } else {
        next[month] = monthRow;
      }
      return next;
    });
  }, []);

  const resetActuals = useCallback(() => setActuals({}), []);

  return { actuals, setActual, resetActuals };
}

export function useTargetOverrides() {
  const [overrides, setOverrides] = useState<MonthlyTargetOverrides>(() =>
    readJSON<MonthlyTargetOverrides>(TARGET_OVERRIDES_KEY, {})
  );

  useEffect(() => {
    writeJSON(TARGET_OVERRIDES_KEY, overrides);
  }, [overrides]);

  const setOverride = useCallback((month: string, metric: MetricKey, value: number | undefined) => {
    setOverrides(prev => {
      const next = { ...prev };
      const row = { ...(next[month] ?? {}) };
      if (value === undefined || Number.isNaN(value)) {
        delete row[metric];
      } else {
        row[metric] = value;
      }
      if (Object.keys(row).length === 0) delete next[month];
      else next[month] = row;
      return next;
    });
  }, []);

  return { overrides, setOverride };
}

// Overlay user-entered actuals onto a mock series. Entered months win;
// blank months keep the mock value so charts never go blank.
export function overlayActuals(
  series: { month: string; label: string; value: number }[],
  actuals: MonthlyActuals,
  metric: MetricKey
) {
  return series.map(p => {
    const override = actuals[p.month]?.[metric];
    return override !== undefined
      ? { ...p, value: override, _isActual: true }
      : { ...p, _isActual: false };
  });
}
