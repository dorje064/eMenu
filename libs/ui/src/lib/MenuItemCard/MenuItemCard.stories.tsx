import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MenuItemCard } from './MenuItemCard';
import type { MenuItemTag } from './MenuItemCard';

const meta: Meta<typeof MenuItemCard> = {
  title: 'Components/MenuItemCard',
  component: MenuItemCard,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    layout: { control: 'select', options: ['vertical', 'horizontal'] },
    soldOut: { control: 'boolean' },
    adding: { control: 'boolean' },
    quantity: { control: 'number' },
  },
};
export default meta;

type Story = StoryObj<typeof MenuItemCard>;

const pizzaTags: MenuItemTag[] = [
  { kind: 'veg' },
  { kind: 'bestseller' },
];

const baseArgs = {
  name: 'Margherita Pizza',
  price: '$12.50',
  description:
    'Wood-fired sourdough base with San Marzano tomato, fresh mozzarella di bufala and basil.',
  imageUrl: 'https://picsum.photos/seed/pizza/400/300',
  imageAlt: 'Margherita pizza on a wooden board',
  prepTime: '15 min',
  tags: pizzaTags,
} as const;

export const Vertical: Story = {
  args: { ...baseArgs, layout: 'vertical' },
  render: (args) => (
    <div style={{ maxWidth: 320 }}>
      <MenuItemCard {...args} />
    </div>
  ),
};

export const Horizontal: Story = {
  args: { ...baseArgs, layout: 'horizontal' },
  render: (args) => (
    <div style={{ maxWidth: 520 }}>
      <MenuItemCard {...args} />
    </div>
  ),
};

export const Spicy: Story = {
  args: {
    name: 'Spicy Chicken Tikka',
    price: '$14.00',
    description: 'Char-grilled chicken in a fiery house masala, served with mint chutney.',
    imageUrl: 'https://picsum.photos/seed/tikka/400/300',
    prepTime: '20 min',
    tags: [{ kind: 'non-veg' }, { kind: 'spicy' }],
  },
  render: (args) => (
    <div style={{ maxWidth: 320 }}>
      <MenuItemCard {...args} />
    </div>
  ),
};

export const Discounted: Story = {
  args: {
    name: 'Garlic Bread',
    price: '$4.00',
    originalPrice: '$6.00',
    description: 'Toasted ciabatta with roasted garlic butter and parsley.',
    imageUrl: 'https://picsum.photos/seed/garlic/400/300',
    prepTime: '8 min',
    tags: [{ kind: 'veg' }, { kind: 'discounted' }],
  },
  render: (args) => (
    <div style={{ maxWidth: 320 }}>
      <MenuItemCard {...args} />
    </div>
  ),
};

export const SoldOut: Story = {
  args: { ...baseArgs, soldOut: true },
  render: (args) => (
    <div style={{ maxWidth: 320 }}>
      <MenuItemCard {...args} />
    </div>
  ),
};

export const Adding: Story = {
  args: { ...baseArgs, adding: true },
  render: (args) => (
    <div style={{ maxWidth: 320 }}>
      <MenuItemCard {...args} />
    </div>
  ),
};

export const InCart: Story = {
  args: { ...baseArgs, quantity: 2 },
  render: (args) => (
    <div style={{ maxWidth: 320 }}>
      <MenuItemCard {...args} />
    </div>
  ),
};

export const ImageLessFallback: Story = {
  args: {
    name: 'Chef’s Daily Special',
    price: '$18.00',
    description: 'Ask your server — a rotating plate built from today’s market produce.',
    prepTime: '25 min',
    tags: [{ kind: 'new' }],
    imageUrl: undefined,
  },
  render: (args) => (
    <div style={{ maxWidth: 320 }}>
      <MenuItemCard {...args} />
    </div>
  ),
};

/** Interactive demo: Add → in-cart stepper with live quantity. */
export const Interactive: Story = {
  render: () => {
    const [qty, setQty] = useState(0);
    const [adding, setAdding] = useState(false);
    return (
      <div style={{ maxWidth: 320 }}>
        <MenuItemCard
          {...baseArgs}
          quantity={qty}
          adding={adding}
          onAdd={() => {
            setAdding(true);
            setTimeout(() => {
              setAdding(false);
              setQty(1);
            }, 700);
          }}
          onIncrease={() => setQty((q) => q + 1)}
          onDecrease={() => setQty((q) => Math.max(0, q - 1))}
        />
      </div>
    );
  },
};

/** A grid of dishes — the customer menu view. */
export const MenuGrid: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 16,
      }}
    >
      <MenuItemCard {...baseArgs} />
      <MenuItemCard
        name="Spicy Chicken Tikka"
        price="$14.00"
        description="Char-grilled chicken in a fiery house masala."
        imageUrl="https://picsum.photos/seed/tikka/400/300"
        prepTime="20 min"
        tags={[{ kind: 'non-veg' }, { kind: 'spicy' }]}
      />
      <MenuItemCard
        name="Vegan Buddha Bowl"
        price="$11.00"
        description="Quinoa, roasted chickpeas, avocado and tahini dressing."
        imageUrl="https://picsum.photos/seed/bowl/400/300"
        prepTime="12 min"
        tags={[{ kind: 'vegan' }]}
        quantity={1}
      />
      <MenuItemCard
        name="Tiramisu"
        price="$7.50"
        description="Espresso-soaked savoiardi with mascarpone cream."
        imageUrl="https://picsum.photos/seed/tiramisu/400/300"
        prepTime="5 min"
        tags={[{ kind: 'veg' }, { kind: 'bestseller' }]}
        soldOut
      />
    </div>
  ),
};
