import {
  Controller,
  MessageEvent,
  Query,
  Sse,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Observable, interval, map, merge } from 'rxjs';
import { JwtPayload } from '../auth/jwt.strategy';
import { NotificationsService } from './notifications.service';
import { NotificationEvent, ownerChannel } from './notifications.types';

/** How often to emit a keepalive so idle proxies don't drop the connection. */
const KEEPALIVE_MS = 25_000;

@Controller()
export class NotificationsController {
  constructor(
    private readonly notifications: NotificationsService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Server-Sent Events stream for a café's admin dashboard.
   *
   * `EventSource` can't send an Authorization header, so the JWT arrives in the
   * `token` query param and is verified here (same secret as the HTTP guard).
   * Every user of a café — the owner and their staff (kitchen, waiter) — joins
   * the same café channel, so all of them receive order notifications. One café
   * never sees another's orders.
   */
  @Sse('notifications/stream')
  @ApiExcludeEndpoint()
  stream(@Query('token') token?: string): Observable<MessageEvent> {
    const cafeId = this.verify(token);

    const events = this.notifications
      .stream([ownerChannel(cafeId)])
      .pipe(map(toMessageEvent));

    // Comment-style keepalive: a lightweight `ping` the client ignores.
    const keepalive = interval(KEEPALIVE_MS).pipe(
      map((): MessageEvent => ({ type: 'ping', data: {} })),
    );

    return merge(events, keepalive);
  }

  /**
   * Verify the token and return the caller's **effective café id**: their own
   * id for an owner, or their employing owner's id for staff. This is the
   * channel every user of a café shares.
   */
  private verify(token?: string): string {
    if (!token) {
      throw new UnauthorizedException('Missing token');
    }
    try {
      const payload = this.jwt.verify<JwtPayload>(token);
      return payload.ownerId ?? payload.sub;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

function toMessageEvent(event: NotificationEvent): MessageEvent {
  return { type: event.type, data: event.payload as string | object };
}
