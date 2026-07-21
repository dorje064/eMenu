import { useRef } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@org/ui';
import type { RestaurantTable } from '../../../api/types';

/** Base URL of the customer app the QR codes point at. */
const CUSTOMER_URL = (
  import.meta.env.VITE_CUSTOMER_URL ?? 'http://localhost:4201'
).replace(/\/+$/, '');

const menuUrlFor = (cafeId: string, tableName: string) =>
  `${CUSTOMER_URL}/?cafe=${encodeURIComponent(cafeId)}&table=${encodeURIComponent(
    tableName,
  )}`;

/** One table's card: shows its auto-generated QR and a PNG download. */
export function TableCard({
  table,
  cafeId,
  onDelete,
}: {
  table: RestaurantTable;
  cafeId: string;
  onDelete: (table: RestaurantTable) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const url = menuUrlFor(cafeId, table.name);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `table-${table.name}-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="table-card">
      <div className="table-card__head">
        <span className="table-card__title">Table {table.name}</span>
        <span
          className={`menu-status menu-status--${table.active ? 'on' : 'off'}`}
        >
          {table.active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="table-card__qr">
        <QRCodeCanvas
          ref={canvasRef}
          value={url}
          size={176}
          marginSize={2}
          level="M"
        />
      </div>

      <a
        className="table-card__url"
        href={url}
        target="_blank"
        rel="noreferrer"
        title={url}
      >
        {url}
      </a>

      <div className="table-card__actions">
        <Button
          variant="secondary"
          size="sm"
          leadingIcon={<Download size={16} />}
          onClick={download}
        >
          Download
        </Button>
        <Button
          variant="tertiary"
          size="sm"
          shape="icon"
          aria-label={`Delete table ${table.name}`}
          leadingIcon={<Trash2 size={16} />}
          onClick={() => onDelete(table)}
        />
      </div>
    </div>
  );
}
