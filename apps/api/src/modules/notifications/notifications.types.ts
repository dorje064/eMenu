/**
 * Generic, transport-agnostic notification primitives.
 *
 * A notification is addressed to a **channel** — an opaque string a client is
 * subscribed to. Today the only channel is a café owner (`owner:<id>`), but the
 * model is deliberately open so future producers can target other audiences
 * (e.g. `order:<id>`, `table:<cafeId>:<name>`) without touching the transport.
 */

/** Event kinds carried over the notification bus. Extend as features are added. */
export type NotificationType =
  | 'order.created'
  // future: 'order.ready' | 'order.served' | ...
  | 'ping';

export interface NotificationEvent {
  /** What happened. Consumers switch on this. */
  type: NotificationType;
  /** Addressed channel — clients only receive events on channels they joined. */
  channel: string;
  /** Arbitrary, type-specific payload (already shaped for the client). */
  payload: unknown;
  /** Epoch ms the event was published. */
  ts: number;
}

/** Channel a café owner's admin dashboard subscribes to. */
export const ownerChannel = (ownerId: string): string => `owner:${ownerId}`;
