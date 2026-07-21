import { Printer } from 'lucide-react';
import { Button, OrderStatusBadge, Select, type SelectOption } from '@org/ui';

import type { Order, OrderStatus } from '../../../api/types';

export const currency = (n: number) =>
  `NRs ${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)}`;

/** API status → OrderStatusBadge (canonical UI vocabulary) + display label. */
export const STATUS_BADGE = {
  pending: { badge: 'placed', label: 'Pending' },
  preparing: { badge: 'preparing', label: 'Preparing' },
  served: { badge: 'completed', label: 'Served' },
  paid: { badge: 'completed', label: 'Paid' },
  cancelled: { badge: 'cancelled', label: 'Cancelled' },
} as const;

/** Statuses selectable per active order (Paid is reached via "Mark paid"). */
export const ROW_STATUS_OPTIONS: SelectOption[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'served', label: 'Served' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const timeFmt = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

/** Render a Kitchen Order Ticket into a hidden iframe and trigger the print dialog. */
const printKOT = (order: Order) => {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td class="qty">${item.quantity}×</td>
        <td class="name">${item.name}</td>
      </tr>
    `,
    )
    .join('');

  const timeFormatted = timeFmt.format(new Date(order.createdAt));

  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>KOT - Table ${order.tableNumber}</title>
        <style>
          @page {
            margin: 0;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            margin: 20px;
            padding: 0;
            color: #000;
            font-size: 14px;
            line-height: 1.4;
          }
          .header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 8px;
            margin-bottom: 12px;
          }
          .title {
            font-size: 18px;
            font-weight: bold;
            margin: 0 0 6px 0;
            letter-spacing: 1px;
          }
          .meta {
            font-size: 13px;
            text-align: left;
          }
          .meta-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 10px;
          }
          .items-table th {
            border-bottom: 1px dashed #000;
            text-align: left;
            padding: 6px 0;
            font-size: 13px;
          }
          .items-table td {
            padding: 6px 0;
            vertical-align: top;
          }
          .qty {
            width: 45px;
            font-weight: bold;
          }
          .name {
            font-weight: bold;
          }
          .note-section {
            margin-top: 12px;
            padding-top: 8px;
            border-top: 1px dashed #000;
            font-size: 13px;
          }
          .note-title {
            font-weight: bold;
            margin-bottom: 4px;
          }
          .note-text {
            font-style: italic;
          }
          .footer {
            margin-top: 20px;
            border-top: 1px dashed #000;
            padding-top: 8px;
            text-align: center;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">KITCHEN ORDER TICKET</h1>
          <div class="meta">
            <div class="meta-row">
              <span><strong>Table:</strong> ${order.tableNumber}</span>
              <span><strong>Status:</strong> ${order.status.toUpperCase()}</span>
            </div>
            <div class="meta-row">
              <span><strong>Date:</strong> ${timeFormatted}</span>
            </div>
            <div class="meta-row">
              <span><strong>Order ID:</strong> #${order.id.slice(-6).toUpperCase()}</span>
            </div>
          </div>
        </div>
        <table class="items-table">
          <thead>
            <tr>
              <th class="qty">Qty</th>
              <th class="name">Item</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        ${
          order.note
            ? `
          <div class="note-section">
            <div class="note-title">Customer Note:</div>
            <div class="note-text">"${order.note}"</div>
          </div>
        `
            : ''
        }
        <div class="footer">
          *** eMenu KOT ***
        </div>
      </body>
    </html>
  `;

  doc.open();
  doc.write(content);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 250);
};

/** A single active order rendered as a selectable card. */
export function OrderCard({
  order,
  updating,
  selected,
  canMarkPaid,
  onToggleSelect,
  onChangeStatus,
}: {
  order: Order;
  updating: boolean;
  selected: boolean;
  canMarkPaid: boolean;
  onToggleSelect: () => void;
  onChangeStatus: (status: OrderStatus) => void;
}) {
  const totalQty = order.items.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <div className={`order-card${selected ? ' order-card--selected' : ''}`}>
      <div className="order-card__head">
        <label className="order-card__select">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            aria-label={`Select order for Table ${order.tableNumber} to merge`}
          />
          <div>
            <span className="order-card__table">Table {order.tableNumber}</span>
            <span className="order-card__time">
              {timeFmt.format(new Date(order.createdAt))}
            </span>
          </div>
        </label>
        <OrderStatusBadge
          status={STATUS_BADGE[order.status].badge}
          label={STATUS_BADGE[order.status].label}
          size="sm"
        />
      </div>

      <ul className="order-dishes">
        {order.items.map((line) => (
          <li key={line.id} className="order-dishes__line">
            <span className="order-dishes__qty">{line.quantity}×</span>
            <span className="order-dishes__name">{line.name}</span>
            <span className="order-dishes__price">
              {currency(line.price * line.quantity)}
            </span>
          </li>
        ))}
      </ul>

      {order.note && <p className="order-card__note">“{order.note}”</p>}

      <div className="order-card__total">
        <span>
          {totalQty} item{totalQty === 1 ? '' : 's'}
        </span>
        <span className="order-card__total-amount">
          {currency(order.total)}
        </span>
      </div>

      <div className="order-card__actions">
        <Select
          options={ROW_STATUS_OPTIONS}
          value={order.status}
          disabled={updating}
          onChange={(value) => onChangeStatus(value as OrderStatus)}
          aria-label={`Update status for Table ${order.tableNumber}`}
        />
        <Button
          variant="secondary"
          disabled={updating}
          onClick={() => printKOT(order)}
          leadingIcon={<Printer size={16} />}
        >
          Print KOT
        </Button>
        {canMarkPaid && (
          <Button
            variant="secondary"
            disabled={updating}
            onClick={() => onChangeStatus('paid')}
          >
            Mark paid
          </Button>
        )}
      </div>
    </div>
  );
}
