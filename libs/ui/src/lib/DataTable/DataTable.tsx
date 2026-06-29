import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '../utils/cn';
import './DataTable.css';

export type DataTableDensity = 'comfortable' | 'compact';

export type ColumnAlign = 'start' | 'center' | 'end';

/** Sort direction for the active sorted column. */
export type SortDirection = 'asc' | 'desc';

export interface SortState<T> {
  /** Key of the column currently sorted. */
  key: keyof T | string;
  /** Active direction. */
  direction: SortDirection;
}

export interface DataTableColumn<T> {
  /** Unique column key; also used as the default accessor. */
  key: keyof T | string;
  /** Header label rendered in the `<th>`. */
  header: ReactNode;
  /** Cell alignment. Numeric/currency columns should use `'end'`. @default 'start' */
  align?: ColumnAlign;
  /** Allow sorting by this column (renders a sort button in the header). */
  sortable?: boolean;
  /**
   * Treat the cell as numeric: right-aligned with tabular figures.
   * Adds the `tnum` class. Implies `align: 'end'` when align is unset.
   */
  numeric?: boolean;
  /** Custom cell renderer. Receives the row and its id. */
  render?: (row: T, rowId: string) => ReactNode;
  /** Fixed/min width for the column, e.g. `'140px'`. */
  width?: string;
}

export interface DataTableProps<T> {
  /** Column definitions (generic, typed to the row shape). */
  columns: DataTableColumn<T>[];
  /** Row data. */
  rows: T[];
  /** Stable unique id for a row — used as React key and selection id. */
  getRowId: (row: T) => string;
  /** Accessible name for the table (maps to `aria-label`). */
  ariaLabel?: string;
  /** Visible `<caption>`; if omitted only `aria-label` is used. */
  caption?: ReactNode;
  /** Row height preset. @default 'comfortable' */
  density?: DataTableDensity;
  /** Pin the header row while the table body scrolls. @default true */
  stickyHeader?: boolean;
  /** Enable row selection (checkbox column + select-all header). */
  selectable?: boolean;
  /** Controlled set of selected row ids. */
  selectedIds?: string[];
  /** Selection change callback (controlled selection). */
  onSelectionChange?: (ids: string[]) => void;
  /** Show skeleton placeholder rows instead of data. */
  loading?: boolean;
  /** Number of skeleton rows to render while loading. @default 5 */
  skeletonRows?: number;
  /** Message shown when there are no rows and not loading. @default 'No records found' */
  emptyMessage?: ReactNode;
  /** Controlled sort state. */
  sort?: SortState<T> | null;
  /** Sort change callback. Fires when a sortable header is activated. */
  onSortChange?: (sort: SortState<T>) => void;
  /** Extra class on the scroll container. */
  className?: string;
}

function resolveAlign<T>(col: DataTableColumn<T>): ColumnAlign {
  if (col.align) return col.align;
  if (col.numeric) return 'end';
  return 'start';
}

function getValue<T>(row: T, key: keyof T | string): unknown {
  return (row as Record<string, unknown>)[key as string];
}

