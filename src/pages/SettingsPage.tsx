import { useState } from "react";
import { getStoredTheme, setTheme, type ThemeMode } from "../utils/theme";

export default function SettingsPage() {
  const [theme, setThemeState] = useState<ThemeMode>(() => getStoredTheme());

  const handleThemeToggle = () => {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setThemeState(nextTheme);
    setTheme(nextTheme);
  };

  return (
    <div className="settings-page">
      <div className="settings-card">
        <h2>Settings</h2>
        <div className="settings-row">
          <div>
            <h3>Dark Mode</h3>
            <p>Switch between light and dark theme.</p>
          </div>
          <label className="theme-toggle">
            <input
              type="checkbox"
              checked={theme === "dark"}
              onChange={handleThemeToggle}
            />
            <span className="theme-toggle__slider" />
          </label>
        </div>
      </div>
    </div>
  );
}
