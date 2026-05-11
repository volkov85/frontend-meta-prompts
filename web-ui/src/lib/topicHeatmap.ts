import { collectTagPool, templateTags } from "./templateTags";
import { InterviewTemplate, Session } from "./types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const startOfLocalDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number): Date =>
  startOfLocalDay(new Date(date.getTime() + days * MS_PER_DAY));

const parseSessionDate = (value: string): Date | null => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export type HeatmapWeek = {
  weekStart: Date;
  weekEnd: Date;
};

export type HeatmapRow = {
  tag: string;
  cells: number[];
  total: number;
};

export type TopicHeatmap = {
  weeks: HeatmapWeek[];
  rows: HeatmapRow[];
  maxCount: number;
  totalSessions: number;
};

const DEFAULT_WEEKS = 12;

export const computeTopicHeatmap = (
  sessions: readonly Session[],
  templates: readonly InterviewTemplate[],
  now: Date = new Date(),
  weeks: number = DEFAULT_WEEKS,
): TopicHeatmap => {
  const totalWeeks = Math.max(1, Math.floor(weeks));
  const today = startOfLocalDay(now);
  const startOfCurrentWeek = addDays(today, -today.getDay());
  const firstWeekStart = addDays(startOfCurrentWeek, -(totalWeeks - 1) * 7);

  const weekColumns: HeatmapWeek[] = [];
  for (let w = 0; w < totalWeeks; w += 1) {
    const weekStart = addDays(firstWeekStart, w * 7);
    weekColumns.push({ weekStart, weekEnd: addDays(weekStart, 7) });
  }

  const tagPool = collectTagPool(sessions, templates);
  if (tagPool.length === 0) {
    return { weeks: weekColumns, rows: [], maxCount: 0, totalSessions: 0 };
  }

  const templateTagIndex = new Map<string, string[]>();
  for (const template of templates) {
    templateTagIndex.set(template.id, templateTags(template));
  }

  const rowMap = new Map<string, number[]>();
  for (const tag of tagPool) {
    rowMap.set(
      tag,
      Array.from({ length: totalWeeks }, () => 0),
    );
  }

  let maxCount = 0;
  let totalSessions = 0;

  for (const session of sessions) {
    const date = parseSessionDate(session.date);
    if (!date) continue;
    const tags = templateTagIndex.get(session.templateId);
    if (!tags || tags.length === 0) continue;

    let weekIndex = -1;
    for (let w = 0; w < weekColumns.length; w += 1) {
      const { weekStart, weekEnd } = weekColumns[w];
      if (date.getTime() >= weekStart.getTime() && date.getTime() < weekEnd.getTime()) {
        weekIndex = w;
        break;
      }
    }
    if (weekIndex === -1) continue;

    totalSessions += 1;
    for (const tag of tags) {
      const row = rowMap.get(tag);
      if (!row) continue;
      row[weekIndex] += 1;
      if (row[weekIndex] > maxCount) maxCount = row[weekIndex];
    }
  }

  const rows: HeatmapRow[] = tagPool.map((tag) => {
    const cells = rowMap.get(tag) ?? Array.from({ length: totalWeeks }, () => 0);
    const total = cells.reduce((sum, value) => sum + value, 0);
    return { tag, cells, total };
  });

  rows.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    return a.tag.localeCompare(b.tag);
  });

  return { weeks: weekColumns, rows, maxCount, totalSessions };
};

export const heatmapIntensityLevel = (count: number, maxCount: number): 0 | 1 | 2 | 3 | 4 => {
  if (count <= 0) return 0;
  if (maxCount <= 1) return 4;
  const ratio = count / maxCount;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
};
