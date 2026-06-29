import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Modal } from './Modal';
import { Button } from '../Button/Button';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'full-screen'] },
    variant: {
      control: 'select',
      options: ['confirmation', 'form', 'informational', 'destructive'],
    },
  },
};
export default meta;

type Story = StoryObj<typeof Modal>;

export const Confirmation: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Confirm order</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Confirm order"
          size="sm"
          variant="confirmation"
          footer={
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Place order</Button>
            </>
          }
        >
          Place this order for Table 7? Total comes to $42.50 across 3 items.
        </Modal>
      </>
    );
  },
};

export const Form: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Edit menu item</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Edit “Margherita Pizza”"
          size="md"
          variant="form"
          footer={
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Save changes</Button>
            </>
          }
        >
          <div style={{ display: 'grid', gap: 16 }}>
            <label style={{ display: 'grid', gap: 4 }}>
              <span>Item name</span>
              <input defaultValue="Margherita Pizza" />
            </label>
            <label style={{ display: 'grid', gap: 4 }}>
              <span>Price</span>
              <input defaultValue="12.00" />
            </label>
            <label style={{ display: 'grid', gap: 4 }}>
              <span>Description</span>
              <textarea defaultValue="San Marzano tomato, fior di latte, basil." />
            </label>
          </div>
        </Modal>
      </>
    );
  },
};

export const Informational: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          View order #1042
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Order #1042 — Table 7"
          size="lg"
          variant="informational"
          footer={<Button onClick={() => setOpen(false)}>Done</Button>}
        >
          <p>1× Margherita Pizza — $12.00</p>
          <p>2× Garlic Bread — $11.00</p>
          <p>2× Lemonade — $7.00</p>
          <p>
            <strong>Subtotal: $30.00 · Tax: $2.50 · Total: $42.50</strong>
          </p>
        </Modal>
      </>
    );
  },
};

export const Destructive: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Cancel order
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Cancel order #1042?"
          size="sm"
          variant="destructive"
          footer={
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Keep order
              </Button>
              <Button variant="destructive" onClick={() => setOpen(false)}>
                Cancel order
              </Button>
            </>
          }
        >
          This permanently cancels Table 7’s order. The kitchen will be
          notified. This action cannot be undone. (Esc and scrim-click are
          disabled here.)
        </Modal>
      </>
    );
  },
};
