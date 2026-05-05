import { describe, expect, it } from "vitest";
import {
  buildExportFilename,
  buildSessionsMarkdown,
  mergeSessions,
  parseSessionsImport,
  sanitizeSession,
  serializeSessionsExport,
} from "./exportSessions";
import { Session } from "./types";

const validSession: Session = {
  id: "session-1",
  date: "2026-04-01T12:00:00.000Z",
  templateId: "junior-react-fundamentals",
  level: "junior",
  score: 7,
  notes: "Solid",
  prompt: "ROLE:\nYou are a frontend interviewer.",
  context: {
    stack: ["React", "TypeScript"],
    focusBoost: ["closures"],
    extraContext: "Pet project",
    simulation: true,
    language: "en",
    timeboxedMinutes: 30,
    companyBar: "FAANG",
  },
};

describe("sanitizeSession", () => {
  it("accepts a valid session", () => {
    expect(sanitizeSession(validSession)).toEqual(validSession);
  });

  it("rejects missing required fields", () => {
    expect(sanitizeSession({})).toBeNull();
    expect(sanitizeSession({ id: "x" })).toBeNull();
    expect(sanitizeSession({ ...validSession, level: "lord" })).toBeNull();
    expect(sanitizeSession({ ...validSession, date: "not-a-date" })).toBeNull();
  });

  it("drops out-of-range scores but keeps the rest", () => {
    const result = sanitizeSession({ ...validSession, score: 99 });
    expect(result?.score).toBeUndefined();
    expect(result?.id).toBe(validSession.id);
  });

  it("drops invalid context fields and keeps valid ones", () => {
    const result = sanitizeSession({
      ...validSession,
      context: {
        stack: ["React", 5],
        focusBoost: "not-array",
        simulation: "yes",
        language: "fr",
        timeboxedMinutes: "30",
        companyBar: "EU fintech",
      },
    });
    expect(result?.context).toEqual({
      stack: ["React"],
      companyBar: "EU fintech",
    });
  });
});

describe("parseSessionsImport", () => {
  it("parses an array payload", () => {
    const payload = JSON.stringify([validSession]);
    expect(parseSessionsImport(payload)).toEqual({ sessions: [validSession], invalidCount: 0 });
  });

  it("parses a wrapped { sessions } payload", () => {
    const payload = JSON.stringify({ version: 1, sessions: [validSession] });
    expect(parseSessionsImport(payload)).toEqual({ sessions: [validSession], invalidCount: 0 });
  });

  it("counts invalid sessions instead of throwing", () => {
    const payload = JSON.stringify([validSession, { id: "x" }, null]);
    const result = parseSessionsImport(payload);
    expect(result.sessions).toEqual([validSession]);
    expect(result.invalidCount).toBe(2);
  });

  it("throws on non-JSON", () => {
    expect(() => parseSessionsImport("{not-json")).toThrow();
  });

  it("throws when payload is not array or object with sessions", () => {
    expect(() => parseSessionsImport(JSON.stringify(42))).toThrow();
    expect(() => parseSessionsImport(JSON.stringify({ foo: "bar" }))).toThrow();
  });
});

describe("mergeSessions", () => {
  it("adds new sessions and skips duplicates by id", () => {
    const existing: Session[] = [{ ...validSession }];
    const incoming: Session[] = [
      { ...validSession }, // duplicate
      { ...validSession, id: "session-2" },
    ];
    const result = mergeSessions(existing, incoming);
    expect(result).toEqual({ added: 1, skipped: 1 });
    expect(existing.map((session) => session.id)).toEqual(["session-1", "session-2"]);
  });
});

describe("serializeSessionsExport", () => {
  it("emits version, exportedAt and sessions", () => {
    const json = serializeSessionsExport([validSession]);
    const parsed: unknown = JSON.parse(json);
    expect(
      parsed && typeof parsed === "object" ? (parsed as { version: number }).version : null,
    ).toBe(1);
    expect(
      parsed &&
        typeof parsed === "object" &&
        Array.isArray((parsed as { sessions: unknown[] }).sessions),
    ).toBe(true);
  });
});

describe("buildSessionsMarkdown", () => {
  it("includes templateId, level, score, prompt and context fields", () => {
    const md = buildSessionsMarkdown([validSession]);
    expect(md).toContain("# Frontend Meta Prompts — interview history");
    expect(md).toContain("## junior-react-fundamentals — junior");
    expect(md).toContain("- **Session ID:** `session-1`");
    expect(md).toContain("- **Score:** 7");
    expect(md).toContain("- Stack: React, TypeScript");
    expect(md).toContain("- Focus: closures");
    expect(md).toContain("- Timebox: 30 min");
    expect(md).toContain("- Simulation: yes");
    expect(md).toContain("- Language: en");
    expect(md).toContain("- Company bar: FAANG");
    expect(md).toContain("ROLE:");
  });

  it("renders an empty-history report when sessions are empty", () => {
    const md = buildSessionsMarkdown([]);
    expect(md).toContain("Sessions: 0");
  });
});

describe("buildExportFilename", () => {
  it("uses ISO date prefix and the requested extension", () => {
    const filename = buildExportFilename("json");
    expect(filename).toMatch(/^frontend-meta-prompts-sessions-\d{4}-\d{2}-\d{2}\.json$/);
    expect(buildExportFilename("md")).toMatch(/\.md$/);
  });
});
