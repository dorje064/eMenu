/**
 * User roles for an eMenu account. A café **owner** owns all data; **staff**
 * (kitchen / waiter) belong to an owner and have limited, code-defined access.
 */
export const USER_ROLES = ['owner', 'kitchen', 'waiter'] as const;

export type UserRole = (typeof USER_ROLES)[number];

/** Roles an owner may assign when creating staff (never another owner). */
export const STAFF_ROLES = ['kitchen', 'waiter'] as const satisfies readonly UserRole[];

export type StaffRole = (typeof STAFF_ROLES)[number];
