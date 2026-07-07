import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { SalesByDay } from '../api/types';
import './SalesChart.css';

interface SalesChartProps {
  data: SalesByDay[];
}

/** Compact currency for axis ticks: NRs 1.2k / NRs 850. */
function nrsShort(n: number): string {
  if (n >= 1000) return `NRs ${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `NRs ${n}`;
}

/** Full currency for the tooltip. */
function nrsFull(n: number): string {
  return `NRs ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** "Jul 7" — short day label from a YYYY-MM-DD key (parsed as local). */
function dayLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

interface TooltipPayload {
  active?: boolean;
  payload?: Array<{ payload: SalesByDay }>;
}

function SalesTooltip({ active, payload }: TooltipPayload) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="sales-chart__tooltip">
      <p className="sales-chart__tooltip-date">{dayLabel(point.date)}</p>
      <p className="sales-chart__tooltip-value">{nrsFull(point.total)}</p>
    </div>
  );
}

/**
 * Sales-per-day bar chart (last 30 days, paid orders). Single series — the
 * panel title names it, so no legend. Colors are driven by design tokens so
 * the chart follows the app's light/dark theme.
 */
export function SalesChart({ data }: SalesChartProps) {
  // With 30 daily bars, label every 5th tick to avoid a crowded axis.
  const tickInterval = useMemo(() => Math.max(0, Math.ceil(data.length / 6) - 1), [data.length]);

  return (
    <div className="sales-chart" role="img" aria-label="Sales per day over the last 30 days">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid
            vertical={false}
            stroke="var(--border-default)"
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="date"
            tickFormatter={dayLabel}
            interval={tickInterval}
            tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'var(--border-default)' }}
          />
          <YAxis
            tickFormatter={nrsShort}
            width={64}
            tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: 'var(--surface-canvas)' }}
            content={<SalesTooltip />}
          />
          <Bar
            dataKey="total"
            fill="var(--color-primary-500)"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
