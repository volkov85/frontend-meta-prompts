import { createTheme, type Theme } from "@mui/material/styles";

export type ThemeMode = "dark" | "light";

const sharedTheme = {
  typography: {
    fontFamily: "'Space Grotesk', sans-serif",
    h6: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 700 },
  },
  shape: { borderRadius: 14 },
};

const darkPaper = "#111827";
const lightPaper = "#ffffff";

export const createAppTheme = (mode: ThemeMode): Theme => {
  const paperColor = mode === "dark" ? darkPaper : lightPaper;
  return createTheme({
    ...sharedTheme,
    palette: {
      mode,
      primary: { main: mode === "dark" ? "#7dd3fc" : "#0284c7" },
      secondary: { main: mode === "dark" ? "#fb7185" : "#e11d48" },
      background:
        mode === "dark"
          ? { default: "transparent", paper: darkPaper }
          : { default: "transparent", paper: lightPaper },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            backgroundColor: paperColor,
            opacity: 1,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: paperColor,
            opacity: 1,
          },
        },
      },
    },
  });
};

export const appTheme = createAppTheme("dark");
