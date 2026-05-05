import { CssBaseline, ThemeProvider } from "@mui/material";
import { render, screen, waitFor, within } from "@testing-library/react";
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

  const seedSetup = (setup: object) => {
    localStorage.setItem("frontend_meta_prompts_setup_v1", JSON.stringify(setup));
  };

  it("renders initial layout", () => {
    renderApp();

    expect(screen.getByText("Frontend Meta Prompts")).toBeInTheDocument();
    expect(screen.getByText("Interview Momentum")).toBeInTheDocument();
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

  it("clears sessions list after confirming", async () => {
    const user = userEvent.setup();
    renderApp();

    const generateButton = screen.getByRole("button", { name: "Generate Prompt" });
    await waitFor(() => expect(generateButton).toBeEnabled());
    await user.click(generateButton);

    await waitFor(() => expect(screen.getByText(/Session:/)).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Clear sessions" }));
    expect(screen.getByRole("dialog", { name: "Clear all sessions?" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Yes, clear all" }));
    await waitFor(() => {
      expect(screen.getByText("No saved sessions yet.")).toBeInTheDocument();
    });
  });

  it("keeps sessions when canceling the clear confirmation", async () => {
    const user = userEvent.setup();
    renderApp();

    const generateButton = screen.getByRole("button", { name: "Generate Prompt" });
    await waitFor(() => expect(generateButton).toBeEnabled());
    await user.click(generateButton);

    await waitFor(() => expect(screen.getByText(/Session:/)).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Clear sessions" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByText("No saved sessions yet.")).not.toBeInTheDocument();
    expect(screen.getByText(/Session:/)).toBeInTheDocument();
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

  it("renders progress chart stats from rated sessions", () => {
    seedSessions([
      {
        id: "session-1",
        date: "2026-03-18T10:00:00.000Z",
        templateId: "react-hooks-internals",
        level: "middle",
        score: 8.4,
      },
      {
        id: "session-2",
        date: "2026-03-17T10:00:00.000Z",
        templateId: "state-management",
        level: "middle",
        score: 7.2,
      },
      {
        id: "session-3",
        date: "2026-03-16T10:00:00.000Z",
        templateId: "frontend-system-design",
        level: "senior",
      },
    ]);

    renderApp();

    expect(screen.getByText("Average")).toBeInTheDocument();
    expect(screen.getByText("7.8")).toBeInTheDocument();
    expect(screen.getByText("Latest")).toBeInTheDocument();
    expect(screen.getByText("8.4")).toBeInTheDocument();
    expect(screen.getByText("67%")).toBeInTheDocument();
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

  it("opens the View prompt dialog with the historical prompt and context", async () => {
    const user = userEvent.setup();
    renderApp();

    const generateButton = screen.getByRole("button", { name: "Generate Prompt" });
    await waitFor(() => expect(generateButton).toBeEnabled());
    await user.click(generateButton);

    await waitFor(() => expect(screen.getByText(/Session:/)).toBeInTheDocument());

    const viewPromptButton = screen.getByRole("button", { name: "View prompt" });
    await user.click(viewPromptButton);

    const dialog = await screen.findByRole("dialog", { name: "Session prompt" });
    expect(dialog).toBeInTheDocument();

    const dialogScope = within(dialog);
    expect(dialogScope.getByText(/ROLE:/)).toBeInTheDocument();
    expect(dialogScope.getByText("Session context")).toBeInTheDocument();
    expect(dialogScope.getByText("Stack")).toBeInTheDocument();
    expect(dialogScope.getByText("Timebox (minutes)")).toBeInTheDocument();
    expect(dialogScope.getByText("30")).toBeInTheDocument();
  });

  it("copies the historical prompt from the View prompt dialog", async () => {
    const user = userEvent.setup();
    renderApp();

    const generateButton = screen.getByRole("button", { name: "Generate Prompt" });
    await waitFor(() => expect(generateButton).toBeEnabled());
    await user.click(generateButton);

    await waitFor(() => expect(screen.getByText(/Session:/)).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "View prompt" }));

    const dialog = await screen.findByRole("dialog", { name: "Session prompt" });
    const copyButton = within(dialog).getByRole("button", { name: "Copy prompt" });
    await user.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText("Prompt copied")).toBeInTheDocument();
    });
  });

  it("shows unavailable notice for legacy sessions without a stored prompt", async () => {
    const user = userEvent.setup();
    seedSessions([
      {
        id: "legacy-session-no-prompt",
        date: "2026-02-26T12:20:55.985Z",
        templateId: "react-hooks-internals",
        level: "middle",
        score: 7,
      },
    ]);
    renderApp();

    await user.click(screen.getByRole("button", { name: "View prompt" }));

    const dialog = await screen.findByRole("dialog", { name: "Session prompt" });
    expect(
      within(dialog).getByText(
        "This session was saved before the prompt-history feature was added, so the original prompt is not available.",
      ),
    ).toBeInTheDocument();

    const copyButton = within(dialog).getByRole("button", { name: "Copy prompt" });
    expect(copyButton).toBeDisabled();
  });

  it("restores setup state from localStorage on mount", async () => {
    seedSetup({
      templateId: "react-hooks-internals",
      level: "middle",
      stackInput: "Solid, Qwik, Astro",
      focusInput: "signals, server-only",
      extraContext: "Persisted setup",
      simulation: false,
      timebox: 17,
      persistSession: false,
    });

    renderApp();

    await waitFor(() => {
      expect(screen.getByDisplayValue("Solid, Qwik, Astro")).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue("signals, server-only")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Persisted setup")).toBeInTheDocument();
    expect(screen.getByDisplayValue("17")).toBeInTheDocument();
  });

  it("persists setup edits to localStorage", async () => {
    const user = userEvent.setup();
    renderApp();

    const stackInput = screen.getByLabelText("Stack (comma separated)");
    await waitFor(() => expect(stackInput).toBeEnabled());
    await user.clear(stackInput);
    await user.type(stackInput, "Solid");

    await waitFor(() => {
      const raw = localStorage.getItem("frontend_meta_prompts_setup_v1");
      expect(raw).not.toBeNull();
      const parsed: { stackInput?: string } = JSON.parse(raw!) as { stackInput?: string };
      expect(parsed.stackInput).toBe("Solid");
    });
  });

  it("exports sessions as JSON", async () => {
    const user = userEvent.setup();
    seedSessions([
      {
        id: "export-test-session",
        date: "2026-03-01T10:00:00.000Z",
        templateId: "react-hooks-internals",
        level: "middle",
        score: 9,
      },
    ]);
    renderApp();

    const createObjectURLSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:fake-url-export");
    const revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL").mockReturnValue(undefined);
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    await user.click(screen.getByRole("button", { name: "Export JSON" }));

    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:fake-url-export");
    await waitFor(() => {
      expect(screen.getByText("Exported 1 session as JSON")).toBeInTheDocument();
    });

    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
    clickSpy.mockRestore();
  });

  it("imports sessions from a JSON file and merges by id", async () => {
    const user = userEvent.setup();
    seedSessions([
      {
        id: "session-existing",
        date: "2026-03-01T10:00:00.000Z",
        templateId: "react-hooks-internals",
        level: "middle",
        score: 6,
      },
    ]);
    renderApp();

    const importPayload = JSON.stringify([
      {
        id: "session-existing",
        date: "2026-03-01T10:00:00.000Z",
        templateId: "react-hooks-internals",
        level: "middle",
      },
      {
        id: "session-imported",
        date: "2026-03-05T10:00:00.000Z",
        templateId: "react-hooks-internals",
        level: "senior",
        score: 9,
      },
      { id: "garbage", level: "wizard" },
    ]);
    const file = new File([importPayload], "sessions.json", { type: "application/json" });

    const fileInput = document.querySelector(
      "input[type='file'][accept='application/json,.json']",
    ) as HTMLInputElement | null;
    expect(fileInput).not.toBeNull();

    await user.upload(fileInput!, file);

    await waitFor(() => {
      expect(screen.getByText(/Imported 1 new/)).toBeInTheDocument();
    });
    const stored: unknown = JSON.parse(
      localStorage.getItem("frontend_meta_prompts_sessions_v1") ?? "[]",
    );
    expect(Array.isArray(stored)).toBe(true);
    expect((stored as { id: string }[]).map((session) => session.id).sort()).toEqual(
      ["session-existing", "session-imported"].sort(),
    );
  });
});
