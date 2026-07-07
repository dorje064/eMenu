import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import {
  Button,
  EmptyState,
  OrderStatusBadge,
  Spinner,
  useToast,
} from '@org/ui';
import { ordersApi } from '../api/orders.api';
import { ApiError } from '../api/client';
import { getStoredOrders } from '../orders/storage';
import type { Order } from '../api/types';
import './MenuPage.css';
import './MyOrdersPage.css';

const currency = (n: number) =>
  `NRs ${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)}`;

/** API status → OrderStatusBadge (canonical UI vocabulary) + display label. */
const STATUS_BADGE = {
  pending: { badge: 'placed', label: 'Received' },
  preparing: { badge: 'preparing', label: 'Preparing' },
  served: { badge: 'completed', label: 'Served' },
  paid: { badge: 'completed', label: 'Paid' },
  cancelled: { badge: 'cancelled', label: 'Cancelled' },
} as const;

type ApiStatus = keyof typeof STATUS_BADGE;

const timeFmt = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export function MyOrdersPage() {
  const [params] = useSearchParams();
  const cafe = params.get('cafe')?.trim() ?? '';

  const { show } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    // Orders remembered on this device (for this café if we know it).
    const refs = getStoredOrders(cafe || undefined);
    try {
      const results = await Promise.allSettled(
        refs.map((r) => ordersApi.get(r.id)),
      );
      // Keep the ones that still exist; drop 404s silently.
      const fetched = results
        .filter(
          (r): r is PromiseFulfilledResult<Order> => r.status === 'fulfilled',
        )
        .map((r) => r.value);
      setOrders(fetched);
    } catch (err) {
      show({
        semantic: 'error',
        message:
          err instanceof ApiError ? err.message : 'Could not load your orders.',
      });
    } finally {
      setLoading(false);
    }
  }, [cafe, show]);

  useEffect(() => {
    load();
  }, [load]);

  const menuLink = { pathname: '/', search: `?${params.toString()}` };

  return (
    <div className="cpage">
      <header className="cpage__header">
        <div className="cpage__header-row">
          <Link className="cpage__myorders" to={menuLink}>
            <ArrowLeft size={16} aria-hidden="true" />
            Back to menu
          </Link>
          <button
            type="button"
            className="cpage__myorders"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw size={16} aria-hidden="true" />
            Refresh
          </button>
        </div>
        <h1 className="cpage__brand">My orders</h1>
      </header>

      <main className="cpage__content">
        {loading ? (
          <div className="myorders__loading">
            <Spinner />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            variant="first-use"
            title="No orders yet"
            description="Orders you place from this device will show up here so you can track them."
            action={{
              label: 'Browse the menu',
              onClick: () => navigate(menuLink),
            }}
          />
        ) : (
          <ul className="myorders">
            {orders.map((order) => {
              const meta =
                STATUS_BADGE[order.status as ApiStatus] ?? STATUS_BADGE.pending;
              return (
                <li key={order.id} className="myorder-card">
                  <div className="myorder-card__head">
                    <div>
                      <span className="myorder-card__table">
                        Table {order.tableNumber}
                      </span>
                      <span className="myorder-card__time">
                        {timeFmt.format(new Date(order.createdAt))}
                      </span>
                    </div>
                    <OrderStatusBadge
                      status={meta.badge}
                      label={meta.label}
                      size="sm"
                    />
                  </div>

                  <ul className="myorder-dishes">
                    {order.items.map((line) => (
                      <li key={line.id} className="myorder-dishes__line">
                        <span className="myorder-dishes__qty">
                          {line.quantity}×
                        </span>
                        <span className="myorder-dishes__name">
                          {line.name}
                        </span>
                        <span className="myorder-dishes__price">
                          {currency(line.price * line.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {order.note && (
                    <p className="myorder-card__note">“{order.note}”</p>
                  )}

                  <div className="myorder-card__total">
                    <span>Total</span>
                    <span className="myorder-card__total-amount">
                      {currency(order.total)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
