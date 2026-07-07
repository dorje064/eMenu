import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { expensesApi } from '../api/expenses.api';
import { ApiError } from '../api/client';
import type { CreateExpenseInput, Expense } from '../api/types';
import './MenuPage.css';
import './ExpensesPage.css';

/** Today as a local ISO date (YYYY-MM-DD). */
function todayIso(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function nrs(n: number): string {
  return `NRs ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

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
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [removeTarget, setRemoveTarget] = useState<Expense | null>(null);
  const [removing, setRemoving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setExpenses(await expensesApi.list());
    } catch (err) {
      setLoadError(
        err instanceof ApiError ? err.message : 'Failed to load expenses',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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

  const handleSave = async () => {
    setFormError(null);
    const amount = Number(form.amount);
    if (!form.amount.trim() || Number.isNaN(amount) || amount < 0)
      return setFormError('Enter a valid amount (0 or more).');
    if (!form.category.trim()) return setFormError('Category is required.');
    if (!form.spentAt) return setFormError('Date is required.');

    const payload: CreateExpenseInput = {
      amount,
      category: form.category.trim(),
      note: form.note.trim() || undefined,
      spentAt: form.spentAt,
    };

    setSaving(true);
    try {
      if (editing) {
        const updated = await expensesApi.update(editing.id, payload);
        setExpenses((prev) =>
          prev.map((e) => (e.id === updated.id ? updated : e)),
        );
        show({ semantic: 'success', message: 'Expense updated' });
      } else {
        const created = await expensesApi.create(payload);
        setExpenses((prev) => [created, ...prev]);
        show({ semantic: 'success', message: 'Expense added' });
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : 'Could not save the expense.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await expensesApi.remove(removeTarget.id);
      setExpenses((prev) => prev.filter((e) => e.id !== removeTarget.id));
      show({ semantic: 'success', message: 'Expense removed' });
      setRemoveTarget(null);
    } catch (err) {
      show({
        semantic: 'error',
        message:
          err instanceof ApiError ? err.message : 'Could not remove the expense.',
      });
    } finally {
      setRemoving(false);
    }
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
      render: (e) => formatDay(e.spentAt),
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
      render: (e) => nrs(e.amount),
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
            {nrs(total)} total
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
          action={{ label: 'Retry', onClick: load }}
        />
      ) : !loading && expenses.length === 0 ? (
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
          loading={loading}
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
            <Button onClick={handleSave} loading={saving}>
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
            <Button variant="destructive" onClick={handleRemove} loading={removing}>
              Remove
            </Button>
          </>
        }
      >
        <p>
          Remove this {removeTarget?.category} expense of{' '}
          {removeTarget ? nrs(removeTarget.amount) : ''}? This can’t be undone.
        </p>
      </Modal>
    </div>
  );
}
