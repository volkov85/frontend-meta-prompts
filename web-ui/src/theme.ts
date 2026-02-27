import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#7dd3fc" },
    secondary: { main: "#fb7185" },
    background: { default: "transparent", paper: "rgba(17, 24, 39, 0.86)" },
  },
  typography: {
    fontFamily: "'Space Grotesk', sans-serif",
    h6: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 700 },
  },
  shape: { borderRadius: 14 },
});
