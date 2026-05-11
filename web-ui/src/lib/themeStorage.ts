import { ThemeMode } from "../theme";

export const THEME_STORAGE_KEY = "frontend_meta_prompts_theme_v1";

const isThemeMode = (value: unknown): value is ThemeMode => value === "dark" || value === "light";

export const readStoredThemeMode = (): ThemeMode | null => {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(raw) ? raw : null;
  } catch {
    return null;
  }
};

export const writeStoredThemeMode = (mode: ThemeMode): void => {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* localStorage may be disabled in private browsing — ignore */
  }
};
