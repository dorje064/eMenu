import { forwardRef, useRef } from 'react';
import type { HTMLAttributes, KeyboardEvent } from 'react';
import { cn } from '../utils/cn';
import './CategoryNavigation.css';

export type CategoryNavigationVariant = 'horizontal' | 'vertical';

export interface CategoryNavigationItem {
  /** Stable identifier — matches the section/anchor id. */
  id: string;
  /** Visible label, e.g. "Starters". */
  label: string;
  /** Optional item count shown as a trailing badge. */
  count?: number;
  /** Dim and disable an empty category. */
  disabled?: boolean;
}

export interface CategoryNavigationProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Categories to render. */
  items: CategoryNavigationItem[];
  /** Currently selected category id (controlled). */
  value: string;
  /** Fired with the newly selected category id. */
  onChange: (id: string) => void;
  /**
   * Layout: `horizontal` scrolling chip bar (default, mobile sticky) or
   * `vertical` anchored side-rail list. @default 'horizontal'
   */
  variant?: CategoryNavigationVariant;
  /** Accessible label for the tablist. @default 'Menu categories' */
  ariaLabel?: string;
}

/**
 * CategoryNavigation — lets diners/staff jump between menu sections.
 * Implemented as an ARIA `tablist` with roving tabindex: arrow keys move the
 * active tab, Home/End jump to ends. Active state is conveyed by weight +
 * color + underline/pill (never color alone). 44px touch targets.
 */
export const CategoryNavigation = forwardRef<
  HTMLDivElement,
  CategoryNavigationProps
>(
  (
    {
      items,
      value,
      onChange,
      variant = 'horizontal',
      ariaLabel = 'Menu categories',
      className,
      ...rest
    },
    ref
  ) => {
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

    const focusableIndexes = items
      .map((item, i) => (item.disabled ? -1 : i))
      .filter((i) => i >= 0);

    const moveTo = (index: number) => {
      const item = items[index];
      if (!item || item.disabled) return;
      onChange(item.id);
      tabRefs.current[index]?.focus();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
      const pos = focusableIndexes.indexOf(i);
      if (pos === -1) return;
      const nextKey = variant === 'vertical' ? 'ArrowDown' : 'ArrowRight';
      const prevKey = variant === 'vertical' ? 'ArrowUp' : 'ArrowLeft';

      let target = -1;
      if (e.key === nextKey) {
        target = focusableIndexes[(pos + 1) % focusableIndexes.length];
      } else if (e.key === prevKey) {
        target =
          focusableIndexes[
            (pos - 1 + focusableIndexes.length) % focusableIndexes.length
          ];
      } else if (e.key === 'Home') {
        target = focusableIndexes[0];
      } else if (e.key === 'End') {
        target = focusableIndexes[focusableIndexes.length - 1];
      } else {
        return;
      }
      e.preventDefault();
      moveTo(target);
    };

    return (
      <div
        ref={ref}
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation={variant === 'vertical' ? 'vertical' : 'horizontal'}
        className={cn(
          'emenu-catnav',
          `emenu-catnav--${variant}`,
          className
        )}
        {...rest}
      >
        {items.map((item, i) => {
          const selected = item.id === value;
          return (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`emenu-catnav-tab-${item.id}`}
              aria-controls={`emenu-catnav-panel-${item.id}`}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              disabled={item.disabled}
              className={cn(
                'emenu-catnav__chip',
                selected && 'emenu-catnav__chip--active'
              )}
              onClick={() => !item.disabled && onChange(item.id)}
              onKeyDown={(e) => handleKeyDown(e, i)}
            >
              <span className="emenu-catnav__label">{item.label}</span>
              {typeof item.count === 'number' && (
                <span className="emenu-catnav__count" aria-hidden="true">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }
);

CategoryNavigation.displayName = 'CategoryNavigation';

export default CategoryNavigation;
