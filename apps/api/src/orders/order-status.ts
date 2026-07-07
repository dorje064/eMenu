export const ORDER_STATUSES = [
  'pending',
  'preparing',
  'served',
  'paid',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Lifecycle rank used to pick a representative status when merging orders —
 *  a merged order keeps the earliest (least advanced) stage of its sources. */
export const ORDER_STATUS_RANK: Record<OrderStatus, number> = {
  pending: 0,
  preparing: 1,
  served: 2,
  paid: 3,
  cancelled: 4,
};
