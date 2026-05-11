import { describe, expect, it } from "vitest";
import { calendarIntensityLevel, computeActivityCalendar, computeStreak } from "./streakCalendar";
import { Session } from "./types";

const makeSession = (date: string, id = `s-${date}`): Session => ({
  id,
  date,
  templateId: "react-hooks-internals",
  level: "middle",
});

const localIsoAt = (year: number, month: number, day: number, hour = 12): string => {
  // Build a date in local time then serialize to ISO. Tests treat this as the
  // "session timestamp" — what matters is that toLocaleDateKey reads its local
  // year/month/day back out unchanged.
  const date = new Date(year, month - 1, day, hour, 0, 0);
  return date.toISOString();
};

describe("computeStreak", () => {
  it("returns zeros when there are no sessions", () => {
    const summary = computeStreak([], new Date(2026, 4, 10));
    expect(summary).toEqual({ current: 0, longest: 0, totalActiveDays: 0 });
  });

  it("counts consecutive days ending today", () => {
    const today = new Date(2026, 4, 10, 9, 0, 0);
    const sessions: Session[] = [
      makeSession(localIsoAt(2026, 5, 8)),
      makeSession(localIsoAt(2026, 5, 9)),
      makeSession(localIsoAt(2026, 5, 10)),
    ];
    const summary = computeStreak(sessions, today);
    expect(summary.current).toBe(3);
    expect(summary.longest).toBe(3);
    expect(summary.totalActiveDays).toBe(3);
  });

  it("keeps the current streak alive when yesterday is active but today is not", () => {
    const today = new Date(2026, 4, 10, 9, 0, 0);
    const sessions: Session[] = [
      makeSession(localIsoAt(2026, 5, 8)),
      makeSession(localIsoAt(2026, 5, 9)),
    ];
    const summary = computeStreak(sessions, today);
    expect(summary.current).toBe(2);
    expect(summary.longest).toBe(2);
  });

  it("breaks the current streak when neither today nor yesterday has a session", () => {
    const today = new Date(2026, 4, 10, 9, 0, 0);
    const sessions: Session[] = [
      makeSession(localIsoAt(2026, 5, 5)),
      makeSession(localIsoAt(2026, 5, 6)),
      makeSession(localIsoAt(2026, 5, 7)),
    ];
    const summary = computeStreak(sessions, today);
    expect(summary.current).toBe(0);
    expect(summary.longest).toBe(3);
    expect(summary.totalActiveDays).toBe(3);
  });

  it("merges multiple sessions on the same day into one active day", () => {
    const today = new Date(2026, 4, 10, 9, 0, 0);
    const sessions: Session[] = [
      makeSession(localIsoAt(2026, 5, 10, 8), "a"),
      makeSession(localIsoAt(2026, 5, 10, 14), "b"),
      makeSession(localIsoAt(2026, 5, 10, 22), "c"),
    ];
    const summary = computeStreak(sessions, today);
    expect(summary.current).toBe(1);
    expect(summary.longest).toBe(1);
    expect(summary.totalActiveDays).toBe(1);
  });

  it("tracks longest streak independently from current", () => {
    const today = new Date(2026, 4, 10, 9, 0, 0);
    const sessions: Session[] = [
      makeSession(localIsoAt(2026, 4, 1), "a"),
      makeSession(localIsoAt(2026, 4, 2), "b"),
      makeSession(localIsoAt(2026, 4, 3), "c"),
      makeSession(localIsoAt(2026, 4, 4), "d"),
      makeSession(localIsoAt(2026, 4, 5), "e"),
      makeSession(localIsoAt(2026, 5, 10), "today"),
    ];
    const summary = computeStreak(sessions, today);
    expect(summary.current).toBe(1);
    expect(summary.longest).toBe(5);
  });

  it("ignores malformed session dates", () => {
    const today = new Date(2026, 4, 10, 9, 0, 0);
    const sessions: Session[] = [
      { ...makeSession("not-a-date"), id: "bad" },
      makeSession(localIsoAt(2026, 5, 10)),
    ];
    const summary = computeStreak(sessions, today);
    expect(summary.current).toBe(1);
    expect(summary.totalActiveDays).toBe(1);
  });
});

describe("computeActivityCalendar", () => {
  it("produces 12 weeks of 7 days by default, right-aligned to today's week", () => {
    const today = new Date(2026, 4, 10, 9, 0, 0); // Sunday
    const calendar = computeActivityCalendar([], today);
    expect(calendar.weeks).toHaveLength(12);
    for (const week of calendar.weeks) {
      expect(week.days).toHaveLength(7);
    }
    expect(calendar.weeks[calendar.weeks.length - 1].days[0].dateKey).toBe("2026-05-10");
    expect(calendar.weeks[calendar.weeks.length - 1].days[6].dateKey).toBe("2026-05-16");
  });

  it("counts sessions on the right day and tracks maxCount", () => {
    const today = new Date(2026, 4, 10, 9, 0, 0);
    const sessions: Session[] = [
      makeSession(localIsoAt(2026, 5, 10, 8), "a"),
      makeSession(localIsoAt(2026, 5, 10, 12), "b"),
      makeSession(localIsoAt(2026, 5, 9, 12), "c"),
    ];
    const calendar = computeActivityCalendar(sessions, today);
    const allCells = calendar.weeks.flatMap((week) => week.days);
    const todayCell = allCells.find((cell) => cell.dateKey === "2026-05-10");
    const yesterdayCell = allCells.find((cell) => cell.dateKey === "2026-05-09");
    expect(todayCell?.count).toBe(2);
    expect(yesterdayCell?.count).toBe(1);
    expect(calendar.maxCount).toBe(2);
    expect(calendar.totalSessions).toBe(3);
    expect(calendar.totalActiveDays).toBe(2);
  });

  it("marks future cells in the current week as isFuture", () => {
    const today = new Date(2026, 4, 6, 9, 0, 0); // Wednesday
    const calendar = computeActivityCalendar([], today);
    const lastWeek = calendar.weeks[calendar.weeks.length - 1];
    expect(lastWeek.days[3].dateKey).toBe("2026-05-06");
    expect(lastWeek.days[3].isFuture).toBe(false);
    expect(lastWeek.days[4].isFuture).toBe(true);
    expect(lastWeek.days[5].isFuture).toBe(true);
    expect(lastWeek.days[6].isFuture).toBe(true);
  });

  it("ignores sessions outside the visible range", () => {
    const today = new Date(2026, 4, 10, 9, 0, 0);
    const sessions: Session[] = [
      makeSession(localIsoAt(2020, 1, 1), "ancient"),
      makeSession(localIsoAt(2026, 5, 10), "today"),
    ];
    const calendar = computeActivityCalendar(sessions, today);
    expect(calendar.totalSessions).toBe(1);
  });
});

describe("calendarIntensityLevel", () => {
  it("returns 0 for empty days", () => {
    expect(calendarIntensityLevel(0, 5)).toBe(0);
  });

  it("scales by ratio of count to max", () => {
    expect(calendarIntensityLevel(1, 4)).toBe(1);
    expect(calendarIntensityLevel(2, 4)).toBe(2);
    expect(calendarIntensityLevel(3, 4)).toBe(3);
    expect(calendarIntensityLevel(4, 4)).toBe(4);
  });

  it("treats single-session days as max when maxCount is 1", () => {
    expect(calendarIntensityLevel(1, 1)).toBe(4);
  });
});
