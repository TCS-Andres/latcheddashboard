import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/Card';
import { cn, formatDelta } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: string;
  delta?: { current: number; prior: number };
  helper?: string;
  sparkData?: { value: number }[];
  invertDelta?: boolean; // for cost metrics where down is good
}

export function KpiCard({ label, value, delta, helper, sparkData, invertDelta }: KpiCardProps) {
  const computed = delta ? formatDelta(delta.current, delta.prior) : null;
  const isUp = computed ? computed.positive : null;
  const isGood = computed ? (invertDelta ? !isUp : isUp) : null;

  return (
    <Card>
      <CardContent className="p-5 pt-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 font-display text-3xl leading-none">{value}</p>
            {helper && <p className="mt-1.5 text-xs text-muted-foreground">{helper}</p>}
          </div>
          {computed && (
            <div
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                isGood === true && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
                isGood === false && 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
                isGood === null && 'bg-muted text-muted-foreground'
              )}
            >
              {isUp === null ? <Minus className="h-3 w-3" /> : isUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {computed.label}
            </div>
          )}
        </div>

        {sparkData && sparkData.length > 0 && (
          <div className="mt-4 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill={`url(#spark-${label})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
