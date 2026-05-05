import { Level } from "./types";

export const SETUP_STORAGE_KEY = "frontend_meta_prompts_setup_v1";

export type StoredSetup = {
  templateId: string;
  level: Level;
  stackInput: string;
  focusInput: string;
  extraContext: string;
  simulation: boolean;
  timebox: number;
  persistSession: boolean;
};

const VALID_LEVELS: ReadonlySet<string> = new Set<Level>(["junior", "middle", "senior"]);

const isLevel = (value: unknown): value is Level =>
  typeof value === "string" && VALID_LEVELS.has(value);

const sanitizeString = (value: unknown): string => (typeof value === "string" ? value : "");

const sanitizeBoolean = (value: unknown, fallback: boolean): boolean =>
  typeof value === "boolean" ? value : fallback;

const sanitizeFiniteNumber = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

export const readStoredSetup = (): Partial<StoredSetup> | null => {
  try {
    const raw = localStorage.getItem(SETUP_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const record = parsed as Record<string, unknown>;
    const out: Partial<StoredSetup> = {};
    if (typeof record.templateId === "string") out.templateId = record.templateId;
    if (isLevel(record.level)) out.level = record.level;
    if (typeof record.stackInput === "string") out.stackInput = record.stackInput;
    if (typeof record.focusInput === "string") out.focusInput = record.focusInput;
    if (typeof record.extraContext === "string") out.extraContext = record.extraContext;
    if (typeof record.simulation === "boolean") out.simulation = record.simulation;
    if (typeof record.timebox === "number" && Number.isFinite(record.timebox)) {
      out.timebox = record.timebox;
    }
    if (typeof record.persistSession === "boolean") out.persistSession = record.persistSession;
    return out;
  } catch {
    return null;
  }
};

export const writeStoredSetup = (setup: StoredSetup): void => {
  try {
    const safe: StoredSetup = {
      templateId: sanitizeString(setup.templateId),
      level: isLevel(setup.level) ? setup.level : "junior",
      stackInput: sanitizeString(setup.stackInput),
      focusInput: sanitizeString(setup.focusInput),
      extraContext: sanitizeString(setup.extraContext),
      simulation: sanitizeBoolean(setup.simulation, true),
      timebox: sanitizeFiniteNumber(setup.timebox, 30),
      persistSession: sanitizeBoolean(setup.persistSession, true),
    };
    localStorage.setItem(SETUP_STORAGE_KEY, JSON.stringify(safe));
  } catch {
    // Ignore quota / private-mode failures so the app stays usable.
  }
};

export const clearStoredSetup = (): void => {
  try {
    localStorage.removeItem(SETUP_STORAGE_KEY);
  } catch {
    // Ignore.
  }
};
