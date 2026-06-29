import { forwardRef, useRef } from 'react';
import type { HTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import { cn } from '../utils/cn';
import './Tabs.css';

export type TabsVariant = 'underline' | 'pill' | 'enclosed';
export type TabsAlign = 'start' | 'full' | 'scrollable';

export interface TabItem {
  /** Stable identifier. */
  id: string;
  /** Visible label. */
  label: string;
  /** Panel content rendered when this tab is selected. */
  content: ReactNode;
  /** Optional trailing count badge, e.g. 12 → "Active 12". */
  count?: number;
  /** Optional leading icon. */
  icon?: ReactNode;
  /** Disable the tab. */
  disabled?: boolean;
}

export interface TabsProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  /** Tabs and their panels. */
  items: TabItem[];
  /** Selected tab id (controlled). */
  value: string;
  /** Fired with the newly selected tab id. */
  onChange: (id: string) => void;
  /** Visual style. @default 'underline' */
  variant?: TabsVariant;
  /** Tab strip alignment. @default 'start' */
  align?: TabsAlign;
  /** Accessible label for the tablist. */
  ariaLabel?: string;
}

/**
 * Tabs — switch between peer views (order states, report periods, settings).
 * Full ARIA `tablist`/`tab`/`tabpanel` with roving tabindex: arrow keys move
 * between tabs, Home/End jump, Tab moves focus into the active panel. Active
 * is conveyed by weight + underline/fill + color (never color alone).
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      items,
      value,
      onChange,
      variant = 'underline',
      align = 'start',
      ariaLabel,
      className,
      ...rest
    },
    ref,
  ) => {
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

    const focusableIndexes = items
      .map((item, i) => (item.disabled ? -1 : i))
      .filter((i) => i >= 0);

    const select = (index: number) => {
      const item = items[index];
      if (!item || item.disabled) return;
      onChange(item.id);
      tabRefs.current[index]?.focus();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
      const pos = focusableIndexes.indexOf(i);
      if (pos === -1) return;
      let target = -1;
      if (e.key === 'ArrowRight') {
        target = focusableIndexes[(pos + 1) % focusableIndexes.length];
      } else if (e.key === 'ArrowLeft') {
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
      select(target);
    };

    const active = items.find((it) => it.id === value) ?? items[0];

    return (
      <div
        ref={ref}
        className={cn('emenu-tabs', `emenu-tabs--${align}`, className)}
        {...rest}
      >
        <div
          role="tablist"
          aria-label={ariaLabel}
          aria-orientation="horizontal"
          className={cn('emenu-tabs__list', `emenu-tabs__list--${variant}`)}
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
                id={`emenu-tab-${item.id}`}
                aria-controls={`emenu-tabpanel-${item.id}`}
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                disabled={item.disabled}
                className={cn(
                  'emenu-tabs__tab',
                  selected && 'emenu-tabs__tab--active',
                )}
                onClick={() => !item.disabled && onChange(item.id)}
                onKeyDown={(e) => handleKeyDown(e, i)}
              >
                {item.icon && (
                  <span className="emenu-tabs__icon" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span className="emenu-tabs__label">{item.label}</span>
                {typeof item.count === 'number' && (
                  <span className="emenu-tabs__count" aria-hidden="true">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {active && (
          <div
            role="tabpanel"
            id={`emenu-tabpanel-${active.id}`}
            aria-labelledby={`emenu-tab-${active.id}`}
            tabIndex={0}
            className="emenu-tabs__panel"
          >
            {active.content}
          </div>
        )}
      </div>
    );
  },
);

Tabs.displayName = 'Tabs';

export default Tabs;
