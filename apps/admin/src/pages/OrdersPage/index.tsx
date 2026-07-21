import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, GitMerge, RefreshCw, X } from 'lucide-react';
import {
  Button,
  DataTable,
  EmptyState,
  Modal,
  Overlay,
  Select,
  Spinner,
  Tabs,
  useToast,
  type DataTableColumn,
  type SelectOption,
  type TabItem,
} from '@org/ui';

import { ordersApi } from '../../api/orders.api';
import { tablesApi } from '../../api/tables.api';
import { ApiError } from '../../api/client';
import { queryKeys } from '../../api/queryKeys';
import { useAuth } from '../../auth/AuthContext';
import { useUnseenOrders } from '../../notifications/UnseenOrdersContext';
import type { Order, OrderStatus } from '../../api/types';
import {
  OrderCard,
  ROW_STATUS_OPTIONS,
  currency,
  timeFmt,
} from './components/OrderCard';
import '../MenuPage/style.css';
import './style.css';

/** Active-tab status filter — never includes Paid (Paid has its own tab). */
const FILTER_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All statuses' },
  ...ROW_STATUS_OPTIONS,
];

type ActiveFilter = 'all' | Exclude<OrderStatus, 'paid'>;

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
  const queryClient = useQueryClient();

  // Table numbers seen across loads — accumulated so the filter keeps offering
  // a table even when none are defined on the Tables page.
  const [seenTables, setSeenTables] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<'active' | 'paid'>('active');
  const [statusFilter, setStatusFilter] = useState<ActiveFilter>('all');
  const [tableFilter, setTableFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmMerge, setConfirmMerge] = useState(false);

  const tableParam = tableFilter === 'all' ? undefined : tableFilter;

  // Fetch every status for the chosen table; the Active/Paid split and the
  // status sub-filter are applied client-side below. The key includes the
  // table filter, so switching tables refetches automatically.
  const {
    data: orders = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.orders({ table: tableParam }),
    queryFn: () => ordersApi.list({ table: tableParam }),
  });

  const loadError = isError
    ? error instanceof ApiError
      ? error.message
      : 'Failed to load orders'
    : null;

  // The café's tables feed the "filter by table" dropdown.
  const { data: tables = [] } = useQuery({
    queryKey: queryKeys.tables,
    queryFn: () => tablesApi.list(),
  });

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

  // Invalidating the orders query refetches — the Active/Paid split re-derives,
  // so an order marked paid moves to the Paid tab automatically.
  const statusMutation = useMutation({
    mutationFn: ({ order, status }: { order: Order; status: OrderStatus }) =>
      ordersApi.updateStatus(order.id, status),
    onSuccess: (_updated, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      show({ semantic: 'success', message: `Order marked ${status}` });
    },
    onError: (err) => {
      show({
        semantic: 'error',
        message:
          err instanceof ApiError ? err.message : 'Could not update the order.',
      });
    },
  });

  const changeStatus = (order: Order, status: OrderStatus) => {
    if (status === order.status) return;
    statusMutation.mutate({ order, status });
  };

  const mergeMutation = useMutation({
    mutationFn: (orderIds: string[]) => ordersApi.merge(orderIds),
    onSuccess: (merged) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      clearSelection();
      setConfirmMerge(false);
      show({
        semantic: 'success',
        message: `Merged into one order for Table ${merged.tableNumber}`,
      });
    },
    onError: (err) => {
      show({
        semantic: 'error',
        message:
          err instanceof ApiError ? err.message : 'Could not merge the orders.',
      });
    },
  });

  const runMerge = () => mergeMutation.mutate(selectedOrders.map((o) => o.id));

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

      {isLoading ? (
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
              updating={
                statusMutation.isPending &&
                statusMutation.variables?.order.id === order.id
              }
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
        loading={isLoading}
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
            onClick={() => refetch()}
            loading={isFetching}
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
          action={{ label: 'Retry', onClick: () => refetch() }}
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
        onClose={() =>
          mergeMutation.isPending ? undefined : setConfirmMerge(false)
        }
        title="Merge orders"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setConfirmMerge(false)}
              disabled={mergeMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={runMerge}
              loading={mergeMutation.isPending}
            >
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
