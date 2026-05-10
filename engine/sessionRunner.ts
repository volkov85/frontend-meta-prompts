import crypto from "crypto";
import fs from "fs";
import path from "path";
import { Level, Rubric, Session, SessionContext } from "../core";
import { computeAggregateScore, isRubric } from "../core/rubric";

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
  const hasValidRubric = candidate.rubric === undefined || isRubric(candidate.rubric);
  const hasValidNotes = candidate.notes === undefined || typeof candidate.notes === "string";
  const hasValidPrompt = candidate.prompt === undefined || typeof candidate.prompt === "string";
  const hasValidContext =
    candidate.context === undefined ||
    (typeof candidate.context === "object" && candidate.context !== null);

  return (
    hasValidCore &&
    hasValidScore &&
    hasValidRubric &&
    hasValidNotes &&
    hasValidPrompt &&
    hasValidContext
  );
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

export type CreateSessionInput = {
  templateId: string;
  level: Level;
  prompt?: string;
  context?: SessionContext;
};

export const createSession = (input: CreateSessionInput): Session => {
  const newSession: Session = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    templateId: input.templateId,
    level: input.level,
    ...(input.prompt !== undefined ? { prompt: input.prompt } : {}),
    ...(input.context !== undefined ? { context: input.context } : {}),
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

export type SessionEvaluationInput = {
  rubric?: Rubric;
  score?: number;
  notes?: string;
};

export const updateSessionEvaluation = (
  sessionId: string,
  input: SessionEvaluationInput,
): Session => {
  const sessions = readSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) throw new Error("Session not found");

  if (input.rubric !== undefined) {
    if (!isRubric(input.rubric)) {
      throw new Error("Rubric values must be numbers between 0 and 10");
    }
    session.rubric = input.rubric;
    session.score = computeAggregateScore(input.rubric);
  } else if (input.score !== undefined) {
    validateScore(input.score);
    session.score = input.score;
  }

  if (input.notes !== undefined) {
    session.notes = input.notes;
  }

  writeSessions(sessions);
  return session;
};

export const listSessions = (): Session[] => {
  return readSessions().sort((a, b) => b.date.localeCompare(a.date));
};
