import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Search } from './Search';

const MENU_ITEMS = [
  'Margherita Pizza',
  'Pad Thai',
  'Chicken Tikka Masala',
  'Caesar Salad',
  'Tonkotsu Ramen',
  'Beef Burger',
  'Falafel Wrap',
  'Tiramisu',
];

const meta: Meta<typeof Search> = {
  title: 'Components/Search',
  component: Search,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['md', 'lg'] },
  },
  args: { label: 'Search menu', placeholder: 'Search menu…', size: 'md' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Search>;

/** Fully controlled, with live filtering over realistic eMenu data. */
export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    const matches = useMemo(
      () =>
        MENU_ITEMS.filter((item) =>
          item.toLowerCase().includes(value.trim().toLowerCase()),
        ),
      [value],
    );
    return (
      <div>
        <Search
          {...args}
          value={value}
          onChange={setValue}
          onClear={() => setValue('')}
          resultsCount={value ? matches.length : undefined}
        />
        <ul style={{ marginTop: 12, paddingLeft: 18 }}>
          {matches.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    );
  },
};

export const Populated: Story = {
  args: { value: 'Pizza', resultsCount: 1 },
};

export const Loading: Story = {
  args: { value: 'Ram', loading: true },
};

export const NoResults: Story = {
  render: (args) => (
    <div>
      <Search
        {...args}
        value="sushi"
        resultsCount={0}
        onChange={() => undefined}
        onClear={() => undefined}
      />
      <p style={{ marginTop: 12, color: 'var(--color-neutral-500)' }}>
        No menu items match “sushi”.
      </p>
    </div>
  ),
};

export const Disabled: Story = {
  args: { value: '', disabled: true },
};

export const CustomerSize: Story = {
  args: {
    size: 'lg',
    label: 'Search the menu',
    placeholder: 'What are you craving?',
  },
};
