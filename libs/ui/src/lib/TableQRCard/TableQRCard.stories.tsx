import type { Meta, StoryObj } from '@storybook/react-vite';
import { TableQRCard } from './TableQRCard';

const meta: Meta<typeof TableQRCard> = {
  title: 'Components/TableQRCard',
  component: TableQRCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    tableLabel: 'Table 12',
    restaurantName: 'The Olive Branch — Downtown',
    url: 'https://emenu.app/t/olive-12',
    status: 'active',
    variant: 'screen',
    onDownload: () => console.log('download'),
    onPrint: () => console.log('print'),
    onRegenerate: () => console.log('regenerate'),
    onDeactivate: () => console.log('deactivate'),
    onReactivate: () => console.log('reactivate'),
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['active', 'inactive', 'regenerating'],
    },
    variant: { control: 'select', options: ['screen', 'print'] },
  },
};
export default meta;

type Story = StoryObj<typeof TableQRCard>;

/** Active, scannable management tile with full action set. */
export const Active: Story = {};

/** Inactive QR — greyed out, only a Reactivate action. */
export const Inactive: Story = { args: { status: 'inactive' } };

/** A fresh QR is being minted; the old one is being invalidated. */
export const Regenerating: Story = { args: { status: 'regenerating' } };

/** Print layout (A6 / business-card) with human-readable URL fallback. */
export const PrintLayout: Story = { args: { variant: 'print' } };

/** A management grid of tiles, mirroring the table-management screen. */
export const ManagementGrid: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 24,
        justifyItems: 'center',
      }}
    >
      <TableQRCard
        tableLabel="Table 12"
        restaurantName="The Olive Branch — Downtown"
        url="https://emenu.app/t/olive-12"
        status="active"
        onDownload={() => {}}
        onPrint={() => {}}
        onRegenerate={() => {}}
        onDeactivate={() => {}}
      />
      <TableQRCard
        tableLabel="Table 13"
        restaurantName="The Olive Branch — Downtown"
        url="https://emenu.app/t/olive-13"
        status="regenerating"
        onRegenerate={() => {}}
      />
      <TableQRCard
        tableLabel="Patio 4"
        restaurantName="The Olive Branch — Downtown"
        url="https://emenu.app/t/olive-patio-4"
        status="inactive"
        onReactivate={() => {}}
      />
    </div>
  ),
};
