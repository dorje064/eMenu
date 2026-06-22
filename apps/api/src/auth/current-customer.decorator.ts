import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Customer } from './entities/customer.entity';

/** Injects the authenticated customer (set by JwtStrategy.validate). */
export const CurrentCustomer = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Customer => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
