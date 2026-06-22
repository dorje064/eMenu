import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils/cn';
import { Button } from '../Button/Button';
import './EmptyState.css';

export type EmptyStateVariant =
  | 'first-use'
  | 'no-results'
  | 'cleared'
  | 'error-empty'
  | 'permission';
export type EmptyStateSize = 'inline' | 'full-page';

export interface EmptyStateAction {
  /** Button label. */
  label: string;
  /** Click handler. */
  onClick?: () => void;
}

export interface EmptyStateProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Icon (rendered `icon.xl`, muted, aria-hidden) or an illustration node. */
  icon?: ReactNode;
  /** Heading — a real heading in the page outline (`text.h4`). */
  title: string;
  /** Supportive copy, ≤ 2 lines, neutral-600. */
  description?: ReactNode;
  /** Primary call to action, rendered as a primary Button. */
  action?: EmptyStateAction;
  /** Optional secondary action, rendered as a link-style Button. */
  secondaryAction?: EmptyStateAction;
  /**
   * Context variant — drives copy/action intent and subtle styling so "empty
   * because new" reads differently from "filtered" or "error".
   * @default 'first-use'
   */
  variant?: EmptyStateVariant;
  /** Layout density. @default 'full-page' */
  size?: EmptyStateSize;
  /** Heading level for the title. @default 2 */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * EmptyState — guides users when there's no data: first-run onboarding,
 * filtered-to-zero, cleared/done, load error, or no permission. The meaning
 * lives in the text; illustrations are decorative.
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon,
      title,
      description,
      action,
      secondaryAction,
      variant = 'first-use',
      size = 'full-page',
      headingLevel = 2,
      className,
      ...rest
    },
    ref
  ) => {
    const Heading = `h${headingLevel}` as const;

    return (
      <div
        ref={ref}
        className={cn(
          'emenu-empty',
          `emenu-empty--${size}`,
          `emenu-empty--${variant}`,
          className
        )}
        {...rest}
      >
        {icon && (
          <div className="emenu-empty__icon" aria-hidden="true">
            {icon}
          </div>
        )}
        <Heading className="emenu-empty__title">{title}</Heading>
        {description && <p className="emenu-empty__desc">{description}</p>}
        {(action || secondaryAction) && (
          <div className="emenu-empty__actions">
            {action && (
              <Button variant="primary" onClick={action.onClick}>
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button variant="link" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

export default EmptyState;
