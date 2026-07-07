import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils/cn';
import './Overlay.css';

/** Which edge the floating panel anchors to, relative to its trigger. */
export type OverlayPlacement = 'bottom' | 'top';

export interface OverlayProps {
  /**
   * Count shown on the clickable trigger. Also the default trigger label
   * (`${length} item(s)`) when {@link OverlayProps.label} is omitted.
   */
  length: number;
  /** Content revealed inside the floating overlay (e.g. a list of items). */
  items: ReactNode;
  /** Singular noun used to build the default trigger label. @default 'item' */
  noun?: string;
  /** Override the trigger's visible text (defaults to `${length} ${noun}(s)`). */
  label?: ReactNode;
  /** Heading rendered at the top of the overlay panel. */
  title?: ReactNode;
  /** Preferred side the panel opens toward. Flips if there's no room. @default 'bottom' */
  placement?: OverlayPlacement;
  /** Accessible label for the trigger button. */
  ariaLabel?: string;
  /** Extra class on the root wrapper. */
  className?: string;
}

/** Viewport-fixed coordinates for the floating panel. */
interface PanelPos {
  top: number;
  left: number;
  side: OverlayPlacement;
}

const GAP = 8; // px between trigger and panel
const MARGIN = 8; // min viewport margin

/**
 * Overlay — a compact clickable count that reveals its full contents in a
 * floating popover (à la Bootstrap's Overlay/Popover). Handy inside dense
 * table cells where listing every item inline would overwhelm the row (e.g.
 * an order's line items).
 *
 * The panel renders to a `document.body` portal with `position: fixed`, so it
 * floats **above** the row and escapes any `overflow: hidden/auto` clipping
 * from the table wrapper. Closes on outside click, Esc, scroll, or a second
 * trigger click, and flips above the trigger when there's no room below.
 */
export function Overlay({
  length,
  items,
  noun = 'item',
  label,
  title,
  placement = 'bottom',
  ariaLabel,
  className,
}: OverlayProps) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PanelPos | null>(null);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const text = label ?? `${length} ${noun}${length === 1 ? '' : 's'}`;
  const a11yLabel = ariaLabel ?? `View ${length} ${noun}${length === 1 ? '' : 's'}`;

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    setPos(null);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  // Compute the panel's fixed position from the trigger rect, flipping and
  // clamping to stay inside the viewport.
  const reposition = useCallback(() => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;
    const t = trigger.getBoundingClientRect();
    const pw = panel.offsetWidth;
    const ph = panel.offsetHeight;

    const spaceBelow = window.innerHeight - t.bottom;
    const spaceAbove = t.top;
    const side: OverlayPlacement =
      placement === 'bottom'
        ? spaceBelow < ph + GAP && spaceAbove > spaceBelow
          ? 'top'
          : 'bottom'
        : spaceAbove < ph + GAP && spaceBelow > spaceAbove
          ? 'bottom'
          : 'top';

    const top = side === 'bottom' ? t.bottom + GAP : t.top - GAP - ph;
    let left = t.left;
    left = Math.min(left, window.innerWidth - pw - MARGIN);
    left = Math.max(MARGIN, left);

    setPos({ top, left, side });
  }, [placement]);

  // Position once the panel has mounted (so offsetWidth/Height are known).
  useLayoutEffect(() => {
    if (open) reposition();
  }, [open, reposition]);

  // Keep it anchored while open; close on scroll (popover semantics).
  useEffect(() => {
    if (!open) return;
    const onScroll = () => close(false);
    const onResize = () => reposition();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, close, reposition]);

  // Close on outside pointer press.
  useEffect(() => {
    if (!open) return;
    const onDocPointer = (e: PointerEvent) => {
      const node = e.target as Node;
      if (
        panelRef.current?.contains(node) ||
        triggerRef.current?.contains(node)
      )
        return;
      close(false);
    };
    document.addEventListener('pointerdown', onDocPointer);
    return () => document.removeEventListener('pointerdown', onDocPointer);
  }, [open, close]);

  return (
    <div className={cn('emenu-overlay', className)}>
      <button
        ref={triggerRef}
        type="button"
        className="emenu-overlay__trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={a11yLabel}
        onClick={() => (open ? close(true) : setOpen(true))}
      >
        {text}
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-label={typeof title === 'string' ? title : a11yLabel}
            className={cn(
              'emenu-overlay__panel',
              pos && `emenu-overlay__panel--${pos.side}`,
            )}
            style={{
              // Rendered off-screen until measured to avoid a flash at 0,0.
              top: pos?.top ?? -9999,
              left: pos?.left ?? -9999,
              visibility: pos ? 'visible' : 'hidden',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.stopPropagation();
                close(true);
              }
            }}
          >
            {title && <div className="emenu-overlay__title">{title}</div>}
            <div className="emenu-overlay__body">{items}</div>
          </div>,
          document.body,
        )}
    </div>
  );
}

Overlay.displayName = 'Overlay';

export default Overlay;
