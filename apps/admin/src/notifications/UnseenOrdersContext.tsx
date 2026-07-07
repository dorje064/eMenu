import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@org/ui';
import type { Order } from '../api/types';
import { playChime } from './chime';
import { useNotificationStream } from './useNotificationStream';

const STORAGE_KEY = 'emenu.admin.unseenOrders';

const currency = (n: number) =>
  `NRs ${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)}`;

interface UnseenOrdersValue {
  /** Orders received but not yet viewed on the Orders page. */
  count: number;
  /** Reset the unseen count (called when the admin views Orders). */
  clear: () => void;
}

const UnseenOrdersContext = createContext<UnseenOrdersValue | null>(null);

/**
 * Single subscriber to the SSE notification stream for the authenticated shell.
 * On `order.created` it raises a toast, plays the tone, and bumps the unseen
 * count shown as a badge in the sidebar. The count is mirrored to localStorage
 * so a page reload doesn't lose it. Cleared when the Orders page is viewed.
 */
export function UnseenOrdersProvider({ children }: { children: ReactNode }) {
  const { show } = useToast();
  const navigate = useNavigate();

  const [count, setCount] = useState<number>(
    () => Number(localStorage.getItem(STORAGE_KEY)) || 0,
  );

  const clear = useCallback(() => {
    setCount(0);
    localStorage.setItem(STORAGE_KEY, '0');
  }, []);

  const onEvent = useCallback(
    (type: string, data: unknown) => {
      if (type !== 'order.created') return;
      const order = data as Order;
      const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

      show({
        semantic: 'info',
        title: `New order · Table ${order.tableNumber}`,
        message: `${itemCount} item${itemCount === 1 ? '' : 's'} · ${currency(
          order.total,
        )}`,
        action: { label: 'View', onClick: () => navigate('/orders') },
      });
      playChime();

      setCount((c) => {
        const next = c + 1;
        localStorage.setItem(STORAGE_KEY, String(next));
        return next;
      });
    },
    [show, navigate],
  );

  useNotificationStream(onEvent);

  return (
    <UnseenOrdersContext.Provider value={{ count, clear }}>
      {children}
    </UnseenOrdersContext.Provider>
  );
}

export function useUnseenOrders(): UnseenOrdersValue {
  const ctx = useContext(UnseenOrdersContext);
  if (!ctx) {
    throw new Error('useUnseenOrders must be used within UnseenOrdersProvider');
  }
  return ctx;
}
