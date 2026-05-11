import { Session } from "./types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const startOfLocalDay = (date: Date): Date => {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return copy;
};

const toLocalDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseSessionDate = (value: string): Date | null => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const buildSessionsByDay = (sessions: readonly Session[]): Map<string, number> => {
  const counts = new Map<string, number>();
  for (const session of sessions) {
    const parsed = parseSessionDate(session.date);
    if (!parsed) continue;
    const key = toLocalDateKey(parsed);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
};

const addDays = (date: Date, days: number): Date => {
  const copy = new Date(date.getTime() + days * MS_PER_DAY);
  return startOfLocalDay(copy);
};

export type StreakSummary = {
  current: number;
  longest: number;
  totalActiveDays: number;
};

export const computeStreak = (
  sessions: readonly Session[],
  now: Date = new Date(),
): StreakSummary => {
  const byDay = buildSessionsByDay(sessions);
  if (byDay.size === 0) {
    return { current: 0, longest: 0, totalActiveDays: 0 };
  }

  const activeKeys = Array.from(byDay.keys()).sort();
  const activeDates = activeKeys
    .map((key) => {
      const [year, month, day] = key.split("-").map((part) => Number(part));
      if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
      return startOfLocalDay(new Date(year, month - 1, day));
    })
    .filter((value): value is Date => value !== null);

  let longest = 0;
  let run = 0;
  let previous: Date | null = null;
  for (const date of activeDates) {
    if (previous === null) {
      run = 1;
    } else {
      const diff = Math.round((date.getTime() - previous.getTime()) / MS_PER_DAY);
      run = diff === 1 ? run + 1 : 1;
    }
    if (run > longest) longest = run;
    previous = date;
  }

  const today = startOfLocalDay(now);
  const yesterday = addDays(today, -1);
  const todayKey = toLocalDateKey(today);
  const yesterdayKey = toLocalDateKey(yesterday);

  let cursor: Date;
  if (byDay.has(todayKey)) {
    cursor = today;
  } else if (byDay.has(yesterdayKey)) {
    cursor = yesterday;
  } else {
    return { current: 0, longest, totalActiveDays: activeKeys.length };
  }

  let current = 0;
  while (byDay.has(toLocalDateKey(cursor))) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  return { current, longest, totalActiveDays: activeKeys.length };
};

export type CalendarCell = {
  dateKey: string;
  date: Date;
  count: number;
  isFuture: boolean;
};

export type CalendarWeek = {
  weekStart: Date;
  days: CalendarCell[];
};

export type ActivityCalendar = {
  weeks: CalendarWeek[];
  maxCount: number;
  totalSessions: number;
  totalActiveDays: number;
  range: { start: Date; end: Date };
};

const DEFAULT_WEEKS = 12;

export const computeActivityCalendar = (
  sessions: readonly Session[],
  now: Date = new Date(),
  weeks: number = DEFAULT_WEEKS,
): ActivityCalendar => {
  const totalWeeks = Math.max(1, Math.floor(weeks));
  const byDay = buildSessionsByDay(sessions);
  const today = startOfLocalDay(now);

  const dayOfWeek = today.getDay();
  const startOfCurrentWeek = addDays(today, -dayOfWeek);
  const startDate = addDays(startOfCurrentWeek, -(totalWeeks - 1) * 7);
  const endDate = addDays(startOfCurrentWeek, 6);

  const weeksOut: CalendarWeek[] = [];
  let maxCount = 0;
  let totalSessions = 0;
  let totalActiveDays = 0;

  for (let w = 0; w < totalWeeks; w += 1) {
    const weekStart = addDays(startDate, w * 7);
    const days: CalendarCell[] = [];
    for (let d = 0; d < 7; d += 1) {
      const date = addDays(weekStart, d);
      const key = toLocalDateKey(date);
      const count = byDay.get(key) ?? 0;
      if (count > 0) {
        totalSessions += count;
        totalActiveDays += 1;
        if (count > maxCount) maxCount = count;
      }
      days.push({
        dateKey: key,
        date,
        count,
        isFuture: date.getTime() > today.getTime(),
      });
    }
    weeksOut.push({ weekStart, days });
  }

  return {
    weeks: weeksOut,
    maxCount,
    totalSessions,
    totalActiveDays,
    range: { start: startDate, end: endDate },
  };
};

export const calendarIntensityLevel = (count: number, maxCount: number): 0 | 1 | 2 | 3 | 4 => {
  if (count <= 0) return 0;
  if (maxCount <= 1) return count > 0 ? 4 : 0;
  const ratio = count / maxCount;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
};
