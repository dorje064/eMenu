import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, UsersRound } from 'lucide-react';
import {
  Button,
  DataTable,
  Dropdown,
  EmptyState,
  Input,
  Modal,
  Select,
  useToast,
  type DataTableColumn,
  type DropdownItem,
  type SelectOption,
} from '@org/ui';
import { staffApi } from '../../api/staff.api';
import { queryKeys } from '../../api/queryKeys';
import { ApiError } from '../../api/client';
import type { CreateStaffInput, Staff, StaffRole } from '../../api/types';
import '../MenuPage/style.css';

const ROLE_LABEL: Record<StaffRole, string> = {
  kitchen: 'Kitchen',
  waiter: 'Waiter',
};

const ROLE_OPTIONS: SelectOption[] = [
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'waiter', label: 'Waiter' },
];

const EMPTY_FORM: CreateStaffInput = {
  fullName: '',
  email: '',
  role: 'kitchen',
  password: '',
};

export function StaffPage() {
  const { show } = useToast();
  const queryClient = useQueryClient();

  const {
    data: staff = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.staff,
    queryFn: () => staffApi.list(),
  });
  const loadError = isError
    ? error instanceof ApiError
      ? error.message
      : 'Failed to load staff'
    : null;

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CreateStaffInput>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  // Row-scoped state: the member being password-reset or removed.
  const [resetTarget, setResetTarget] = useState<Staff | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Staff | null>(null);

  const createMutation = useMutation({
    mutationFn: (input: CreateStaffInput) => staffApi.create(input),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff });
      setModalOpen(false);
      show({ semantic: 'success', message: `Added ${created.fullName}` });
    },
    onError: (err) => {
      setFormError(
        err instanceof ApiError ? err.message : 'Could not add the staff member.',
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: (vars: {
      member: Staff;
      patch: { role?: StaffRole; active?: boolean };
      successMsg: string;
    }) => staffApi.update(vars.member.id, vars.patch),
    onSuccess: (_updated, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff });
      show({ semantic: 'success', message: vars.successMsg });
    },
    onError: (err) => {
      show({
        semantic: 'error',
        message:
          err instanceof ApiError ? err.message : 'Could not update the staff member.',
      });
    },
  });

  const resetMutation = useMutation({
    mutationFn: (vars: { id: string; password: string; fullName: string }) =>
      staffApi.resetPassword(vars.id, vars.password),
    onSuccess: (_updated, vars) => {
      show({
        semantic: 'success',
        message: `Password reset for ${vars.fullName}`,
      });
      setResetTarget(null);
    },
    onError: (err) => {
      setResetError(
        err instanceof ApiError ? err.message : 'Could not reset the password.',
      );
    },
  });

  const removeMutation = useMutation({
    mutationFn: (member: Staff) => staffApi.remove(member.id),
    onSuccess: (_data, member) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff });
      show({ semantic: 'success', message: `Removed ${member.fullName}` });
      setRemoveTarget(null);
    },
    onError: (err) => {
      show({
        semantic: 'error',
        message:
          err instanceof ApiError ? err.message : 'Could not remove the staff member.',
      });
    },
  });

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setFormError(null);
    if (!form.fullName.trim()) return setFormError('Full name is required.');
    if (!form.email.trim()) return setFormError('Email is required.');
    if (form.password.length < 8)
      return setFormError('Password must be at least 8 characters.');

    createMutation.mutate({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      role: form.role,
      password: form.password,
    });
  };

  const applyUpdate = (
    member: Staff,
    patch: { role?: StaffRole; active?: boolean },
    successMsg: string,
  ) => {
    updateMutation.mutate({ member, patch, successMsg });
  };

  const handleAction = (member: Staff, action: string): void => {
    switch (action) {
      case 'toggle-active':
        void applyUpdate(
          member,
          { active: !member.active },
          member.active
            ? `${member.fullName} deactivated`
            : `${member.fullName} reactivated`,
        );
        break;
      case 'make-kitchen':
        void applyUpdate(member, { role: 'kitchen' }, `${member.fullName} is now Kitchen`);
        break;
      case 'make-waiter':
        void applyUpdate(member, { role: 'waiter' }, `${member.fullName} is now Waiter`);
        break;
      case 'reset':
        setNewPassword('');
        setResetError(null);
        setResetTarget(member);
        break;
      case 'remove':
        setRemoveTarget(member);
        break;
    }
  };

  const handleReset = () => {
    if (!resetTarget) return;
    setResetError(null);
    if (newPassword.length < 8)
      return setResetError('Password must be at least 8 characters.');
    resetMutation.mutate({
      id: resetTarget.id,
      password: newPassword,
      fullName: resetTarget.fullName,
    });
  };

  const handleRemove = () => {
    if (!removeTarget) return;
    removeMutation.mutate(removeTarget);
  };

  const rowActions = (member: Staff): DropdownItem[] => [
    {
      id: 'toggle-active',
      label: member.active ? 'Deactivate' : 'Reactivate',
    },
    member.role === 'kitchen'
      ? { id: 'make-waiter', label: 'Change to Waiter' }
      : { id: 'make-kitchen', label: 'Change to Kitchen' },
    { id: 'reset', label: 'Reset password' },
    { id: 'remove', label: 'Remove', destructive: true },
  ];

  const columns: DataTableColumn<Staff>[] = [
    {
      key: 'fullName',
      header: 'Name',
      sortable: true,
      render: (s) => <strong>{s.fullName}</strong>,
    },
    { key: 'email', header: 'Email', sortable: true },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      width: '120px',
      render: (s) => ROLE_LABEL[s.role],
    },
    {
      key: 'active',
      header: 'Status',
      width: '110px',
      render: (s) => (
        <span className={`menu-status menu-status--${s.active ? 'on' : 'off'}`}>
          {s.active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '56px',
      render: (s) => (
        <Dropdown
          items={rowActions(s)}
          onSelect={(action) => handleAction(s, action)}
          triggerLabel={`Actions for ${s.fullName}`}
        />
      ),
    },
  ];

  return (
    <div className="menu-page">
      <div className="menu-page__head">
        <div>
          <h2 className="menu-page__title">Staff</h2>
          <p className="menu-page__subtitle">
            {staff.length} staff member{staff.length === 1 ? '' : 's'} · kitchen
            &amp; waiters with limited access
          </p>
        </div>
        <Button leadingIcon={<Plus size={18} />} onClick={openCreate}>
          Add staff
        </Button>
      </div>

      {loadError ? (
        <EmptyState
          variant="error-empty"
          title="Couldn’t load staff"
          description={loadError}
          action={{ label: 'Retry', onClick: () => refetch() }}
        />
      ) : !isLoading && staff.length === 0 ? (
        <EmptyState
          variant="first-use"
          icon={<UsersRound />}
          title="No staff yet"
          description="Add kitchen staff and waiters by email. They log in with their own credentials and see only what their role allows."
          action={{ label: 'Add staff', onClick: openCreate }}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={staff}
          getRowId={(s) => s.id}
          ariaLabel="Staff"
          loading={isLoading}
          emptyMessage="No staff yet."
        />
      )}

      {/* Add staff */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add staff"
        variant="form"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={createMutation.isPending}>
              Add staff
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
            label="Full name"
            required
            value={form.fullName}
            onChange={(e: any) => {
              const { value } = e.currentTarget;
              setForm((f) => ({ ...f, fullName: value }));
            }}
            placeholder="e.g. Ram Thapa"
          />
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e: any) => {
              const { value } = e.currentTarget;
              setForm((f) => ({ ...f, email: value }));
            }}
            placeholder="staff@cafe.com"
            helperText="They use this email to log in."
          />
          <div className="menu-form__field">
            <label className="menu-form__label">Role</label>
            <Select
              options={ROLE_OPTIONS}
              value={form.role}
              onChange={(value) =>
                setForm((f) => ({ ...f, role: value as StaffRole }))
              }
              aria-label="Staff role"
            />
          </div>
          <Input
            label="Initial password"
            type="password"
            required
            value={form.password}
            onChange={(e: any) => {
              const { value } = e.currentTarget;
              setForm((f) => ({ ...f, password: value }));
            }}
            placeholder="At least 8 characters"
            helperText="Share this with the staff member; they can change it later."
          />
        </div>
      </Modal>

      {/* Reset password */}
      <Modal
        open={resetTarget !== null}
        onClose={() => setResetTarget(null)}
        title={`Reset password${resetTarget ? ` — ${resetTarget.fullName}` : ''}`}
        variant="form"
        footer={
          <>
            <Button variant="secondary" onClick={() => setResetTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleReset} loading={resetMutation.isPending}>
              Reset password
            </Button>
          </>
        }
      >
        <div className="menu-form">
          {resetError && (
            <p className="menu-form__error" role="alert">
              {resetError}
            </p>
          )}
          <Input
            label="New password"
            type="password"
            required
            value={newPassword}
            onChange={(e: any) => setNewPassword(e.currentTarget.value)}
            placeholder="At least 8 characters"
          />
        </div>
      </Modal>

      {/* Remove */}
      <Modal
        open={removeTarget !== null}
        onClose={() => setRemoveTarget(null)}
        title="Remove staff"
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
          Remove {removeTarget?.fullName}? They will no longer be able to log in.
          This can’t be undone.
        </p>
      </Modal>
    </div>
  );
}
