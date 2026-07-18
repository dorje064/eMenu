import { useEffect, useState } from 'react';
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
import { formatDay, formatNrs } from '../utils/format';
import './SalesChart.css';

interface SalesChartProps {
  data: SalesByDay[];
}

/** Compact currency for axis ticks: NRs 1.2k / NRs 850. */
function nrsShort(n: number): string {
  if (n >= 1000) return `NRs ${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `NRs ${n}`;
}

/** Recharts writes colors as SVG presentation attributes, where CSS `var()`
 *  does NOT resolve — so we read the design tokens off the document and pass
 *  concrete values. Re-read when the theme attribute changes so it stays
 *  theme-aware. */
interface ChartColors {
  bar: string;
  grid: string;
  axis: string;
  cursor: string;
}

function readChartColors(): ChartColors {
  if (typeof window === 'undefined') {
    return { bar: '#f97316', grid: '#e5e7eb', axis: '#6b7280', cursor: '#f9fafb' };
  }
  const s = getComputedStyle(document.documentElement);
  const token = (name: string, fallback: string) =>
    s.getPropertyValue(name).trim() || fallback;
  return {
    bar: token('--color-primary-500', '#f97316'),
    grid: token('--border-default', '#e5e7eb'),
    axis: token('--text-secondary', '#6b7280'),
    cursor: token('--surface-canvas', '#f9fafb'),
  };
}

function useChartColors(): ChartColors {
  const [colors, setColors] = useState<ChartColors>(readChartColors);
  useEffect(() => {
    const update = () => setColors(readChartColors());
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class', 'style'],
    });
    return () => observer.disconnect();
  }, []);
  return colors;
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
      <p className="sales-chart__tooltip-date">{formatDay(point.date)}</p>
      <p className="sales-chart__tooltip-value">{formatNrs(point.total)}</p>
    </div>
  );
}

/**
 * Sales-per-day bar chart (last 30 days, paid orders). Single series — the
 * panel title names it, so no legend. Colors come from design tokens so the
 * chart follows the app's light/dark theme.
 */
export function SalesChart({ data }: SalesChartProps) {
  const colors = useChartColors();
  // With 30 daily bars, label every ~6th tick to avoid a crowded axis.
  const tickInterval = Math.max(0, Math.ceil(data.length / 6) - 1);

  return (
    <div className="sales-chart" role="img" aria-label="Sales per day over the last 30 days">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid vertical={false} stroke={colors.grid} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(iso: string) => formatDay(iso)}
            interval={tickInterval}
            tick={{ fill: colors.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: colors.grid }}
          />
          <YAxis
            tickFormatter={nrsShort}
            width={64}
            tick={{ fill: colors.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip cursor={{ fill: colors.cursor }} content={<SalesTooltip />} />
          <Bar dataKey="total" fill={colors.bar} radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
