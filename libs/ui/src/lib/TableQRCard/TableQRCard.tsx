import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Download,
  Printer,
  RefreshCw,
  Power,
  Loader2,
  UtensilsCrossed,
} from 'lucide-react';
import { Button } from '../Button/Button';
import { cn } from '../utils/cn';
import './TableQRCard.css';

/** Lifecycle of a table's QR code. */
export type TableQRStatus = 'active' | 'inactive' | 'regenerating';

/** Layout mode — an on-screen management tile or a print-ready card. */
export type TableQRVariant = 'screen' | 'print';

export interface TableQRCardProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title'
> {
  /** Physical table label, e.g. "Table 12". */
  tableLabel: string;
  /** Branch / restaurant name shown under the table label. */
  restaurantName: string;
  /** The URL the QR code encodes (also shown as human-readable fallback text). */
  url: string;
  /** QR lifecycle state. @default 'active' */
  status?: TableQRStatus;
  /** Layout mode. @default 'screen' */
  variant?: TableQRVariant;
  /** Short scan instruction. @default 'Scan to view menu & order' */
  instruction?: string;
  /** Optional brand mark (logo). Falls back to a default mark + name. */
  brandMark?: ReactNode;
  /** Pixel size of the QR module grid. @default 160 */
  qrSize?: number;
  /** Download the QR (e.g. as PNG/SVG). */
  onDownload?: () => void;
  /** Print this card. */
  onPrint?: () => void;
  /** Mint a fresh QR — invalidates the old one (confirm before calling). */
  onRegenerate?: () => void;
  /** Deactivate the table's QR (active → inactive). */
  onDeactivate?: () => void;
  /** Reactivate a disabled QR (inactive → active). */
  onReactivate?: () => void;
}

/**
 * TableQRCard — printable/exportable card for a physical table's QR code, and
 * the on-screen management tile. QR uses error-correction `H` with a preserved
 * quiet zone for maximum scannability. State is conveyed by text + styling, not
 * colour alone, and the encoded URL is always shown as a human-readable
 * fallback for un-scannable conditions.
 */
export const TableQRCard = forwardRef<HTMLDivElement, TableQRCardProps>(
  (
    {
      tableLabel,
      restaurantName,
      url,
      status = 'active',
      variant = 'screen',
      instruction = 'Scan to view menu & order',
      brandMark,
      qrSize = 160,
      onDownload,
      onPrint,
      onRegenerate,
      onDeactivate,
      onReactivate,
      className,
      ...rest
    },
    ref,
  ) => {
    const isInactive = status === 'inactive';
    const isRegenerating = status === 'regenerating';
    const qrLabel = `QR code for ${tableLabel}`;
    const statusText =
      status === 'active'
        ? 'Active'
        : status === 'inactive'
          ? 'Inactive'
          : 'Regenerating…';

    return (
      <div
        ref={ref}
        className={cn(
          'emenu-qrcard',
          `emenu-qrcard--${variant}`,
          `emenu-qrcard--${status}`,
          className,
        )}
        {...rest}
      >
        {/* Brand mark */}
        <div className="emenu-qrcard__brand">
          {brandMark ?? (
            <UtensilsCrossed
              size={18}
              aria-hidden="true"
              className="emenu-qrcard__brand-mark"
            />
          )}
          <span className="emenu-qrcard__brand-name">{restaurantName}</span>
        </div>

        {/* QR + live state */}
        <div className="emenu-qrcard__qr-wrap">
          <div className="emenu-qrcard__qr" role="img" aria-label={qrLabel}>
            <QRCodeSVG
              value={url}
              size={qrSize}
              level="H"
              marginSize={4}
              bgColor="#ffffff"
              fgColor="#000000"
              title={qrLabel}
            />
            {isRegenerating && (
              <div className="emenu-qrcard__qr-overlay" aria-hidden="true">
                <Loader2 size={28} className="emenu-qrcard__spinner" />
              </div>
            )}
          </div>
        </div>

        {/* Table label + instruction */}
        <div className="emenu-qrcard__body">
          <p className="emenu-qrcard__table">{tableLabel}</p>
          <p className="emenu-qrcard__instruction">{instruction}</p>
          {/* Human-readable URL fallback for un-scannable conditions */}
          <p className="emenu-qrcard__url">{url}</p>
        </div>

        {/* Status — text + dot, never colour alone */}
        <p
          className="emenu-qrcard__status"
          aria-live={isRegenerating ? 'polite' : undefined}
        >
          <span className="emenu-qrcard__status-dot" aria-hidden="true" />
          <span>{statusText}</span>
          {isInactive && (
            <span className="emenu-qrcard__status-note"> — not scannable</span>
          )}
          {isRegenerating && (
            <span className="emenu-qrcard__status-note">
              {' '}
              — old QR codes will stop working
            </span>
          )}
        </p>

        {/* Actions — only on the screen tile */}
        {variant === 'screen' && (
          <div className="emenu-qrcard__actions">
            {isInactive ? (
              <Button
                variant="primary"
                size="sm"
                leadingIcon={<Power size={16} />}
                onClick={onReactivate}
                disabled={!onReactivate}
              >
                Reactivate
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  leadingIcon={<Download size={16} />}
                  onClick={onDownload}
                  disabled={isRegenerating || !onDownload}
                >
                  Download
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  leadingIcon={<Printer size={16} />}
                  onClick={onPrint}
                  disabled={isRegenerating || !onPrint}
                >
                  Print
                </Button>
                <Button
                  variant="tertiary"
                  size="sm"
                  leadingIcon={<RefreshCw size={16} />}
                  onClick={onRegenerate}
                  loading={isRegenerating}
                  disabled={!onRegenerate}
                >
                  Regenerate
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  leadingIcon={<Power size={16} />}
                  onClick={onDeactivate}
                  disabled={isRegenerating || !onDeactivate}
                >
                  Deactivate
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    );
  },
);

TableQRCard.displayName = 'TableQRCard';

export default TableQRCard;
