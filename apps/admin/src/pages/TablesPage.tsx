import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, Plus, QrCode, Trash2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Button,
  EmptyState,
  Input,
  Modal,
  useToast,
} from '@org/ui';
import { tablesApi } from '../api/tables.api';
import { ApiError } from '../api/client';
import type { CreateTableInput, RestaurantTable } from '../api/types';
import './MenuPage.css';
import './TablesPage.css';

/** Base URL of the customer app the QR codes point at. */
const CUSTOMER_URL = (
  import.meta.env.VITE_CUSTOMER_URL ?? 'http://localhost:4201'
).replace(/\/+$/, '');

const menuUrlFor = (tableName: string) =>
  `${CUSTOMER_URL}/?table=${encodeURIComponent(tableName)}`;

/** One table's card: shows its auto-generated QR and a PNG download. */
function TableCard({
  table,
  onDelete,
}: {
  table: RestaurantTable;
  onDelete: (table: RestaurantTable) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const url = menuUrlFor(table.name);

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

const EMPTY_FORM: CreateTableInput = { name: '', active: true };

export function TablesPage() {
  const { show } = useToast();
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CreateTableInput>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<RestaurantTable | null>(null);
  const [removing, setRemoving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setTables(await tablesApi.list());
    } catch (err) {
      setLoadError(
        err instanceof ApiError ? err.message : 'Failed to load tables'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFieldErrors(null);
    setModalOpen(true);
  };

  const handleCreate = async () => {
    setFieldErrors(null);
    if (!form.name.trim()) {
      setFieldErrors('Table name is required.');
      return;
    }
    setSaving(true);
    try {
      const created = await tablesApi.create({
        name: form.name.trim(),
        active: form.active,
      });
      setTables((prev) => [...prev, created]);
      setModalOpen(false);
      show({ semantic: 'success', message: `Added table ${created.name}` });
    } catch (err) {
      setFieldErrors(
        err instanceof ApiError ? err.message : 'Could not add the table.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setRemoving(true);
    try {
      await tablesApi.remove(deleteTarget.id);
      setTables((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      show({ semantic: 'success', message: `Deleted table ${deleteTarget.name}` });
      setDeleteTarget(null);
    } catch (err) {
      show({
        semantic: 'error',
        message:
          err instanceof ApiError ? err.message : 'Could not delete the table.',
      });
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="menu-page">
      <div className="menu-page__head">
        <div>
          <h2 className="menu-page__title">Tables</h2>
          <p className="menu-page__subtitle">
            {tables.length} table{tables.length === 1 ? '' : 's'} · scan a QR to
            open that table’s menu
          </p>
        </div>
        <Button leadingIcon={<Plus size={18} />} onClick={openCreate}>
          Add table
        </Button>
      </div>

      {loadError ? (
        <EmptyState
          variant="error-empty"
          title="Couldn’t load tables"
          description={loadError}
          action={{ label: 'Retry', onClick: load }}
        />
      ) : !loading && tables.length === 0 ? (
        <EmptyState
          variant="first-use"
          icon={<QrCode />}
          title="No tables yet"
          description="Add a table number and its menu QR code is generated automatically."
          action={{ label: 'Add table', onClick: openCreate }}
        />
      ) : (
        <div className="table-grid">
          {tables.map((table) => (
            <TableCard key={table.id} table={table} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add table"
        variant="form"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={saving}>
              Add table
            </Button>
          </>
        }
      >
        <div className="menu-form">
          {fieldErrors && (
            <p className="menu-form__error" role="alert">
              {fieldErrors}
            </p>
          )}
          <Input
            label="Table name"
            required
            value={form.name}
            onChange={(e) =>
              setForm((f) => ({ ...f, name: e.currentTarget.value }))
            }
            placeholder="e.g. 1 or t1"
            helperText="Any text — shown to customers and embedded in the QR code."
          />
          <label className="menu-form__check">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                setForm((f) => ({ ...f, active: e.currentTarget.checked }))
              }
            />
            Active
          </label>
        </div>
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete table"
        variant="destructive"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              loading={removing}
            >
              Delete
            </Button>
          </>
        }
      >
        <p>
          Delete table {deleteTarget?.name}? Its QR code will stop working.
        </p>
      </Modal>
    </div>
  );
}
