import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Customer } from './entities/customer.entity';

/**
 * Resolves the authenticated café owner's id from the request.
 * The JWT strategy attaches the Customer entity as `req.user`, and each
 * account owns its own isolated data (categories, menu, tables, orders…).
 */
export const OwnerId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return (request.user as Customer).id;
  }
);
