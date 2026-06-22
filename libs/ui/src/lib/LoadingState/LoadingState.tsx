import { forwardRef } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';
import './LoadingState.css';

/* ------------------------------------------------------------------ */
/* Skeleton                                                            */
/* ------------------------------------------------------------------ */

export type SkeletonShape = 'text' | 'rect' | 'circle';

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  /** Placeholder shape. @default 'text' */
  shape?: SkeletonShape;
  /** CSS width (number → px). @default '100%' */
  width?: number | string;
  /** CSS height (number → px). Defaults per shape. */
  height?: number | string;
  /** Override border radius (number → px). */
  radius?: number | string;
}

const toCss = (v: number | string | undefined): string | undefined =>
  typeof v === 'number' ? `${v}px` : v;

/**
 * Skeleton — a content-shaped placeholder (neutral-100 base, neutral-200
 * shimmer). Mirror your final layout with these to prevent layout shift (CLS).
 * Decorative: marked aria-hidden; announce loading on the parent region.
 */
export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(
  ({ shape = 'text', width, height, radius, className, style, ...rest }, ref) => {
    const computed: CSSProperties = {
      width: toCss(width),
      height: toCss(height),
      borderRadius: toCss(radius),
      ...style,
    };
    return (
      <span
        ref={ref}
        aria-hidden="true"
        className={cn('emenu-skeleton', `emenu-skeleton--${shape}`, className)}
        style={computed}
        {...rest}
      />
    );
  }
);
Skeleton.displayName = 'Skeleton';

/* ------------------------------------------------------------------ */
/* Spinner                                                             */
/* ------------------------------------------------------------------ */

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /** Size token. @default 'md' */
  size?: SpinnerSize;
  /** Accessible status label announced to AT. @default 'Loading' */
  label?: string;
  /** Hide the visually-rendered label text (keep it for screen readers). @default true */
  hideLabel?: boolean;
}

const SPINNER_PX: Record<SpinnerSize, number> = { sm: 16, md: 24, lg: 40 };

/**
 * Spinner — indeterminate wait indicator with `role="status"` and a label.
 * Used inside buttons and small inline waits. Respects reduced motion.
 */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ size = 'md', label = 'Loading', hideLabel = true, className, ...rest }, ref) => (
    <span
      ref={ref}
      role="status"
      className={cn('emenu-spinner', `emenu-spinner--${size}`, className)}
      {...rest}
    >
      <Loader2 className="emenu-spinner__icon" size={SPINNER_PX[size]} aria-hidden="true" />
      <span className={hideLabel ? 'emenu-visually-hidden' : 'emenu-spinner__label'}>
        {label}
      </span>
    </span>
  )
);
Spinner.displayName = 'Spinner';

/* ------------------------------------------------------------------ */
/* ProgressBar                                                         */
/* ------------------------------------------------------------------ */

export interface ProgressBarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  /** Current value. Omit (or set null) for an indeterminate bar. */
  value?: number | null;
  /** Minimum value. @default 0 */
  min?: number;
  /** Maximum value. @default 100 */
  max?: number;
  /** Accessible label for the progress, e.g. "Uploading photo". */
  label?: string;
  /** Show a numeric "n%" caption beside the track. @default false */
  showValue?: boolean;
}

/**
 * ProgressBar — determinate (with aria-valuenow/min/max) for uploads/imports,
 * or indeterminate (omit value) for route-level loading. Respects reduced motion.
 */
export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    { value, min = 0, max = 100, label, showValue = false, className, ...rest },
    ref
  ) => {
    const indeterminate = value == null;
    const clamped = indeterminate
      ? undefined
      : Math.min(Math.max(value as number, min), max);
    const pct =
      clamped == null ? 0 : ((clamped - min) / (max - min || 1)) * 100;

    return (
      <div
        ref={ref}
        className={cn('emenu-progress', className)}
        {...rest}
      >
        <div
          className={cn(
            'emenu-progress__track',
            indeterminate && 'emenu-progress__track--indeterminate'
          )}
          role="progressbar"
          aria-label={label}
          aria-valuemin={indeterminate ? undefined : min}
          aria-valuemax={indeterminate ? undefined : max}
          aria-valuenow={indeterminate ? undefined : clamped}
        >
          <div
            className="emenu-progress__fill"
            style={indeterminate ? undefined : { width: `${pct}%` }}
          />
        </div>
        {showValue && !indeterminate && (
          <span className="emenu-progress__value">{Math.round(pct)}%</span>
        )}
      </div>
    );
  }
);
ProgressBar.displayName = 'ProgressBar';

export default Spinner;
