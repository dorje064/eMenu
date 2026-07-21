import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Boxes, Pencil, Plus, SlidersHorizontal, Trash2 } from 'lucide-react';
import {
  Button,
  DataTable,
  EmptyState,
  Input,
  Modal,
  Select,
  useToast,
  type DataTableColumn,
  type SelectOption,
} from '@org/ui';
import { inventoryApi } from '../../api/inventory.api';
import { menuApi } from '../../api/menu.api';
import { ApiError } from '../../api/client';
import { queryKeys } from '../../api/queryKeys';
import { SearchableSelect } from '../../components/SearchableSelect';
import type {
  AdjustReason,
  CreateInventoryInput,
  InventoryItem,
} from '../../api/types';
import '../MenuPage/style.css';
import './style.css';

/** A dish link while editing — quantity kept as a string for the input. */
interface LinkRow {
  foodItemId: string;
  quantityPerUnit: string;
}

interface FormState {
  name: string;
  unit: string;
  quantity: string;
  links: LinkRow[];
  lowStockThreshold: string;
  note: string;
}

const emptyForm = (): FormState => ({
  name: '',
  unit: '',
  quantity: '',
  links: [],
  lowStockThreshold: '',
  note: '',
});

const REASON_OPTIONS: SelectOption[] = [
  { value: 'restock', label: 'Restock (+)' },
  { value: 'waste', label: 'Waste (−)' },
  { value: 'correction', label: 'Correction' },
];

