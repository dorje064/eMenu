import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus, ArrowRight, Trash2 } from 'lucide-react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'destructive', 'link'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    shape: { control: 'select', options: ['default', 'pill', 'icon'] },
  },
  args: { children: 'Place order', variant: 'primary', size: 'md' },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {};

export const Secondary: Story = { args: { variant: 'secondary' } };

export const Tertiary: Story = { args: { variant: 'tertiary' } };

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete item',
    leadingIcon: <Trash2 size={18} />,
  },
};

export const Link: Story = {
  args: { variant: 'link', children: 'View report' },
};

export const Hierarchy: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">XL</Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Button leadingIcon={<Plus size={18} />}>Add item</Button>
      <Button trailingIcon={<ArrowRight size={18} />}>Continue</Button>
      <Button shape="icon" aria-label="Add item">
        <Plus size={18} />
      </Button>
    </div>
  ),
};

export const Loading: Story = { args: { loading: true } };

export const Disabled: Story = { args: { disabled: true } };

export const FullWidth: Story = {
  args: { size: 'xl', fullWidth: true, children: 'Place order — $42.50' },
  parameters: { layout: 'padded' },
};
