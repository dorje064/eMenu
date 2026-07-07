import { SetMetadata } from '@nestjs/common';
import type { UserRole } from './roles';

export const ROLES_KEY = 'roles';

/**
 * Restrict a route (or controller) to the given roles. Used with
 * {@link RolesGuard}. With no `@Roles(...)`, any authenticated user is allowed.
 *
 * @example
 * @Roles('owner')            // owner only
 * @Roles('owner', 'waiter')  // owner or waiter
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
