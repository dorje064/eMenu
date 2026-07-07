import { useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardList, GitMerge, RefreshCw, X } from 'lucide-react';
import {
  Button,
  DataTable,
  EmptyState,
  Modal,
  OrderStatusBadge,
  Overlay,
  Select,
  Spinner,
  Tabs,
  useToast,
  type DataTableColumn,
  type SelectOption,
  type TabItem,
} from '@org/ui';

import { ordersApi } from '../api/orders.api';
import { tablesApi } from '../api/tables.api';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';
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

/** Statuses selectable per active order (Paid is reached via "Mark paid"). */
const ROW_STATUS_OPTIONS: SelectOption[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'served', label: 'Served' },
  { value: 'cancelled', label: 'Cancelled' },
];

/** Active-tab status filter — never includes Paid (Paid has its own tab). */
const FILTER_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All statuses' },
  ...ROW_STATUS_OPTIONS,
];

type ActiveFilter = 'all' | Exclude<OrderStatus, 'paid'>;

const timeFmt = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

/** A single active order rendered as a selectable card. */
function OrderCard({
  order,
  updating,
  selected,
  canMarkPaid,
  onToggleSelect,
  onChangeStatus,
}: {
  order: Order;
  updating: boolean;
  selected: boolean;
  canMarkPaid: boolean;
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
          options={ROW_STATUS_OPTIONS}
          value={order.status}
          disabled={updating}
          onChange={(value) => onChangeStatus(value as OrderStatus)}
          aria-label={`Update status for Table ${order.tableNumber}`}
        />
        {canMarkPaid && (
          <Button
            variant="secondary"
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

/** Compact per-order dish list rendered inside a DataTable cell. */
function ItemsCell({ order }: { order: Order }) {
  return (
    <div className="order-items-cell">
      <ul className="order-items-cell__list">
        {order.items.map((line) => (
          <li key={line.id}>
            <span className="order-items-cell__qty">{line.quantity}×</span>
            {line.name}
          </li>
        ))}
      </ul>
      {order.note && <p className="order-items-cell__note">“{order.note}”</p>}
    </div>
  );
}

export function OrdersPage() {
  const { show } = useToast();
  const { can } = useAuth();
  const canMarkPaid = can('markPaid');
  const { clear: clearUnseen } = useUnseenOrders();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  // Table numbers seen across loads — accumulated so the filter keeps offering
  // a table even when none are defined on the Tables page.
  const [seenTables, setSeenTables] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<'active' | 'paid'>('active');
  const [statusFilter, setStatusFilter] = useState<ActiveFilter>('all');
  const [tableFilter, setTableFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmMerge, setConfirmMerge] = useState(false);
  const [merging, setMerging] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      // Fetch every status for the chosen table; the Active/Paid split and the
      // status sub-filter are applied client-side below.
      setOrders(
        await ordersApi.list({
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
  }, [tableFilter]);

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

  // Remember every table number that has appeared in an order so the filter
  // lists real tables even when none are defined on the Tables page.
  useEffect(() => {
    setSeenTables((prev) => {
      const next = new Set(prev);
      for (const o of orders) next.add(o.tableNumber);
      return next.size === prev.size ? prev : next;
    });
  }, [orders]);

  const paidOrders = useMemo(
    () => orders.filter((o) => o.status === 'paid'),
    [orders],
  );
  const nonPaidOrders = useMemo(
    () => orders.filter((o) => o.status !== 'paid'),
    [orders],
  );
  const activeOrders = useMemo(
    () =>
      statusFilter === 'all'
        ? nonPaidOrders
        : nonPaidOrders.filter((o) => o.status === statusFilter),
    [nonPaidOrders, statusFilter],
  );

  // Selections only apply to the Active tab; drop any that are no longer shown.
  useEffect(() => {
    setSelectedIds((prev) => {
      const visible = new Set(activeOrders.map((o) => o.id));
      const next = new Set([...prev].filter((id) => visible.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [activeOrders]);

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
      // Update in place — the Active/Paid split re-derives, so an order marked
      // paid moves to the Paid tab automatically.
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o)),
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

  const switchTab = (next: string) => {
    setTab(next as 'active' | 'paid');
    clearSelection();
  };

  const tableFilterControl = (
    <div className="orders-filter">
      <Select
        options={tableOptions}
        value={tableFilter}
        onChange={setTableFilter}
        aria-label="Filter orders by table"
      />
    </div>
  );

  const activePanel = (
    <div className="orders-panel">
      <div className="orders-toolbar">
        {tableFilterControl}
        <div className="orders-filter">
          <Select
            options={FILTER_OPTIONS}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as ActiveFilter)}
            aria-label="Filter orders by status"
          />
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

      {loading ? (
        <div className="orders-loading">
          <Spinner />
        </div>
      ) : activeOrders.length === 0 ? (
        <EmptyState
          variant="first-use"
          icon={<ClipboardList />}
          title="No active orders"
          description="Orders placed by customers from their table QR codes will appear here."
        />
      ) : (
        <div className="order-grid">
          {activeOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              updating={updatingId === order.id}
              selected={selectedIds.has(order.id)}
              canMarkPaid={canMarkPaid}
              onToggleSelect={() => toggleSelect(order.id)}
              onChangeStatus={(status) => changeStatus(order, status)}
            />
          ))}
        </div>
      )}
    </div>
  );

  const paidColumns: DataTableColumn<Order>[] = [
    {
      key: 'tableNumber',
      header: 'Table',
      sortable: true,
      width: '90px',
      render: (o) => <strong>Table {o.tableNumber}</strong>,
    },
    {
      key: 'createdAt',
      header: 'Placed',
      sortable: true,
      width: '130px',
      render: (o) => timeFmt.format(new Date(o.createdAt)),
    },
    {
      key: 'items',
      header: 'Items',
      width: '120px',
      render: (o) => (
        <Overlay
          length={o.items.reduce((sum, l) => sum + l.quantity, 0)}
          title={`Table ${o.tableNumber}`}
          items={<ItemsCell order={o} />}
        />
      ),
    },
    {
      key: 'total',
      header: 'Total',
      numeric: true,
      sortable: true,
      width: '110px',
      render: (o) => currency(o.total),
    },
    {
      key: 'updatedAt',
      header: 'Paid at',
      sortable: true,
      width: '130px',
      render: (o) => timeFmt.format(new Date(o.updatedAt)),
    },
  ];

  const paidPanel = (
    <div className="orders-panel">
      <div className="orders-toolbar">{tableFilterControl}</div>
      <DataTable
        columns={paidColumns}
        rows={paidOrders}
        getRowId={(o) => o.id}
        ariaLabel="Paid orders"
        loading={loading}
        emptyMessage="No paid orders yet."
      />
    </div>
  );

  const tabItems: TabItem[] = [
    {
      id: 'active',
      label: 'Active orders',
      count: nonPaidOrders.length,
      content: activePanel,
    },
    {
      id: 'paid',
      label: 'Paid orders',
      count: paidOrders.length,
      content: paidPanel,
    },
  ];

  return (
    <div className="menu-page">
      <div className="menu-page__head">
        <div>
          <h2 className="menu-page__title">Orders</h2>
          <p className="menu-page__subtitle">
            {tab === 'paid'
              ? `${paidOrders.length} paid order${
                  paidOrders.length === 1 ? '' : 's'
                }`
              : `${activeOrders.length} active order${
                  activeOrders.length === 1 ? '' : 's'
                }`}
            {tableFilter !== 'all' ? ` · Table ${tableFilter}` : ''}
          </p>
        </div>
        <div className="menu-page__actions">
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
      ) : (
        <Tabs
          items={tabItems}
          value={tab}
          onChange={switchTab}
          ariaLabel="Order views"
        />
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
