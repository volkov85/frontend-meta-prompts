import { computeAggregateScore, isRubric } from "../../../core/rubric";
import { Level, Rubric, Session, SessionContext } from "./types";

const SESSIONS_KEY = "frontend_meta_prompts_sessions_v1";

const readSessions = (): Session[] => {
  const raw = localStorage.getItem(SESSIONS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Session[];
  } catch {
    return [];
  }
};

const writeSessions = (sessions: Session[]) => {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
};

export const listSessions = (): Session[] => {
  return readSessions().sort((a, b) => b.date.localeCompare(a.date));
};

export type CreateSessionInput = {
  templateId: string;
  level: Level;
  prompt?: string;
  context?: SessionContext;
};

export const createSession = (input: CreateSessionInput): Session => {
  const session: Session = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    templateId: input.templateId,
    level: input.level,
    ...(input.prompt !== undefined ? { prompt: input.prompt } : {}),
    ...(input.context !== undefined ? { context: input.context } : {}),
  };

  const sessions = readSessions();
  sessions.push(session);
  writeSessions(sessions);
  return session;
};

export const updateSessionScore = (sessionId: string, score: number, notes?: string): Session => {
  if (!Number.isFinite(score) || score < 0 || score > 10) {
    throw new Error("Score must be a number between 0 and 10");
  }

  const sessions = readSessions();
  const session = sessions.find((item) => item.id === sessionId);
  if (!session) {
    throw new Error("Session not found");
  }

  session.score = score;
  session.notes = notes ?? session.notes;
  writeSessions(sessions);
  return session;
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
  const session = sessions.find((item) => item.id === sessionId);
  if (!session) {
    throw new Error("Session not found");
  }

  if (input.rubric !== undefined) {
    if (!isRubric(input.rubric)) {
      throw new Error("Rubric values must be numbers between 0 and 10");
    }
    session.rubric = input.rubric;
    session.score = computeAggregateScore(input.rubric);
  } else if (input.score !== undefined) {
    if (!Number.isFinite(input.score) || input.score < 0 || input.score > 10) {
      throw new Error("Score must be a number between 0 and 10");
    }
    session.score = input.score;
  }

  if (input.notes !== undefined) {
    session.notes = input.notes;
  }

  writeSessions(sessions);
  return session;
};

export const clearSessions = (): void => {
  localStorage.removeItem(SESSIONS_KEY);
};

export const replaceSessions = (sessions: Session[]): void => {
  writeSessions(sessions);
};

export const readRawSessions = (): Session[] => readSessions();
