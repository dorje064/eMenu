import type { Meta, StoryObj } from '@storybook/react-vite';
import { Store } from 'lucide-react';
import { Avatar, AvatarGroup } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    shape: { control: 'select', options: ['circle', 'rounded-square'] },
    status: {
      control: 'select',
      options: [undefined, 'online', 'away', 'offline', 'busy'],
    },
  },
  args: { name: 'Priya Sharma', size: 'md' },
};
export default meta;

type Story = StoryObj<typeof Avatar>;

const STAFF_PHOTO =
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop';

export const Image: Story = { args: { src: STAFF_PHOTO, name: 'Aarav Thapa' } };

export const Initials: Story = { args: { name: 'Priya Sharma' } };

export const IconFallback: Story = { args: { name: '' } };

export const RestaurantLogo: Story = {
  args: {
    name: 'Spice Garden',
    shape: 'rounded-square',
    fallbackIcon: <Store />,
  },
};

export const ImageError: Story = {
  args: { name: 'Bina Gurung', src: 'https://example.com/does-not-exist.jpg' },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Avatar name="Sita Rai" size="xs" />
      <Avatar name="Sita Rai" size="sm" />
      <Avatar name="Sita Rai" size="md" />
      <Avatar name="Sita Rai" size="lg" />
      <Avatar name="Sita Rai" size="xl" />
    </div>
  ),
};

export const WithStatus: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Avatar name="Ram Karki" status="online" />
      <Avatar name="Maya Lama" status="away" />
      <Avatar name="Kiran Bhandari" status="busy" />
      <Avatar name="Hari Adhikari" status="offline" />
    </div>
  ),
};

export const InitialsPalette: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', maxWidth: 360 }}>
      {[
        'Priya Sharma',
        'Aarav Thapa',
        'Bina Gurung',
        'Suresh Magar',
        'Anjali Shrestha',
        'Deepak Rana',
      ].map((n) => (
        <Avatar key={n} name={n} size="lg" />
      ))}
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <AvatarGroup label="Staff on shift" max={4}>
      <Avatar name="Priya Sharma" />
      <Avatar name="Aarav Thapa" src={STAFF_PHOTO} />
      <Avatar name="Bina Gurung" />
      <Avatar name="Suresh Magar" />
      <Avatar name="Anjali Shrestha" />
      <Avatar name="Deepak Rana" />
    </AvatarGroup>
  ),
};
