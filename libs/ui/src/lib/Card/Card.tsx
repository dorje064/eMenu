import { forwardRef } from 'react';
import type {
  HTMLAttributes,
  ButtonHTMLAttributes,
  AnchorHTMLAttributes,
  ReactNode,
  ElementType,
  Ref,
} from 'react';
import { cn } from '../utils/cn';
import './Card.css';

export type CardElevation = 'flat' | 'raised' | 'interactive';
export type CardPadding = 'compact' | 'default';
/** Optional status accent rendered as a left border on the card. */
export type CardAccent =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'
  | 'primary';

interface CardOwnProps {
  /**
   * Elevation treatment.
   * - `flat` — border only, no shadow
   * - `raised` — `elevation-1`
   * - `interactive` — pointer + hover raises to `elevation-2`
   * @default 'flat'
   */
  elevation?: CardElevation;
  /** Inner padding. `compact` = space-4, `default` = space-6. @default 'default' */
  padding?: CardPadding;
  /** Optional status accent shown as a left border stripe. */
  accent?: CardAccent;
  /**
   * Selected state — primary tint background + primary-600 border.
   * Reflected with `aria-pressed`/`aria-current` is left to the caller.
   */
  selected?: boolean;
  /** Disabled — dims the card and blocks pointer events (clickable cards only). */
  disabled?: boolean;
  /**
   * Render the whole card as a single clickable control.
   * - `'button'` → renders a `<button>` (provide `onClick`)
   * - `'link'`   → renders an `<a>` (provide `href`)
   * When set, focus-visible ring + hover semantics apply automatically.
   */
  as?: 'div' | 'button' | 'link';
  children?: ReactNode;
}

type DivCardProps = CardOwnProps & {
  as?: 'div';
} & Omit<HTMLAttributes<HTMLDivElement>, keyof CardOwnProps>;

type ButtonCardProps = CardOwnProps & {
  as: 'button';
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CardOwnProps>;

type AnchorCardProps = CardOwnProps & {
  as: 'link';
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CardOwnProps>;

export type CardProps = DivCardProps | ButtonCardProps | AnchorCardProps;

/* ---- Composition slots (optional helpers) ---- */

export type CardMediaProps = HTMLAttributes<HTMLDivElement>;
/** Media slot — image / video at the top or left of a card. */
export function CardMedia({ className, ...rest }: CardMediaProps) {
  return <div className={cn('emenu-card__media', className)} {...rest} />;
}

export type CardHeaderProps = HTMLAttributes<HTMLDivElement>;
/** Header slot — title / metadata row. */
export function CardHeader({ className, ...rest }: CardHeaderProps) {
  return <div className={cn('emenu-card__header', className)} {...rest} />;
}

export type CardBodyProps = HTMLAttributes<HTMLDivElement>;
/** Body slot — primary content. */
export function CardBody({ className, ...rest }: CardBodyProps) {
  return <div className={cn('emenu-card__body', className)} {...rest} />;
}

export type CardFooterProps = HTMLAttributes<HTMLDivElement>;
/** Footer / actions slot. */
export function CardFooter({ className, ...rest }: CardFooterProps) {
  return <div className={cn('emenu-card__footer', className)} {...rest} />;
}

/**
 * Card — the generic content container and structural primitive behind menu
 * items, dashboard widgets, and lists. Composes via children or the
 * `CardMedia`/`CardHeader`/`CardBody`/`CardFooter` slots.
 *
 * Set `as="button"` / `as="link"` to make the entire card a single clickable
 * control with a focus-visible ring (avoid nesting other interactive elements
 * inside a clickable card).
 */
export const Card = forwardRef<HTMLElement, CardProps>(
  (
    {
      elevation = 'flat',
      padding = 'default',
      accent,
      selected = false,
      disabled = false,
      as = 'div',
      className,
      children,
      ...rest
    },
    ref
  ) => {
    const clickable = as === 'button' || as === 'link';
    const classes = cn(
      'emenu-card',
      `emenu-card--${elevation}`,
      `emenu-card--pad-${padding}`,
      accent && `emenu-card--accent-${accent}`,
      selected && 'emenu-card--selected',
      disabled && 'emenu-card--disabled',
      clickable && 'emenu-card--clickable',
      className
    );

    if (as === 'button') {
      const { type, ...buttonRest } =
        rest as ButtonHTMLAttributes<HTMLButtonElement>;
      return (
        <button
          ref={ref as Ref<HTMLButtonElement>}
          type={type ?? 'button'}
          className={classes}
          disabled={disabled}
          aria-pressed={selected || undefined}
          {...buttonRest}
        >
          {children}
        </button>
      );
    }

    if (as === 'link') {
      const anchorRest = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
      return (
        <a
          ref={ref as Ref<HTMLAnchorElement>}
          className={classes}
          aria-disabled={disabled || undefined}
          aria-current={selected ? 'true' : undefined}
          {...anchorRest}
        >
          {children}
        </a>
      );
    }

    const Tag: ElementType = 'div';
    return (
      <Tag
        ref={ref as Ref<HTMLDivElement>}
        className={classes}
        aria-disabled={disabled || undefined}
        {...(rest as HTMLAttributes<HTMLDivElement>)}
      >
        {children}
      </Tag>
    );
  }
);

Card.displayName = 'Card';

export default Card;
