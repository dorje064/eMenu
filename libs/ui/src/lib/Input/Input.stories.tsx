import type { Meta, StoryObj } from '@storybook/react-vite';
import { Mail, Hash } from 'lucide-react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'currency', 'textarea'],
    },
    size: { control: 'select', options: ['md', 'lg'] },
  },
  args: {
    label: 'Menu item name',
    placeholder: 'e.g. Margherita Pizza',
    size: 'md',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const Required: Story = {
  args: { label: 'Dish name', required: true, helperText: 'Shown to customers on the menu.' },
};

export const WithHelperText: Story = {
  args: {
    label: 'Item description',
    placeholder: 'Wood-fired, San Marzano tomatoes, fresh basil',
    helperText: 'Keep it appetizing and under 120 characters.',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    label: 'Staff email',
    placeholder: 'chef@trattoria.com',
    leadingIcon: <Mail size={18} />,
    defaultValue: 'chef@trattoria.com',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    label: 'Password',
    placeholder: 'Enter your password',
    defaultValue: 'kitchen-secret-42',
    helperText: 'At least 8 characters.',
  },
};

export const Currency: Story = {
  args: {
    type: 'currency',
    label: 'Price',
    placeholder: '0.00',
    defaultValue: '14.50',
    helperText: 'Per serving, before tax.',
  },
};

export const NumberWithSuffix: Story = {
  args: {
    type: 'number',
    label: 'Prep time',
    placeholder: '15',
    suffix: 'min',
    defaultValue: '12',
    leadingIcon: <Hash size={18} />,
  },
};

export const Textarea: Story = {
  args: {
    type: 'textarea',
    label: 'Special instructions',
    placeholder: 'No onions, extra spicy…',
    rows: 4,
    helperText: 'Passed to the kitchen with the order.',
  },
};

export const ErrorState: Story = {
  args: {
    label: 'Price',
    type: 'currency',
    defaultValue: '-3.00',
    error: 'Price must be greater than $0.00.',
  },
};

export const SuccessState: Story = {
  args: {
    label: 'Menu URL slug',
    defaultValue: 'margherita-pizza',
    success: true,
    helperText: 'This slug is available.',
  },
};

export const Disabled: Story = {
  args: { label: 'SKU', defaultValue: 'PIZ-0001', disabled: true },
};

export const ReadOnly: Story = {
  args: { label: 'Item ID', defaultValue: 'itm_8fK2a90', readOnly: true },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Input size="md" label="Dashboard density (md / 40px)" placeholder="Search orders" defaultValue="Pad Thai" />
      <Input size="lg" label="Customer density (lg / 48px)" placeholder="Your name" defaultValue="Aanya" />
    </div>
  ),
};
