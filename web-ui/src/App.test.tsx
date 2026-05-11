import { CssBaseline, ThemeProvider } from "@mui/material";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
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

const switchToTab = async (user: UserEvent, label: "Prompt" | "Charts" | "Sessions") => {
  await user.click(screen.getByRole("tab", { name: label }));
};

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, "", "/");
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

  it("renders initial layout", async () => {
    const user = userEvent.setup();
    renderApp();

    expect(screen.getByText("Frontend Meta Prompts")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Prompt" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Charts" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Sessions" })).toBeInTheDocument();
    expect(screen.getByText("Generated prompt will appear here.")).toBeInTheDocument();

    await switchToTab(user, "Charts");
    expect(screen.getByText("Interview Momentum")).toBeInTheDocument();

    await switchToTab(user, "Sessions");
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

    await switchToTab(user, "Sessions");
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

  it("saves evaluation with rubric and aggregates to overall score", async () => {
    const user = userEvent.setup({ delay: null });
    renderApp();

    const generateButton = screen.getByRole("button", { name: "Generate Prompt" });
    await waitFor(() => expect(generateButton).toBeEnabled());
    await user.click(generateButton);

    await waitFor(() => expect(screen.getByText(/Session created:/)).toBeInTheDocument());

    const axisInput = (label: string) => {
      const candidates = screen.getAllByLabelText(label);
      const input = candidates.find(
        (element): element is HTMLInputElement =>
          element instanceof HTMLInputElement && element.type === "number",
      );
      expect(input).toBeDefined();
      return input!;
    };

    for (const axisLabel of ["Correctness", "Depth", "Clarity", "Trade-offs", "Practicality"]) {
      const input = axisInput(axisLabel);
      await user.clear(input);
      await user.type(input, "8.5");
    }
    await user.type(screen.getByLabelText("Notes"), "Strong trade-off analysis");
    await user.click(screen.getByRole("button", { name: "Save score" }));

    await waitFor(() => {
      expect(screen.getByText("Evaluation saved")).toBeInTheDocument();
    });

    await switchToTab(user, "Sessions");
    expect(screen.getByText("Score: 8.5")).toBeInTheDocument();
    expect(screen.getByText("Rubric")).toBeInTheDocument();
  }, 15000);

  it("disables save until all rubric axes are filled and rejects out-of-range values", async () => {
    const user = userEvent.setup({ delay: null });
    renderApp();

    const generateButton = screen.getByRole("button", { name: "Generate Prompt" });
    await waitFor(() => expect(generateButton).toBeEnabled());
    await user.click(generateButton);

    await waitFor(() => expect(screen.getByText(/Session created:/)).toBeInTheDocument());

    const saveButton = screen.getByRole("button", { name: "Save score" });
    expect(saveButton).toBeDisabled();

    const axisInput = (label: string) => {
      const candidates = screen.getAllByLabelText(label);
      const input = candidates.find(
        (element): element is HTMLInputElement =>
          element instanceof HTMLInputElement && element.type === "number",
      );
      expect(input).toBeDefined();
      return input!;
    };

    await user.clear(axisInput("Correctness"));
    await user.type(axisInput("Correctness"), "11");
    for (const label of ["Depth", "Clarity", "Trade-offs", "Practicality"]) {
      await user.clear(axisInput(label));
      await user.type(axisInput(label), "5");
    }
    expect(saveButton).toBeEnabled();
    await user.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByText("Each rubric axis must be a number between 0 and 10"),
      ).toBeInTheDocument();
    });
  }, 15000);

  it("clears sessions list after confirming", async () => {
    const user = userEvent.setup();
    renderApp();

    const generateButton = screen.getByRole("button", { name: "Generate Prompt" });
    await waitFor(() => expect(generateButton).toBeEnabled());
    await user.click(generateButton);

    await waitFor(() => expect(screen.getByText(/Session created:/)).toBeInTheDocument());

    await switchToTab(user, "Sessions");
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

    await waitFor(() => expect(screen.getByText(/Session created:/)).toBeInTheDocument());

    await switchToTab(user, "Sessions");
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

    await switchToTab(user, "Sessions");
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

    await switchToTab(user, "Sessions");
    await user.type(screen.getByLabelText("Search"), "closure");

    expect(screen.getByText("react-hooks-internals")).toBeInTheDocument();
    expect(screen.queryByText("junior-react-fundamentals")).not.toBeInTheDocument();
  });

  it("filters sessions by clicking tag chips", async () => {
    const user = userEvent.setup();
    seedSessions([
      {
        id: "session-react",
        date: "2026-03-18T10:00:00.000Z",
        templateId: "react-hooks-internals",
        level: "middle",
      },
      {
        id: "session-css",
        date: "2026-03-18T09:00:00.000Z",
        templateId: "css-architecture-design-systems",
        level: "middle",
      },
    ]);
    renderApp();

    await switchToTab(user, "Sessions");
    expect(screen.getByText("react-hooks-internals")).toBeInTheDocument();
    expect(screen.getByText("css-architecture-design-systems")).toBeInTheDocument();

    const cssChip = screen.getByRole("button", { name: "css" });
    await user.click(cssChip);

    expect(screen.queryByText("react-hooks-internals")).not.toBeInTheDocument();
    expect(screen.getByText("css-architecture-design-systems")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear tags" }));

    expect(screen.getByText("react-hooks-internals")).toBeInTheDocument();
    expect(screen.getByText("css-architecture-design-systems")).toBeInTheDocument();
  });

  it("renders progress chart stats from rated sessions", async () => {
    const user = userEvent.setup();
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

    await switchToTab(user, "Charts");
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

    await waitFor(() => expect(screen.getByText(/Session created:/)).toBeInTheDocument());

    await switchToTab(user, "Sessions");
    const viewPromptButton = await screen.findByRole("button", { name: "View prompt" });
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

    await waitFor(() => expect(screen.getByText(/Session created:/)).toBeInTheDocument());

    await switchToTab(user, "Sessions");
    await user.click(await screen.findByRole("button", { name: "View prompt" }));

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

    await switchToTab(user, "Sessions");
    await user.click(await screen.findByRole("button", { name: "View prompt" }));

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

    await switchToTab(user, "Sessions");
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

    await switchToTab(user, "Sessions");
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

  it("hydrates setup form from URL query parameters", async () => {
    window.history.replaceState(
      {},
      "",
      "/?template=react-hooks-internals&level=senior&stack=Solid%2C%20Qwik&focus=signals%2C%20ssr&extra=fintech%20checkout&simulation=1&timebox=42&lang=en",
    );

    renderApp();

    await waitFor(() => {
      expect(screen.getByText("Setup loaded from shared link")).toBeInTheDocument();
    });
    expect(screen.getByLabelText("Stack (comma separated)")).toHaveValue("Solid, Qwik");
    expect(screen.getByLabelText("Focus boost (comma separated)")).toHaveValue("signals, ssr");
    expect(screen.getByLabelText("Extra context")).toHaveValue("fintech checkout");
    expect(screen.getByLabelText("Timebox (minutes)")).toHaveValue(42);
    await waitFor(() => expect(window.location.search).toBe(""));
  });

  it("copies share link to clipboard when the user requests it", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    renderApp();

    const shareButton = screen.getByRole("button", { name: "Copy share link" });
    await waitFor(() => expect(shareButton).toBeEnabled());
    await user.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText("Share link copied to clipboard")).toBeInTheDocument();
    });
    expect(writeText).toHaveBeenCalledTimes(1);
    const copied = writeText.mock.calls[0][0] as string;
    expect(copied).toContain("template=");
    expect(copied).toContain("level=");
    expect(copied).toContain("simulation=");
    expect(copied).toContain("lang=");
  });

  it("triggers Generate Prompt with Ctrl+Enter shortcut", async () => {
    const user = userEvent.setup();
    renderApp();

    const generateButton = screen.getByRole("button", { name: "Generate Prompt" });
    await waitFor(() => expect(generateButton).toBeEnabled());

    await user.keyboard("{Control>}{Enter}{/Control}");

    await waitFor(() => {
      expect(screen.getByText(/ROLE:/)).toBeInTheDocument();
    });
  });

  it("applies a company-bar preset chip and reflects it in the prompt", async () => {
    const user = userEvent.setup();
    renderApp();

    const presetChip = await screen.findByRole("button", { name: "Series-A startup" });
    await user.click(presetChip);

    expect(screen.getByLabelText("Company bar")).toHaveValue("Series-A startup");

    const generateButton = screen.getByRole("button", { name: "Generate Prompt" });
    await waitFor(() => expect(generateButton).toBeEnabled());
    await user.click(generateButton);

    await waitFor(() => {
      const prompt = document.querySelector(".prompt-output");
      expect(prompt?.textContent ?? "").toContain("Series-A startup");
    });
  });

  it("URL params win over saved setup", async () => {
    seedSetup({
      templateId: "react-hooks-internals",
      level: "junior",
      stackInput: "from-storage",
      focusInput: "from-storage-focus",
      extraContext: "from-storage-extra",
      simulation: false,
      timebox: 30,
      persistSession: true,
    });
    window.history.replaceState({}, "", "/?stack=from-url&timebox=55&simulation=1");

    renderApp();

    await waitFor(() => {
      expect(screen.getByLabelText("Stack (comma separated)")).toHaveValue("from-url");
    });
    expect(screen.getByLabelText("Timebox (minutes)")).toHaveValue(55);
    expect(screen.getByLabelText("Focus boost (comma separated)")).toHaveValue(
      "from-storage-focus",
    );
    expect(screen.getByLabelText("Extra context")).toHaveValue("from-storage-extra");
  });

  it("shows recommended next session and applies it when clicked", async () => {
    const user = userEvent.setup();
    seedSessions([
      {
        id: "weak-tradeoffs-1",
        date: "2026-03-18T10:00:00.000Z",
        templateId: "react-hooks-internals",
        level: "middle",
        score: 6,
        rubric: {
          correctness: 9,
          depth: 9,
          clarity: 8,
          tradeOffs: 3,
          practicality: 8,
        },
      },
    ]);
    renderApp();

    await waitFor(() => {
      expect(screen.getByText("Recommended next session")).toBeInTheDocument();
    });
    expect(screen.getByText(/Trade-offs scored lowest/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() => {
      expect(screen.getByText(/Applied recommendation:/)).toBeInTheDocument();
    });
  });

  it("dismisses the recommendation banner when the user clicks dismiss", async () => {
    const user = userEvent.setup();
    seedSessions([
      {
        id: "weak-clarity-1",
        date: "2026-03-18T10:00:00.000Z",
        templateId: "react-hooks-internals",
        level: "middle",
        score: 6,
        rubric: {
          correctness: 9,
          depth: 9,
          clarity: 2,
          tradeOffs: 8,
          practicality: 8,
        },
      },
    ]);
    renderApp();

    await waitFor(() => {
      expect(screen.getByText("Recommended next session")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Dismiss recommendation" }));

    expect(screen.queryByText("Recommended next session")).not.toBeInTheDocument();
  });

  it("renders the streak calendar with current streak when sessions exist", async () => {
    const user = userEvent.setup();
    const today = new Date();
    const todayIso = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      12,
    ).toISOString();
    seedSessions([
      {
        id: "today-1",
        date: todayIso,
        templateId: "react-hooks-internals",
        level: "middle",
      },
    ]);
    renderApp();

    await switchToTab(user, "Charts");
    expect(screen.getByText("Practice streak")).toBeInTheDocument();
    expect(screen.getByText(/1 day current streak/)).toBeInTheDocument();
  });

  it("shows the streak calendar empty state with no sessions", async () => {
    const user = userEvent.setup();
    renderApp();

    await switchToTab(user, "Charts");
    expect(screen.getByText("Practice streak")).toBeInTheDocument();
    expect(
      screen.getByText("No sessions yet — save one to start your streak."),
    ).toBeInTheDocument();
  });

  it("does not show the recommendation banner without rated sessions", async () => {
    seedSessions([
      {
        id: "unrated-1",
        date: "2026-03-18T10:00:00.000Z",
        templateId: "react-hooks-internals",
        level: "middle",
      },
    ]);
    renderApp();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Generate Prompt" })).toBeEnabled();
    });

    expect(screen.queryByText("Recommended next session")).not.toBeInTheDocument();
  });
});
