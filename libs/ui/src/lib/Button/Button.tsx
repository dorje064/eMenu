import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';
import './Button.css';

export type ButtonVariant =
  'primary' | 'secondary' | 'tertiary' | 'destructive' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';
export type ButtonShape = 'default' | 'pill' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual hierarchy. @default 'primary' */
  variant?: ButtonVariant;
  /** Height/size. @default 'md' */
  size?: ButtonSize;
  /** Corner shape. `icon` renders a square icon-only button (requires aria-label). */
  shape?: ButtonShape;
  /** Stretch to fill the container width (e.g. sticky mobile CTA). */
  fullWidth?: boolean;
  /** Show a spinner and lock the width; the button becomes non-interactive. */
  loading?: boolean;
  /** Icon rendered before the label. */
  leadingIcon?: ReactNode;
  /** Icon rendered after the label. */
  trailingIcon?: ReactNode;
  children?: ReactNode;
}

/**
 * Button — the primary action control. Drives one-click ordering and every
 * confirm/save flow. Renders a real `<button>` with explicit `type`.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      shape = 'default',
      fullWidth = false,
      loading = false,
      leadingIcon,
      trailingIcon,
      disabled,
      type = 'button',
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          'emenu-btn',
          `emenu-btn--${variant}`,
          `emenu-btn--${size}`,
          shape !== 'default' && `emenu-btn--${shape}`,
          fullWidth && 'emenu-btn--full',
          loading && 'emenu-btn--loading',
          className,
        )}
        {...rest}
      >
        {loading ? (
          <Loader2
            className="emenu-btn__spinner"
            aria-hidden="true"
            size={18}
          />
        ) : (
          leadingIcon && (
            <span className="emenu-btn__icon" aria-hidden="true">
              {leadingIcon}
            </span>
          )
        )}
        {children && <span className="emenu-btn__label">{children}</span>}
        {!loading && trailingIcon && (
          <span className="emenu-btn__icon" aria-hidden="true">
            {trailingIcon}
          </span>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
