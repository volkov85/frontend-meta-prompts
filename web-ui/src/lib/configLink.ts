import { InterviewLanguage, Level } from "./types";

const VALID_LEVELS: ReadonlySet<string> = new Set<Level>(["junior", "middle", "senior"]);
const VALID_LANGS: ReadonlySet<string> = new Set<InterviewLanguage>(["en", "ru"]);

const TIMEBOX_MIN = 1;
const TIMEBOX_MAX = 600;

const SHARE_PARAM_KEYS = [
  "template",
  "level",
  "stack",
  "focus",
  "extra",
  "simulation",
  "timebox",
  "lang",
] as const;

export type ShareableConfig = {
  templateId: string;
  level: Level;
  stackInput: string;
  focusInput: string;
  extraContext: string;
  simulation: boolean;
  timebox: number;
  language: InterviewLanguage;
};

const parseBooleanParam = (value: string | null): boolean | undefined => {
  if (value === null) return undefined;
  const normalized = value.toLowerCase();
  if (normalized === "1" || normalized === "true" || normalized === "yes") return true;
  if (normalized === "0" || normalized === "false" || normalized === "no") return false;
  return undefined;
};

const parseFiniteIntegerParam = (value: string | null): number | undefined => {
  if (value === null) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.trunc(parsed);
};

/**
 * Build a shareable URL containing the current interview setup as query
 * parameters. The base URL determines origin/path; only the search part is
 * rewritten.
 */
export const encodeConfigToUrl = (base: string, config: ShareableConfig): string => {
  const url = new URL(base);
  url.search = "";
  const sp = url.searchParams;
  if (config.templateId) sp.set("template", config.templateId);
  if (config.level) sp.set("level", config.level);
  if (config.stackInput.trim()) sp.set("stack", config.stackInput);
  if (config.focusInput.trim()) sp.set("focus", config.focusInput);
  if (config.extraContext.trim()) sp.set("extra", config.extraContext);
  sp.set("simulation", config.simulation ? "1" : "0");
  if (Number.isFinite(config.timebox)) sp.set("timebox", String(Math.trunc(config.timebox)));
  if (config.language) sp.set("lang", config.language);
  return url.toString();
};

/**
 * Extract a partial setup from URL search parameters with strict per-field
 * validation. Unknown / malformed values are silently dropped — callers fall
 * back to their existing defaults for any field not returned here.
 */
export const parseConfigFromUrl = (searchParams: URLSearchParams): Partial<ShareableConfig> => {
  const out: Partial<ShareableConfig> = {};

  const template = searchParams.get("template");
  if (template) out.templateId = template;

  const level = searchParams.get("level");
  if (level && VALID_LEVELS.has(level)) out.level = level as Level;

  const stack = searchParams.get("stack");
  if (stack !== null) out.stackInput = stack;

  const focus = searchParams.get("focus");
  if (focus !== null) out.focusInput = focus;

  const extra = searchParams.get("extra");
  if (extra !== null) out.extraContext = extra;

  const simulation = parseBooleanParam(searchParams.get("simulation"));
  if (simulation !== undefined) out.simulation = simulation;

  const timebox = parseFiniteIntegerParam(searchParams.get("timebox"));
  if (timebox !== undefined && timebox >= TIMEBOX_MIN && timebox <= TIMEBOX_MAX) {
    out.timebox = timebox;
  }

  const lang = searchParams.get("lang");
  if (lang && VALID_LANGS.has(lang)) out.language = lang as InterviewLanguage;

  return out;
};

/** Whether the URL carries any of our shareable config params. */
export const hasShareableParams = (searchParams: URLSearchParams): boolean =>
  SHARE_PARAM_KEYS.some((key) => searchParams.has(key));

/** Strip our shareable config params from a URL while keeping the rest intact. */
export const stripShareableParams = (base: string): string => {
  const url = new URL(base);
  for (const key of SHARE_PARAM_KEYS) {
    url.searchParams.delete(key);
  }
  return url.toString();
};
