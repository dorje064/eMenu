import type { Meta, StoryObj } from '@storybook/react-vite';
import { DollarSign, ShoppingBag, Utensils, Receipt } from 'lucide-react';
import { DashboardCard } from './DashboardCard';

const meta: Meta<typeof DashboardCard> = {
  title: 'Components/DashboardCard',
  component: DashboardCard,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    accent: {
      control: 'select',
      options: ['none', 'success', 'error', 'warning', 'info'],
    },
    state: { control: 'select', options: ['loaded', 'loading', 'empty'] },
  },
  args: {
    label: "Today's revenue",
    value: '$1,240',
    delta: { direction: 'up', label: '+12%', srLabel: 'up 12% vs yesterday' },
    context: 'vs yesterday',
  },
};
export default meta;

type Story = StoryObj<typeof DashboardCard>;

export const Revenue: Story = {
  args: {
    icon: <DollarSign size={18} />,
    accent: 'success',
    onViewReport: () => {},
  },
};

export const Orders: Story = {
  args: {
    label: 'Orders',
    value: '84',
    delta: { direction: 'up', label: '+8%' },
    context: 'vs last week',
    icon: <ShoppingBag size={18} />,
  },
};

export const ActiveTables: Story = {
  args: {
    label: 'Active tables',
    value: '12',
    delta: undefined,
    context: 'of 20 seated',
    icon: <Utensils size={18} />,
  },
};

export const ExpensesDown: Story = {
  args: {
    label: 'Expenses',
    value: '$640',
    delta: { direction: 'down', label: '−4%', srLabel: 'down 4% vs last week' },
    context: 'vs last week',
    icon: <Receipt size={18} />,
    accent: 'error',
  },
};

export const Loading: Story = { args: { state: 'loading' } };

export const Empty: Story = {
  args: { label: 'Pending payments', state: 'empty', icon: <DollarSign size={18} /> },
};

export const DashboardGrid: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
      }}
    >
      <DashboardCard
        label="Today's revenue"
        value="$1,240"
        delta={{ direction: 'up', label: '+12%', srLabel: 'up 12% vs yesterday' }}
        context="vs yesterday"
        icon={<DollarSign size={18} />}
        accent="success"
        onViewReport={() => {}}
      />
      <DashboardCard
        label="Orders"
        value="84"
        delta={{ direction: 'up', label: '+8%' }}
        context="vs last week"
        icon={<ShoppingBag size={18} />}
      />
      <DashboardCard
        label="Active tables"
        value="12"
        context="of 20 seated"
        icon={<Utensils size={18} />}
      />
      <DashboardCard
        label="Expenses"
        value="$640"
        delta={{ direction: 'down', label: '−4%', srLabel: 'down 4% vs last week' }}
        context="vs last week"
        icon={<Receipt size={18} />}
        accent="error"
      />
    </div>
  ),
};