/**
 * DataTable — dense, scannable, accessible table for orders, menu items,
 * transactions and reports (spec §10.12). Semantic `<table>` with
 * `<th scope="col">`, sortable header buttons (`aria-sort`), optional row
 * selection with a select-all-page header checkbox, sticky header and
 * comfortable/compact density. Generic over the row type `T`.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowId,
  ariaLabel,
  caption,
  density = 'comfortable',
  stickyHeader = true,
  selectable = false,
  selectedIds,
  onSelectionChange,
  loading = false,
  skeletonRows = 5,
  emptyMessage = 'No records found',
  sort,
  onSortChange,
  className,
}: DataTableProps<T>) {
  // Uncontrolled selection fallback.
  const [internalSelected, setInternalSelected] = useState<string[]>([]);
  const selected = selectedIds ?? internalSelected;

  // Uncontrolled sort fallback.
  const [internalSort, setInternalSort] = useState<SortState<T> | null>(null);
  const activeSort = sort !== undefined ? sort : internalSort;

  const pageIds = useMemo(() => rows.map(getRowId), [rows, getRowId]);

  const sortedRows = useMemo(() => {
    if (!activeSort) return rows;
    const { key, direction } = activeSort;
    const factor = direction === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = getValue(a, key);
      const bv = getValue(b, key);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') {
        return (av - bv) * factor;
      }
      return String(av).localeCompare(String(bv)) * factor;
    });
  }, [rows, activeSort]);

  const allSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.includes(id));
  const someSelected = selected.length > 0 && !allSelected;

  const commitSelection = (ids: string[]) => {
    if (selectedIds === undefined) setInternalSelected(ids);
    onSelectionChange?.(ids);
  };

  const toggleAll = () => {
    if (allSelected) {
      commitSelection(selected.filter((id) => !pageIds.includes(id)));
    } else {
      const merged = Array.from(new Set([...selected, ...pageIds]));
      commitSelection(merged);
    }
  };

  const toggleRow = (id: string) => {
    if (selected.includes(id)) {
      commitSelection(selected.filter((s) => s !== id));
    } else {
      commitSelection([...selected, id]);
    }
  };

  const requestSort = (col: DataTableColumn<T>) => {
    const isActive = activeSort?.key === col.key;
    const direction: SortDirection =
      isActive && activeSort?.direction === 'asc' ? 'desc' : 'asc';
    const next: SortState<T> = { key: col.key, direction };
    if (sort === undefined) setInternalSort(next);
    onSortChange?.(next);
  };

  const colCount = columns.length + (selectable ? 1 : 0);
  const showEmpty = !loading && rows.length === 0;

  return (
    <div
      className={cn(
        'emenu-table',
        `emenu-table--${density}`,
        stickyHeader && 'emenu-table--sticky',
        className,
      )}
    >
      {selectable && (
        <div className="emenu-table__selection-status" aria-live="polite">
          {selected.length > 0 ? `${selected.length} selected` : ''}
        </div>
      )}
      <div className="emenu-table__scroll">
        <table
          className="emenu-table__table"
          aria-label={ariaLabel}
          aria-busy={loading || undefined}
        >
          {caption && (
            <caption className="emenu-table__caption">{caption}</caption>
          )}
          <thead className="emenu-table__head">
            <tr>
              {selectable && (
                <th
                  scope="col"
                  className="emenu-table__th emenu-table__th--checkbox"
                >
                  <input
                    type="checkbox"
                    className="emenu-table__checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleAll}
                    aria-label="Select all rows on this page"
                    disabled={loading || rows.length === 0}
                  />
                </th>
              )}
              {columns.map((col) => {
                const align = resolveAlign(col);
                const isSorted = activeSort?.key === col.key;
                const ariaSort = col.sortable
                  ? isSorted
                    ? activeSort?.direction === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                  : undefined;
                return (
                  <th
                    key={String(col.key)}
                    scope="col"
                    aria-sort={ariaSort}
                    style={col.width ? { width: col.width } : undefined}
                    className={cn(
                      'emenu-table__th',
                      `emenu-table__th--${align}`,
                    )}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        className="emenu-table__sort-btn"
                        onClick={() => requestSort(col)}
                      >
                        <span>{col.header}</span>
                        <span
                          className="emenu-table__sort-icon"
                          aria-hidden="true"
                        >
                          {isSorted ? (
                            activeSort?.direction === 'asc' ? (
                              <ArrowUp size={14} />
                            ) : (
                              <ArrowDown size={14} />
                            )
                          ) : (
                            <ChevronsUpDown size={14} />
                          )}
                        </span>
                      </button>
                    ) : (
                      <span className="emenu-table__th-label">
                        {col.header}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="emenu-table__body">
            {loading &&
              Array.from({ length: skeletonRows }).map((_, r) => (
                <tr key={`sk-${r}`} className="emenu-table__row">
                  {selectable && (
                    <td className="emenu-table__td emenu-table__td--checkbox">
                      <span className="emenu-table__skeleton emenu-table__skeleton--checkbox" />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={cn(
                        'emenu-table__td',
                        `emenu-table__td--${resolveAlign(col)}`,
                      )}
                    >
                      <span className="emenu-table__skeleton" />
                    </td>
                  ))}
                </tr>
              ))}

            {showEmpty && (
              <tr>
                <td colSpan={colCount} className="emenu-table__empty">
                  {emptyMessage}
                </td>
              </tr>
            )}

            {!loading &&
              sortedRows.map((row) => {
                const id = getRowId(row);
                const isSelected = selected.includes(id);
                return (
                  <tr
                    key={id}
                    className={cn(
                      'emenu-table__row',
                      isSelected && 'emenu-table__row--selected',
                    )}
                    aria-selected={selectable ? isSelected : undefined}
                  >
                    {selectable && (
                      <td className="emenu-table__td emenu-table__td--checkbox">
                        <input
                          type="checkbox"
                          className="emenu-table__checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(id)}
                          aria-label={`Select row ${id}`}
                        />
                      </td>
                    )}
                    {columns.map((col) => {
                      const align = resolveAlign(col);
                      const content = col.render
                        ? col.render(row, id)
                        : (getValue(row, col.key) as ReactNode);
                      return (
                        <td
                          key={String(col.key)}
                          className={cn(
                            'emenu-table__td',
                            `emenu-table__td--${align}`,
                            col.numeric && 'tnum',
                          )}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

DataTable.displayName = 'DataTable';

export default DataTable;
