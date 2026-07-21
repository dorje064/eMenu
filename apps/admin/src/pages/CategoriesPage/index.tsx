import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import {
  Button,
  DataTable,
  EmptyState,
  Input,
  Modal,
  useToast,
  type DataTableColumn,
} from '@org/ui';
import { categoryApi } from '../../api/category.api';
import { ApiError } from '../../api/client';
import { queryKeys } from '../../api/queryKeys';
import type { Category, CreateCategoryInput } from '../../api/types';
import '../MenuPage/style.css';

const EMPTY_FORM: CreateCategoryInput = {
  name: '',
  description: '',
  sortOrder: 0,
  active: true,
};

export function CategoriesPage() {
  const { show } = useToast();
  const queryClient = useQueryClient();

  const {
    data: categories = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.categories(),
    queryFn: () => categoryApi.list(),
  });

  const loadError = isError
    ? error instanceof ApiError
      ? error.message
      : 'Failed to load categories'
    : null;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateCategoryInput>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const createMutation = useMutation({
    mutationFn: (payload: CreateCategoryInput) => categoryApi.create(payload),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
      show({
        semantic: 'success',
        message: `Added category “${created.name}”`,
      });
      setModalOpen(false);
    },
    onError: (err) =>
      setFieldErrors(
        err instanceof ApiError ? err.message : 'Could not save the category.',
      ),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateCategoryInput }) =>
      categoryApi.update(id, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
      show({ semantic: 'success', message: `Updated “${updated.name}”` });
      setModalOpen(false);
    },
    onError: (err) =>
      setFieldErrors(
        err instanceof ApiError ? err.message : 'Could not save the category.',
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: (target: Category) => categoryApi.remove(target.id),
    onSuccess: (_data, target) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
      show({ semantic: 'success', message: `Deleted “${target.name}”` });
      setDeleteTarget(null);
    },
    onError: (err) =>
      show({
        semantic: 'error',
        message:
          err instanceof ApiError
            ? err.message
            : 'Could not delete the category.',
      }),
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFieldErrors(null);
    setModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      description: category.description ?? '',
      sortOrder: category.sortOrder,
      active: category.active,
    });
    setFieldErrors(null);
    setModalOpen(true);
  };

  const update = <K extends keyof CreateCategoryInput>(
    key: K,
    value: CreateCategoryInput[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = () => {
    setFieldErrors(null);
    if (!form.name.trim()) {
      setFieldErrors('Name is required.');
      return;
    }
    const payload: CreateCategoryInput = {
      name: form.name.trim(),
      description: form.description?.trim() || undefined,
      sortOrder: Number(form.sortOrder) || 0,
      active: form.active,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget);
  };

  const columns: DataTableColumn<Category>[] = [
    {
      key: 'name',
      header: 'Category',
      render: (r) => <strong>{r.name}</strong>,
    },
    {
      key: 'description',
      header: 'Description',
      render: (r) => r.description ?? '—',
    },
    { key: 'sortOrder', header: 'Order', numeric: true },
    {
      key: 'active',
      header: 'Status',
      render: (r) => (
        <span className={`menu-status menu-status--${r.active ? 'on' : 'off'}`}>
          {r.active ? 'Active' : 'Hidden'}
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
          <h2 className="menu-page__title">Categories</h2>
          <p className="menu-page__subtitle">
            {categories.length} categor{categories.length === 1 ? 'y' : 'ies'}
          </p>
        </div>
        <Button leadingIcon={<Plus size={18} />} onClick={openCreate}>
          Add category
        </Button>
      </div>

      {loadError ? (
        <EmptyState
          variant="error-empty"
          title="Couldn’t load categories"
          description={loadError}
          action={{ label: 'Retry', onClick: () => refetch() }}
        />
      ) : !isLoading && categories.length === 0 ? (
        <EmptyState
          variant="first-use"
          icon={<Tags />}
          title="No categories yet"
          description="Create a category to organise the menu."
          action={{ label: 'Add category', onClick: openCreate }}
        />
      ) : (
        <DataTable
          ariaLabel="Categories"
          columns={columns}
          rows={categories}
          getRowId={(r) => r.id}
          loading={isLoading}
        />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit category' : 'Add category'}
        variant="form"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingId ? 'Save changes' : 'Add category'}
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
            placeholder="Breakfast"
          />
          <Input
            label="Description"
            type="textarea"
            rows={2}
            value={form.description}
            onChange={(e) => update('description', e.currentTarget.value)}
            placeholder="Morning dishes served until 11am."
          />
          <Input
            label="Sort order"
            type="number"
            value={String(form.sortOrder)}
            onChange={(e) => update('sortOrder', Number(e.currentTarget.value))}
            helperText="Lower numbers sort first."
            placeholder="0"
          />
          <label className="menu-form__check">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => update('active', e.currentTarget.checked)}
            />
            Active (shown in the menu)
          </label>
        </div>
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete category"
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
          Delete “{deleteTarget?.name}”? Menu items in this category won’t be
          removed, but they’ll no longer have a matching category.
        </p>
      </Modal>
    </div>
  );
}
