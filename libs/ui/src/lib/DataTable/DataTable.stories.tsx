import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MoreVertical } from 'lucide-react';
import { DataTable } from './DataTable';
import type { DataTableColumn, SortState } from './DataTable';
import { OrderStatusBadge } from '../OrderStatusBadge/OrderStatusBadge';
import type { OrderStatus } from '../OrderStatusBadge/OrderStatusBadge';

interface Order {
  id: string;
  orderNo: string;
  table: string;
  items: number;
  total: number;
  status: OrderStatus;
  time: string;
}

const ORDERS: Order[] = [
  { id: 'o1', orderNo: '#1042', table: 'Table 6', items: 3, total: 42.5, status: 'placed', time: '12:04' },
  { id: 'o2', orderNo: '#1043', table: 'Table 2', items: 5, total: 78.0, status: 'accepted', time: '12:07' },
  { id: 'o3', orderNo: '#1044', table: 'Takeaway', items: 1, total: 12.25, status: 'preparing', time: '12:11' },
  { id: 'o4', orderNo: '#1045', table: 'Table 9', items: 7, total: 134.9, status: 'ready', time: '12:15' },
  { id: 'o5', orderNo: '#1046', table: 'Table 4', items: 2, total: 28.0, status: 'completed', time: '12:18' },
  { id: 'o6', orderNo: '#1047', table: 'Table 1', items: 4, total: 56.75, status: 'cancelled', time: '12:21' },
  { id: 'o7', orderNo: '#1048', table: 'Table 12', items: 6, total: 92.4, status: 'preparing', time: '12:24' },
];

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const baseColumns: DataTableColumn<Order>[] = [
  { key: 'orderNo', header: 'Order #', sortable: true },
  { key: 'table', header: 'Table', sortable: true },
  { key: 'items', header: 'Items', numeric: true, sortable: true },
  {
    key: 'total',
    header: 'Total',
    numeric: true,
    sortable: true,
    render: (row) => currency(row.total),
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <OrderStatusBadge status={row.status} />,
  },
  { key: 'time', header: 'Time', align: 'end', sortable: true },
  {
    key: 'actions',
    header: 'Actions',
    align: 'center',
    render: () => (
      <button
        type="button"
        aria-label="Row actions"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'inline-flex',
          padding: 4,
        }}
      >
        <MoreVertical size={18} aria-hidden="true" />
      </button>
    ),
  },
];

const meta: Meta<typeof DataTable<Order>> = {
  title: 'Components/DataTable',
  component: DataTable,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof DataTable<Order>>;

export const Loaded: Story = {
  args: {
    columns: baseColumns,
    rows: ORDERS,
    getRowId: (r: Order) => r.id,
    ariaLabel: 'Recent orders',
    caption: 'Recent orders',
  },
};

export const Compact: Story = {
  args: { ...Loaded.args, density: 'compact' },
};

export const Sortable: Story = {
  render: () => {
    const [sort, setSort] = useState<SortState<Order> | null>({
      key: 'total',
      direction: 'desc',
    });
    return (
      <DataTable<Order>
        columns={baseColumns}
        rows={ORDERS}
        getRowId={(r) => r.id}
        ariaLabel="Sortable orders"
        caption="Click a column header to sort"
        sort={sort}
        onSortChange={setSort}
      />
    );
  },
};

export const Selectable: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>(['o2']);
    return (
      <DataTable<Order>
        columns={baseColumns}
        rows={ORDERS}
        getRowId={(r) => r.id}
        ariaLabel="Selectable orders"
        caption="Select orders to bulk-update"
        selectable
        selectedIds={selected}
        onSelectionChange={setSelected}
      />
    );
  },
};

export const Loading: Story = {
  args: {
    columns: baseColumns,
    rows: [],
    getRowId: (r: Order) => r.id,
    ariaLabel: 'Loading orders',
    selectable: true,
    loading: true,
    skeletonRows: 6,
  },
};

export const Empty: Story = {
  args: {
    columns: baseColumns,
    rows: [],
    getRowId: (r: Order) => r.id,
    ariaLabel: 'Orders',
    caption: 'Orders',
    emptyMessage: 'No orders yet today',
  },
};
