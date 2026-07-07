import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

import type { UserRole } from './roles';

export interface JwtPayload {
  /** customer id */
  sub: string;
  email: string;
  role: UserRole;
  /** employing owner's id (null for owners) */
  ownerId: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'dev-insecure-secret',
    });
  }

  /** Return value is attached to request.user. */
  async validate(payload: JwtPayload) {
    const customer = await this.authService.findById(payload.sub);
    if (!customer) {
      throw new UnauthorizedException('Account no longer exists');
    }
    if (!customer.active) {
      throw new UnauthorizedException('Account has been deactivated');
    }
    return customer;
  }
}
