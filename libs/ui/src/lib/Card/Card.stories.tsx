import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardMedia, CardHeader, CardBody, CardFooter } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    elevation: {
      control: 'select',
      options: ['flat', 'raised', 'interactive'],
    },
    padding: { control: 'select', options: ['compact', 'default'] },
    accent: {
      control: 'select',
      options: [
        undefined,
        'success',
        'warning',
        'error',
        'info',
        'neutral',
        'primary',
      ],
    },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
    as: { control: 'select', options: ['div', 'button', 'link'] },
  },
  args: { elevation: 'flat', padding: 'default' },
};
export default meta;

type Story = StoryObj<typeof Card>;

const cardStyle = { maxWidth: 360 } as const;

export const Default: Story = {
  args: {
    style: cardStyle,
    children: (
      <>
        <CardHeader>
          <h3
            style={{ font: 'var(--font-family-base)', margin: 0, fontSize: 18 }}
          >
            Table 12 — Window seat
          </h3>
        </CardHeader>
        <CardBody>Open tab · 3 items · seated 19:42</CardBody>
      </>
    ),
  },
};

export const Raised: Story = {
  args: { ...Default.args, elevation: 'raised' },
};

export const Interactive: Story = {
  args: { ...Default.args, elevation: 'interactive' },
};

export const Compact: Story = {
  args: { ...Default.args, padding: 'compact' },
};

export const Selected: Story = {
  args: { ...Default.args, selected: true, elevation: 'raised' },
};

export const WithAccent: Story = {
  args: {
    ...Default.args,
    accent: 'warning',
    children: (
      <>
        <CardHeader>
          <strong>Order #1043 — Preparing</strong>
        </CardHeader>
        <CardBody>2× Margherita Pizza, 1× Garlic Bread</CardBody>
      </>
    ),
  },
};

export const ClickableButton: Story = {
  args: {
    as: 'button',
    elevation: 'interactive',
    style: cardStyle,
    onClick: () => alert('Card pressed'),
    'aria-label': 'Open order #1043',
    children: (
      <>
        <CardHeader>
          <strong>Order #1043</strong>
        </CardHeader>
        <CardBody>Tap anywhere on this card to open the order.</CardBody>
      </>
    ),
  },
};

export const ClickableLink: Story = {
  args: {
    as: 'link',
    elevation: 'interactive',
    href: '#menu',
    style: cardStyle,
    children: (
      <>
        <CardHeader>
          <strong>Browse the dinner menu</strong>
        </CardHeader>
        <CardBody>Starters, mains, desserts and drinks.</CardBody>
      </>
    ),
  },
};

export const Disabled: Story = {
  args: {
    as: 'button',
    elevation: 'interactive',
    disabled: true,
    style: cardStyle,
    'aria-label': 'Closed table',
    children: (
      <>
        <CardHeader>
          <strong>Table 4 — Closed</strong>
        </CardHeader>
        <CardBody>Not accepting orders right now.</CardBody>
      </>
    ),
  },
};

export const WithMediaAndFooter: Story = {
  render: () => (
    <Card elevation="raised" style={cardStyle}>
      <CardMedia>
        <img
          src="https://picsum.photos/seed/pasta/400/240"
          alt="Creamy mushroom pasta"
          style={{
            display: 'block',
            width: '100%',
            height: 200,
            objectFit: 'cover',
          }}
        />
      </CardMedia>
      <CardHeader>
        <strong style={{ fontSize: 18 }}>Mushroom Tagliatelle</strong>
      </CardHeader>
      <CardBody>Hand-rolled pasta in a wild-mushroom cream sauce.</CardBody>
      <CardFooter>
        <span style={{ fontWeight: 700 }}>$14.00</span>
      </CardFooter>
    </Card>
  ),
};
