import type { ReactNode } from "react";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function AuthLayout({
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__panel">
        <div className="auth-layout__brand">
          <span className="auth-layout__badge">Admin Panel</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        <div className="auth-layout__card">{children}</div>
      </div>
    </div>
  );
}
