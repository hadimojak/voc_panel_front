import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { usersApi } from "../services/users";
import type { ManagedUser, ManagedUserRole } from "../types/user";

const roleOptions: Array<{ label: string; value: ManagedUserRole }> = [
  { label: "user", value: 1 },
  { label: "admin", value: 0 },
];

function getUserRole(user: ManagedUser): ManagedUserRole {
  const role = user.role ?? user.roles?.[0] ?? "user";
  const roleValue = String(role).toLowerCase();
  return roleValue === "0" || roleValue === "admin" ? 0 : 1;
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

export default function UsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingUserId, setSavingUserId] = useState<ManagedUser["id"] | null>(
    null,
  );
  const [error, setError] = useState("");

  const adminCount = useMemo(
    () => users.filter((user) => getUserRole(user) === 0).length,
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

  const handleRoleChange = async (
    user: ManagedUser,
    role: ManagedUserRole,
  ) => {
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
            {users.length} accounts, {adminCount} admins
          </p>
        </div>

        <button type="button" onClick={loadUsers} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
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
                    </td>
                    <td>{formatDate(user.created_at)}</td>
                    <td>{formatDate(user.updated_at)}</td>
                    <td>
                      <button
                        type="button"
                        className="users-table__delete"
                        disabled={saving}
                        onClick={() => void handleDelete(user)}
                      >
                        Delete
                      </button>
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
    </div>
  );
}
