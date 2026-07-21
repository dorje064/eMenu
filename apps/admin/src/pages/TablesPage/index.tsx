import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, QrCode } from 'lucide-react';
import { Button, EmptyState, Input, Modal, useToast } from '@org/ui';
import { tablesApi } from '../../api/tables.api';
import { ApiError } from '../../api/client';
import { queryKeys } from '../../api/queryKeys';
import { useAuth } from '../../auth/AuthContext';
import type { CreateTableInput, RestaurantTable } from '../../api/types';
import { TableCard } from './components/TableCard';
import '../MenuPage/style.css';
import './style.css';

const EMPTY_FORM: CreateTableInput = { name: '', active: true };

export function TablesPage() {
  const { show } = useToast();
  const { customer } = useAuth();
  const cafeId = customer?.id ?? '';
  const queryClient = useQueryClient();

  const {
    data: tables = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.tables,
    queryFn: () => tablesApi.list(),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CreateTableInput>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RestaurantTable | null>(
    null,
  );

  const createMutation = useMutation({
    mutationFn: (input: CreateTableInput) => tablesApi.create(input),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tables });
      setModalOpen(false);
      show({ semantic: 'success', message: `Added table ${created.name}` });
    },
    onError: (err) => {
      setFieldErrors(
        err instanceof ApiError ? err.message : 'Could not add the table.',
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (table: RestaurantTable) => tablesApi.remove(table.id),
    onSuccess: (_data, table) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tables });
      show({ semantic: 'success', message: `Deleted table ${table.name}` });
      setDeleteTarget(null);
    },
    onError: (err) => {
      show({
        semantic: 'error',
        message:
          err instanceof ApiError ? err.message : 'Could not delete the table.',
      });
    },
  });

  const loadError = isError
    ? error instanceof ApiError
      ? error.message
      : 'Failed to load tables'
    : null;

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFieldErrors(null);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setFieldErrors(null);
    if (!form.name.trim()) {
      setFieldErrors('Table name is required.');
      return;
    }
    createMutation.mutate({ name: form.name.trim(), active: form.active });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget);
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
          action={{ label: 'Retry', onClick: () => refetch() }}
        />
      ) : !isLoading && tables.length === 0 ? (
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
            <TableCard
              key={table.id}
              table={table}
              cafeId={cafeId}
              onDelete={setDeleteTarget}
            />
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
            <Button onClick={handleCreate} loading={createMutation.isPending}>
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
            onChange={(e: any) => {
              const { value } = e.currentTarget;
              setForm((f) => ({ ...f, name: value }));
            }}
            placeholder="e.g. 1 or t1"
            helperText="Any text — shown to customers and embedded in the QR code."
          />
          <label className="menu-form__check">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => {
                const { checked } = e.currentTarget;
                setForm((f) => ({ ...f, active: checked }));
              }}
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
              loading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </>
        }
      >
        <p>Delete table {deleteTarget?.name}? Its QR code will stop working.</p>
      </Modal>
    </div>
  );
}
