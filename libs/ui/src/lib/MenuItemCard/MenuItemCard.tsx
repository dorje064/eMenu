import { forwardRef, useId } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Clock, Plus, Minus } from 'lucide-react';
import { Button } from '../Button/Button';
import { cn } from '../utils/cn';
import './MenuItemCard.css';

export type MenuItemTagKind =
  'veg' | 'non-veg' | 'vegan' | 'spicy' | 'bestseller' | 'new' | 'discounted';

export interface MenuItemTag {
  /** Canonical tag kind — drives icon + default label. */
  kind: MenuItemTagKind;
  /** Optional label override (defaults to the canonical name for the kind). */
  label?: string;
}

export type MenuItemCardLayout = 'vertical' | 'horizontal';

export interface MenuItemCardProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  /** Dish name — rendered as `text-h5` and used as the accessible label. */
  name: string;
  /** Formatted price string, e.g. "$12.50". Rendered with tabular numerals. */
  price: string;
  /** Optional original price (shown struck-through) for discounted items. */
  originalPrice?: string;
  /** 2-line clamped description. */
  description?: string;
  /** Food image URL (4:3). Omit for the image-less color-block fallback. */
  imageUrl?: string;
  /** Alt text for the image; falls back to the dish name. */
  imageAlt?: string;
  /** Prep time label, e.g. "15 min". Shown in a clock chip when present. */
  prepTime?: string;
  /** Dietary / merchandising tags. Each renders icon + text (never color alone). */
  tags?: MenuItemTag[];
  /** Layout: `vertical` grid card or `horizontal` list row. @default 'vertical' */
  layout?: MenuItemCardLayout;
  /** Sold-out: desaturated image, "Sold out" badge, Add disabled + aria-disabled. */
  soldOut?: boolean;
  /** Quantity currently in cart. `> 0` shows the stepper + primary ring. @default 0 */
  quantity?: number;
  /** Adding-to-cart in flight — Add button shows a spinner. */
  adding?: boolean;
  /** Fired when the Add button is pressed (item not yet in cart). */
  onAdd?: () => void;
  /** Fired when the stepper increments. */
  onIncrease?: () => void;
  /** Fired when the stepper decrements (at qty 1, this removes the item). */
  onDecrease?: () => void;
  /** Optional context slot (e.g. admin edit/delete controls) rendered in actions. */
  actionsSlot?: ReactNode;
}

const TAG_LABEL: Record<MenuItemTagKind, string> = {
  veg: 'Veg',
  'non-veg': 'Non-veg',
  vegan: 'Vegan',
  spicy: 'Spicy',
  bestseller: 'Bestseller',
  new: 'New',
  discounted: 'Discounted',
};

/** Icon glyph for each tag — shape/text, not color alone (a11y). */
function TagGlyph({ kind }: { kind: MenuItemTagKind }) {
  switch (kind) {
    case 'veg':
    case 'vegan':
      // square-in-square veg mark + dot
      return <span className="emenu-mic__tag-dot" aria-hidden="true" />;
    case 'non-veg':
      return <span className="emenu-mic__tag-tri" aria-hidden="true" />;
    case 'spicy':
      return (
        <span className="emenu-mic__tag-glyph" aria-hidden="true">
          🌶
        </span>
      );
    case 'bestseller':
      return (
        <span className="emenu-mic__tag-glyph" aria-hidden="true">
          ★
        </span>
      );
    case 'new':
      return (
        <span className="emenu-mic__tag-glyph" aria-hidden="true">
          ✦
        </span>
      );
    case 'discounted':
      return (
        <span className="emenu-mic__tag-glyph" aria-hidden="true">
          %
        </span>
      );
    default:
      return null;
  }
}

/**
 * MenuItemCard — the hero customer component. Presents a dish so it is
 * appetizing and orderable in one tap. Supports vertical grid and horizontal
 * row layouts and the available / sold-out / in-cart / adding states.
 */
