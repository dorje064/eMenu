import type { UserRole } from '../api/types';

/** Gated areas/actions of the admin app. */
export type Feature =
  | 'dashboard'
  | 'orders'
  | 'markPaid'
  | 'tables'
  | 'menu'
  | 'categories'
  | 'settings'
  | 'staff';

/**
 * Role → allowed features (the locked "Orders-focused" matrix). Owners have
 * full access; staff are limited here at code level. This is the single source
 * of truth shared by nav, route guards and page-level UI.
 */
const ACCESS: Record<UserRole, Set<Feature>> = {
  owner: new Set([
    'dashboard',
    'orders',
    'markPaid',
    'tables',
    'menu',
    'categories',
    'settings',
    'staff',
  ]),
  kitchen: new Set(['orders']),
  waiter: new Set(['orders', 'markPaid', 'tables']),
};

export function can(role: UserRole | undefined, feature: Feature): boolean {
  return role ? ACCESS[role].has(feature) : false;
}

/** Where a role should land after login / when hitting a disallowed route. */
export function homePathFor(role: UserRole | undefined): string {
  return role === 'owner' ? '/' : '/orders';
}
