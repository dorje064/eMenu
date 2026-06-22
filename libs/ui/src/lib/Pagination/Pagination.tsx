import { useId } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '../utils/cn';
import './Pagination.css';

/** Available page-size options for the optional selector. */
export type PageSizeOption = 10 | 25 | 50 | 100;

export interface PaginationProps {
  /** Current 1-based page. */
  page: number;
  /** Total number of pages. */
  pageCount: number;
  /** Called with the requested 1-based page. */
  onPageChange: (page: number) => void;
  /** Current page size; renders the page-size selector when paired with `onPageSizeChange`. */
  pageSize?: PageSizeOption;
  /** Page-size change handler. */
  onPageSizeChange?: (size: PageSizeOption) => void;
  /** Total item count; enables the "Showing 1–25 of 312" range text. */
  totalItems?: number;
  /** Page-size choices. @default [10, 25, 50, 100] */
  pageSizeOptions?: PageSizeOption[];
  /**
   * How many page links to show around the current page (each side).
   * @default 1
   */
  siblingCount?: number;
  /** Extra class on the `<nav>`. */
  className?: string;
}

const DOTS = 'dots' as const;
type PageItem = number | typeof DOTS;

function range(start: number, end: number): number[] {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

/** Build the truncated page list, e.g. `1 … 4 5 6 … 20`. */
function buildPages(page: number, pageCount: number, siblingCount: number): PageItem[] {
  // first + last + current + 2*siblings + 2 dots
  const totalSlots = siblingCount * 2 + 5;
  if (pageCount <= totalSlots) return range(1, pageCount);

  const leftSibling = Math.max(page - siblingCount, 1);
  const rightSibling = Math.min(page + siblingCount, pageCount);

  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < pageCount - 1;

  if (!showLeftDots && showRightDots) {
    const leftCount = siblingCount * 2 + 3;
    return [...range(1, leftCount), DOTS, pageCount];
  }
  if (showLeftDots && !showRightDots) {
    const rightCount = siblingCount * 2 + 3;
    return [1, DOTS, ...range(pageCount - rightCount + 1, pageCount)];
  }
  return [1, DOTS, ...range(leftSibling, rightSibling), DOTS, pageCount];
}

/**
 * Pagination — navigate large record sets (spec §10.17). Renders a
 * `<nav aria-label="Pagination">` with first/last/prev/next controls and
 * truncated numbered pages. The current page is marked `aria-current="page"`
 * and distinguished by fill + weight (not color alone). Prev/Next use
 * `aria-disabled` at the bounds rather than becoming focus traps. Optionally
 * renders a page-size selector and an `aria-live` result-range message.
 */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalItems,
  pageSizeOptions = [10, 25, 50, 100],
  siblingCount = 1,
  className,
}: PaginationProps) {
  const selectId = useId();
  const pages = buildPages(page, pageCount, siblingCount);

  const atStart = page <= 1;
  const atEnd = page >= pageCount;

  const go = (target: number) => {
    const clamped = Math.min(Math.max(target, 1), pageCount);
    if (clamped !== page) onPageChange(clamped);
  };

  let rangeText: string | null = null;
  if (totalItems != null && pageSize != null) {
    if (totalItems === 0) {
      rangeText = 'No results';
    } else {
      const start = (page - 1) * pageSize + 1;
      const end = Math.min(page * pageSize, totalItems);
      rangeText = `Showing ${start}–${end} of ${totalItems}`;
    }
  }

  const showSizeSelector = pageSize != null && onPageSizeChange != null;

  return (
    <nav aria-label="Pagination" className={cn('emenu-pagination', className)}>
      {(rangeText || showSizeSelector) && (
        <div className="emenu-pagination__meta">
          {rangeText && (
            <p className="emenu-pagination__range" aria-live="polite">
              {rangeText}
            </p>
          )}
          {showSizeSelector && (
            <div className="emenu-pagination__size">
              <label htmlFor={selectId} className="emenu-pagination__size-label">
                Rows per page
              </label>
              <select
                id={selectId}
                className="emenu-pagination__select"
                value={pageSize}
                onChange={(e) =>
                  onPageSizeChange?.(Number(e.target.value) as PageSizeOption)
                }
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      <ul className="emenu-pagination__list">
        <li>
          <button
            type="button"
            className="emenu-pagination__btn emenu-pagination__btn--edge"
            aria-label="First page"
            aria-disabled={atStart || undefined}
            disabled={atStart}
            onClick={() => go(1)}
          >
            <ChevronsLeft size={18} aria-hidden="true" />
          </button>
        </li>
        <li>
          <button
            type="button"
            className="emenu-pagination__btn emenu-pagination__btn--edge"
            aria-label="Previous page"
            aria-disabled={atStart || undefined}
            disabled={atStart}
            onClick={() => go(page - 1)}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
        </li>

        {pages.map((item, idx) =>
          item === DOTS ? (
            <li key={`dots-${idx}`} aria-hidden="true" className="emenu-pagination__dots">
              &hellip;
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                className={cn(
                  'emenu-pagination__btn',
                  'emenu-pagination__btn--page',
                  item === page && 'emenu-pagination__btn--current'
                )}
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
                onClick={() => go(item)}
              >
                {item}
              </button>
            </li>
          )
        )}

        <li>
          <button
            type="button"
            className="emenu-pagination__btn emenu-pagination__btn--edge"
            aria-label="Next page"
            aria-disabled={atEnd || undefined}
            disabled={atEnd}
            onClick={() => go(page + 1)}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </li>
        <li>
          <button
            type="button"
            className="emenu-pagination__btn emenu-pagination__btn--edge"
            aria-label="Last page"
            aria-disabled={atEnd || undefined}
            disabled={atEnd}
            onClick={() => go(pageCount)}
          >
            <ChevronsRight size={18} aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  );
}

Pagination.displayName = 'Pagination';

export default Pagination;
