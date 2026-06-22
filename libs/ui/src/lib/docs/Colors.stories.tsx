import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Design System/Colors',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div
        style={{
          height: 56,
          borderRadius: 10,
          background: value,
          border: '1px solid var(--color-neutral-200)',
        }}
      />
      <code style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>
        {name}
      </code>
      <code style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>
        {value}
      </code>
    </div>
  );
}

function Ramp({
  title,
  prefix,
  scales,
}: {
  title: string;
  prefix: string;
  scales: (number | string)[];
}) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h3 style={{ font: '600 18px/26px var(--font-family-base)' }}>{title}</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: 16,
        }}
      >
        {scales.map((s) => (
          <Swatch
            key={s}
            name={`${prefix}-${s}`}
            value={`var(--${prefix}-${s})`}
          />
        ))}
      </div>
    </section>
  );
}

export const Palette: Story = {
  render: () => (
    <div style={{ padding: 32, fontFamily: 'var(--font-family-base)' }}>
      <h1 style={{ font: '700 32px/40px var(--font-family-base)' }}>
        Color Palette
      </h1>
      <Ramp
        title="Primary — Saffron"
        prefix="color-primary"
        scales={[50, 100, 200, 300, 400, 500, 600, 700, 800, 900]}
      />
      <Ramp
        title="Secondary — Ember"
        prefix="color-secondary"
        scales={[50, 100, 500, 600, 700]}
      />
      <Ramp
        title="Neutral — Slate"
        prefix="color-neutral"
        scales={[0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900]}
      />
    </div>
  ),
};

export const OrderStatus: Story = {
  render: () => {
    const statuses = [
      'placed',
      'accepted',
      'preparing',
      'ready',
      'completed',
      'cancelled',
    ];
    return (
      <div style={{ padding: 32 }}>
        <h1 style={{ font: '700 32px/40px var(--font-family-base)' }}>
          Order Status (canonical)
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {statuses.map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 9999,
                  background: `var(--status-${s}-fill)`,
                }}
              />
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: 9999,
                  background: `var(--status-${s}-bg)`,
                  color: `var(--status-${s}-text)`,
                  font: '600 14px/20px var(--font-family-base)',
                  textTransform: 'capitalize',
                }}
              >
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  },
};
