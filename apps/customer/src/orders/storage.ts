/**
 * Tracks orders placed from *this device*. The customer app is anonymous, so
 * "My Orders" is scoped by what's remembered in localStorage rather than by a
 * logged-in account. We keep a light reference per order (id + café + table +
 * time); live details/status are re-fetched from the API by id.
 */
import type { Order } from '../api/types';

const KEY = 'emenu.customer.orders';
const MAX = 50;

export interface StoredOrderRef {
  id: string;
  cafeId: string;
  tableNumber: string;
  placedAt: string;
}

function readAll(): StoredOrderRef[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredOrderRef[]) : [];
  } catch {
    return [];
  }
}

/** Remember an order just placed from this device (newest first, de-duped). */
export function rememberOrder(order: Order, cafeId: string): void {
  const ref: StoredOrderRef = {
    id: order.id,
    cafeId,
    tableNumber: order.tableNumber,
    placedAt: order.createdAt,
  };
  const next = [ref, ...readAll().filter((o) => o.id !== order.id)].slice(
    0,
    MAX,
  );
  localStorage.setItem(KEY, JSON.stringify(next));
}

/** Stored order refs, newest first. Optionally filtered to one café. */
export function getStoredOrders(cafeId?: string): StoredOrderRef[] {
  const all = readAll();
  return cafeId ? all.filter((o) => o.cafeId === cafeId) : all;
}
