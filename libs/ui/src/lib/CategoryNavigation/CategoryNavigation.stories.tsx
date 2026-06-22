import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CategoryNavigation } from './CategoryNavigation';
import type { CategoryNavigationItem } from './CategoryNavigation';

const CATEGORIES: CategoryNavigationItem[] = [
  { id: 'starters', label: 'Starters', count: 8 },
  { id: 'mains', label: 'Mains', count: 14 },
  { id: 'drinks', label: 'Drinks', count: 11 },
  { id: 'desserts', label: 'Desserts', count: 6 },
  { id: 'sides', label: 'Sides', count: 5 },
  { id: 'specials', label: 'Chef Specials', count: 0, disabled: true },
];

const meta: Meta<typeof CategoryNavigation> = {
  title: 'Components/CategoryNavigation',
  component: CategoryNavigation,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['horizontal', 'vertical'] },
  },
};
export default meta;

type Story = StoryObj<typeof CategoryNavigation>;

export const HorizontalChipBar: Story = {
  render: () => {
    const [value, setValue] = useState('mains');
    return (
      <CategoryNavigation
        items={CATEGORIES}
        value={value}
        onChange={setValue}
        variant="horizontal"
      />
    );
  },
};

export const VerticalRail: Story = {
  render: () => {
    const [value, setValue] = useState('starters');
    return (
      <div style={{ maxWidth: 240 }}>
        <CategoryNavigation
          items={CATEGORIES}
          value={value}
          onChange={setValue}
          variant="vertical"
        />
      </div>
    );
  },
};

export const WithCountBadges: Story = {
  render: () => {
    const [value, setValue] = useState('drinks');
    return (
      <CategoryNavigation
        items={CATEGORIES}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const Overflowing: Story = {
  render: () => {
    const [value, setValue] = useState('mains');
    const many: CategoryNavigationItem[] = [
      { id: 'starters', label: 'Starters' },
      { id: 'soups', label: 'Soups & Salads' },
      { id: 'mains', label: 'Mains' },
      { id: 'grills', label: 'From the Grill' },
      { id: 'pasta', label: 'Pasta & Risotto' },
      { id: 'drinks', label: 'Drinks' },
      { id: 'cocktails', label: 'Cocktails' },
      { id: 'desserts', label: 'Desserts' },
      { id: 'sides', label: 'Sides' },
    ];
    return (
      <div style={{ maxWidth: 420 }}>
        <CategoryNavigation items={many} value={value} onChange={setValue} />
      </div>
    );
  },
};
