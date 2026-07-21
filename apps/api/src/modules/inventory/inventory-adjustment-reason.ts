/** Why an inventory item's quantity changed. Manual reasons are chosen by the
 *  owner on the adjust form; `sale`/`sale-reverted` are written automatically
 *  when an order is marked paid / un-paid. */
export const MANUAL_ADJUSTMENT_REASONS = [
  'restock',
  'waste',
  'correction',
] as const;

export const ADJUSTMENT_REASONS = [
  ...MANUAL_ADJUSTMENT_REASONS,
  'sale',
  'sale-reverted',
] as const;

export type ManualAdjustmentReason = (typeof MANUAL_ADJUSTMENT_REASONS)[number];
export type AdjustmentReason = (typeof ADJUSTMENT_REASONS)[number];
