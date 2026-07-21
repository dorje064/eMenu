import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Download,
  Eye,
  FileUp,
  Pencil,
  Plus,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react';
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
import { menuApi } from '../../api/menu.api';
import { categoryApi } from '../../api/category.api';
import { settingsApi } from '../../api/settings.api';
import { ApiError } from '../../api/client';
import { queryKeys } from '../../api/queryKeys';
import { ImagePicker } from '../../components/ImagePicker';
import { MenuPreview, MENU_TEMPLATES } from '../../components/MenuPreview';
import type {
  BulkUploadResult,
  CreateFoodItemInput,
  FoodItem,
  MenuTemplate,
} from '../../api/types';
import './style.css';

/** Header + a couple of example rows the "Download template" button hands out. */
const BULK_TEMPLATE_CSV = [
  'name,description,category,price,prepTimeMinutes,imageUrl,available',
  '"Margherita Pizza","San Marzano tomato, mozzarella, basil",Mains,12.5,15,,true',
  '"Iced Latte","Double shot over ice",Drinks,4,5,,true',
  '"Garlic Bread",,Sides,3.5,8,,true',
].join('\n');

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
  const queryClient = useQueryClient();

  // Three independent queries; the page shows a single combined loading/error
  // state derived from them (previously one Promise.all in a manual loader).
  const itemsQuery = useQuery({
    queryKey: queryKeys.menu(),
    queryFn: () => menuApi.list(),
  });
  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories(true),
    queryFn: () => categoryApi.list(true),
  });
  const settingsQuery = useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => settingsApi.get(),
  });

  const items = itemsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const savedTemplate: MenuTemplate =
    settingsQuery.data?.menuTemplate ?? 'classic';

  const loading =
    itemsQuery.isLoading ||
    categoriesQuery.isLoading ||
    settingsQuery.isLoading;
  const loadErrorSource =
    itemsQuery.error ?? categoriesQuery.error ?? settingsQuery.error;
  const loadError = loadErrorSource
    ? loadErrorSource instanceof ApiError
      ? loadErrorSource.message
      : 'Failed to load menu'
    : null;
  const reload = () => {
    itemsQuery.refetch();
    categoriesQuery.refetch();
    settingsQuery.refetch();
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateFoodItemInput>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<FoodItem | null>(null);

  // Bulk upload (.csv / .xlsx)
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkResult, setBulkResult] = useState<BulkUploadResult | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<MenuTemplate>('classic');

  const categoryOptions: SelectOption[] = categories.map((c) => ({
    value: c.name,
    label: c.name,
  }));

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

  const saveMutation = useMutation({
    mutationFn: (payload: CreateFoodItemInput) =>
      editingId ? menuApi.update(editingId, payload) : menuApi.create(payload),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menu() });
      show({
        semantic: 'success',
        message: editingId
          ? `Updated “${saved.name}”`
          : `Added “${saved.name}” to the menu`,
      });
      setModalOpen(false);
    },
    onError: (err) => {
      setFieldErrors(
        err instanceof ApiError ? err.message : 'Could not save the item.',
      );
    },
  });

  const handleSubmit = () => {
    setFieldErrors(null);
    if (!form.name.trim() || !form.category.trim()) {
      setFieldErrors('Name and category are required.');
      return;
    }
    const payload: CreateFoodItemInput = {
      name: form.name.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      prepTimeMinutes: Number(form.prepTimeMinutes) || 15,
      description: form.description?.trim() || undefined,
      imageUrl: form.imageUrl?.trim() || undefined,
      available: form.available,
    };
    saveMutation.mutate(payload);
  };

  const deleteMutation = useMutation({
    mutationFn: (item: FoodItem) => menuApi.remove(item.id),
    onSuccess: (_data, item) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menu() });
      show({ semantic: 'success', message: `Deleted “${item.name}”` });
      setDeleteTarget(null);
    },
    onError: (err) => {
      show({
        semantic: 'error',
        message:
          err instanceof ApiError ? err.message : 'Could not delete the item.',
      });
    },
  });

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget);
  };

  const openBulk = () => {
    setBulkFile(null);
    setBulkResult(null);
    setBulkError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setBulkOpen(true);
  };

  const downloadTemplate = () => {
    const blob = new Blob([BULK_TEMPLATE_CSV], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'menu-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const bulkMutation = useMutation({
    mutationFn: (file: File) => menuApi.bulkUpload(file),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menu() });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setBulkResult(result);
      if (result.created > 0) {
        show({
          semantic: result.failed ? 'info' : 'success',
          message: `Imported ${result.created} item${
            result.created === 1 ? '' : 's'
          }${result.failed ? `, ${result.failed} skipped` : ''}`,
        });
      } else {
        show({
          semantic: 'error',
          message: 'No items imported — check the errors below.',
        });
      }
    },
    onError: (err) => {
      setBulkError(
        err instanceof ApiError ? err.message : 'Could not upload the file.',
      );
    },
  });

  const handleBulkUpload = () => {
    if (!bulkFile) return;
    setBulkError(null);
    bulkMutation.mutate(bulkFile);
  };

  const openPreview = () => {
    setSelectedTemplate(savedTemplate);
    setPreviewOpen(true);
  };

  const templateMutation = useMutation({
    mutationFn: (template: MenuTemplate) =>
      settingsApi.update({ menuTemplate: template }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
      const label =
        MENU_TEMPLATES.find((t) => t.id === updated.menuTemplate)?.label ??
        updated.menuTemplate;
      show({
        semantic: 'success',
        message: `Customer menu set to the “${label}” template`,
      });
    },
    onError: (err) => {
      show({
        semantic: 'error',
        message:
          err instanceof ApiError
            ? err.message
            : 'Could not save the template.',
      });
    },
  });

  const saveTemplate = () => templateMutation.mutate(selectedTemplate);

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
          <Button
            variant="secondary"
            leadingIcon={<FileUp size={18} />}
            onClick={openBulk}
          >
            Bulk upload
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
          action={{ label: 'Retry', onClick: reload }}
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
            <Button onClick={handleSubmit} loading={saveMutation.isPending}>
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
              loading={deleteMutation.isPending}
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
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        title="Bulk upload menu items"
        variant="form"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setBulkOpen(false)}>
              Close
            </Button>
            <Button
              onClick={handleBulkUpload}
              loading={bulkMutation.isPending}
              disabled={!bulkFile}
            >
              Upload
            </Button>
          </>
        }
      >
        <div className="menu-bulk">
          <p className="menu-bulk__intro">
            Upload a <strong>.csv</strong> or <strong>.xlsx</strong> file to add
            many items at once. The first row must be the header. Columns:{' '}
            <code>name</code>, <code>category</code>, <code>price</code>{' '}
            (required) and optional <code>description</code>,{' '}
            <code>prepTimeMinutes</code>, <code>imageUrl</code>,{' '}
            <code>available</code>. Unknown categories are created automatically.
          </p>

          <Button
            variant="tertiary"
            leadingIcon={<Download size={16} />}
            onClick={downloadTemplate}
          >
            Download CSV template
          </Button>

          <label className="menu-bulk__file">
            <span className="menu-bulk__file-label">Choose file</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              onChange={(e) => {
                setBulkFile(e.currentTarget.files?.[0] ?? null);
                setBulkResult(null);
                setBulkError(null);
              }}
            />
          </label>

          {bulkError && (
            <p className="menu-form__error" role="alert">
              {bulkError}
            </p>
          )}

          {bulkResult && (
            <div className="menu-bulk__result" role="status">
              <p className="menu-bulk__summary">
                Imported <strong>{bulkResult.created}</strong> of{' '}
                {bulkResult.total} row{bulkResult.total === 1 ? '' : 's'}
                {bulkResult.failed > 0
                  ? ` · ${bulkResult.failed} skipped`
                  : ''}
                .
              </p>
              {bulkResult.createdCategories.length > 0 && (
                <p className="menu-bulk__cats">
                  New categories: {bulkResult.createdCategories.join(', ')}
                </p>
              )}
              {bulkResult.errors.length > 0 && (
                <ul className="menu-bulk__errors">
                  {bulkResult.errors.map((e) => (
                    <li key={e.row}>
                      <strong>Row {e.row}:</strong> {e.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
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
            loading={templateMutation.isPending}
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
