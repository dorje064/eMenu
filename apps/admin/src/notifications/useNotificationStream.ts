import { useEffect, useRef } from 'react';
import { BASE_URL } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export type NotificationHandler = (type: string, data: unknown) => void;

/**
 * Generic subscription to the API's SSE notification stream
 * (`/notifications/stream`). Opens an EventSource authenticated with the
 * current JWT (passed as a query param — EventSource can't set headers) and
 * forwards every named event to `onEvent`. `ping` keepalives are ignored.
 *
 * Reusable for any future notification type — callers switch on `type`.
 * The connection is torn down and reopened when the token changes, and the
 * browser auto-reconnects on transient drops.
 */
export function useNotificationStream(onEvent: NotificationHandler): void {
  const { token } = useAuth();

  // Keep the latest handler without forcing the effect to reconnect.
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    if (!token) return;

    // BASE_URL may carry a trailing slash (VITE_API_URL is often `…/api/`).
    // Strip it so we don't produce `…/api//notifications/stream`, which the
    // Express route won't match (404 → the stream never connects).
    const base = BASE_URL.replace(/\/+$/, '');
    const url = `${base}/notifications/stream?token=${encodeURIComponent(
      token,
    )}`;
    const source = new EventSource(url);

    const dispatch = (event: MessageEvent) => {
      if (event.type === 'ping') return;
      let data: unknown = event.data;
      try {
        data = JSON.parse(event.data);
      } catch {
        // leave as-is if not JSON
      }
      handlerRef.current(event.type, data);
    };

    // Named events (server sets `type`) don't fire the generic `message`
    // handler, so listen for each type we care about explicitly.
    source.addEventListener('order.created', dispatch as EventListener);
    source.addEventListener('message', dispatch as EventListener);

    return () => source.close();
  }, [token]);
}
