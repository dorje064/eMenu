import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  UtensilsCrossed,
  SearchX,
  PartyPopper,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { EmptyState } from './EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['first-use', 'no-results', 'cleared', 'error-empty', 'permission'],
    },
    size: { control: 'select', options: ['inline', 'full-page'] },
  },
};
export default meta;

type Story = StoryObj<typeof EmptyState>;

export const FirstUse: Story = {
  args: {
    variant: 'first-use',
    icon: <UtensilsCrossed />,
    title: 'Add your first menu item',
    description:
      'Your menu is empty. Create a dish with a photo and price so guests can start ordering.',
    action: { label: 'Add menu item' },
    secondaryAction: { label: 'Import from spreadsheet' },
  },
};

export const NoResults: Story = {
  args: {
    variant: 'no-results',
    icon: <SearchX />,
    title: 'No items match your filters',
    description: 'Try a different category or clear the active filters.',
    action: { label: 'Clear filters' },
  },
};

export const ClearedDone: Story = {
  args: {
    variant: 'cleared',
    icon: <PartyPopper />,
    title: 'No pending orders 🎉',
    description: "You're all caught up. New orders will appear here in real time.",
  },
};

export const ErrorEmpty: Story = {
  args: {
    variant: 'error-empty',
    icon: <AlertTriangle />,
    title: "Couldn't load orders",
    description: 'Something went wrong fetching this list. Check your connection and retry.',
    action: { label: 'Retry' },
  },
};

export const Permission: Story = {
  args: {
    variant: 'permission',
    icon: <Lock />,
    title: "You don't have access",
    description: 'Ask a manager to grant you the Reports permission to view this page.',
    secondaryAction: { label: 'Back to dashboard' },
  },
};

export const Inline: Story = {
  args: {
    size: 'inline',
    variant: 'cleared',
    icon: <PartyPopper />,
    title: 'No reservations today',
    description: 'Tables open up here as guests book.',
  },
};
