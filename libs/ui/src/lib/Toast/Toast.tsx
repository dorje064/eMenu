import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircle2,
  Info,
  AlertTriangle,
  XCircle,
  X,
} from 'lucide-react';
import { cn } from '../utils/cn';
import './Toast.css';

export type ToastSemantic = 'success' | 'info' | 'warning' | 'error';

export interface ToastAction {
  /** Action button label, e.g. "Undo" or "View order". */
  label: string;
  /** Invoked when the action is pressed. Dismisses the toast afterwards. */
  onClick: () => void;
}

/** Options accepted by `useToast().show(...)`. */
export interface ToastOptions {
  /** Semantic intent — drives icon, color, and live-region politeness. @default 'info' */
  semantic?: ToastSemantic;
  /** Optional bold title above the message. */
  title?: ReactNode;
  /** The toast message. */
  message: ReactNode;
  /** Optional single action button. Presence bumps auto-dismiss to 6s. */
  action?: ToastAction;
  /**
   * Auto-dismiss delay in ms. `0`/`null` = persistent (no auto-dismiss).
   * @default 4000 (6000 when an action is present)
   */
  duration?: number | null;
}

/** Props for the presentational Toast. */
export interface ToastProps extends ToastOptions {
  /** Called when the toast requests dismissal (timer, close, or action). */
  onDismiss: () => void;
}

const ICONS: Record<ToastSemantic, typeof Info> = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
};

/**
 * Toast — presentational, transient feedback row. Auto-dismiss pauses on
 * hover/focus; color + icon + text together convey state (never color-only).
 * Use via `ToastProvider` + `useToast` rather than rendering directly.
 */
export function Toast({
  semantic = 'info',
  title,
  message,
  action,
  duration,
  onDismiss,
}: ToastProps) {
  const Icon = ICONS[semantic];
  const isError = semantic === 'error';
  const resolvedDuration =
    duration === undefined ? (action ? 6000 : 4000) : duration;

  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);
  const remainingRef = useRef<number>(resolvedDuration ?? 0);
  const startRef = useRef<number>(0);

  // Keep the latest onDismiss without re-arming the timer on every parent render.
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    if (!resolvedDuration || paused) return;
    startRef.current = Date.now();
    timerRef.current = window.setTimeout(
      () => dismissRef.current(),
      remainingRef.current
    );
    return () => {
      window.clearTimeout(timerRef.current);
      remainingRef.current -= Date.now() - startRef.current;
    };
  }, [paused, resolvedDuration]);

  return (
    <div
      className={cn('emenu-toast', `emenu-toast--${semantic}`)}
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Icon className="emenu-toast__icon" size={20} aria-hidden="true" />
      <div className="emenu-toast__content">
        {title && <p className="emenu-toast__title">{title}</p>}
        <p className="emenu-toast__message">{message}</p>
      </div>
      {action && (
        <button
          type="button"
          className="emenu-toast__action"
          onClick={() => {
            action.onClick();
            onDismiss();
          }}
        >
          {action.label}
        </button>
      )}
      <button
        type="button"
        className="emenu-toast__close"
        aria-label="Dismiss notification"
        onClick={onDismiss}
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

Toast.displayName = 'Toast';

/* ------------------------------------------------------------------------- */
/* Provider + hook                                                           */
/* ------------------------------------------------------------------------- */

interface ToastEntry extends ToastOptions {
  id: number;
}

/** Imperative API exposed by `useToast`. */
export interface ToastContextValue {
  /** Enqueue a toast; returns its id. */
  show: (options: ToastOptions) => number;
  /** Dismiss a toast by id. */
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const MAX_VISIBLE = 3;

export interface ToastProviderProps {
  children?: ReactNode;
}

/**
 * ToastProvider — owns the toast queue and renders the stacked region (top-right,
 * max 3 visible) into a portal at `z-toast`. Wrap the app once, then call
 * `useToast()` anywhere to enqueue.
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((options: ToastOptions) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { ...options, id }]);
    return id;
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({ show, dismiss }),
    [show, dismiss]
  );

  const visible = toasts.slice(-MAX_VISIBLE);
  const overflow = toasts.length - visible.length;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            className="emenu-toast-region"
            aria-label="Notifications"
          >
            {visible.map((t) => (
              <Toast
                key={t.id}
                semantic={t.semantic}
                title={t.title}
                message={t.message}
                action={t.action}
                duration={t.duration}
                onDismiss={() => dismiss(t.id)}
              />
            ))}
            {overflow > 0 && (
              <div className="emenu-toast-region__overflow">
                +{overflow} more
              </div>
            )}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

ToastProvider.displayName = 'ToastProvider';

/** Access the toast API. Must be used within a `ToastProvider`. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>.');
  }
  return ctx;
}

export default Toast;
