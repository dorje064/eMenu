import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton, Spinner, ProgressBar } from './LoadingState';
import { Button } from '../Button/Button';

const meta: Meta = {
  title: 'Components/LoadingState',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj;

/** Skeleton mirrors a real menu card to prevent layout shift. */
export const MenuCardSkeleton: Story = {
  render: () => (
    <div
      aria-busy="true"
      aria-label="Loading menu item"
      style={{
        width: 280,
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: 'var(--surface-card)',
      }}
    >
      <Skeleton shape="rect" height={160} radius={0} />
      <div
        style={{
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <Skeleton width="70%" height={18} />
        <Skeleton width="90%" />
        <Skeleton width="40%" height={20} />
      </div>
    </div>
  ),
};

export const SkeletonShapes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Skeleton shape="circle" width={48} />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          maxWidth: 240,
        }}
      >
        <Skeleton width="60%" />
        <Skeleton width="100%" />
      </div>
    </div>
  ),
};

export const Spinners: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <Spinner size="sm" label="Loading orders" />
      <Spinner size="md" label="Loading orders" />
      <Spinner size="lg" label="Loading orders" />
      <Spinner size="md" label="Loading orders" hideLabel={false} />
    </div>
  ),
};

export const SpinnerInButton: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <Button loading>Placing order…</Button>
      <Button variant="secondary" loading>
        Saving
      </Button>
    </div>
  ),
};

export const UploadProgress: Story = {
  render: () => (
    <div
      style={{
        maxWidth: 360,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <ProgressBar value={64} label="Uploading food photo" showValue />
      <ProgressBar value={100} label="Bulk menu import" showValue />
    </div>
  ),
};

export const IndeterminateProgress: Story = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <ProgressBar label="Loading dashboard" />
    </div>
  ),
};
