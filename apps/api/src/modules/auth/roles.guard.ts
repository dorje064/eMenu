import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Customer } from './entities/customer.entity';
import { ROLES_KEY } from './roles.decorator';
import type { UserRole } from './roles';

/**
 * Enforces `@Roles(...)` metadata against the authenticated user's role. Runs
 * after {@link JwtAuthGuard} (which populates `req.user`). Routes without
 * `@Roles(...)` are open to any authenticated user.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const user = context.switchToHttp().getRequest().user as
      | Customer
      | undefined;
    if (!user || !required.includes(user.role)) {
      throw new ForbiddenException(
        'Your role does not have access to this action',
      );
    }
    return true;
  }
}
