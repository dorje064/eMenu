import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import {
  Receipt,
  CircleCheck,
  Flame,
  BellRing,
  XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../utils/cn';
import './OrderStatusBadge.css';

/** Canonical, locked order-lifecycle vocabulary (spec §2.5 / §10.7). */
export type OrderStatus =
  | 'placed'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

export type OrderStatusBadgeStyle = 'solid' | 'soft' | 'dot';
export type OrderStatusBadgeSize = 'sm' | 'md';

interface StatusMeta {
  /** Default human-readable label. */
  label: string;
  /** Canonical lucide icon per spec §9. */
  icon: LucideIcon;
}

const STATUS_META: Record<OrderStatus, StatusMeta> = {
  placed: { label: 'Placed', icon: Receipt },
  accepted: { label: 'Accepted', icon: CircleCheck },
  preparing: { label: 'Preparing', icon: Flame },
  ready: { label: 'Ready', icon: BellRing },
  completed: { label: 'Completed', icon: CircleCheck },
  cancelled: { label: 'Cancelled', icon: XCircle },
};

export interface OrderStatusBadgeProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Lifecycle state — drives icon, label and color. */
  status: OrderStatus;
  /** Visual treatment. `soft` = tint bg + colored text. @default 'soft' */
  styleVariant?: OrderStatusBadgeStyle;
  /** @default 'md' */
  size?: OrderStatusBadgeSize;
  /** Override the default label text (e.g. "Served"). */
  label?: string;
  /** Optional timer/countdown text, e.g. "Ready in ~8 min" (typically Preparing). */
  timer?: string;
  /**
   * Announce status changes politely for the customer tracking view.
   * Sets `aria-live="polite"`. @default false
   */
  live?: boolean;
}

/**
 * OrderStatusBadge — communicates an order's lifecycle state at a glance.
 * ALWAYS renders icon + text + color together (never color-only — the core
 * a11y rule for this product). Colors come from the locked `--status-*` tokens.
 */
export const OrderStatusBadge = forwardRef<
  HTMLSpanElement,
  OrderStatusBadgeProps
>(
  (
    {
      status,
      styleVariant = 'soft',
      size = 'md',
      label,
      timer,
      live = false,
      className,
      ...rest
    },
    ref
  ) => {
    const meta = STATUS_META[status];
    const Icon = meta.icon;
    const text = label ?? meta.label;
    const iconSize = size === 'sm' ? 14 : 16;

    return (
      <span
        ref={ref}
        className={cn(
          'emenu-status',
          `emenu-status--${styleVariant}`,
          `emenu-status--${size}`,
          `emenu-status--${status}`,
          className
        )}
        aria-live={live ? 'polite' : undefined}
        {...rest}
      >
        {styleVariant === 'dot' ? (
          <span className="emenu-status__dot" aria-hidden="true" />
        ) : (
          <Icon className="emenu-status__icon" size={iconSize} aria-hidden="true" />
        )}
        <span className="emenu-status__label">{text}</span>
        {timer && <span className="emenu-status__timer">{timer}</span>}
      </span>
    );
  }
);

OrderStatusBadge.displayName = 'OrderStatusBadge';

export default OrderStatusBadge;
