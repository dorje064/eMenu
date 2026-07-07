import { useCallback, useEffect, useState } from 'react';
import { ClipboardList, RefreshCw } from 'lucide-react';
import {
  Button,
  EmptyState,
  OrderStatusBadge,
  Select,
  Spinner,
  useToast,
  type SelectOption,
} from '@org/ui';

import { ordersApi } from '../api/orders.api';
import { ApiError } from '../api/client';
import type { Order, OrderStatus } from '../api/types';
import './MenuPage.css';
import './OrdersPage.css';

const currency = (n: number) =>
  `NRs ${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)}`;

/** API status → OrderStatusBadge (canonical UI vocabulary) + display label. */
const STATUS_BADGE = {
  pending: { badge: 'placed', label: 'Pending' },
  preparing: { badge: 'preparing', label: 'Preparing' },
  served: { badge: 'completed', label: 'Served' },
  cancelled: { badge: 'cancelled', label: 'Cancelled' },
} as const;

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'served', label: 'Served' },
  { value: 'cancelled', label: 'Cancelled' },
];

const FILTER_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All orders' },
  ...STATUS_OPTIONS,
];

const timeFmt = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

/** A single order rendered as a card. */
function OrderCard({
  order,
  updating,
  onChangeStatus,
}: {
  order: Order;
  updating: boolean;
  onChangeStatus: (status: OrderStatus) => void;
}) {
  const totalQty = order.items.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <div className="order-card">
      <div className="order-card__head">
        <div>
          <span className="order-card__table">Table {order.tableNumber}</span>
          <span className="order-card__time">
            {timeFmt.format(new Date(order.createdAt))}
          </span>
        </div>
        <OrderStatusBadge
          status={STATUS_BADGE[order.status].badge}
          label={STATUS_BADGE[order.status].label}
          size="sm"
        />
      </div>

      <ul className="order-dishes">
        {order.items.map((line) => (
          <li key={line.id} className="order-dishes__line">
            <span className="order-dishes__qty">{line.quantity}×</span>
            <span className="order-dishes__name">{line.name}</span>
            <span className="order-dishes__price">
              {currency(line.price * line.quantity)}
            </span>
          </li>
        ))}
      </ul>

      {order.note && <p className="order-card__note">“{order.note}”</p>}

      <div className="order-card__total">
        <span>
          {totalQty} item{totalQty === 1 ? '' : 's'}
        </span>
        <span className="order-card__total-amount">
          {currency(order.total)}
        </span>
      </div>

      <div className="order-card__actions">
        <Select
          options={STATUS_OPTIONS}
          value={order.status}
          disabled={updating}
          onChange={(value) => onChangeStatus(value as OrderStatus)}
          aria-label={`Update status for Table ${order.tableNumber}`}
        />
      </div>
    </div>
  );
}

export function OrdersPage() {
  const { show } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setOrders(await ordersApi.list(filter === 'all' ? undefined : filter));
    } catch (err) {
      setLoadError(
        err instanceof ApiError ? err.message : 'Failed to load orders',
      );
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = async (order: Order, status: OrderStatus) => {
    if (status === order.status) return;
    setUpdatingId(order.id);
    try {
      const updated = await ordersApi.updateStatus(order.id, status);
      // If a status filter is active and the order no longer matches, drop it.
      setOrders((prev) =>
        filter !== 'all' && updated.status !== filter
          ? prev.filter((o) => o.id !== updated.id)
          : prev.map((o) => (o.id === updated.id ? updated : o)),
      );
      show({ semantic: 'success', message: `Order marked ${status}` });
    } catch (err) {
      show({
        semantic: 'error',
        message:
          err instanceof ApiError ? err.message : 'Could not update the order.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="menu-page">
      <div className="menu-page__head">
        <div>
          <h2 className="menu-page__title">Orders</h2>
          <p className="menu-page__subtitle">
            {orders.length} order{orders.length === 1 ? '' : 's'}
            {filter !== 'all' ? ` · ${STATUS_BADGE[filter].label}` : ''}
          </p>
        </div>
        <div className="menu-page__actions">
          <div className="orders-filter">
            <Select
              options={FILTER_OPTIONS}
              value={filter}
              onChange={(value) => setFilter(value as 'all' | OrderStatus)}
              aria-label="Filter orders by status"
            />
          </div>
          <Button
            variant="secondary"
            leadingIcon={<RefreshCw size={18} />}
            onClick={load}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {loadError ? (
        <EmptyState
          variant="error-empty"
          title="Couldn’t load orders"
          description={loadError}
          action={{ label: 'Retry', onClick: load }}
        />
      ) : loading ? (
        <div className="orders-loading">
          <Spinner />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          variant="first-use"
          icon={<ClipboardList />}
          title="No orders yet"
          description="Orders placed by customers from their table QR codes will appear here."
        />
      ) : (
        <div className="order-grid">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              updating={updatingId === order.id}
              onChangeStatus={(status) => changeStatus(order, status)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
