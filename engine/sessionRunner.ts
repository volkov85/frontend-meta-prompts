import crypto from "crypto";
import fs from "fs";
import path from "path";

export type Session = {
  id: string;
  date: string;
  templateId: string;
  level: "junior" | "middle" | "senior";
  score?: number;
  notes?: string;
};

const sessionsPath = path.resolve(process.cwd(), "data/sessions.json");

const isValidSession = (value: unknown): value is Session => {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<Session>;
  const hasValidCore =
    typeof candidate.id === "string" &&
    typeof candidate.date === "string" &&
    typeof candidate.templateId === "string" &&
    (candidate.level === "junior" || candidate.level === "middle" || candidate.level === "senior");

  const hasValidScore = candidate.score === undefined || Number.isFinite(candidate.score);
  const hasValidNotes = candidate.notes === undefined || typeof candidate.notes === "string";

  return hasValidCore && hasValidScore && hasValidNotes;
};

const validateScore = (score: number) => {
  if (!Number.isFinite(score) || score < 0 || score > 10) {
    throw new Error("Score must be a finite number between 0 and 10");
  }
};

const readSessions = (): Session[] => {
  if (!fs.existsSync(sessionsPath)) return [];

  const raw = fs.readFileSync(sessionsPath, "utf-8").trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isValidSession);
  } catch {
    // Defensive fallback: corrupted JSON should not crash the engine.
    return [];
  }
};

const writeSessions = (sessions: Session[]) => {
  const dir = path.dirname(sessionsPath);
  fs.mkdirSync(dir, { recursive: true });

  const tempPath = path.join(dir, `sessions.${process.pid}.${Date.now()}.tmp`);
  const payload = JSON.stringify(sessions, null, 2);

  fs.writeFileSync(tempPath, payload, "utf-8");
  fs.renameSync(tempPath, sessionsPath);
};

export const createSession = (
  templateId: string,
  level: "junior" | "middle" | "senior",
): Session => {
  const newSession: Session = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    templateId,
    level,
  };

  const sessions = readSessions();
  sessions.push(newSession);
  writeSessions(sessions);

  return newSession;
};

export const updateSessionScore = (sessionId: string, score: number, notes?: string) => {
  validateScore(score);

  const sessions = readSessions();
  const session = sessions.find((s) => s.id === sessionId);

  if (!session) throw new Error("Session not found");

  session.score = score;
  if (notes !== undefined) {
    session.notes = notes;
  }

  writeSessions(sessions);
};

export const listSessions = (): Session[] => {
  return readSessions().sort((a, b) => b.date.localeCompare(a.date));
};
