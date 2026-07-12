import type { ReactNode } from "react";
import type { AuthUser } from "../../types/auth";
import { isAdminUser } from "../../utils/roles";

export type AdminPage = "dashboard" | "tickets" | "users";

type AdminLayoutProps = {
  children: ReactNode;
  user?: AuthUser | null;
  onLogout?: () => void;
  activePage?: AdminPage;
  onPageChange?: (page: AdminPage) => void;
};

export default function AdminLayout({
  children,
  user,
  onLogout,
  activePage = "dashboard",
  onPageChange,
}: AdminLayoutProps) {
  const canManageUsers = isAdminUser(user);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div>
          <div className="admin-sidebar__logo">VOC</div>
          <h2 className="admin-sidebar__title">Administration</h2>
          <p className="admin-sidebar__text">
            Manage users, graphs, reports, and system settings.
          </p>
        </div>

        <nav className="admin-sidebar__nav">
          <button
            className={`admin-nav__item ${
              activePage === "dashboard" ? "admin-nav__item--active" : ""
            }`}
            onClick={() => onPageChange?.("dashboard")}
          >
            Dashboard
          </button>
          {canManageUsers ? (
            <button
              className={`admin-nav__item ${
                activePage === "users" ? "admin-nav__item--active" : ""
              }`}
              onClick={() => onPageChange?.("users")}
            >
              Users
            </button>
          ) : null}
          <button className="admin-nav__item">Reports</button>
          <button
            className={`admin-nav__item ${
              activePage === "tickets" ? "admin-nav__item--active" : ""
            }`}
            onClick={() => onPageChange?.("tickets")}
          >
            Tickets
          </button>
          <button className="admin-nav__item">Graphs</button>
          <button className="admin-nav__item">Settings</button>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>
              Welcome back
              {user?.username ? `, ${user.username}` : ""}. Monitor the
              platform from one place.
            </p>
          </div>

          <button className="admin-logout" onClick={onLogout}>
            Logout
          </button>
        </header>

        <section className="admin-content">{children}</section>
      </main>
    </div>
  );
}
