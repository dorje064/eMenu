import { useCallback, useEffect, useState } from 'react';
import { Plus, UtensilsCrossed } from 'lucide-react';
import {
  Button,
  DataTable,
  EmptyState,
  Input,
  Modal,
  useToast,
  type DataTableColumn,
} from '@org/ui';
import { menuApi } from '../api/menu.api';
import { ApiError } from '../api/client';
import type { CreateFoodItemInput, FoodItem } from '../api/types';
import './MenuPage.css';

const currency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const EMPTY_FORM: CreateFoodItemInput = {
  name: '',
  category: '',
  price: 0,
  prepTimeMinutes: 15,
  description: '',
  imageUrl: '',
  available: true,
};

export function MenuPage() {
  const { show } = useToast();
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CreateFoodItemInput>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setItems(await menuApi.list());
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openModal = () => {
    setForm(EMPTY_FORM);
    setFieldErrors(null);
    setModalOpen(true);
  };

  const update = <K extends keyof CreateFoodItemInput>(
    key: K,
    value: CreateFoodItemInput[K]
  ) => setForm((f) => ({ ...f, [key]: value }));

  const handleCreate = async () => {
    setFieldErrors(null);
    if (!form.name.trim() || !form.category.trim()) {
      setFieldErrors('Name and category are required.');
      return;
    }
    setSaving(true);
    try {
      const payload: CreateFoodItemInput = {
        name: form.name.trim(),
        category: form.category.trim(),
        price: Number(form.price),
        prepTimeMinutes: Number(form.prepTimeMinutes) || 15,
        description: form.description?.trim() || undefined,
        imageUrl: form.imageUrl?.trim() || undefined,
        available: form.available,
      };
      const created = await menuApi.create(payload);
      setItems((prev) => [...prev, created]);
      setModalOpen(false);
      show({ semantic: 'success', message: `Added “${created.name}” to the menu` });
    } catch (err) {
      setFieldErrors(
        err instanceof ApiError ? err.message : 'Could not create the item.'
      );
    } finally {
      setSaving(false);
    }
  };

  const columns: DataTableColumn<FoodItem>[] = [
    { key: 'name', header: 'Item', render: (r) => <strong>{r.name}</strong> },
    { key: 'category', header: 'Category' },
    {
      key: 'price',
      header: 'Price',
      numeric: true,
      render: (r) => currency(r.price),
    },
    {
      key: 'prepTimeMinutes',
      header: 'Prep',
      numeric: true,
      render: (r) => `${r.prepTimeMinutes} min`,
    },
    {
      key: 'available',
      header: 'Status',
      render: (r) => (
        <span
          className={`menu-status menu-status--${r.available ? 'on' : 'off'}`}
        >
          {r.available ? 'Available' : 'Sold out'}
        </span>
      ),
    },
  ];

  return (
    <div className="menu-page">
      <div className="menu-page__head">
        <div>
          <h2 className="menu-page__title">Menu items</h2>
          <p className="menu-page__subtitle">
            {items.length} item{items.length === 1 ? '' : 's'} on the menu
          </p>
        </div>
        <Button leadingIcon={<Plus size={18} />} onClick={openModal}>
          Add item
        </Button>
      </div>

      {loadError ? (
        <EmptyState
          variant="error-empty"
          title="Couldn’t load the menu"
          description={loadError}
          action={{ label: 'Retry', onClick: load }}
        />
      ) : !loading && items.length === 0 ? (
        <EmptyState
          variant="first-use"
          icon={<UtensilsCrossed />}
          title="No menu items yet"
          description="Add your first dish to start building the menu."
          action={{ label: 'Add item', onClick: openModal }}
        />
      ) : (
        <DataTable
          ariaLabel="Menu items"
          columns={columns}
          rows={items}
          getRowId={(r) => r.id}
          loading={loading}
        />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add food item"
        variant="form"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={saving}>
              Add item
            </Button>
          </>
        }
      >
        <div className="menu-form">
          <Input
            label="Name"
            required
            value={form.name}
            onChange={(e) => update('name', e.currentTarget.value)}
            placeholder="Margherita Pizza"
          />
          <Input
            label="Category"
            required
            value={form.category}
            onChange={(e) => update('category', e.currentTarget.value)}
            placeholder="Mains"
          />
          <div className="menu-form__row">
            <Input
              label="Price"
              type="currency"
              value={String(form.price)}
              onChange={(e) => update('price', Number(e.currentTarget.value))}
              placeholder="12.50"
            />
            <Input
              label="Prep time"
              type="number"
              suffix="min"
              value={String(form.prepTimeMinutes)}
              onChange={(e) =>
                update('prepTimeMinutes', Number(e.currentTarget.value))
              }
              placeholder="15"
            />
          </div>
          <Input
            label="Description"
            type="textarea"
            rows={3}
            value={form.description}
            onChange={(e) => update('description', e.currentTarget.value)}
            placeholder="Wood-fired, San Marzano tomato, fresh mozzarella, basil."
          />
          <Input
            label="Image URL"
            value={form.imageUrl}
            onChange={(e) => update('imageUrl', e.currentTarget.value)}
            placeholder="https://…"
            error={fieldErrors ?? undefined}
          />
          <label className="menu-form__check">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) => update('available', e.currentTarget.checked)}
            />
            Available for ordering
          </label>
        </div>
      </Modal>
    </div>
  );
}
