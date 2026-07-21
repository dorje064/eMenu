import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Wallet } from 'lucide-react';
import {
  Button,
  DataTable,
  Dropdown,
  EmptyState,
  Input,
  Modal,
  useToast,
  type DataTableColumn,
  type DropdownItem,
} from '@org/ui';
import { expensesApi } from '../../api/expenses.api';
import { queryKeys } from '../../api/queryKeys';
import { ApiError } from '../../api/client';
import type { CreateExpenseInput, Expense } from '../../api/types';
import { formatDay, formatNrs, todayIso } from '../../utils/format';
import '../MenuPage/style.css';
import './style.css';

const DATE_LABEL: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

interface FormState {
  amount: string;
  category: string;
  note: string;
  spentAt: string;
}

const emptyForm = (): FormState => ({
  amount: '',
  category: '',
  note: '',
  spentAt: todayIso(),
});

export function ExpensesPage() {
  const { show } = useToast();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const [removeTarget, setRemoveTarget] = useState<Expense | null>(null);

  const {
    data: expenses = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.expenses(),
    queryFn: () => expensesApi.list(),
  });

  const loadError = isError
    ? error instanceof ApiError
      ? error.message
      : 'Failed to load expenses'
    : null;

  const total = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses],
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (expense: Expense) => {
    setEditing(expense);
    setForm({
      amount: String(expense.amount),
      category: expense.category,
      note: expense.note ?? '',
      spentAt: expense.spentAt,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (payload: CreateExpenseInput) =>
      editing ? expensesApi.update(editing.id, payload) : expensesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      show({
        semantic: 'success',
        message: editing ? 'Expense updated' : 'Expense added',
      });
      setModalOpen(false);
    },
    onError: (err) => {
      setFormError(
        err instanceof ApiError ? err.message : 'Could not save the expense.',
      );
    },
  });

  const handleSave = () => {
    setFormError(null);
    const amount = Number(form.amount);
    if (!form.amount.trim() || Number.isNaN(amount) || amount < 0)
      return setFormError('Enter a valid amount (0 or more).');
    if (!form.category.trim()) return setFormError('Category is required.');
    if (!form.spentAt) return setFormError('Date is required.');

    const payload: CreateExpenseInput = {
      amount,
      category: form.category.trim(),
      // Always send the note (even as "") so clearing it on edit persists;
      // the server normalizes blank to null.
      note: form.note.trim(),
      spentAt: form.spentAt,
    };

    saveMutation.mutate(payload);
  };

  const removeMutation = useMutation({
    mutationFn: (id: string) => expensesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      show({ semantic: 'success', message: 'Expense removed' });
      setRemoveTarget(null);
    },
    onError: (err) => {
      show({
        semantic: 'error',
        message:
          err instanceof ApiError ? err.message : 'Could not remove the expense.',
      });
    },
  });

  const handleRemove = () => {
    if (!removeTarget) return;
    removeMutation.mutate(removeTarget.id);
  };

  const rowActions = (): DropdownItem[] => [
    { id: 'edit', label: 'Edit' },
    { id: 'remove', label: 'Remove', destructive: true },
  ];

  const handleAction = (expense: Expense, action: string) => {
    if (action === 'edit') openEdit(expense);
    else if (action === 'remove') setRemoveTarget(expense);
  };

  const columns: DataTableColumn<Expense>[] = [
    {
      key: 'spentAt',
      header: 'Date',
      sortable: true,
      width: '150px',
      render: (e) => formatDay(e.spentAt, DATE_LABEL),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (e) => <strong>{e.category}</strong>,
    },
    {
      key: 'note',
      header: 'Note',
      render: (e) => e.note ?? '—',
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      align: 'right',
      width: '140px',
      render: (e) => formatNrs(e.amount),
    },
    {
      key: 'actions',
      header: '',
      width: '56px',
      render: (e) => (
        <Dropdown
          items={rowActions()}
          onSelect={(action) => handleAction(e, action)}
          triggerLabel={`Actions for ${e.category} expense`}
        />
      ),
    },
  ];

  return (
    <div className="menu-page">
      <div className="menu-page__head">
        <div>
          <h2 className="menu-page__title">Expenses</h2>
          <p className="menu-page__subtitle">
            {expenses.length} expense{expenses.length === 1 ? '' : 's'} ·{' '}
            {formatNrs(total)} total
          </p>
        </div>
        <Button leadingIcon={<Plus size={18} />} onClick={openCreate}>
          Add expense
        </Button>
      </div>

      {loadError ? (
        <EmptyState
          variant="error-empty"
          title="Couldn’t load expenses"
          description={loadError}
          action={{ label: 'Retry', onClick: () => refetch() }}
        />
      ) : !isLoading && expenses.length === 0 ? (
        <EmptyState
          variant="first-use"
          icon={<Wallet />}
          title="No expenses yet"
          description="Record business expenses (supplies, rent, wages…) to track net income on your dashboard."
          action={{ label: 'Add expense', onClick: openCreate }}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={expenses}
          getRowId={(e) => e.id}
          ariaLabel="Expenses"
          loading={isLoading}
          emptyMessage="No expenses yet."
        />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit expense' : 'Add expense'}
        variant="form"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saveMutation.isPending}>
              {editing ? 'Save changes' : 'Add expense'}
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
            label="Amount"
            type="number"
            required
            value={form.amount}
            onChange={(e: any) => {
              const { value } = e.currentTarget;
              setForm((f) => ({ ...f, amount: value }));
            }}
            placeholder="e.g. 1500"
            helperText="In NRs."
          />
          <Input
            label="Category"
            required
            value={form.category}
            onChange={(e: any) => {
              const { value } = e.currentTarget;
              setForm((f) => ({ ...f, category: value }));
            }}
            placeholder="e.g. Supplies, Rent, Wages"
          />
          <div className="menu-form__field">
            <label className="menu-form__label" htmlFor="expense-date">
              Date
            </label>
            <input
              id="expense-date"
              className="expense-date-input"
              type="date"
              value={form.spentAt}
              max={todayIso()}
              onChange={(e) =>
                setForm((f) => ({ ...f, spentAt: e.currentTarget.value }))
              }
            />
          </div>
          <Input
            label="Note"
            type="textarea"
            value={form.note}
            onChange={(e: any) => {
              const { value } = e.currentTarget;
              setForm((f) => ({ ...f, note: value }));
            }}
            placeholder="Optional detail"
          />
        </div>
      </Modal>

      <Modal
        open={removeTarget !== null}
        onClose={() => setRemoveTarget(null)}
        title="Remove expense"
        variant="destructive"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRemoveTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemove} loading={removeMutation.isPending}>
              Remove
            </Button>
          </>
        }
      >
        <p>
          Remove this {removeTarget?.category} expense of{' '}
          {removeTarget ? formatNrs(removeTarget.amount) : ''}? This can’t be undone.
        </p>
      </Modal>
    </div>
  );
}
