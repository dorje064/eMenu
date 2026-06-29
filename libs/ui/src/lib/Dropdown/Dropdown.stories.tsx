import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pencil, Copy, Trash2 } from 'lucide-react';
import { Dropdown, Select } from './Dropdown';
import type { DropdownItem, SelectOption } from './Dropdown';

const meta: Meta<typeof Dropdown> = {
  title: 'Components/Dropdown',
  component: Dropdown,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Dropdown>;

/* ------------------------------------------------------------------ */
/* Dropdown — action menu                                             */
/* ------------------------------------------------------------------ */

const rowActions: DropdownItem[] = [
  { id: 'edit', label: 'Edit', icon: <Pencil size={16} /> },
  { id: 'duplicate', label: 'Duplicate', icon: <Copy size={16} /> },
  {
    id: 'delete',
    label: 'Delete',
    icon: <Trash2 size={16} />,
    destructive: true,
  },
];

/** Row kebab on a table-management row: Edit / Duplicate / Delete. */
export const RowKebabMenu: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        width: 320,
        padding: '12px 16px',
        border: '1px solid var(--border-default)',
        borderRadius: 10,
        background: 'var(--surface-card)',
      }}
    >
      <span style={{ fontFamily: 'var(--font-family-base)' }}>
        Table 12 — Patio
      </span>
      <Dropdown
        items={rowActions}
        triggerLabel="Actions for Table 12"
        onSelect={(id) => console.log('selected', id)}
      />
    </div>
  ),
};

/** Selected / disabled item states inside an action menu. */
export const MenuItemStates: Story = {
  render: () => (
    <Dropdown
      triggerLabel="Sort menu by"
      items={[
        { id: 'popular', label: 'Most popular', selected: true },
        { id: 'price-asc', label: 'Price: low to high' },
        { id: 'price-desc', label: 'Price: high to low' },
        { id: 'archived', label: 'Archived items', disabled: true },
        { id: 'reset', label: 'Reset sort', destructive: true },
      ]}
    />
  ),
};

/* ------------------------------------------------------------------ */
/* Select — listbox / combobox                                        */
/* ------------------------------------------------------------------ */

const categories: SelectOption[] = [
  { value: 'starters', label: 'Starters' },
  { value: 'mains', label: 'Mains' },
  { value: 'pizzas', label: 'Wood-fired Pizzas' },
  { value: 'desserts', label: 'Desserts' },
  { value: 'drinks', label: 'Drinks & Cocktails' },
  { value: 'seasonal', label: 'Seasonal (coming soon)', disabled: true },
];

/** Choose a menu category (single-select listbox pattern). */
export const SelectMenuCategory: StoryObj<typeof Select> = {
  render: () => {
    const [value, setValue] = useState('mains');
    return (
      <Select
        label="Menu category"
        options={categories}
        value={value}
        onChange={setValue}
      />
    );
  },
};

const branches: SelectOption[] = [
  { value: 'downtown', label: 'The Olive Branch — Downtown' },
  { value: 'harbor', label: 'The Olive Branch — Harborfront' },
  { value: 'airport', label: 'The Olive Branch — Airport Terminal 2' },
];

/** Choose a branch, starting empty with a placeholder. */
export const SelectBranch: StoryObj<typeof Select> = {
  render: () => {
    const [value, setValue] = useState<string | undefined>(undefined);
    return (
      <Select
        label="Branch"
        placeholder="Choose a branch…"
        options={branches}
        value={value}
        onChange={setValue}
      />
    );
  },
};

/** Disabled select control. */
export const SelectDisabled: StoryObj<typeof Select> = {
  render: () => (
    <Select
      label="Currency"
      options={categories}
      defaultValue="mains"
      disabled
    />
  ),
};
