import { beforeEach, describe, expect, it } from "vitest";
import {
  clearSessions,
  createSession,
  listSessions,
  updateSessionEvaluation,
  updateSessionScore,
} from "./localSessions";

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

    const created = createSession({
      templateId: "junior-typescript-fundamentals",
      level: "junior",
    });
    expect(created.id).toBeTruthy();

    const sessions = listSessions();
    expect(sessions).toHaveLength(2);
    expect(sessions[0].id).toBe(created.id);
    expect(sessions[1].id).toBe("old");
  });

  it("persists prompt and context fields when provided", () => {
    const created = createSession({
      templateId: "junior-typescript-fundamentals",
      level: "junior",
      prompt: "ROLE:\nYou are a senior frontend interviewer.",
      context: {
        stack: ["React", "TypeScript"],
        focusBoost: ["closures"],
        extraContext: "Pet project context",
        simulation: true,
        language: "en",
        timeboxedMinutes: 30,
        companyBar: "top-tier product company",
      },
    });

    const persisted = listSessions().find((session) => session.id === created.id);
    expect(persisted?.prompt).toContain("ROLE:");
    expect(persisted?.context?.stack).toEqual(["React", "TypeScript"]);
    expect(persisted?.context?.focusBoost).toEqual(["closures"]);
    expect(persisted?.context?.extraContext).toBe("Pet project context");
    expect(persisted?.context?.simulation).toBe(true);
    expect(persisted?.context?.language).toBe("en");
    expect(persisted?.context?.timeboxedMinutes).toBe(30);
    expect(persisted?.context?.companyBar).toBe("top-tier product company");
  });

  it("omits prompt and context when not provided (backward compatible)", () => {
    const created = createSession({
      templateId: "junior-react-fundamentals",
      level: "junior",
    });

    const persisted = listSessions().find((session) => session.id === created.id);
    expect(persisted).toBeDefined();
    expect(persisted).not.toHaveProperty("prompt");
    expect(persisted).not.toHaveProperty("context");
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

  it("updateSessionEvaluation stores rubric and derives aggregate score", () => {
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

    const updated = updateSessionEvaluation("abc", {
      rubric: {
        correctness: 8,
        depth: 7,
        clarity: 9,
        tradeOffs: 6,
        practicality: 10,
      },
      notes: "deep dive",
    });
    expect(updated.rubric?.correctness).toBe(8);
    expect(updated.score).toBe(8);
    expect(updated.notes).toBe("deep dive");

    const persisted = listSessions().find((session) => session.id === "abc");
    expect(persisted?.rubric).toEqual({
      correctness: 8,
      depth: 7,
      clarity: 9,
      tradeOffs: 6,
      practicality: 10,
    });
    expect(persisted?.score).toBe(8);
  });

  it("updateSessionEvaluation rejects rubrics with out-of-range axes", () => {
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

    expect(() =>
      updateSessionEvaluation("abc", {
        rubric: {
          correctness: 11,
          depth: 7,
          clarity: 9,
          tradeOffs: 6,
          practicality: 10,
        },
      }),
    ).toThrowError("Rubric values must be numbers between 0 and 10");
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
