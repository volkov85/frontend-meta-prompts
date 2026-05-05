import { Level, Session, SessionContext } from "./types";

export const SESSIONS_EXPORT_VERSION = 1;

export type SessionsExport = {
  version: typeof SESSIONS_EXPORT_VERSION;
  exportedAt: string;
  sessions: Session[];
};

const VALID_LEVELS: ReadonlySet<string> = new Set<Level>(["junior", "middle", "senior"]);
const VALID_LANGUAGES: ReadonlySet<string> = new Set(["en", "ru"]);

const isString = (value: unknown): value is string => typeof value === "string";
const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const sanitizeStringArray = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const out = value.filter(isString);
  return out.length === value.length ? out : out;
};

const sanitizeContext = (raw: unknown): SessionContext | undefined => {
  if (!raw || typeof raw !== "object") return undefined;
  const record = raw as Record<string, unknown>;
  const out: SessionContext = {};
  const stack = sanitizeStringArray(record.stack);
  if (stack) out.stack = stack;
  const focusBoost = sanitizeStringArray(record.focusBoost);
  if (focusBoost) out.focusBoost = focusBoost;
  if (isString(record.extraContext)) out.extraContext = record.extraContext;
  if (typeof record.simulation === "boolean") out.simulation = record.simulation;
  if (isString(record.language) && VALID_LANGUAGES.has(record.language)) {
    out.language = record.language as SessionContext["language"];
  }
  if (isFiniteNumber(record.timeboxedMinutes)) out.timeboxedMinutes = record.timeboxedMinutes;
  if (isString(record.companyBar)) out.companyBar = record.companyBar;
  return out;
};

export const sanitizeSession = (raw: unknown): Session | null => {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  if (!isString(record.id) || record.id.length === 0) return null;
  if (!isString(record.date) || Number.isNaN(Date.parse(record.date))) return null;
  if (!isString(record.templateId) || record.templateId.length === 0) return null;
  if (!isString(record.level) || !VALID_LEVELS.has(record.level)) return null;

  const session: Session = {
    id: record.id,
    date: record.date,
    templateId: record.templateId,
    level: record.level as Level,
  };
  if (isFiniteNumber(record.score) && record.score >= 0 && record.score <= 10) {
    session.score = record.score;
  }
  if (isString(record.notes)) session.notes = record.notes;
  if (isString(record.prompt)) session.prompt = record.prompt;
  const context = sanitizeContext(record.context);
  if (context && Object.keys(context).length > 0) session.context = context;
  return session;
};

export const buildSessionsExport = (sessions: Session[]): SessionsExport => ({
  version: SESSIONS_EXPORT_VERSION,
  exportedAt: new Date().toISOString(),
  sessions,
});

export const serializeSessionsExport = (sessions: Session[]): string =>
  JSON.stringify(buildSessionsExport(sessions), null, 2);

export type ParsedSessionsImport = {
  sessions: Session[];
  invalidCount: number;
};

export const parseSessionsImport = (text: string): ParsedSessionsImport => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new Error(
      `Could not parse JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  let rawSessions: unknown;
  if (Array.isArray(parsed)) {
    rawSessions = parsed;
  } else if (
    parsed &&
    typeof parsed === "object" &&
    Array.isArray((parsed as { sessions?: unknown }).sessions)
  ) {
    rawSessions = (parsed as { sessions: unknown[] }).sessions;
  } else {
    throw new Error("Expected an array of sessions or an object with a `sessions` array.");
  }

  const sessions: Session[] = [];
  let invalidCount = 0;
  for (const item of rawSessions as unknown[]) {
    const session = sanitizeSession(item);
    if (session) {
      sessions.push(session);
    } else {
      invalidCount += 1;
    }
  }

  return { sessions, invalidCount };
};

export type MergeResult = {
  added: number;
  skipped: number;
};

export const mergeSessions = (existing: Session[], incoming: Session[]): MergeResult => {
  const existingIds = new Set(existing.map((session) => session.id));
  let added = 0;
  let skipped = 0;
  for (const session of incoming) {
    if (existingIds.has(session.id)) {
      skipped += 1;
      continue;
    }
    existing.push(session);
    existingIds.add(session.id);
    added += 1;
  }
  return { added, skipped };
};

const escapeMarkdownText = (text: string): string =>
  text.replace(/\r\n/g, "\n").replace(/[`]/g, "\u200b`");

export const buildSessionsMarkdown = (sessions: Session[]): string => {
  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
  const header = "# Frontend Meta Prompts — interview history\n";
  const exportedAt = `_Exported: ${new Date().toISOString()}_\n`;
  const summary = `Sessions: ${sorted.length}\n`;

  if (sorted.length === 0) {
    return `${header}\n${exportedAt}\n${summary}\n`;
  }

  const sections = sorted.map((session) => buildSessionMarkdown(session)).join("\n\n---\n\n");
  return `${header}\n${exportedAt}\n${summary}\n${sections}\n`;
};

const buildSessionMarkdown = (session: Session): string => {
  const lines: string[] = [];
  const dateLabel = session.date;
  lines.push(`## ${session.templateId} — ${session.level}`);
  lines.push("");
  lines.push(`- **Session ID:** \`${session.id}\``);
  lines.push(`- **Date:** ${dateLabel}`);
  lines.push(`- **Score:** ${session.score === undefined ? "not rated" : session.score}`);
  if (session.notes) {
    lines.push(`- **Notes:** ${escapeMarkdownText(session.notes)}`);
  }

  if (session.context) {
    const ctx = session.context;
    lines.push("");
    lines.push("**Context**");
    if (ctx.stack && ctx.stack.length > 0) lines.push(`- Stack: ${ctx.stack.join(", ")}`);
    if (ctx.focusBoost && ctx.focusBoost.length > 0)
      lines.push(`- Focus: ${ctx.focusBoost.join(", ")}`);
    if (ctx.extraContext) lines.push(`- Extra context: ${escapeMarkdownText(ctx.extraContext)}`);
    if (ctx.timeboxedMinutes !== undefined) lines.push(`- Timebox: ${ctx.timeboxedMinutes} min`);
    if (ctx.simulation !== undefined) lines.push(`- Simulation: ${ctx.simulation ? "yes" : "no"}`);
    if (ctx.language) lines.push(`- Language: ${ctx.language}`);
    if (ctx.companyBar) lines.push(`- Company bar: ${ctx.companyBar}`);
  }

  if (session.prompt) {
    lines.push("");
    lines.push("<details><summary>Prompt</summary>");
    lines.push("");
    lines.push("```text");
    lines.push(escapeMarkdownText(session.prompt));
    lines.push("```");
    lines.push("");
    lines.push("</details>");
  }

  return lines.join("\n");
};

export const buildExportFilename = (extension: "json" | "md"): string => {
  const today = new Date().toISOString().slice(0, 10);
  return `frontend-meta-prompts-sessions-${today}.${extension}`;
};
