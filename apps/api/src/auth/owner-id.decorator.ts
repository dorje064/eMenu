import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Customer } from './entities/customer.entity';

/**
 * Resolves the authenticated user's **effective café id** from the request.
 * The JWT strategy attaches the Customer entity as `req.user`. For an owner
 * this is their own id; for a staff member it is their employing owner's id
 * (`ownerId`), so all owner-scoped data (categories, menu, tables, orders…)
 * transparently resolves to the café the user belongs to.
 */
export const OwnerId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const user = ctx.switchToHttp().getRequest().user as Customer;
    return user.ownerId ?? user.id;
  }
);
