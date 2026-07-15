import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { usersApi } from "../services/users";
import type { ManagedUser, ManagedUserRole } from "../types/user";
import type { AuthUser } from "../types/auth";

type UsersPageProps = {
  currentUser?: AuthUser | null;
};

const roleOptions: Array<{ label: string; value: ManagedUserRole }> = [
  { label: "user", value: 2 },
  { label: "admin", value: 1 },
  { label: "superAdmin", value: 0 },
];

function getUserRole(
  user?: Partial<ManagedUser> | Partial<AuthUser> | null,
): ManagedUserRole {
  if (!user) {
    return 2;
  }

  const role = user.role ?? user.roles?.[0] ?? 2;
  const roleValue = String(role).toLowerCase();

  if (roleValue === "0" || roleValue === "superadmin") {
    return 0;
  }

  if (roleValue === "1" || roleValue === "admin") {
    return 1;
  }

  return 2;
}

function getRoleLabel(role: ManagedUserRole) {
  if (role === 0) {
    return "superAdmin";
  }

  if (role === 1) {
    return "admin";
  }

  return "user";
}

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export default function UsersPage({ currentUser }: UsersPageProps) {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingUserId, setSavingUserId] = useState<ManagedUser["id"] | null>(
    null,
  );
  const [error, setError] = useState("");

  const isSuperAdmin = getUserRole(currentUser) === 0;

  // Modal state (shared for create + edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [modalUsername, setModalUsername] = useState("");
  const [modalEmail, setModalEmail] = useState("");
  const [modalPassword, setModalPassword] = useState("");
  const [modalRole, setModalRole] = useState<ManagedUserRole>(1);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const isCreateMode = editingUser === null;

  const privilegedCount = useMemo(
    () => users.filter((user) => getUserRole(user) !== 2).length,
    [users],
  );

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await usersApi.getUsers();
      setUsers(data.users);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Could not load users.");
      } else {
        setError("Something went wrong while loading users.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const resetModalForm = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setModalUsername("");
    setModalEmail("");
    setModalPassword("");
    setModalRole(1);
    setModalError("");
    setModalLoading(false);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setModalUsername("");
    setModalEmail("");
    setModalPassword("");
    setModalRole(isSuperAdmin ? 1 : 2);
    setModalError("");
    setIsModalOpen(true);
  };

  const openEditModal = (user: ManagedUser) => {
    setEditingUser(user);
    setModalUsername(user.username || "");
    setModalEmail(user.email || "");
    setModalPassword("");
    setModalRole(getUserRole(user));
    setModalError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (modalLoading) {
      return;
    }
    resetModalForm();
  };

  const handleSubmitUser = async (event: FormEvent) => {
    event.preventDefault();

    try {
      setModalLoading(true);
      setModalError("");

      if (isCreateMode) {
        // --- CREATE ---
        if (!modalPassword.trim()) {
          setModalError("Password is required when creating a new user.");
          setModalLoading(false);
          return;
        }

        const createdUser = await usersApi.createUser({
          username: modalUsername,
          email: modalEmail || undefined,
          password: modalPassword,
          role: isSuperAdmin ? modalRole : 2,
        });

        setUsers((currentUsers) => [...currentUsers, createdUser]);
        resetModalForm();
      } else {
        // --- UPDATE ---
        if (!editingUser) {
          return;
        }

        const payload: Partial<ManagedUser> & { password?: string } = {
          username: modalUsername,
          email: modalEmail,
        };
        
        if (isSuperAdmin) {
          payload.role = modalRole;
        }

        if (modalPassword.trim()) {
          payload.password = modalPassword;
        }

        const updatedUser = await usersApi.updateUser(editingUser.id, payload);

        setUsers((currentUsers) =>
          currentUsers.map((user) =>
            user.id === editingUser.id ? updatedUser : user,
          ),
        );

        resetModalForm();
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setModalError(
          err.response?.data?.message ||
            (isCreateMode
              ? "Could not create user."
              : "Could not update user."),
        );
      } else {
        setModalError(
          isCreateMode
            ? "Something went wrong while creating user."
            : "Something went wrong while updating user.",
        );
      }
    } finally {
      setModalLoading(false);
    }
  };

  const handleRoleChange = async (user: ManagedUser, role: ManagedUserRole) => {
    if (!isSuperAdmin) {
      return;
    }
  
    try {
      setSavingUserId(user.id);
      setError("");
  
      await usersApi.updateUserRole(user.id, role);
      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === user.id ? { ...currentUser, role } : currentUser,
        ),
      );
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Could not update user role.");
      } else {
        setError("Something went wrong while updating user role.");
      }
    } finally {
      setSavingUserId(null);
    }
  };
  

  const handleDelete = async (user: ManagedUser) => {
    const confirmed = window.confirm(`Delete ${user.username}?`);

    if (!confirmed) {
      return;
    }

    try {
      setSavingUserId(user.id);
      setError("");

      await usersApi.deleteUser(user.id);
      setUsers((currentUsers) =>
        currentUsers.filter((currentUser) => currentUser.id !== user.id),
      );
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Could not delete user.");
      } else {
        setError("Something went wrong while deleting user.");
      }
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <div className="users-page">
      <div className="users-page__header">
        <div>
          <h2>Users</h2>
          <p>
            {users.length} accounts, {privilegedCount} admins
          </p>
        </div>

        <div className="users-page__header-actions">
          <button type="button" onClick={openCreateModal} disabled={loading}>
            Create User
          </button>
          <button type="button" onClick={loadUsers} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {error ? <p className="users-page__error">{error}</p> : null}

      <div className="users-table-shell">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="users-table__empty">
                  Loading users...
                </td>
              </tr>
            ) : users.length > 0 ? (
              users.map((user) => {
                const saving = savingUserId === user.id;

                return (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email || "-"}</td>
                    <td>
                      {isSuperAdmin ? (
                        <select
                          value={getUserRole(user)}
                          disabled={saving}
                          onChange={(event) =>
                            void handleRoleChange(
                              user,
                              Number(event.target.value) as ManagedUserRole,
                            )
                          }
                        >
                          {roleOptions.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span>{getRoleLabel(getUserRole(user))}</span>
                      )}
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>{formatDate(user.updatedAt)}</td>
                    <td>
                      <div className="users-table__row-actions">
                        <button
                          type="button"
                          className="users-table__edit"
                          disabled={saving}
                          onClick={() => openEditModal(user)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="users-table__delete"
                          disabled={saving}
                          onClick={() => void handleDelete(user)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="users-table__empty">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div
            className="modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h3>{isCreateMode ? "Create User" : "Update User"}</h3>
              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
              >
                x
              </button>
            </div>

            <form onSubmit={handleSubmitUser}>
              {modalError ? (
                <p className="users-page__error">{modalError}</p>
              ) : null}

              <label className="modal-form-field">
                <span>Username</span>
                <input
                  type="text"
                  value={modalUsername}
                  onChange={(event) => setModalUsername(event.target.value)}
                  required
                />
              </label>

              <label className="modal-form-field">
                <span>Email</span>
                <input
                  type="email"
                  value={modalEmail}
                  onChange={(event) => setModalEmail(event.target.value)}
                />
              </label>

              <label className="modal-form-field">
                <span>
                  {isCreateMode
                    ? "Password"
                    : "Password (leave empty to keep current)"}
                </span>
                <input
                  type="password"
                  value={modalPassword}
                  onChange={(event) => setModalPassword(event.target.value)}
                  placeholder={
                    isCreateMode
                      ? "Enter password"
                      : "Leave empty to keep current password"
                  }
                  required={isCreateMode}
                />
              </label>

              <label className="modal-form-field">
                <span>Role</span>
                {isSuperAdmin ? (
                  <select
                    value={modalRole}
                    onChange={(event) =>
                      setModalRole(
                        Number(event.target.value) as ManagedUserRole,
                      )
                    }
                  >
                    {roleOptions.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input type="text" value={getRoleLabel(modalRole)} disabled />
                )}
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={closeModal}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-submit-btn"
                  disabled={modalLoading}
                >
                  {modalLoading
                    ? isCreateMode
                      ? "Creating..."
                      : "Updating..."
                    : isCreateMode
                      ? "Create"
                      : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