export const MenuItemCard = forwardRef<HTMLDivElement, MenuItemCardProps>(
  (
    {
      name,
      price,
      originalPrice,
      description,
      imageUrl,
      imageAlt,
      prepTime,
      tags = [],
      layout = 'vertical',
      soldOut = false,
      quantity = 0,
      adding = false,
      onAdd,
      onIncrease,
      onDecrease,
      actionsSlot,
      className,
      ...rest
    },
    ref,
  ) => {
    const headingId = useId();
    const inCart = quantity > 0 && !soldOut;

    return (
      <div
        ref={ref}
        className={cn(
          'emenu-mic',
          `emenu-mic--${layout}`,
          soldOut && 'emenu-mic--soldout',
          inCart && 'emenu-mic--incart',
          className,
        )}
        role="group"
        aria-labelledby={headingId}
        {...rest}
      >
        {/* ---- Media ---- */}
        <div className="emenu-mic__media">
          {imageUrl ? (
            <img
              className="emenu-mic__img"
              src={imageUrl}
              alt={imageAlt ?? name}
              loading="lazy"
            />
          ) : (
            <div className="emenu-mic__fallback" aria-hidden="true">
              <span className="emenu-mic__fallback-text">{name}</span>
            </div>
          )}

          {tags.length > 0 && (
            <ul className="emenu-mic__tags" aria-label="Dish tags">
              {tags.map((tag) => {
                const label = tag.label ?? TAG_LABEL[tag.kind];
                return (
                  <li
                    key={tag.kind}
                    className={cn(
                      'emenu-mic__tag',
                      `emenu-mic__tag--${tag.kind}`,
                    )}
                  >
                    <TagGlyph kind={tag.kind} />
                    <span className="emenu-mic__tag-label">{label}</span>
                  </li>
                );
              })}
            </ul>
          )}

          {soldOut && (
            <div className="emenu-mic__overlay">
              <span className="emenu-mic__soldout-badge">Sold out</span>
            </div>
          )}
        </div>

        {/* ---- Content ---- */}
        <div className="emenu-mic__content">
          <div className="emenu-mic__head">
            <h3 id={headingId} className="emenu-mic__name">
              {name}
            </h3>
            {prepTime && (
              <span className="emenu-mic__prep">
                <Clock size={14} aria-hidden="true" />
                <span>{prepTime}</span>
              </span>
            )}
          </div>

          {description && <p className="emenu-mic__desc">{description}</p>}

          <div className="emenu-mic__footer">
            <div className="emenu-mic__price">
              {originalPrice && (
                <span className="emenu-mic__price-was tnum">
                  {originalPrice}
                </span>
              )}
              <span className="emenu-mic__price-now tnum">{price}</span>
            </div>

            <div className="emenu-mic__actions">
              {actionsSlot}
              {inCart ? (
                <QuantityStepper
                  quantity={quantity}
                  name={name}
                  onIncrease={onIncrease}
                  onDecrease={onDecrease}
                />
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  loading={adding}
                  disabled={soldOut}
                  aria-disabled={soldOut || undefined}
                  aria-label={`Add ${name} to order`}
                  leadingIcon={!adding ? <Plus size={16} /> : undefined}
                  onClick={soldOut ? undefined : onAdd}
                >
                  Add
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

MenuItemCard.displayName = 'MenuItemCard';

function QuantityStepper({
  quantity,
  name,
  onIncrease,
  onDecrease,
}: {
  quantity: number;
  name: string;
  onIncrease?: () => void;
  onDecrease?: () => void;
}) {
  return (
    <div
      className="emenu-mic__stepper"
      role="group"
      aria-label={`Quantity for ${name}`}
    >
      <button
        type="button"
        className="emenu-mic__step-btn"
        aria-label="Decrease quantity"
        onClick={onDecrease}
      >
        <Minus size={16} aria-hidden="true" />
      </button>
      <span
        className="emenu-mic__qty tnum"
        aria-live="polite"
        aria-atomic="true"
      >
        {quantity}
      </span>
      <button
        type="button"
        className="emenu-mic__step-btn"
        aria-label="Increase quantity"
        onClick={onIncrease}
      >
        <Plus size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

export default MenuItemCard;
