'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, UserRole } from '@/lib/types';

interface UserManagementViewProps {
  currentUser: User;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function UserManagementView({
  currentUser,
  onShowToast,
}: UserManagementViewProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const isManager = currentUser.role === 'manager';
  const isAdmin = currentUser.role === 'admin';

  // Create User Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('support');
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('support');
  const [editPassword, setEditPassword] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  // Delete Confirmation State
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users', {
        headers: {
          'x-user-role': currentUser.role,
        },
      });
      const data = await res.json();
      if (res.ok && data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/users', {
          headers: {
            'x-user-role': currentUser.role,
          },
        });
        const data = await res.json();
        if (!ignore && res.ok && data.users) {
          setUsers(data.users);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [currentUser.role]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!newEmail.trim() || !newName.trim() || !newPassword) {
      setCreateError('All fields are required.');
      return;
    }

    const targetRole = isManager ? 'support' : newRole;

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
        },
        body: JSON.stringify({
          user_id: newEmail.trim().toLowerCase(),
          name: newName.trim(),
          password: newPassword,
          role: targetRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || 'Failed to create user.');
        return;
      }

      if (onShowToast) {
        onShowToast(`User ${data.user.name} created as ${targetRole.toUpperCase()}.`, 'success');
      }
      setIsCreateOpen(false);
      setNewEmail('');
      setNewName('');
      setNewPassword('');
      setNewRole('support');
      fetchUsers();
    } catch (err) {
      console.error(err);
      setCreateError('Network error while creating user.');
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError(null);

    try {
      const payload: any = {
        name: editName.trim(),
        role: isManager ? 'support' : editRole,
      };
      if (editPassword.trim()) {
        payload.password = editPassword.trim();
      }

      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || 'Failed to update user.');
        return;
      }

      if (onShowToast) {
        onShowToast(`User ${editName} updated successfully.`, 'success');
      }
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      setEditError('Network error while updating user.');
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      const res = await fetch(`/api/users/${deletingUser.id}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': currentUser.role,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        if (onShowToast) onShowToast(data.error || 'Failed to delete user.', 'error');
        return;
      }
      if (onShowToast) {
        onShowToast(`User ${deletingUser.name} deleted.`, 'info');
      }
      setDeletingUser(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      if (onShowToast) onShowToast('Network error while deleting user.', 'error');
    }
  };

  if (!isAdmin && !isManager) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 text-center max-w-md mx-auto my-12 shadow-xs">
        <span className="material-symbols-outlined text-3xl text-rose-600 mb-2">lock</span>
        <h2 className="text-base font-bold text-on-surface">Restricted Access</h2>
        <p className="text-xs text-secondary mt-1">
          Only Admin and Managers have permissions to manage user accounts.
        </p>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q || u.name.toLowerCase().includes(q) || u.user_id.toLowerCase().includes(q);
    const matchesRole = roleFilter === 'ALL' || u.role.toUpperCase() === roleFilter.toUpperCase();
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">
            Admin
          </span>
        );
      case 'manager':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
            Manager
          </span>
        );
      case 'support':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-50 text-teal-700 border border-teal-200">
            Support
          </span>
        );
      case 'accounts':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
            Accounts
          </span>
        );
      default:
        return <span>{role}</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-4 w-full"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-on-surface">
            {isAdmin ? 'Staff Management' : 'Support Staff Management'}
          </h1>
          <p className="text-xs text-secondary mt-0.5">
            {isAdmin
              ? 'Admin provisions all staff roles (Admin, Manager, Support, Accounts).'
              : 'Manager provisions Support staff accounts.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsCreateOpen(true);
            setNewRole('support');
          }}
          className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">person_add</span>
          <span>{isManager ? 'Add Support Account' : 'Add User Account'}</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-xs overflow-hidden flex flex-col">
        {/* Filter bar */}
        <div className="p-3 bg-surface-bright flex flex-col sm:flex-row items-center justify-between gap-2.5 border-b border-outline-variant/20 text-xs">
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-secondary text-base">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user name or email..."
              className="w-full pl-8 pr-3 py-1.5 bg-surface text-on-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600"
            />
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-secondary font-medium">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-surface text-on-surface px-2.5 py-1 rounded-lg border border-outline-variant/40 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="SUPPORT">Support</option>
                <option value="ACCOUNTS">Accounts</option>
              </select>
            </div>
          )}
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[620px]">
            <thead>
              <tr className="bg-surface-container-low text-secondary uppercase tracking-wider h-9">
                <th className="px-4 font-semibold">Email / Login ID</th>
                <th className="px-3 font-semibold">Name</th>
                <th className="px-3 font-semibold">Role</th>
                <th className="px-3 font-semibold">Created</th>
                <th className="px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-secondary">
                    Loading accounts...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-secondary">
                    No accounts found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-container-low/60 transition-colors h-12">
                    <td className="px-4 font-data-mono font-bold text-teal-700">
                      {user.user_id}
                    </td>
                    <td className="px-3 font-semibold text-on-surface">
                      {user.name}
                    </td>
                    <td className="px-3">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-3 text-secondary font-data-mono">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUser(user);
                            setEditName(user.name);
                            setEditRole(user.role);
                            setEditPassword('');
                            setEditError(null);
                          }}
                          className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-medium transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        {user.user_id.toLowerCase() !== 'kamrul.cse9@gmail.com' && (
                          <button
                            type="button"
                            onClick={() => setDeletingUser(user)}
                            className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
          onClick={() => setIsCreateOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-surface-container-lowest rounded-xl shadow-xl max-w-sm w-full p-5 border border-outline-variant/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-outline-variant/20">
              <h3 className="text-sm font-bold text-on-surface">
                {isManager ? 'Add Support Account' : 'Add User Account'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-secondary hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {createError && (
              <div className="mb-3 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-secondary uppercase">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. staff@ispprovider.com"
                  className="h-9 px-2.5 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-secondary uppercase">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Arif Rahman"
                  className="h-9 px-2.5 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-secondary uppercase">
                  Role Assigned
                </label>
                {isManager ? (
                  <div className="h-9 px-2.5 bg-surface-container rounded-lg border border-outline-variant/40 flex items-center justify-between text-xs">
                    <span className="font-semibold text-on-surface">Support</span>
                    <span className="text-[10px] text-secondary italic">Manager role locked</span>
                  </div>
                ) : (
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="h-9 px-2 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 text-xs cursor-pointer"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="support">Support</option>
                    <option value="accounts">Accounts</option>
                  </select>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-secondary uppercase">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-9 px-2.5 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-secondary hover:bg-surface-container text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Save Account
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
          onClick={() => setEditingUser(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-lowest rounded-xl shadow-xl max-w-sm w-full p-5 border border-outline-variant/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-outline-variant/20">
              <h3 className="text-sm font-bold text-on-surface">
                Edit User ({editingUser.user_id})
              </h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-secondary hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {editError && (
              <div className="mb-3 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditUser} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-secondary uppercase">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-9 px-2.5 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 text-xs"
                />
              </div>

              {isAdmin && (
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-secondary uppercase">
                    Role *
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="h-9 px-2 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 text-xs cursor-pointer"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="support">Support</option>
                    <option value="accounts">Accounts</option>
                  </select>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-secondary uppercase">
                  New Password (Optional)
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Leave empty to keep unchanged"
                  className="h-9 px-2.5 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 rounded-lg text-secondary hover:bg-surface-container text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Update
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete User Modal */}
      {deletingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
          onClick={() => setDeletingUser(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-lowest rounded-xl shadow-xl max-w-xs w-full p-4 border border-outline-variant/30 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-sm text-on-surface mb-1">Delete User</h3>
            <p className="text-secondary mb-3">
              Are you sure you want to remove <strong>{deletingUser.name}</strong> ({deletingUser.user_id})?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-3 py-1 rounded text-secondary hover:bg-surface-container cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="px-3.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
