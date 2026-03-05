import { beforeEach, describe, expect, it } from "vitest";
import { clearSessions, createSession, listSessions, updateSessionScore } from "./localSessions";

const SESSIONS_KEY = "frontend_meta_prompts_sessions_v1";

describe("localSessions", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("creates and lists sessions sorted by newest date", () => {
    localStorage.setItem(
      SESSIONS_KEY,
      JSON.stringify([
        {
          id: "old",
          date: "2026-01-01T00:00:00.000Z",
          templateId: "junior-react-fundamentals",
          level: "junior",
        },
      ]),
    );

    const created = createSession("junior-typescript-fundamentals", "junior");
    expect(created.id).toBeTruthy();

    const sessions = listSessions();
    expect(sessions).toHaveLength(2);
    expect(sessions[0].id).toBe(created.id);
    expect(sessions[1].id).toBe("old");
  });

  it("updates session score and notes", () => {
    localStorage.setItem(
      SESSIONS_KEY,
      JSON.stringify([
        {
          id: "abc",
          date: "2026-01-01T00:00:00.000Z",
          templateId: "junior-testing-basics",
          level: "junior",
        },
      ]),
    );

    const updated = updateSessionScore("abc", 8.5, "clear structure");
    expect(updated.score).toBe(8.5);
    expect(updated.notes).toBe("clear structure");

    const persisted = listSessions().find((session) => session.id === "abc");
    expect(persisted?.score).toBe(8.5);
    expect(persisted?.notes).toBe("clear structure");
  });

  it("throws on invalid score range", () => {
    localStorage.setItem(
      SESSIONS_KEY,
      JSON.stringify([
        {
          id: "abc",
          date: "2026-01-01T00:00:00.000Z",
          templateId: "junior-testing-basics",
          level: "junior",
        },
      ]),
    );

    expect(() => updateSessionScore("abc", 11)).toThrowError(
      "Score must be a number between 0 and 10",
    );
  });

  it("returns empty list for malformed storage and supports clear", () => {
    localStorage.setItem(SESSIONS_KEY, "{broken-json");
    expect(listSessions()).toEqual([]);

    localStorage.setItem(
      SESSIONS_KEY,
      JSON.stringify([
        {
          id: "abc",
          date: "2026-01-01T00:00:00.000Z",
          templateId: "junior-testing-basics",
          level: "junior",
        },
      ]),
    );

    clearSessions();
    expect(localStorage.getItem(SESSIONS_KEY)).toBeNull();
  });
});
