import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ChangeEvent, KeyboardEvent } from 'react';
import { Search as SearchIcon, X, Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';
import './Search.css';

export type SearchSize = 'md' | 'lg';

export interface SearchProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type' | 'onChange' | 'value'
> {
  /** Current query (controlled). @default '' */
  value?: string;
  /** Fired on every keystroke; receives the next string value. */
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  /** Fired when the clear (×) button is pressed or Esc clears a populated field. */
  onClear?: () => void;
  /** Accessible label for the searchbox. @default 'Search' */
  label?: string;
  /** Control height. `md` 40px (dashboard) · `lg` 48px (customer). @default 'md' */
  size?: SearchSize;
  /** Show an inline spinner while live results are loading. @default false */
  loading?: boolean;
  /**
   * Number of matching results. When provided, announced politely via
   * `aria-live` so screen-reader users hear the count update as they type.
   */
  resultsCount?: number;
}

/**
 * Search — a focused search field for finding menu items and filtering
 * orders/menu/staff. Leading search icon, trailing clear button when
 * populated, optional inline spinner, and a polite live region for the
 * results count. A full combobox/suggestions list is out of scope.
 */
export const Search = forwardRef<HTMLInputElement, SearchProps>(
  (
    {
      value = '',
      onChange,
      onClear,
      label = 'Search',
      size = 'md',
      loading = false,
      resultsCount,
      placeholder = 'Search menu…',
      disabled,
      id: idProp,
      className,
      onKeyDown,
      ...rest
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const statusId = `${id}-status`;
    const hasValue = value.length > 0;

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      onChange?.(event.target.value, event);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Escape' && hasValue) {
        onClear?.();
      }
      onKeyDown?.(event);
    };

    return (
      <div
        className={cn(
          'emenu-search',
          `emenu-search--${size}`,
          disabled && 'emenu-search--disabled',
          className,
        )}
      >
        <div className="emenu-search__control">
          <SearchIcon
            className="emenu-search__icon"
            aria-hidden="true"
            size={18}
          />

          <input
            ref={ref}
            id={id}
            type="search"
            role="searchbox"
            className="emenu-search__field"
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            aria-label={label}
            aria-describedby={resultsCount != null ? statusId : undefined}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            {...rest}
          />

          {loading && (
            <Loader2
              className="emenu-search__spinner"
              aria-hidden="true"
              size={18}
            />
          )}

          {hasValue && !loading && (
            <button
              type="button"
              className="emenu-search__clear"
              aria-label="Clear search"
              onClick={onClear}
              disabled={disabled}
            >
              <X aria-hidden="true" size={18} />
            </button>
          )}
        </div>

        {/* Polite live region — announces result counts without stealing focus. */}
        <span id={statusId} className="emenu-search__status" aria-live="polite">
          {resultsCount != null
            ? `${resultsCount} ${resultsCount === 1 ? 'result' : 'results'}`
            : ''}
        </span>
      </div>
    );
  },
);

Search.displayName = 'Search';

export default Search;
