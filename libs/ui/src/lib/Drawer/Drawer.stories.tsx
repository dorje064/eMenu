import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Drawer } from './Drawer';
import { Button } from '../Button/Button';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    edge: { control: 'select', options: ['right', 'left', 'bottom', 'top'] },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'auto'] },
    modal: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof Drawer>;

const cartItems = [
  { name: 'Margherita Pizza', qty: 1, price: 12.0 },
  { name: 'Garlic Bread', qty: 2, price: 11.0 },
  { name: 'Lemonade', qty: 2, price: 7.0 },
];

function CartBody() {
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 12 }}>
      {cartItems.map((item) => (
        <li
          key={item.name}
          style={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <span>
            {item.qty}× {item.name}
          </span>
          <span>${item.price.toFixed(2)}</span>
        </li>
      ))}
    </ul>
  );
}

export const Cart: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open cart</Button>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          title="Your order — Table 7"
          edge="right"
          size="md"
          footer={
            <Button fullWidth size="lg" onClick={() => setOpen(false)}>
              Place Order — $42.50
            </Button>
          }
        >
          <CartBody />
        </Drawer>
      </>
    );
  },
};

export const BottomSheet: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open bottom sheet</Button>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          title="Your order"
          edge="bottom"
          size="auto"
          footer={
            <Button fullWidth size="lg" onClick={() => setOpen(false)}>
              Place Order — $42.50
            </Button>
          }
        >
          <CartBody />
        </Drawer>
      </>
    );
  },
};

export const NavLeft: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Open menu
        </Button>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          title="Menu"
          edge="left"
          size="sm"
        >
          <nav style={{ display: 'grid', gap: 12 }}>
            <a href="#orders">Orders</a>
            <a href="#menu">Menu</a>
            <a href="#tables">Tables</a>
            <a href="#reports">Reports</a>
          </nav>
        </Drawer>
      </>
    );
  },
};

export const NonModalFilters: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Filters
        </Button>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          title="Filter orders"
          edge="right"
          size="sm"
          modal={false}
          footer={
            <Button onClick={() => setOpen(false)}>Apply filters</Button>
          }
        >
          <div style={{ display: 'grid', gap: 12 }}>
            <label>
              <input type="checkbox" /> Placed
            </label>
            <label>
              <input type="checkbox" /> Preparing
            </label>
            <label>
              <input type="checkbox" /> Ready
            </label>
          </div>
        </Drawer>
      </>
    );
  },
};
