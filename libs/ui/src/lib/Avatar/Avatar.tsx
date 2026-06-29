import { forwardRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { User } from 'lucide-react';
import { cn } from '../utils/cn';
import './Avatar.css';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarShape = 'circle' | 'rounded-square';
export type AvatarStatus = 'online' | 'away' | 'offline' | 'busy';

const STATUS_LABELS: Record<AvatarStatus, string> = {
  online: 'Online',
  away: 'Away',
  offline: 'Offline',
  busy: 'Busy',
};

/** Contrast-safe initials backgrounds — each pairs with white text (≥ 4.5:1). */
const PALETTE = [
  'emenu-avatar--c0',
  'emenu-avatar--c1',
  'emenu-avatar--c2',
  'emenu-avatar--c3',
  'emenu-avatar--c4',
  'emenu-avatar--c5',
];

/** Derive up to two uppercase initials from a name. */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Stable palette index from a name (deterministic). */
function paletteFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Person or restaurant name. Drives `alt`, initials, and the auto color. */
  name: string;
  /** Image source. On error, falls back to initials. */
  src?: string;
  /** Size token. @default 'md' */
  size?: AvatarSize;
  /** Shape — `rounded-square` for restaurants/brands. @default 'circle' */
  shape?: AvatarShape;
  /** Presence dot; its meaning is exposed via `aria-label`, not color alone. */
  status?: AvatarStatus;
  /** Override the icon fallback (used when there's no image and no name). */
  fallbackIcon?: ReactNode;
  /** Hide from the a11y tree entirely (purely decorative avatar). @default false */
  decorative?: boolean;
}

/**
 * Avatar — image, auto-initials, or icon fallback for users/staff/restaurants.
 * Image errors degrade gracefully to initials; initials get a deterministic,
 * contrast-safe background.
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  (
    {
      name,
      src,
      size = 'md',
      shape = 'circle',
      status,
      fallbackIcon,
      decorative = false,
      className,
      ...rest
    },
    ref,
  ) => {
    const [imgFailed, setImgFailed] = useState(false);
    const showImage = !!src && !imgFailed;
    const initials = getInitials(name);
    const showInitials = !showImage && initials.length > 0;
    const colorClass = showInitials ? paletteFor(name) : undefined;

    const a11y = decorative
      ? { 'aria-hidden': true as const }
      : showImage
        ? {}
        : { role: 'img', 'aria-label': name };

    return (
      <span
        ref={ref}
        className={cn(
          'emenu-avatar',
          `emenu-avatar--${size}`,
          `emenu-avatar--${shape}`,
          colorClass,
          className,
        )}
        {...a11y}
        {...rest}
      >
        {showImage ? (
          <img
            className="emenu-avatar__img"
            src={src}
            alt={decorative ? '' : name}
            onError={() => setImgFailed(true)}
          />
        ) : showInitials ? (
          <span className="emenu-avatar__initials" aria-hidden="true">
            {initials}
          </span>
        ) : (
          <span className="emenu-avatar__icon" aria-hidden="true">
            {fallbackIcon ?? <User />}
          </span>
        )}

        {status && (
          <span
            className={cn(
              'emenu-avatar__status',
              `emenu-avatar__status--${status}`,
            )}
            role="img"
            aria-label={STATUS_LABELS[status]}
          />
        )}
      </span>
    );
  },
);

Avatar.displayName = 'Avatar';

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Avatar elements to stack. */
  children: ReactNode;
  /** Maximum avatars to show before collapsing into a "+N" chip. @default 4 */
  max?: number;
  /** Size applied to the overflow chip (match the avatars). @default 'md' */
  size?: AvatarSize;
  /** Accessible label for the whole group, e.g. "Staff on shift". */
  label?: string;
}

/**
 * AvatarGroup — overlapping stack of avatars with a "+N" overflow chip,
 * e.g. staff assigned to a shift.
 */
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ children, max = 4, size = 'md', label, className, ...rest }, ref) => {
    const items = Array.isArray(children) ? children.flat() : [children];
    const visible = items.slice(0, max);
    const overflow = items.length - visible.length;

    return (
      <div
        ref={ref}
        className={cn('emenu-avatar-group', className)}
        role="group"
        aria-label={label}
        {...rest}
      >
        {visible.map((child, i) => (
          <span className="emenu-avatar-group__item" key={i}>
            {child}
          </span>
        ))}
        {overflow > 0 && (
          <span
            className={cn(
              'emenu-avatar',
              `emenu-avatar--${size}`,
              'emenu-avatar--circle',
              'emenu-avatar-group__item',
              'emenu-avatar-group__overflow',
            )}
            role="img"
            aria-label={`${overflow} more`}
          >
            <span className="emenu-avatar__initials" aria-hidden="true">
              +{overflow}
            </span>
          </span>
        )}
      </div>
    );
  },
);

AvatarGroup.displayName = 'AvatarGroup';

export default Avatar;
