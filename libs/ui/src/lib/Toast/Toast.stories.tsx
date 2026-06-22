import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toast, ToastProvider, useToast } from './Toast';
import { Button } from '../Button/Button';

const meta: Meta<typeof Toast> = {
  title: 'Components/Toast',
  component: Toast,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    semantic: {
      control: 'select',
      options: ['success', 'info', 'warning', 'error'],
    },
  },
};
export default meta;

type Story = StoryObj<typeof Toast>;

/** Presentational toast in isolation (no auto-dismiss). */
export const Presentational: Story = {
  args: {
    semantic: 'success',
    title: 'Order placed',
    message: 'Order #1042 placed for Table 7.',
    duration: null,
    onDismiss: () => undefined,
  },
};

function Demo() {
  const { show } = useToast();
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Button
        onClick={() =>
          show({
            semantic: 'success',
            title: 'Order #1042 placed',
            message: 'Sent to the kitchen — Table 7.',
          })
        }
      >
        Place order
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          show({
            semantic: 'info',
            message: 'New order #1043 received.',
            action: { label: 'View order', onClick: () => undefined },
          })
        }
      >
        Info + action
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          show({
            semantic: 'warning',
            title: 'Low stock',
            message: 'Margherita Pizza is running low.',
          })
        }
      >
        Warning
      </Button>
      <Button
        variant="destructive"
        onClick={() =>
          show({
            semantic: 'error',
            title: 'Connection lost',
            message: 'Reconnecting to the kitchen display…',
            duration: null,
          })
        }
      >
        Error (persistent)
      </Button>
    </div>
  );
}

/** Provider + useToast hook firing real eMenu toasts (stacked, max 3 visible). */
export const WithProvider: StoryObj = {
  render: () => (
    <ToastProvider>
      <Demo />
    </ToastProvider>
  ),
};
