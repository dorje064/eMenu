export const ORDER_STATUSES = [
  'pending',
  'preparing',
  'served',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
