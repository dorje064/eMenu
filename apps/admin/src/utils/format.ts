/** Shared formatting helpers for the admin app. Keeping currency/date logic in
 *  one place avoids the per-page drift that had crept in (see dashboard,
 *  expenses & chart). Currency matches the rest of the app's en-US grouping. */

const NRS = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format an amount as the restaurant's currency, e.g. "NRs 1,240.00". */
export function formatNrs(n: number): string {
  return `NRs ${NRS.format(n)}`;
}

/** Today as a local ISO date (YYYY-MM-DD). */
export function todayIso(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Parse a YYYY-MM-DD key into a local Date (no timezone shift). */
export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Human day label from a YYYY-MM-DD key, e.g. "Jul 7" or "Jul 7, 2026". */
export function formatDay(
  iso: string,
  opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' },
): string {
  return parseLocalDate(iso).toLocaleDateString(undefined, opts);
}
