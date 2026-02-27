import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#7dd3fc" },
    secondary: { main: "#fb7185" },
    background: { default: "transparent", paper: "#111827" },
  },
  typography: {
    fontFamily: "'Space Grotesk', sans-serif",
    h6: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 700 },
  },
  shape: { borderRadius: 14 },
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
          backgroundColor: "#111827",
          opacity: 1,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: "#111827",
          opacity: 1,
        },
      },
    },
  },
});
