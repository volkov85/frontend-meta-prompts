import { Level, Session } from "./types";

const SESSIONS_KEY = "frontend_meta_prompts_sessions_v1";

function readSessions(): Session[] {
  const raw = localStorage.getItem(SESSIONS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Session[];
  } catch {
    return [];
  }
}

function writeSessions(sessions: Session[]) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function listSessions(): Session[] {
  return readSessions().sort((a, b) => b.date.localeCompare(a.date));
}

export function createSession(templateId: string, level: Level): Session {
  const session: Session = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    templateId,
    level,
  };

  const sessions = readSessions();
  sessions.push(session);
  writeSessions(sessions);
  return session;
}

export function updateSessionScore(sessionId: string, score: number, notes?: string): Session {
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
}
