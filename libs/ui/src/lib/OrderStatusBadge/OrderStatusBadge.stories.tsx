import type { Meta, StoryObj } from '@storybook/react-vite';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { OrderStatus } from './OrderStatusBadge';

const meta: Meta<typeof OrderStatusBadge> = {
  title: 'Components/OrderStatusBadge',
  component: OrderStatusBadge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: [
        'placed',
        'accepted',
        'preparing',
        'ready',
        'completed',
        'cancelled',
      ],
    },
    styleVariant: { control: 'select', options: ['solid', 'soft', 'dot'] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
  args: { status: 'preparing', styleVariant: 'soft', size: 'md' },
};
export default meta;

type Story = StoryObj<typeof OrderStatusBadge>;

const ALL: OrderStatus[] = [
  'placed',
  'accepted',
  'preparing',
  'ready',
  'completed',
  'cancelled',
];

export const Default: Story = {};

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {ALL.map((s) => (
        <OrderStatusBadge key={s} status={s} />
      ))}
    </div>
  ),
};

export const Soft: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {ALL.map((s) => (
        <OrderStatusBadge key={s} status={s} styleVariant="soft" />
      ))}
    </div>
  ),
};

export const Solid: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {ALL.map((s) => (
        <OrderStatusBadge key={s} status={s} styleVariant="solid" />
      ))}
    </div>
  ),
};

export const DotForTables: Story = {
  render: () => (
    <table style={{ borderCollapse: 'collapse', fontSize: 14 }}>
      <thead>
        <tr style={{ textAlign: 'left' }}>
          <th style={{ padding: '8px 16px' }}>Order</th>
          <th style={{ padding: '8px 16px' }}>Table</th>
          <th style={{ padding: '8px 16px' }}>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ padding: '8px 16px' }}>#1042</td>
          <td style={{ padding: '8px 16px' }}>Table 7</td>
          <td style={{ padding: '8px 16px' }}>
            <OrderStatusBadge status="preparing" styleVariant="dot" size="sm" />
          </td>
        </tr>
        <tr>
          <td style={{ padding: '8px 16px' }}>#1043</td>
          <td style={{ padding: '8px 16px' }}>Table 2</td>
          <td style={{ padding: '8px 16px' }}>
            <OrderStatusBadge status="ready" styleVariant="dot" size="sm" />
          </td>
        </tr>
        <tr>
          <td style={{ padding: '8px 16px' }}>#1044</td>
          <td style={{ padding: '8px 16px' }}>Takeaway</td>
          <td style={{ padding: '8px 16px' }}>
            <OrderStatusBadge status="cancelled" styleVariant="dot" size="sm" />
          </td>
        </tr>
      </tbody>
    </table>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <OrderStatusBadge status="ready" size="sm" />
      <OrderStatusBadge status="ready" size="md" />
    </div>
  ),
};

export const WithTimer: Story = {
  args: { status: 'preparing', timer: 'Ready in ~8 min' },
};

export const CustomLabel: Story = {
  args: { status: 'completed', label: 'Served' },
};
