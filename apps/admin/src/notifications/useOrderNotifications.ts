import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@org/ui';
import type { Order } from '../api/types';
import { playChime } from './chime';
import { useNotificationStream } from './useNotificationStream';

const currency = (n: number) =>
  `NRs ${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)}`;

/**
 * Admin-side listener for new orders. On an `order.created` event it raises a
 * toast (with a "View" action linking to /orders) and plays the notification
 * tone. Mount once behind auth (DashboardLayout) so it runs on every page.
 */
export function useOrderNotifications(): void {
  const { show } = useToast();
  const navigate = useNavigate();

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
    },
    [show, navigate],
  );

  useNotificationStream(onEvent);
}
