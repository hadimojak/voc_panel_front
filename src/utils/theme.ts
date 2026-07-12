export type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "voc_theme";

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return savedTheme === "dark" || savedTheme === "light" ? savedTheme : "light";
}

export function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

export function saveTheme(theme: ThemeMode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function setTheme(theme: ThemeMode) {
  saveTheme(theme);
  applyTheme(theme);
}

export function initializeTheme() {
  const theme = getStoredTheme();
  applyTheme(theme);
  return theme;
}
