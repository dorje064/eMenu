import { forwardRef, useId, useState } from 'react';
import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from 'react';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { cn } from '../utils/cn';
import './Input.css';

export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'currency'
  | 'textarea';
export type InputSize = 'md' | 'lg';

/** Native attributes shared by `<input>` and `<textarea>` we delegate to the field. */
type NativeFieldAttrs = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'prefix' | 'type'
> &
  Pick<TextareaHTMLAttributes<HTMLTextAreaElement>, 'rows'>;

export interface InputProps extends NativeFieldAttrs {
  /** Field type. `currency` renders text input with a `$` prefix + numeric inputmode; `textarea` renders a multi-line field. @default 'text' */
  type?: InputType;
  /** Visible top-aligned label. Always rendered for a11y — never use placeholder as the label. */
  label?: ReactNode;
  /** Control height. `md` 40px (dashboard) · `lg` 48px (customer). @default 'md' */
  size?: InputSize;
  /** Marks the field required: shows `*` and sets `aria-required`. @default false */
  required?: boolean;
  /** Helper/hint text shown beneath the field. Its row height is always reserved to avoid layout shift. */
  helperText?: ReactNode;
  /** Error message. When set, the field is styled invalid, gets `aria-invalid` and an alert icon, and this replaces the helper text. */
  error?: ReactNode;
  /** Marks the field validated/successful (e.g. unique slug). Ignored when `error` is set. @default false */
  success?: boolean;
  /** Icon rendered inside the field, before the value. Decorative. */
  leadingIcon?: ReactNode;
  /** Icon or button rendered inside the field, after the value. Suppressed for password (reveal toggle) and currency types where the slot is reserved. */
  trailingIcon?: ReactNode;
  /** Static text rendered before the value (e.g. `$`). Currency type adds `$` automatically. */
  prefix?: ReactNode;
  /** Static text rendered after the value (e.g. `min`, `%`). */
  suffix?: ReactNode;
  /** Read-only: value shown, not editable; renders borderless on a transparent background. @default false */
  readOnly?: boolean;
}

/**
 * Input — the text field primitive. Top-aligned label, optional adornments,
 * helper/error text, success state, and md/lg densities. Supports text, email,
 * password (with reveal toggle), number, currency, and textarea types.
 */
export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (
    {
      type = 'text',
      label,
      size = 'md',
      required = false,
      helperText,
      error,
      success = false,
      leadingIcon,
      trailingIcon,
      prefix,
      suffix,
      readOnly = false,
      disabled,
      id: idProp,
      className,
      inputMode,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const describedById = `${id}-desc`;

    const [revealed, setRevealed] = useState(false);

    const isTextarea = type === 'textarea';
    const isPassword = type === 'password';
    const isCurrency = type === 'currency';
    const isInvalid = Boolean(error);
    const isSuccess = success && !isInvalid;

    const description = error ?? helperText;

    // Resolve the native input type and mobile keyboard hints.
    const nativeType = isPassword
      ? revealed
        ? 'text'
        : 'password'
      : isCurrency
      ? 'text'
      : type === 'textarea'
      ? undefined
      : type;
    const resolvedInputMode =
      inputMode ??
      (isCurrency ? 'decimal' : type === 'number' ? 'numeric' : undefined);

    // Currency provides a `$` prefix unless the consumer set their own.
    const resolvedPrefix = isCurrency && prefix == null ? '$' : prefix;

    // Trailing slot priority: password reveal > success/error status icon > custom icon.
    const statusIcon = isInvalid ? (
      <AlertCircle className="emenu-input__status-icon emenu-input__status-icon--error" aria-hidden="true" size={18} />
    ) : isSuccess ? (
      <Check className="emenu-input__status-icon emenu-input__status-icon--success" aria-hidden="true" size={18} />
    ) : null;

    const fieldClassName = cn('emenu-input__field', className);

    const sharedProps = {
      id,
      'aria-required': required || undefined,
      'aria-invalid': isInvalid || undefined,
      'aria-describedby': description ? describedById : undefined,
      disabled,
      readOnly,
      required,
      className: fieldClassName,
      ...rest,
    };

    return (
      <div
        className={cn(
          'emenu-input',
          `emenu-input--${size}`,
          isInvalid && 'emenu-input--error',
          isSuccess && 'emenu-input--success',
          disabled && 'emenu-input--disabled',
          readOnly && 'emenu-input--readonly'
        )}
      >
        {label != null && (
          <label className="emenu-input__label" htmlFor={id}>
            {label}
            {required && (
              <span className="emenu-input__required" aria-hidden="true">
                {' '}
                *
              </span>
            )}
          </label>
        )}

        <div
          className={cn(
            'emenu-input__control',
            isTextarea && 'emenu-input__control--textarea'
          )}
        >
          {leadingIcon && (
            <span className="emenu-input__adornment emenu-input__adornment--leading" aria-hidden="true">
              {leadingIcon}
            </span>
          )}
          {resolvedPrefix != null && (
            <span className="emenu-input__affix emenu-input__affix--prefix" aria-hidden="true">
              {resolvedPrefix}
            </span>
          )}

          {isTextarea ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              {...(sharedProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              type={nativeType}
              inputMode={resolvedInputMode}
              {...(sharedProps as InputHTMLAttributes<HTMLInputElement>)}
            />
          )}

          {suffix != null && (
            <span className="emenu-input__affix emenu-input__affix--suffix" aria-hidden="true">
              {suffix}
            </span>
          )}

          {isPassword ? (
            <button
              type="button"
              className="emenu-input__reveal"
              onClick={() => setRevealed((v) => !v)}
              aria-label={revealed ? 'Hide password' : 'Show password'}
              aria-pressed={revealed}
              disabled={disabled}
              tabIndex={disabled ? -1 : 0}
            >
              {revealed ? (
                <EyeOff aria-hidden="true" size={18} />
              ) : (
                <Eye aria-hidden="true" size={18} />
              )}
            </button>
          ) : statusIcon ? (
            <span className="emenu-input__adornment emenu-input__adornment--trailing">
              {statusIcon}
            </span>
          ) : (
            trailingIcon && (
              <span className="emenu-input__adornment emenu-input__adornment--trailing" aria-hidden="true">
                {trailingIcon}
              </span>
            )
          )}
        </div>

        {/* Helper/error row — height always reserved to prevent layout shift. */}
        <p
          id={describedById}
          className="emenu-input__helper"
          role={isInvalid ? 'alert' : undefined}
        >
          {description}
        </p>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
