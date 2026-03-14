import { CssBaseline, ThemeProvider } from "@mui/material";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { appTheme } from "./theme";

const renderApp = () =>
  render(
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>,
  );

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });
  });

  it("renders initial layout", () => {
    renderApp();

    expect(screen.getByText("Frontend Meta Prompts")).toBeInTheDocument();
    expect(screen.getByText("Generated prompt will appear here.")).toBeInTheDocument();
    expect(screen.getByText("No saved sessions yet.")).toBeInTheDocument();
  });

  it("generates a prompt and creates a session", async () => {
    const user = userEvent.setup();
    renderApp();

    const generateButton = screen.getByRole("button", { name: "Generate Prompt" });
    await waitFor(() => expect(generateButton).toBeEnabled());

    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/ROLE:/)).toBeInTheDocument();
    });
    expect(screen.getByText(/Session created:/)).toBeInTheDocument();
    expect(screen.getByText(/Session:/)).toBeInTheDocument();
  });

  it("generates prompt in russian after switching language", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: "RU" }));
    const generateButton = screen.getByRole("button", { name: "Сгенерировать промпт" });
    await waitFor(() => expect(generateButton).toBeEnabled());

    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/РОЛЬ:/)).toBeInTheDocument();
    });
    expect(screen.getByText(/Сессия создана:/)).toBeInTheDocument();
  });

  it("saves evaluation and updates session score", async () => {
    const user = userEvent.setup();
    renderApp();

    const generateButton = screen.getByRole("button", { name: "Generate Prompt" });
    await waitFor(() => expect(generateButton).toBeEnabled());
    await user.click(generateButton);

    await waitFor(() => expect(screen.getByText(/Session:/)).toBeInTheDocument());

    await user.clear(screen.getByLabelText("Score (0..10)"));
    await user.type(screen.getByLabelText("Score (0..10)"), "8.5");
    await user.type(screen.getByLabelText("Notes"), "Strong trade-off analysis");
    await user.click(screen.getByRole("button", { name: "Save score" }));

    await waitFor(() => {
      expect(screen.getByText("Evaluation saved")).toBeInTheDocument();
    });
    expect(screen.getByText("Score: 8.5")).toBeInTheDocument();
  });

  it("shows validation error for out-of-range score", async () => {
    const user = userEvent.setup();
    renderApp();

    const generateButton = screen.getByRole("button", { name: "Generate Prompt" });
    await waitFor(() => expect(generateButton).toBeEnabled());
    await user.click(generateButton);

    await waitFor(() => expect(screen.getByText(/Session:/)).toBeInTheDocument());

    await user.clear(screen.getByLabelText("Score (0..10)"));
    await user.type(screen.getByLabelText("Score (0..10)"), "11");
    await user.click(screen.getByRole("button", { name: "Save score" }));

    await waitFor(() => {
      expect(screen.getByText("Score must be a number between 0 and 10")).toBeInTheDocument();
    });
  });

  it("clears sessions list", async () => {
    const user = userEvent.setup();
    renderApp();

    const generateButton = screen.getByRole("button", { name: "Generate Prompt" });
    await waitFor(() => expect(generateButton).toBeEnabled());
    await user.click(generateButton);

    await waitFor(() => expect(screen.getByText(/Session:/)).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Clear sessions" }));
    expect(screen.getByText("No saved sessions yet.")).toBeInTheDocument();
  });

  it("copies generated prompt to clipboard", async () => {
    const user = userEvent.setup();
    renderApp();

    const generateButton = screen.getByRole("button", { name: "Generate Prompt" });
    await waitFor(() => expect(generateButton).toBeEnabled());
    await user.click(generateButton);

    await waitFor(() => expect(screen.getByText(/ROLE:/)).toBeInTheDocument());

    const copyButton = screen.getByRole("button", { name: "Copy" });
    expect(copyButton).toBeEnabled();

    await user.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText("Prompt copied")).toBeInTheDocument();
    });
  });

  it("shares generated prompt", async () => {
    const user = userEvent.setup();
    renderApp();

    const generateButton = screen.getByRole("button", { name: "Generate Prompt" });
    await waitFor(() => expect(generateButton).toBeEnabled());
    await user.click(generateButton);

    await waitFor(() => expect(screen.getByText(/ROLE:/)).toBeInTheDocument());

    const shareButton = screen.getByRole("button", { name: "Share" });
    expect(shareButton).toBeEnabled();

    await user.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText("Prompt shared")).toBeInTheDocument();
    });
  });
});
