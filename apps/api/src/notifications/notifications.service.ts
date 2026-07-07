import { Injectable } from '@nestjs/common';
import { Observable, Subject, filter } from 'rxjs';
import {
  NotificationEvent,
  NotificationType,
  ownerChannel,
} from './notifications.types';

/**
 * In-process notification bus. Producers call {@link publish} (or a convenience
 * like {@link emitToOwner}); subscribers get a filtered stream via {@link stream}.
 *
 * Backed by a single RxJS Subject: publishing with no subscribers is a safe
 * no-op, so callers (e.g. order creation) never block or fail on notifications.
 * Reusable across features — the SSE controller is just one consumer.
 */
@Injectable()
export class NotificationsService {
  private readonly subject = new Subject<NotificationEvent>();

  /** Publish a fully-formed event to its channel. */
  publish(event: Omit<NotificationEvent, 'ts'>): void {
    this.subject.next({ ...event, ts: Date.now() });
  }

  /** Convenience: notify a single café owner's dashboard. */
  emitToOwner(
    ownerId: string,
    type: NotificationType,
    payload: unknown,
  ): void {
    this.publish({ type, channel: ownerChannel(ownerId), payload });
  }

  /** Stream of events restricted to the given channels. */
  stream(channels: string[]): Observable<NotificationEvent> {
    const allowed = new Set(channels);
    return this.subject.pipe(filter((e) => allowed.has(e.channel)));
  }
}
