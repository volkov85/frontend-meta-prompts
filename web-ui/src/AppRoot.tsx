import { CssBaseline, ThemeProvider } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import App from "./App";
import { createAppTheme, type ThemeMode } from "./theme";
import { readStoredThemeMode, writeStoredThemeMode } from "./lib/themeStorage";

export type AppRootProps = {
  initialMode?: ThemeMode;
};

export const AppRoot = ({ initialMode }: AppRootProps = {}) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (initialMode) return initialMode;
    return readStoredThemeMode() ?? "dark";
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", themeMode);
    }
    writeStoredThemeMode(themeMode);
  }, [themeMode]);

  const theme = useMemo(() => createAppTheme(themeMode), [themeMode]);

  const handleThemeModeChange = useCallback((mode: ThemeMode) => {
    setThemeMode(mode);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App themeMode={themeMode} onThemeModeChange={handleThemeModeChange} />
    </ThemeProvider>
  );
};
