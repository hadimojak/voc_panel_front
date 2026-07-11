import type { ReactNode } from "react";

type AdminLayoutProps = {
  children: ReactNode;
  onLogout?: () => void;
};

export default function AdminLayout({
  children,
  onLogout,
}: AdminLayoutProps) {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div>
          <div className="admin-sidebar__logo">VOC</div>
          <h2 className="admin-sidebar__title">Administration</h2>
          <p className="admin-sidebar__text">
            Manage users, content, reports, and system settings.
          </p>
        </div>

        <nav className="admin-sidebar__nav">
          <button className="admin-nav__item admin-nav__item--active">
            Dashboard
          </button>
          <button className="admin-nav__item">Users</button>
          <button className="admin-nav__item">Reports</button>
          <button className="admin-nav__item">Settings</button>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome back. Monitor the platform from one place.</p>
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
