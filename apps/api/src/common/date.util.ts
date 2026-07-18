/**
 * Server-side day helpers. The API groups sales/expenses by the server's local
 * calendar day; both the orders stats and the expenses module share these so
 * "today" means one thing across the codebase.
 */

/** Midnight (local time) of the given date. */
export function startOfLocalDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Local-time YYYY-MM-DD key for grouping/comparing by day. */
export function localDateKey(date: Date): string {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
