import { describe, expect, it } from "vitest";
import { computeTopicHeatmap, heatmapIntensityLevel } from "./topicHeatmap";
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

const session = (id: string, templateId: string, date: Date): Session => ({
  id,
  date: date.toISOString(),
  templateId,
  level: "middle",
});

const TEMPLATES: InterviewTemplate[] = [
  template("react-hooks-internals", { focus: ["hooks rules", "closures"] }),
  template("css-architecture-design-systems", { focus: ["cascade", "tokens"] }),
  template("a11y-advanced", { focus: ["aria patterns"] }),
];

describe("computeTopicHeatmap", () => {
  it("returns 12 empty weeks when there are no sessions", () => {
    const today = new Date(2026, 4, 10, 9, 0, 0);
    const heatmap = computeTopicHeatmap([], TEMPLATES, today);
    expect(heatmap.weeks).toHaveLength(12);
    expect(heatmap.rows).toEqual([]);
    expect(heatmap.maxCount).toBe(0);
    expect(heatmap.totalSessions).toBe(0);
  });

  it("places a single session in the current week column for every matching tag", () => {
    const today = new Date(2026, 4, 10, 9, 0, 0);
    const sessions: Session[] = [
      session("react-1", "react-hooks-internals", new Date(2026, 4, 10, 12)),
    ];
    const heatmap = computeTopicHeatmap(sessions, TEMPLATES, today);
    const reactRow = heatmap.rows.find((row) => row.tag === "react");
    const internalsRow = heatmap.rows.find((row) => row.tag === "internals");

    expect(reactRow?.cells[11]).toBe(1);
    expect(internalsRow?.cells[11]).toBe(1);
    for (let i = 0; i < 11; i += 1) {
      expect(reactRow?.cells[i]).toBe(0);
    }
    expect(heatmap.totalSessions).toBe(1);
    expect(heatmap.maxCount).toBe(1);
  });

  it("groups multiple same-week sessions into one cell", () => {
    const today = new Date(2026, 4, 10, 9, 0, 0);
    const sessions: Session[] = [
      session("a", "react-hooks-internals", new Date(2026, 4, 10, 10)),
      session("b", "react-hooks-internals", new Date(2026, 4, 11, 10)),
      session("c", "react-hooks-internals", new Date(2026, 4, 12, 10)),
    ];
    const heatmap = computeTopicHeatmap(sessions, TEMPLATES, today);
    const reactRow = heatmap.rows.find((row) => row.tag === "react");
    expect(reactRow?.cells[11]).toBe(3);
    expect(heatmap.maxCount).toBe(3);
    expect(heatmap.totalSessions).toBe(3);
  });

  it("splits sessions across week columns", () => {
    const today = new Date(2026, 4, 10, 9, 0, 0); // current week starts 2026-05-10
    const previousWeek = new Date(2026, 4, 6, 12);
    const earlierWeek = new Date(2026, 4, 1, 12);
    const sessions: Session[] = [
      session("now", "react-hooks-internals", new Date(2026, 4, 10, 12)),
      session("prev", "react-hooks-internals", previousWeek),
      session("earlier", "react-hooks-internals", earlierWeek),
    ];
    const heatmap = computeTopicHeatmap(sessions, TEMPLATES, today);
    const reactRow = heatmap.rows.find((row) => row.tag === "react");
    expect(reactRow?.cells[11]).toBe(1);
    expect(reactRow?.cells[10]).toBe(1);
    expect(reactRow?.cells[9]).toBe(1);
  });

  it("ignores sessions outside the visible 12-week window", () => {
    const today = new Date(2026, 4, 10, 9, 0, 0);
    const farPast = new Date(2020, 0, 1, 12);
    const sessions: Session[] = [
      session("recent", "react-hooks-internals", new Date(2026, 4, 10, 12)),
      session("ancient", "react-hooks-internals", farPast),
    ];
    const heatmap = computeTopicHeatmap(sessions, TEMPLATES, today);
    expect(heatmap.totalSessions).toBe(1);
  });

  it("orders rows by total session count descending, then by tag alphabetically", () => {
    const today = new Date(2026, 4, 10, 9, 0, 0);
    const sessions: Session[] = [
      session("css1", "css-architecture-design-systems", new Date(2026, 4, 10, 12)),
      session("css2", "css-architecture-design-systems", new Date(2026, 4, 11, 12)),
      session("a11y", "a11y-advanced", new Date(2026, 4, 10, 12)),
    ];
    const heatmap = computeTopicHeatmap(sessions, TEMPLATES, today);
    const tags = heatmap.rows.map((row) => row.tag);
    // css has 2 sessions, architecture has 2 sessions (from css template), a11y/accessibility 1 each
    expect(tags[0]).toMatch(/^(architecture|css)$/);
    expect(tags[tags.length - 1]).toBe("accessibility");
  });

  it("ignores sessions with malformed dates or unknown templates", () => {
    const today = new Date(2026, 4, 10, 9, 0, 0);
    const sessions: Session[] = [
      { ...session("bad", "react-hooks-internals", new Date()), date: "not-a-date" },
      session("orphan", "nonexistent-template", new Date(2026, 4, 10, 12)),
      session("good", "react-hooks-internals", new Date(2026, 4, 10, 12)),
    ];
    const heatmap = computeTopicHeatmap(sessions, TEMPLATES, today);
    expect(heatmap.totalSessions).toBe(1);
  });
});

describe("heatmapIntensityLevel", () => {
  it("returns 0 for empty cells", () => {
    expect(heatmapIntensityLevel(0, 5)).toBe(0);
  });

  it("scales by ratio of count to max", () => {
    expect(heatmapIntensityLevel(1, 4)).toBe(1);
    expect(heatmapIntensityLevel(2, 4)).toBe(2);
    expect(heatmapIntensityLevel(3, 4)).toBe(3);
    expect(heatmapIntensityLevel(4, 4)).toBe(4);
  });

  it("treats single-session weeks as max when maxCount is 1", () => {
    expect(heatmapIntensityLevel(1, 1)).toBe(4);
  });
});
