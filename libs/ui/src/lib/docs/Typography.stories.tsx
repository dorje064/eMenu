import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Design System/Typography',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

const scale: {
  token: string;
  size: string;
  weight: number;
  sample: string;
}[] = [
  { token: 'display', size: '40/48', weight: 700, sample: '$12,480 revenue' },
  { token: 'h1', size: '32/40', weight: 700, sample: 'Page title' },
  { token: 'h2', size: '28/36', weight: 700, sample: 'Section header' },
  { token: 'h3', size: '24/32', weight: 600, sample: 'Menu category' },
  { token: 'h4', size: '20/28', weight: 600, sample: 'Card / modal title' },
  { token: 'h5', size: '18/26', weight: 600, sample: 'Margherita Pizza' },
  { token: 'body-lg', size: '16/24', weight: 400, sample: 'Customer app body text.' },
  { token: 'body', size: '14/20', weight: 400, sample: 'Dashboard body & table cells.' },
  { token: 'caption', size: '12/16', weight: 400, sample: 'Helper text · 2 min ago' },
  { token: 'overline', size: '11/16', weight: 600, sample: "TODAY'S REVENUE" },
  { token: 'price', size: '18/24', weight: 700, sample: '$12.50' },
];

export const Scale: Story = {
  render: () => (
    <div style={{ padding: 32, fontFamily: 'var(--font-family-base)' }}>
      <h1 style={{ font: '700 32px/40px var(--font-family-base)' }}>
        Typography Scale
      </h1>
      <p style={{ color: 'var(--color-neutral-600)' }}>
        Inter · 1.25 (major third) ratio on a 16px base.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 24 }}>
        {scale.map((t) => (
          <div
            key={t.token}
            style={{
              display: 'grid',
              gridTemplateColumns: '160px 1fr',
              alignItems: 'baseline',
              gap: 24,
              borderBottom: '1px solid var(--color-neutral-200)',
              paddingBottom: 12,
            }}
          >
            <div>
              <code style={{ fontSize: 13, color: 'var(--color-neutral-800)' }}>
                text.{t.token}
              </code>
              <div style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>
                {t.size} · {t.weight}
              </div>
            </div>
            <div
              style={{
                fontSize: `var(--text-${t.token}-size)`,
                lineHeight: `var(--text-${t.token}-line)`,
                fontWeight: t.weight,
                fontVariantNumeric:
                  t.token === 'price' || t.token === 'display'
                    ? 'tabular-nums'
                    : undefined,
                textTransform: t.token === 'overline' ? 'uppercase' : undefined,
                letterSpacing: t.token === 'overline' ? '0.06em' : undefined,
                color: 'var(--color-neutral-900)',
              }}
            >
              {t.sample}
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};
