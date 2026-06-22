import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../utils/cn';
import './DashboardCard.css';

export type DashboardCardState = 'loaded' | 'loading' | 'empty';
export type DashboardCardAccent = 'none' | 'success' | 'error' | 'warning' | 'info';

export interface DashboardCardDelta {
  /** Direction of change vs the prior period. */
  direction: 'up' | 'down';
  /** Formatted delta label, e.g. "+12%" or "−4%". */
  label: string;
  /** Optional accessible phrase, e.g. "up 12% vs yesterday". Falls back to direction + label. */
  srLabel?: string;
}

export interface DashboardCardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Small eyebrow label above the value (rendered as `text.overline`), e.g. "Today's revenue". */
  label: string;
  /** The headline metric, pre-formatted, e.g. "$1,240" or "84". */
  value?: ReactNode;
  /** Change vs the prior period. Meaning is icon + sign + label, never color alone. */
  delta?: DashboardCardDelta;
  /** Context line under the value, e.g. "vs last week". */
  context?: ReactNode;
  /** Optional leading icon (decorative). */
  icon?: ReactNode;
  /** Left status accent stripe. @default 'none' */
  accent?: DashboardCardAccent;
  /** Render state. @default 'loaded' */
  state?: DashboardCardState;
  /** Message shown in the empty state. @default 'No data yet' */
  emptyMessage?: string;
  /** When provided, renders a "View report" footer link wired to this handler. */
  onViewReport?: () => void;
  /** Footer link label. @default 'View report' */
  viewReportLabel?: string;
}

/**
 * DashboardCard — a stat/KPI card for role dashboards (revenue, orders, tables…).
 * The number is the truth and always lives in text; the delta conveys meaning via
 * icon (▲/▼) + sign + label, not color alone.
 */
export const DashboardCard = forwardRef<HTMLDivElement, DashboardCardProps>(
  (
    {
      label,
      value,
      delta,
      context,
      icon,
      accent = 'none',
      state = 'loaded',
      emptyMessage = 'No data yet',
      onViewReport,
      viewReportLabel = 'View report',
      className,
      ...rest
    },
    ref
  ) => {
    const isLoading = state === 'loading';
    const isEmpty = state === 'empty';

    const deltaSr =
      delta &&
      (delta.srLabel ??
        `${delta.direction === 'up' ? 'up' : 'down'} ${delta.label}`);

    const accessibleValue =
      !isLoading && !isEmpty && value != null
        ? `${label}: ${String(value)}${deltaSr ? `, ${deltaSr}` : ''}${
            context ? ` ${typeof context === 'string' ? context : ''}` : ''
          }`
        : undefined;

    return (
      <div
        ref={ref}
        className={cn(
          'emenu-dashcard',
          accent !== 'none' && `emenu-dashcard--accent-${accent}`,
          className
        )}
        aria-busy={isLoading || undefined}
        {...rest}
      >
        <div className="emenu-dashcard__head">
          <p className="emenu-dashcard__label">{label}</p>
          {icon && (
            <span className="emenu-dashcard__icon" aria-hidden="true">
              {icon}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="emenu-dashcard__skeleton" aria-hidden="true">
            <span className="emenu-dashcard__skeleton-label" />
            <span className="emenu-dashcard__skeleton-value" />
          </div>
        ) : isEmpty ? (
          <p className="emenu-dashcard__empty">{emptyMessage}</p>
        ) : (
          <>
            <p className="emenu-dashcard__value" aria-label={accessibleValue}>
              {value}
            </p>
            {(delta || context) && (
              <div className="emenu-dashcard__meta">
                {delta && (
                  <span
                    className={cn(
                      'emenu-dashcard__delta',
                      `emenu-dashcard__delta--${delta.direction}`
                    )}
                  >
                    {delta.direction === 'up' ? (
                      <TrendingUp size={14} aria-hidden="true" />
                    ) : (
                      <TrendingDown size={14} aria-hidden="true" />
                    )}
                    <span>{delta.label}</span>
                  </span>
                )}
                {context && (
                  <span className="emenu-dashcard__context">{context}</span>
                )}
              </div>
            )}
          </>
        )}

        {onViewReport && !isLoading && (
          <div className="emenu-dashcard__footer">
            <button
              type="button"
              className="emenu-dashcard__link"
              onClick={onViewReport}
            >
              {viewReportLabel}
            </button>
          </div>
        )}
      </div>
    );
  }
);

DashboardCard.displayName = 'DashboardCard';

export default DashboardCard;
