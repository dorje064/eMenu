import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ListChecks, Flame, BellRing, CircleCheck } from 'lucide-react';
import { Tabs } from './Tabs';
import type { TabItem } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['underline', 'pill', 'enclosed'] },
    align: { control: 'select', options: ['start', 'full', 'scrollable'] },
  },
};
export default meta;

type Story = StoryObj<typeof Tabs>;

const panel = (text: string) => (
  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{text}</p>
);

const ORDER_TABS: TabItem[] = [
  { id: 'all', label: 'All', count: 27, content: panel('All 27 orders across every state.') },
  { id: 'active', label: 'Active', count: 12, content: panel('12 orders being accepted or prepared right now.') },
  { id: 'ready', label: 'Ready', count: 4, content: panel('4 orders ready for pickup or service.') },
  { id: 'completed', label: 'Completed', count: 11, content: panel('11 orders served and closed today.') },
];

export const OrderStates: Story = {
  render: () => {
    const [value, setValue] = useState('active');
    return (
      <Tabs
        items={ORDER_TABS}
        value={value}
        onChange={setValue}
        ariaLabel="Order states"
      />
    );
  },
};

export const PillSegmented: Story = {
  render: () => {
    const [value, setValue] = useState('active');
    return (
      <Tabs
        items={ORDER_TABS}
        value={value}
        onChange={setValue}
        variant="pill"
        ariaLabel="Order states"
      />
    );
  },
};

export const Enclosed: Story = {
  render: () => {
    const [value, setValue] = useState('all');
    return (
      <Tabs
        items={ORDER_TABS}
        value={value}
        onChange={setValue}
        variant="enclosed"
        ariaLabel="Order states"
      />
    );
  },
};

export const FullWidth: Story = {
  render: () => {
    const [value, setValue] = useState('ready');
    return (
      <Tabs
        items={ORDER_TABS}
        value={value}
        onChange={setValue}
        align="full"
        ariaLabel="Order states"
      />
    );
  },
};

export const WithIcons: Story = {
  render: () => {
    const [value, setValue] = useState('preparing');
    const tabs: TabItem[] = [
      { id: 'all', label: 'All', icon: <ListChecks size={16} />, count: 27, content: panel('Every order.') },
      { id: 'preparing', label: 'Preparing', icon: <Flame size={16} />, count: 8, content: panel('Kitchen is cooking 8 orders.') },
      { id: 'ready', label: 'Ready', icon: <BellRing size={16} />, count: 4, content: panel('4 orders ready.') },
      { id: 'completed', label: 'Completed', icon: <CircleCheck size={16} />, count: 11, content: panel('11 orders done.') },
    ];
    return (
      <Tabs items={tabs} value={value} onChange={setValue} variant="pill" ariaLabel="Kitchen queue" />
    );
  },
};

export const Scrollable: Story = {
  render: () => {
    const [value, setValue] = useState('daily');
    const tabs: TabItem[] = [
      { id: 'daily', label: 'Daily', content: panel('Today’s sales report.') },
      { id: 'weekly', label: 'Weekly', content: panel('This week’s sales report.') },
      { id: 'monthly', label: 'Monthly', content: panel('This month’s sales report.') },
      { id: 'quarterly', label: 'Quarterly', content: panel('This quarter’s sales report.') },
      { id: 'yearly', label: 'Yearly', content: panel('This year’s sales report.') },
      { id: 'custom', label: 'Custom range', content: panel('Pick a custom date range.') },
    ];
    return (
      <div style={{ maxWidth: 360 }}>
        <Tabs items={tabs} value={value} onChange={setValue} align="scrollable" ariaLabel="Report period" />
      </div>
    );
  },
};
