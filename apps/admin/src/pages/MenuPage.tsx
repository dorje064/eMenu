import { useCallback, useEffect, useState } from 'react';
import { Eye, Pencil, Plus, Trash2, UtensilsCrossed } from 'lucide-react';
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
import { menuApi } from '../api/menu.api';
import { categoryApi } from '../api/category.api';
import { settingsApi } from '../api/settings.api';
import { ApiError } from '../api/client';
import { ImagePicker } from '../components/ImagePicker';
import { MenuPreview, MENU_TEMPLATES } from '../components/MenuPreview';
import type {
  Category,
  CreateFoodItemInput,
  FoodItem,
  MenuTemplate,
} from '../api/types';
import './MenuPage.css';

const currency = (n: number) =>
  `NRs ${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)}`;

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateFoodItemInput>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<FoodItem | null>(null);
  const [removing, setRemoving] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<MenuTemplate>('classic');
  const [savedTemplate, setSavedTemplate] = useState<MenuTemplate>('classic');
  const [savingTemplate, setSavingTemplate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [menuItems, cats, settings] = await Promise.all([
        menuApi.list(),
        categoryApi.list(true),
        settingsApi.get(),
      ]);
      setItems(menuItems);
      setCategories(cats);
      setSavedTemplate(settings.menuTemplate);
      setSelectedTemplate(settings.menuTemplate);
    } catch (err) {
      setLoadError(
        err instanceof ApiError ? err.message : 'Failed to load menu',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const categoryOptions: SelectOption[] = categories.map((c) => ({
    value: c.name,
    label: c.name,
  }));

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFieldErrors(null);
    setModalOpen(true);
  };

  const openEdit = (item: FoodItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      category: item.category,
      price: item.price,
      prepTimeMinutes: item.prepTimeMinutes,
      description: item.description ?? '',
      imageUrl: item.imageUrl ?? '',
      available: item.available,
    });
    setFieldErrors(null);
    setModalOpen(true);
  };

  const update = <K extends keyof CreateFoodItemInput>(
    key: K,
    value: CreateFoodItemInput[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
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
      if (editingId) {
        const updated = await menuApi.update(editingId, payload);
        setItems((prev) => prev.map((i) => (i.id === editingId ? updated : i)));
        show({ semantic: 'success', message: `Updated “${updated.name}”` });
      } else {
        const created = await menuApi.create(payload);
        setItems((prev) => [...prev, created]);
        show({
          semantic: 'success',
          message: `Added “${created.name}” to the menu`,
        });
      }
      setModalOpen(false);
    } catch (err) {
      setFieldErrors(
        err instanceof ApiError ? err.message : 'Could not save the item.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setRemoving(true);
    try {
      await menuApi.remove(deleteTarget.id);
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      show({ semantic: 'success', message: `Deleted “${deleteTarget.name}”` });
      setDeleteTarget(null);
    } catch (err) {
      show({
        semantic: 'error',
        message:
          err instanceof ApiError ? err.message : 'Could not delete the item.',
      });
    } finally {
      setRemoving(false);
    }
  };

  const openPreview = () => {
    setSelectedTemplate(savedTemplate);
    setPreviewOpen(true);
  };

  const saveTemplate = async () => {
    setSavingTemplate(true);
    try {
      const updated = await settingsApi.update({
        menuTemplate: selectedTemplate,
      });
      setSavedTemplate(updated.menuTemplate);
      const label =
        MENU_TEMPLATES.find((t) => t.id === updated.menuTemplate)?.label ??
        updated.menuTemplate;
      show({
        semantic: 'success',
        message: `Customer menu set to the “${label}” template`,
      });
    } catch (err) {
      show({
        semantic: 'error',
        message:
          err instanceof ApiError
            ? err.message
            : 'Could not save the template.',
      });
    } finally {
      setSavingTemplate(false);
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
    {
      key: 'actions',
      header: '',
      align: 'end',
      render: (r) => (
        <div className="menu-row-actions">
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
            onClick={() => setDeleteTarget(r)}
            leadingIcon={<Trash2 size={16} />}
          />
        </div>
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
        <div className="menu-page__actions">
          <Button
            variant="secondary"
            leadingIcon={<Eye size={18} />}
            onClick={openPreview}
            disabled={items.length === 0}
          >
            Preview menu
          </Button>
          <Button leadingIcon={<Plus size={18} />} onClick={openCreate}>
            Add item
          </Button>
        </div>
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
          action={{ label: 'Add item', onClick: openCreate }}
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
        title={editingId ? 'Edit food item' : 'Add food item'}
        variant="form"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editingId ? 'Save changes' : 'Add item'}
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
            label="Name"
            required
            value={form.name}
            onChange={(e) => update('name', e.currentTarget.value)}
            placeholder="Margherita Pizza"
          />
          <div className="menu-form__field">
            <label className="menu-form__label">
              Category <span aria-hidden="true">*</span>
            </label>
            <Select
              options={categoryOptions}
              value={form.category || undefined}
              onChange={(value) => update('category', value)}
              placeholder={
                categoryOptions.length
                  ? 'Select a category'
                  : 'No categories yet'
              }
              disabled={categoryOptions.length === 0}
              label="Category"
            />
          </div>
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
          <ImagePicker
            value={form.imageUrl ?? ''}
            onChange={(url) => update('imageUrl', url)}
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

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete food item"
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
          Delete “{deleteTarget?.name}” from the menu? This can’t be undone.
        </p>
      </Modal>

      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Menu preview"
        variant="informational"
        size="full-screen"
      >
        <div className="menu-preview-toolbar">
          <div
            className="menu-preview-toolbar__templates"
            role="radiogroup"
            aria-label="Menu template"
          >
            {MENU_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={selectedTemplate === t.id}
                className={`tpl-option${
                  selectedTemplate === t.id ? ' tpl-option--active' : ''
                }`}
                onClick={() => setSelectedTemplate(t.id)}
              >
                <span className="tpl-option__label">
                  {t.label}
                  {savedTemplate === t.id && (
                    <span className="tpl-option__current"> · live</span>
                  )}
                </span>
                <span className="tpl-option__desc">{t.description}</span>
              </button>
            ))}
          </div>
          <Button
            onClick={saveTemplate}
            loading={savingTemplate}
            disabled={selectedTemplate === savedTemplate}
          >
            {selectedTemplate === savedTemplate
              ? 'Current customer menu'
              : 'Set as customer menu'}
          </Button>
        </div>
        <MenuPreview
          items={items}
          categories={categories}
          template={selectedTemplate}
        />
      </Modal>
    </div>
  );
}
