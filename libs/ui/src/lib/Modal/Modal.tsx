import { useCallback, useEffect, useId, useRef } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../utils/cn';
import './Modal.css';

export type ModalSize = 'sm' | 'md' | 'lg' | 'full-screen';
export type ModalVariant =
  'confirmation' | 'form' | 'informational' | 'destructive';

export interface ModalProps {
  /** Whether the modal is mounted/visible. */
  open: boolean;
  /** Called when the user requests close (Esc, scrim click, or close button). */
  onClose: () => void;
  /** Accessible title rendered in the header; also wires `aria-labelledby`. */
  title: ReactNode;
  /** Width preset. @default 'md' */
  size?: ModalSize;
  /** Type/intent — `destructive` accents the header and disables Esc/scrim close. @default 'confirmation' */
  variant?: ModalVariant;
  /** Sticky footer action area (usually Cancel + confirm Buttons). */
  footer?: ReactNode;
  /**
   * Disable closing on Esc. Auto-enabled for `destructive` unless explicitly set.
   * @default false (true for destructive)
   */
  disableEscClose?: boolean;
  /**
   * Disable closing on scrim click. Auto-enabled for `destructive` unless explicitly set.
   * @default false (true for destructive)
   */
  disableScrimClose?: boolean;
  /** Body content (scrollable region). */
  children?: ReactNode;
}

const FOCUSABLE =
  'a[href],area[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Modal (Dialog) — focused interruption for confirmations, forms, and detail
 * views requiring a decision before continuing. Renders to a portal on
 * `document.body`, traps focus, locks background scroll, and returns focus to
 * the trigger on close.
 */
export function Modal({
  open,
  onClose,
  title,
  size = 'md',
  variant = 'confirmation',
  footer,
  disableEscClose,
  disableScrimClose,
  children,
}: ModalProps) {
  const isDestructive = variant === 'destructive';
  const escClosable = !(disableEscClose ?? isDestructive);
  const scrimClosable = !(disableScrimClose ?? isDestructive);

  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const titleId = useId();
  const bodyId = useId();

  // Capture trigger, lock scroll, move focus, restore on close.
  useEffect(() => {
    if (!open) return;
    triggerRef.current = document.activeElement;

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    // Move focus to first focusable in the panel, else the close button.
    const focusTimer = window.setTimeout(() => {
      const panel = panelRef.current;
      const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? closeBtnRef.current)?.focus();
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = overflow;
      const trigger = triggerRef.current;
      if (trigger instanceof HTMLElement) trigger.focus();
    };
  }, [open]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && escClosable) {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      // Focus trap.
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
    [escClosable, onClose],
  );

  if (!open) return null;

  return createPortal(
    <div className="emenu-modal" onKeyDown={onKeyDown}>
      <div
        className="emenu-modal__scrim"
        onClick={scrimClosable ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className={cn(
          'emenu-modal__panel',
          `emenu-modal__panel--${size}`,
          isDestructive && 'emenu-modal__panel--destructive',
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
      >
        <header className="emenu-modal__header">
          <h2 id={titleId} className="emenu-modal__title">
            {title}
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            className="emenu-modal__close"
            aria-label="Close"
            onClick={onClose}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        <div id={bodyId} className="emenu-modal__body">
          {children}
        </div>
        {footer && <footer className="emenu-modal__footer">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}

Modal.displayName = 'Modal';

export default Modal;
