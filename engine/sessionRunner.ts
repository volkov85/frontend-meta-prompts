import fs from "fs";
import path from "path";

export type Session = {
  id: string;
  date: string;
  templateId: string;
  level: "middle" | "senior";
  score?: number;
  notes?: string;
};

const sessionsPath = path.resolve(__dirname, "../data/sessions.json");

function readSessions(): Session[] {
  if (!fs.existsSync(sessionsPath)) return [];
  const raw = fs.readFileSync(sessionsPath, "utf-8");
  return raw ? JSON.parse(raw) : [];
}

function writeSessions(sessions: Session[]) {
  fs.writeFileSync(sessionsPath, JSON.stringify(sessions, null, 2));
}

export function createSession(templateId: string, level: "middle" | "senior"): Session {
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
}

export function updateSessionScore(sessionId: string, score: number, notes?: string) {
  const sessions = readSessions();
  const session = sessions.find((s) => s.id === sessionId);

  if (!session) throw new Error("Session not found");

  session.score = score;
  session.notes = notes;

  writeSessions(sessions);
}