export function InventoryPage() {
  const { show } = useToast();
  const queryClient = useQueryClient();

  const {
    data: items = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.inventory,
    queryFn: () => inventoryApi.list(),
  });

  // Menu items back the dish multi-select and the table's link column.
  const { data: menu = [] } = useQuery({
    queryKey: queryKeys.menu(),
    queryFn: () => menuApi.list(),
  });

  const dishName = useMemo(() => {
    const byId = new Map(menu.map((m) => [m.id, m.name]));
    return (id: string) => byId.get(id) ?? 'Unknown dish';
  }, [menu]);

  const dishOptions = useMemo(
    () => menu.map((m) => ({ value: m.id, label: m.name })),
    [menu],
  );

  const loadError = isError
    ? error instanceof ApiError
      ? error.message
      : 'Failed to load inventory'
    : null;

  // Add / edit form.
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  // Manual adjust.
  const [adjustTarget, setAdjustTarget] = useState<InventoryItem | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState<AdjustReason>('restock');
  const [adjustNote, setAdjustNote] = useState('');
  const [adjustError, setAdjustError] = useState<string | null>(null);

  const [removeTarget, setRemoveTarget] = useState<InventoryItem | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Reconcile the links array to the dishes chosen in the multi-select,
  // preserving any per-unit quantities already typed for kept dishes.
  const setLinkedDishes = (ids: string[]) =>
    setForm((f) => {
      const existing = new Map(f.links.map((l) => [l.foodItemId, l]));
      return {
        ...f,
        links: ids.map(
          (id) => existing.get(id) ?? { foodItemId: id, quantityPerUnit: '1' },
        ),
      };
    });

  const setLinkQty = (foodItemId: string, quantityPerUnit: string) =>
    setForm((f) => ({
      ...f,
      links: f.links.map((l) =>
        l.foodItemId === foodItemId ? { ...l, quantityPerUnit } : l,
      ),
    }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      unit: item.unit ?? '',
      quantity: String(item.quantity),
      links: item.links.map((l) => ({
        foodItemId: l.foodItemId,
        quantityPerUnit: String(l.quantityPerUnit),
      })),
      lowStockThreshold:
        item.lowStockThreshold === null ? '' : String(item.lowStockThreshold),
      note: item.note ?? '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (payload: CreateInventoryInput) =>
      editing
        ? inventoryApi.update(editing.id, payload)
        : inventoryApi.create(payload),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
      show({
        semantic: 'success',
        message: editing ? `Updated “${saved.name}”` : `Added “${saved.name}”`,
      });
      setModalOpen(false);
    },
    onError: (err) => {
      setFormError(
        err instanceof ApiError ? err.message : 'Could not save the item.',
      );
    },
  });

  const handleSave = () => {
    setFormError(null);
    const quantity = Number(form.quantity);
    if (!form.name.trim()) return setFormError('Name is required.');
    if (form.quantity.trim() === '' || Number.isNaN(quantity) || quantity < 0)
      return setFormError('Enter a valid quantity (0 or more).');

    const links = [];
    for (const l of form.links) {
      const perUnit = Number(l.quantityPerUnit);
      if (l.quantityPerUnit.trim() === '' || Number.isNaN(perUnit) || perUnit <= 0)
        return setFormError(
          `Enter a per-unit amount greater than 0 for “${dishName(l.foodItemId)}”.`,
        );
      links.push({ foodItemId: l.foodItemId, quantityPerUnit: perUnit });
    }

    const threshold = form.lowStockThreshold.trim();
    let lowStockThreshold: number | null = null;
    if (threshold !== '') {
      const parsed = Number(threshold);
      if (Number.isNaN(parsed) || parsed < 0)
        return setFormError('Low-stock threshold must be 0 or more.');
      lowStockThreshold = parsed;
    }

    saveMutation.mutate({
      name: form.name.trim(),
      quantity,
      unit: form.unit.trim() || undefined,
      links,
      lowStockThreshold,
      note: form.note.trim() || undefined,
    });
  };

  const adjustMutation = useMutation({
    mutationFn: (payload: {
      id: string;
      delta: number;
      reason: AdjustReason;
      note?: string;
    }) =>
      inventoryApi.adjust(payload.id, {
        delta: payload.delta,
        reason: payload.reason,
        note: payload.note,
      }),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
      show({
        semantic: 'success',
        message: `Stock updated — “${saved.name}” now ${saved.quantity}`,
      });
      setAdjustTarget(null);
    },
    onError: (err) => {
      setAdjustError(
        err instanceof ApiError ? err.message : 'Could not adjust stock.',
      );
    },
  });

  const openAdjust = (item: InventoryItem) => {
    setAdjustTarget(item);
    setAdjustAmount('');
    setAdjustReason('restock');
    setAdjustNote('');
    setAdjustError(null);
  };

  const handleAdjust = () => {
    if (!adjustTarget) return;
    setAdjustError(null);
    const amount = Number(adjustAmount);
    if (adjustAmount.trim() === '' || Number.isNaN(amount) || amount <= 0)
      return setAdjustError('Enter an amount greater than 0.');
    // Waste removes stock; restock adds. Correction can go either way, so the
    // user types a signed value there.
    const delta =
      adjustReason === 'waste'
        ? -amount
        : adjustReason === 'restock'
          ? amount
          : Number(adjustAmount);
    adjustMutation.mutate({
      id: adjustTarget.id,
      delta,
      reason: adjustReason,
      note: adjustNote.trim() || undefined,
    });
  };

  const deleteMutation = useMutation({
    mutationFn: (item: InventoryItem) => inventoryApi.remove(item.id),
    onSuccess: (_data, item) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
      show({ semantic: 'success', message: `Deleted “${item.name}”` });
      setRemoveTarget(null);
    },
    onError: (err) => {
      show({
        semantic: 'error',
        message:
          err instanceof ApiError ? err.message : 'Could not delete the item.',
      });
    },
  });

  const columns: DataTableColumn<InventoryItem>[] = [
    { key: 'name', header: 'Item', render: (r) => <strong>{r.name}</strong> },
    { key: 'unit', header: 'Unit', render: (r) => r.unit ?? '—' },
    {
      key: 'links',
      header: 'Consumed by',
      render: (r) =>
        r.links.length === 0
          ? '—'
          : r.links
              .map((l) => `${dishName(l.foodItemId)} ×${l.quantityPerUnit}`)
              .join(', '),
    },
    {
      key: 'quantity',
      header: 'On hand',
      numeric: true,
      render: (r) => (
        <span className="inv-qty">
          {r.quantity}
          {r.lowStock && <span className="inv-badge">Low</span>}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'end',
      render: (r) => (
        <div className="menu-row-actions">
          <Button
            variant="tertiary"
            shape="icon"
            aria-label={`Adjust stock for ${r.name}`}
            onClick={() => openAdjust(r)}
            leadingIcon={<SlidersHorizontal size={16} />}
          />
          <Button
            variant="tertiary"
            shape="icon"
            aria-label={`Edit ${r.name}`}
            onClick={() => openEdit(r)}
            leadingIcon={<Pencil size={16} />}
          />
          <Button
            variant="tertiary"
            shape="icon"
            aria-label={`Delete ${r.name}`}
            onClick={() => setRemoveTarget(r)}
            leadingIcon={<Trash2 size={16} />}
          />
        </div>
      ),
    },
  ];

  const lowCount = items.filter((i) => i.lowStock).length;

  return (
    <div className="menu-page">
      <div className="menu-page__head">
        <div>
          <h2 className="menu-page__title">Inventory</h2>
          <p className="menu-page__subtitle">
            {items.length} item{items.length === 1 ? '' : 's'} tracked
            {lowCount > 0 ? ` · ${lowCount} low on stock` : ''}
          </p>
        </div>
        <div className="menu-page__actions">
          <Button leadingIcon={<Plus size={18} />} onClick={openCreate}>
            Add item
          </Button>
        </div>
      </div>

      {loadError ? (
        <EmptyState
          variant="error-empty"
          title="Couldn’t load inventory"
          description={loadError}
          action={{ label: 'Retry', onClick: () => refetch() }}
        />
      ) : !isLoading && items.length === 0 ? (
        <EmptyState
          variant="first-use"
          icon={<Boxes />}
          title="No inventory items yet"
          description="Add stock items and link them to menu dishes to track them as orders are paid."
          action={{ label: 'Add item', onClick: openCreate }}
        />
      ) : (
        <DataTable
          ariaLabel="Inventory items"
          columns={columns}
          rows={items}
          getRowId={(r) => r.id}
          loading={isLoading}
        />
      )}

      {/* Add / edit */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit inventory item' : 'Add inventory item'}
        variant="form"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saveMutation.isPending}>
              {editing ? 'Save changes' : 'Add item'}
            </Button>
          </>
        }
      >
        <div className="menu-form">
          {formError && (
            <p className="menu-form__error" role="alert">
              {formError}
            </p>
          )}
          <Input
            label="Name"
            required
            value={form.name}
            onChange={(e) => update('name', e.currentTarget.value)}
            placeholder="Mozzarella"
          />
          <div className="menu-form__row">
            <Input
              label="Quantity on hand"
              type="number"
              value={form.quantity}
              onChange={(e) => update('quantity', e.currentTarget.value)}
              placeholder="20"
            />
            <Input
              label="Unit"
              value={form.unit}
              onChange={(e) => update('unit', e.currentTarget.value)}
              placeholder="kg, cans, packs…"
            />
          </div>

          <div className="menu-form__field">
            <label className="menu-form__label" htmlFor="inv-linked-dishes">
              Consumed by dishes
            </label>
            <SearchableSelect
              inputId="inv-linked-dishes"
              isMulti
              options={dishOptions}
              value={form.links.map((l) => l.foodItemId)}
              onChange={setLinkedDishes}
              placeholder={
                dishOptions.length ? 'Search dishes…' : 'No dishes on the menu'
              }
              isDisabled={dishOptions.length === 0}
              label="Consumed by dishes"
            />
            <p className="inv-hint">
              When a linked dish is on a paid order, this item’s stock drops by
              the per-unit amount × quantity sold.
            </p>
          </div>

          {form.links.length > 0 && (
            <div className="inv-links">
              {form.links.map((l) => (
                <div className="inv-links__row" key={l.foodItemId}>
                  <span className="inv-links__name">
                    {dishName(l.foodItemId)}
                  </span>
                  <Input
                    label={`Per unit${form.unit ? ` (${form.unit})` : ''}`}
                    type="number"
                    value={l.quantityPerUnit}
                    onChange={(e) =>
                      setLinkQty(l.foodItemId, e.currentTarget.value)
                    }
                    placeholder="1"
                  />
                </div>
              ))}
            </div>
          )}

          <Input
            label="Low-stock threshold"
            type="number"
            value={form.lowStockThreshold}
            onChange={(e) => update('lowStockThreshold', e.currentTarget.value)}
            placeholder="Leave blank for no warning"
          />
          <Input
            label="Note"
            type="textarea"
            rows={2}
            value={form.note}
            onChange={(e) => update('note', e.currentTarget.value)}
            placeholder="Supplier, storage location…"
          />
        </div>
      </Modal>

      {/* Manual adjust */}
      <Modal
        open={adjustTarget !== null}
        onClose={() => setAdjustTarget(null)}
        title={`Adjust stock — ${adjustTarget?.name ?? ''}`}
        variant="form"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAdjustTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleAdjust} loading={adjustMutation.isPending}>
              Apply
            </Button>
          </>
        }
      >
        <div className="menu-form">
          {adjustError && (
            <p className="menu-form__error" role="alert">
              {adjustError}
            </p>
          )}
          <p className="inv-hint">
            On hand now: <strong>{adjustTarget?.quantity}</strong>
            {adjustTarget?.unit ? ` ${adjustTarget.unit}` : ''}
          </p>
          <div className="menu-form__field">
            <Select
              label="Reason"
              options={REASON_OPTIONS}
              value={adjustReason}
              onChange={(value) => setAdjustReason(value as AdjustReason)}
            />
          </div>
          <Input
            label={
              adjustReason === 'correction'
                ? 'Amount (use − to remove)'
                : 'Amount'
            }
            type="number"
            value={adjustAmount}
            onChange={(e) => setAdjustAmount(e.currentTarget.value)}
            placeholder={adjustReason === 'correction' ? 'e.g. -2' : 'e.g. 10'}
          />
          <Input
            label="Note"
            type="textarea"
            rows={2}
            value={adjustNote}
            onChange={(e) => setAdjustNote(e.currentTarget.value)}
            placeholder="Optional"
          />
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={removeTarget !== null}
        onClose={() => setRemoveTarget(null)}
        title="Delete inventory item"
        variant="destructive"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRemoveTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => removeTarget && deleteMutation.mutate(removeTarget)}
              loading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </>
        }
      >
        <p>Delete “{removeTarget?.name}”? This can’t be undone.</p>
      </Modal>
    </div>
  );
}
