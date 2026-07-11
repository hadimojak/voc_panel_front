import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import AdminLayout from "./components/layout/AdminLayout";
import LoginPage from "./pages/LoginPage";
import { ACCESS_TOKEN_REFRESH_BUFFER_SECONDS } from "./config/auth";
import { setOnUnauthorized } from "./services/api";
import { authApi, refreshSession, restoreSession } from "./services/auth";
import type { AuthUser } from "./types/auth";
import { authStorage } from "./utils/authStorage";
import { getTokenExpiresAt } from "./utils/token";

function clearSessionState(
  setIsAuthenticated: (value: boolean) => void,
  setAccessToken: (value: string) => void,
  setUser: (value: AuthUser | null) => void
) {
  authStorage.clear();
  setIsAuthenticated(false);
  setAccessToken("");
  setUser(null);
}

export default function App() {
  const [initializing, setInitializing] = useState(() => authStorage.hasTokens());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [user, setUser] = useState<AuthUser | null>(() => authStorage.getUser());

  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      if (!authStorage.hasTokens()) {
        if (isMounted) {
          setInitializing(false);
        }
        return;
      }

      const session = await restoreSession();

      if (!isMounted) {
        return;
      }

      if (session) {
        setAccessToken(session.accessToken);
        setUser(session.user ?? authStorage.getUser());
        setIsAuthenticated(true);
      } else {
        clearSessionState(setIsAuthenticated, setAccessToken, setUser);
      }

      setInitializing(false);
    }

    void initSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      clearSessionState(setIsAuthenticated, setAccessToken, setUser);
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleAccessTokenRefresh = () => {
      const token = authStorage.getAccessToken();
      const expiresAt = token ? getTokenExpiresAt(token) : null;

      if (!expiresAt) {
        return;
      }

      const refreshAt =
        expiresAt - ACCESS_TOKEN_REFRESH_BUFFER_SECONDS * 1000;
      const delay = Math.max(refreshAt - Date.now(), 0);

      timeoutId = setTimeout(async () => {
        const session = await refreshSession();

        if (!session) {
          clearSessionState(setIsAuthenticated, setAccessToken, setUser);
          return;
        }

        setAccessToken(session.accessToken);
        setUser(session.user ?? authStorage.getUser());
        scheduleAccessTokenRefresh();
      }, delay);
    };

    scheduleAccessTokenRefresh();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isAuthenticated, accessToken]);

  const handleLogin = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError("");

      const data = await authApi.login({ username, password });

      authStorage.save({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      });
      authStorage.saveUser(data.user);

      setAccessToken(data.access_token);
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Login failed");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = accessToken || authStorage.getAccessToken();

      if (token) {
        await authApi.logout(token);
      }
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      clearSessionState(setIsAuthenticated, setAccessToken, setUser);
    }
  };

  if (initializing) {
    return (
      <main className="auth-layout">
        <div className="auth-layout__panel">
          <p>Restoring session...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} error={error} loading={loading} />;
  }

  return (

    <AdminLayout user={user} onLogout={handleLogout}>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <span className="dashboard-card__label">Total Users</span>
          <strong>1,248</strong>
          <p>Active users across the platform.</p>
        </div>

        <div className="dashboard-card">
          <span className="dashboard-card__label">Open Tickets</span>
          <strong>36</strong>
          <p>Support requests waiting for action.</p>
        </div>

        <div className="dashboard-card">
          <span className="dashboard-card__label">Monthly Reports</span>
          <strong>18</strong>
          <p>Reports generated this month.</p>
        </div>

        <div className="dashboard-card dashboard-card--wide">
          <span className="dashboard-card__label">System Status</span>
          <strong>Operational</strong>
          <p>
            All core services are running normally. No critical incidents
            detected.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
