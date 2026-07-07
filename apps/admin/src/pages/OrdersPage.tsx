import { useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardList, GitMerge, RefreshCw, X } from 'lucide-react';
import {
  Button,
  EmptyState,
  Modal,
  OrderStatusBadge,
  Select,
  Spinner,
  useToast,
  type SelectOption,
} from '@org/ui';

import { ordersApi } from '../api/orders.api';
import { tablesApi } from '../api/tables.api';
import { ApiError } from '../api/client';
import { useUnseenOrders } from '../notifications/UnseenOrdersContext';
import type { Order, OrderStatus, RestaurantTable } from '../api/types';
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
  paid: { badge: 'completed', label: 'Paid' },
  cancelled: { badge: 'cancelled', label: 'Cancelled' },
} as const;

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'served', label: 'Served' },
  { value: 'paid', label: 'Paid' },
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
  selected,
  onToggleSelect,
  onChangeStatus,
}: {
  order: Order;
  updating: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  onChangeStatus: (status: OrderStatus) => void;
}) {
  const totalQty = order.items.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <div className={`order-card${selected ? ' order-card--selected' : ''}`}>
      <div className="order-card__head">
        <label className="order-card__select">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            aria-label={`Select order for Table ${order.tableNumber} to merge`}
          />
          <div>
            <span className="order-card__table">Table {order.tableNumber}</span>
            <span className="order-card__time">
              {timeFmt.format(new Date(order.createdAt))}
            </span>
          </div>
        </label>
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
        {order.status !== 'paid' && order.status !== 'cancelled' && (
          <Button
            variant="secondary"
            size="sm"
            disabled={updating}
            onClick={() => onChangeStatus('paid')}
          >
            Mark paid
          </Button>
        )}
      </div>
    </div>
  );
}

export function OrdersPage() {
  const { show } = useToast();
  const { clear: clearUnseen } = useUnseenOrders();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  // Table numbers seen across loads — accumulated so the filter keeps offering
  // a table even after narrowing to it (or to a status) drops others.
  const [seenTables, setSeenTables] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [tableFilter, setTableFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmMerge, setConfirmMerge] = useState(false);
  const [merging, setMerging] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setOrders(
        await ordersApi.list({
          status: filter === 'all' ? undefined : filter,
          table: tableFilter === 'all' ? undefined : tableFilter,
        }),
      );
    } catch (err) {
      setLoadError(
        err instanceof ApiError ? err.message : 'Failed to load orders',
      );
    } finally {
      setLoading(false);
    }
  }, [filter, tableFilter]);

  useEffect(() => {
    load();
  }, [load]);

  // Load the café's tables once for the "filter by table" dropdown.
  useEffect(() => {
    tablesApi
      .list()
      .then(setTables)
      .catch(() => setTables([]));
  }, []);

  // Viewing the Orders page marks incoming orders as seen (clears the badge).
  useEffect(() => {
    clearUnseen();
  }, [clearUnseen]);

  // Drop selections that are no longer visible after a filter/refresh change.
  useEffect(() => {
    setSelectedIds((prev) => {
      const visible = new Set(orders.map((o) => o.id));
      const next = new Set([...prev].filter((id) => visible.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [orders]);

  // Remember every table number that has appeared in an order so the filter
  // lists real tables even when none are defined on the Tables page.
  useEffect(() => {
    setSeenTables((prev) => {
      const next = new Set(prev);
      for (const o of orders) next.add(o.tableNumber);
      return next.size === prev.size ? prev : next;
    });
  }, [orders]);

  const tableOptions = useMemo<SelectOption[]>(() => {
    const names = new Set<string>(tables.map((t) => t.name));
    for (const t of seenTables) names.add(t);
    const sorted = [...names].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
    );
    return [
      { value: 'all', label: 'All tables' },
      ...sorted.map((name) => ({ value: name, label: `Table ${name}` })),
    ];
  }, [tables, seenTables]);

  const selectedOrders = useMemo(
    () => orders.filter((o) => selectedIds.has(o.id)),
    [orders, selectedIds],
  );

  // Orders can only be merged when they all belong to the same table.
  const selectedTables = new Set(selectedOrders.map((o) => o.tableNumber));
  const canMerge = selectedOrders.length >= 2 && selectedTables.size === 1;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

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

  const runMerge = async () => {
    setMerging(true);
    try {
      const merged = await ordersApi.merge(selectedOrders.map((o) => o.id));
      const mergedAway = new Set(selectedOrders.map((o) => o.id));
      setOrders((prev) => [
        merged,
        ...prev.filter((o) => !mergedAway.has(o.id)),
      ]);
      clearSelection();
      setConfirmMerge(false);
      show({
        semantic: 'success',
        message: `Merged into one order for Table ${merged.tableNumber}`,
      });
    } catch (err) {
      show({
        semantic: 'error',
        message:
          err instanceof ApiError ? err.message : 'Could not merge the orders.',
      });
    } finally {
      setMerging(false);
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
            {tableFilter !== 'all' ? ` · Table ${tableFilter}` : ''}
          </p>
        </div>
        <div className="menu-page__actions">
          <div className="orders-filter">
            <Select
              options={tableOptions}
              value={tableFilter}
              onChange={setTableFilter}
              aria-label="Filter orders by table"
            />
          </div>
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

      {selectedIds.size > 0 && (
        <div className="orders-merge-bar">
          <span className="orders-merge-bar__count">
            {selectedIds.size} selected
          </span>
          <div className="orders-merge-bar__actions">
            {!canMerge && (
              <span className="orders-merge-bar__hint">
                {selectedOrders.length < 2
                  ? 'Select 2 or more orders to merge'
                  : 'Selected orders must be from the same table'}
              </span>
            )}
            <Button
              variant="tertiary"
              size="sm"
              leadingIcon={<X size={16} />}
              onClick={clearSelection}
            >
              Clear
            </Button>
            <Button
              variant="primary"
              size="sm"
              leadingIcon={<GitMerge size={16} />}
              disabled={!canMerge}
              onClick={() => setConfirmMerge(true)}
            >
              Merge orders
            </Button>
          </div>
        </div>
      )}

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
              selected={selectedIds.has(order.id)}
              onToggleSelect={() => toggleSelect(order.id)}
              onChangeStatus={(status) => changeStatus(order, status)}
            />
          ))}
        </div>
      )}

      <Modal
        open={confirmMerge}
        onClose={() => (merging ? undefined : setConfirmMerge(false))}
        title="Merge orders"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setConfirmMerge(false)}
              disabled={merging}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={runMerge} loading={merging}>
              Merge {selectedOrders.length} orders
            </Button>
          </>
        }
      >
        <p>
          Combine {selectedOrders.length} orders from{' '}
          <strong>Table {[...selectedTables][0]}</strong> into a single order?
          Their items are added together and the separate orders are removed.
          This can’t be undone.
        </p>
      </Modal>
    </div>
  );
}
