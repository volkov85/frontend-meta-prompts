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

  const seedSessions = (sessions: object[]) => {
    localStorage.setItem("frontend_meta_prompts_sessions_v1", JSON.stringify(sessions));
  };

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

  it("filters sessions by level and score status", async () => {
    const user = userEvent.setup();
    seedSessions([
      {
        id: "session-middle-rated",
        date: "2026-03-18T10:00:00.000Z",
        templateId: "react-hooks-internals",
        level: "middle",
        score: 8.5,
      },
      {
        id: "session-junior-unrated",
        date: "2026-03-18T09:00:00.000Z",
        templateId: "junior-react-fundamentals",
        level: "junior",
      },
    ]);
    renderApp();

    await user.click(screen.getByLabelText("Level filter"));
    await user.click(screen.getByRole("option", { name: "Junior" }));

    expect(screen.getByText("junior-react-fundamentals")).toBeInTheDocument();
    expect(screen.queryByText("react-hooks-internals")).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("Score filter"));
    await user.click(screen.getByRole("option", { name: "Rated" }));

    expect(screen.getByText("No sessions match the current filters.")).toBeInTheDocument();
  });

  it("filters sessions by search query", async () => {
    const user = userEvent.setup();
    seedSessions([
      {
        id: "session-search-match",
        date: "2026-03-18T10:00:00.000Z",
        templateId: "react-hooks-internals",
        level: "middle",
        notes: "stale closure issue",
      },
      {
        id: "session-search-other",
        date: "2026-03-18T09:00:00.000Z",
        templateId: "junior-react-fundamentals",
        level: "junior",
      },
    ]);
    renderApp();

    await user.type(screen.getByLabelText("Search"), "closure");

    expect(screen.getByText("react-hooks-internals")).toBeInTheDocument();
    expect(screen.queryByText("junior-react-fundamentals")).not.toBeInTheDocument();
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

  it("starts a new session by clearing the current prompt", async () => {
    const user = userEvent.setup();
    renderApp();

    const generateButton = screen.getByRole("button", { name: "Generate Prompt" });
    await waitFor(() => expect(generateButton).toBeEnabled());
    await user.click(generateButton);

    await waitFor(() => expect(screen.getByText(/ROLE:/)).toBeInTheDocument());

    const startNewSessionButton = screen.getByRole("button", { name: "Start new session" });
    expect(startNewSessionButton).toBeEnabled();

    await user.click(startNewSessionButton);

    await waitFor(() => {
      expect(screen.getByText("Generated prompt will appear here.")).toBeInTheDocument();
    });
    expect(screen.queryByText(/ROLE:/)).not.toBeInTheDocument();
  });
});
