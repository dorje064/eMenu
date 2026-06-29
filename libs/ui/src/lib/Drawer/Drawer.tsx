import { useCallback, useEffect, useId, useRef } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../utils/cn';
import './Drawer.css';

export type DrawerEdge = 'right' | 'left' | 'bottom' | 'top';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'auto';

export interface DrawerProps {
  /** Whether the drawer is mounted/visible. */
  open: boolean;
  /** Called when the user requests close (Esc, scrim click, or close button). */
  onClose: () => void;
  /** Accessible title rendered in the header; also labels the dialog. */
  title: ReactNode;
  /** Which edge the panel slides in from. @default 'right' */
  edge?: DrawerEdge;
  /** Size preset — width for left/right, height for top/bottom. `auto` fits content. @default 'md' */
  size?: DrawerSize;
  /**
   * Modal drawers render a scrim, trap focus, and close on Esc. Non-modal
   * drawers push/overlay without trapping focus. @default true
   */
  modal?: boolean;
  /** Sticky footer action area (e.g. "Place Order — $42.50"). */
  footer?: ReactNode;
  /** Body content (scrollable region). */
  children?: ReactNode;
}

const FOCUSABLE =
  'a[href],area[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Drawer (Sheet) — slide-in panel for secondary flows that keep context: the
 * customer cart, filters, order detail, mobile nav. Portal-based. Modal mode
 * adds a scrim, focus trap, scroll lock, and Esc-to-close; non-modal mode keeps
 * the panel keyboard-reachable without trapping focus.
 */
export function Drawer({
  open,
  onClose,
  title,
  edge = 'right',
  size = 'md',
  modal = true,
  footer,
  children,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    triggerRef.current = document.activeElement;

    let prevOverflow = '';
    if (modal) {
      prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }

    const focusTimer = window.setTimeout(() => {
      const panel = panelRef.current;
      const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? closeBtnRef.current)?.focus();
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      if (modal) document.body.style.overflow = prevOverflow;
      const trigger = triggerRef.current;
      if (modal && trigger instanceof HTMLElement) trigger.focus();
    };
  }, [open, modal]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (!modal || e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [modal, onClose],
  );

  if (!open) return null;

  return createPortal(
    <div
      className={cn(
        'emenu-drawer',
        `emenu-drawer--${edge}`,
        !modal && 'emenu-drawer--non-modal',
      )}
      onKeyDown={onKeyDown}
    >
      {modal && (
        <div
          className="emenu-drawer__scrim"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div
        ref={panelRef}
        className={cn(
          'emenu-drawer__panel',
          `emenu-drawer__panel--${edge}`,
          `emenu-drawer__panel--${size}`,
        )}
        role="dialog"
        aria-modal={modal || undefined}
        aria-labelledby={titleId}
      >
        <header className="emenu-drawer__header">
          <h2 id={titleId} className="emenu-drawer__title">
            {title}
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            className="emenu-drawer__close"
            aria-label="Close"
            onClick={onClose}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        <div className="emenu-drawer__body">{children}</div>
        {footer && <footer className="emenu-drawer__footer">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}

Drawer.displayName = 'Drawer';

export default Drawer;
