import { describe, expect, it } from "vitest";
import { collectTagPool, filterSessionsByTags, templateTags } from "./templateTags";
import { InterviewTemplate, Session } from "./types";

const template = (id: string, overrides: Partial<InterviewTemplate> = {}): InterviewTemplate => ({
  id,
  title: id.replace(/-/g, " "),
  focus: [],
  levels: ["middle"],
  questionStyles: [],
  constraints: [],
  ...overrides,
});

const session = (id: string, templateId: string): Session => ({
  id,
  date: "2026-05-10T10:00:00.000Z",
  templateId,
  level: "middle",
});

describe("templateTags", () => {
  it("tags react-hooks-internals with react + internals", () => {
    const tags = templateTags(template("react-hooks-internals"));
    expect(tags).toContain("react");
    expect(tags).toContain("internals");
  });

  it("tags js-async-concurrency with javascript + async", () => {
    const tags = templateTags(
      template("js-async-concurrency", { focus: ["promise chaining", "async/await internals"] }),
    );
    expect(tags).toContain("javascript");
    expect(tags).toContain("async");
  });

  it("tags frontend-system-design-dashboard with system-design + architecture cues", () => {
    const tags = templateTags(
      template("frontend-system-design-dashboard", {
        focus: ["data fetching", "caching", "pagination"],
      }),
    );
    expect(tags).toContain("system-design");
  });

  it("tags a11y-advanced with accessibility", () => {
    const tags = templateTags(
      template("a11y-advanced", {
        focus: ["aria patterns", "keyboard navigation"],
      }),
    );
    expect(tags).toContain("accessibility");
  });

  it("tags junior-* with fundamentals", () => {
    const tags = templateTags(
      template("junior-javascript-fundamentals", {
        focus: ["variables and scope", "basic debugging"],
      }),
    );
    expect(tags).toContain("fundamentals");
    expect(tags).toContain("javascript");
  });

  it("returns sorted unique tags", () => {
    const tags = templateTags(
      template("react-performance-profiling", {
        focus: ["profiling", "rendering", "memoization", "virtualization"],
      }),
    );
    expect(tags).toEqual([...new Set(tags)].sort());
  });
});

describe("collectTagPool", () => {
  it("returns an empty pool when no sessions exist", () => {
    expect(collectTagPool([], [template("react-hooks-internals")])).toEqual([]);
  });

  it("only includes tags from templates that have at least one session", () => {
    const templates = [
      template("react-hooks-internals"),
      template("css-architecture-design-systems"),
    ];
    const sessions = [session("s1", "react-hooks-internals")];
    const pool = collectTagPool(sessions, templates);
    expect(pool).toContain("react");
    expect(pool).not.toContain("css");
  });

  it("deduplicates tags across multiple sessions on the same template", () => {
    const templates = [template("react-hooks-internals")];
    const sessions = [session("a", "react-hooks-internals"), session("b", "react-hooks-internals")];
    const pool = collectTagPool(sessions, templates);
    expect(new Set(pool).size).toBe(pool.length);
  });
});

describe("filterSessionsByTags", () => {
  const templates = [
    template("react-hooks-internals"),
    template("css-architecture-design-systems"),
    template("a11y-advanced"),
  ];
  const sessions = [
    session("s-react", "react-hooks-internals"),
    session("s-css", "css-architecture-design-systems"),
    session("s-a11y", "a11y-advanced"),
  ];

  it("returns the full list when no tags are selected", () => {
    expect(filterSessionsByTags(sessions, templates, []).map((s) => s.id)).toEqual([
      "s-react",
      "s-css",
      "s-a11y",
    ]);
  });

  it("filters to sessions whose template matches at least one selected tag (OR)", () => {
    const filtered = filterSessionsByTags(sessions, templates, ["react"]);
    expect(filtered.map((s) => s.id)).toEqual(["s-react"]);
  });

  it("supports multi-tag selection with OR semantics", () => {
    const filtered = filterSessionsByTags(sessions, templates, ["css", "accessibility"]);
    expect(filtered.map((s) => s.id).sort()).toEqual(["s-a11y", "s-css"]);
  });

  it("ignores sessions whose templateId is not in the catalog", () => {
    const orphan = session("orphan", "nonexistent-template");
    const filtered = filterSessionsByTags([orphan, ...sessions], templates, ["react"]);
    expect(filtered.map((s) => s.id)).toEqual(["s-react"]);
  });
});
