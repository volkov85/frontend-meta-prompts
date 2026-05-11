import { InterviewTemplate, Session } from "./types";

const TAG_PATTERNS: Record<string, RegExp[]> = {
  javascript: [/\bjs[-_ ]/i, /^js$/i, /\bjavascript\b/i],
  typescript: [/\btypescript\b/i, /\bts[-_ ]/i],
  react: [/\breact\b/i, /\bhooks?\b/i, /\bjsx\b/i],
  performance: [
    /\bperformance\b/i,
    /\bprofiling\b/i,
    /\bweb[- ]vitals\b/i,
    /\bbundle\b/i,
    /\bbundling\b/i,
    /\boptimi[sz]ation\b/i,
  ],
  architecture: [
    /\barchitecture\b/i,
    /\bdesign[- ]system\b/i,
    /\bdesign[- ]review\b/i,
    /\bcomposition\b/i,
  ],
  "system-design": [/\bsystem[- ]design\b/i, /\bdashboard\b/i, /\bscalab/i],
  algorithms: [/\balgorithm/i, /\bdata[- ]structure/i, /\bcomplexity\b/i],
  internals: [/\binternals?\b/i, /\bdeep[- ]dive\b/i, /\bevent[- ]loop\b/i],
  async: [/\basync\b/i, /\bconcurrency\b/i, /\bpromise/i, /\babort[- ]controller\b/i],
  "web-platform": [
    /\bweb[- ]platform\b/i,
    /\bdom\b/i,
    /\bservice[- ]worker\b/i,
    /\bindexed[- ]?db\b/i,
  ],
  security: [/\bsecurity\b/i, /\bxss\b/i, /\bcsrf\b/i, /\bcsp\b/i, /\bcookie\b/i],
  accessibility: [/\ba11y\b/i, /\baccessibility\b/i, /\baria\b/i, /\bscreen[- ]reader\b/i],
  css: [/\bcss\b/i, /\bstyling\b/i, /\bcascade\b/i],
  testing: [/\btesting\b/i, /\btest[- ]pyramid\b/i, /\bmocking\b/i, /\bflakiness\b/i],
  tooling: [/\btooling\b/i, /\bbuild\b/i, /\btree[- ]shak/i, /\bcode[- ]splitting\b/i],
  observability: [/\bobservability\b/i, /\blogging\b/i, /\btracing\b/i, /\bmonitoring\b/i],
  ssr: [/\bssr\b/i, /\bhydration\b/i, /\bssg\b/i, /\bserver[- ]side\b/i],
  behavioral: [
    /\bbehavioral\b/i,
    /\bleadership\b/i,
    /\bmentor/i,
    /\bconflict\b/i,
    /\bcommunication\b/i,
  ],
  i18n: [/\bi18n\b/i, /\bl10n\b/i, /\blocalization\b/i, /\binternationalization\b/i],
  networking: [/\bnetworking\b/i, /\bhttp\b/i, /\bcontract[- ]test/i, /\bretry\b/i],
  debugging: [/\bdebug/i, /\bincident\b/i, /\bproduction\b/i, /\btriage\b/i, /\bpostmortem\b/i],
  pwa: [/\bpwa\b/i, /\boffline\b/i, /\bservice[- ]worker\b/i, /\bmanifest\b/i],
  state: [/\bstate\b/i, /\bredux\b/i, /\bzustand\b/i, /\brecoil\b/i],
  fundamentals: [/\bjunior\b/i, /\bfundamentals\b/i, /\bbasics\b/i],
};

const templateSearchText = (template: InterviewTemplate): string => {
  const parts: string[] = [template.id, template.title ?? "", template.focus?.join(" ") ?? ""];
  return parts.join(" ");
};

export const templateTags = (template: InterviewTemplate): string[] => {
  const haystack = templateSearchText(template);
  const matched = new Set<string>();
  for (const [tag, patterns] of Object.entries(TAG_PATTERNS)) {
    if (patterns.some((pattern) => pattern.test(haystack))) {
      matched.add(tag);
    }
  }
  return Array.from(matched).sort();
};

export const collectTagPool = (
  sessions: readonly Session[],
  templates: readonly InterviewTemplate[],
): string[] => {
  if (sessions.length === 0 || templates.length === 0) return [];
  const seenTemplateIds = new Set(sessions.map((session) => session.templateId));
  const pool = new Set<string>();
  for (const template of templates) {
    if (!seenTemplateIds.has(template.id)) continue;
    for (const tag of templateTags(template)) {
      pool.add(tag);
    }
  }
  return Array.from(pool).sort();
};

export const filterSessionsByTags = (
  sessions: readonly Session[],
  templates: readonly InterviewTemplate[],
  selectedTags: readonly string[],
): Session[] => {
  if (selectedTags.length === 0) return [...sessions];
  const templateTagIndex = new Map<string, Set<string>>();
  for (const template of templates) {
    templateTagIndex.set(template.id, new Set(templateTags(template)));
  }
  const wanted = new Set(selectedTags);
  return sessions.filter((session) => {
    const tags = templateTagIndex.get(session.templateId);
    if (!tags) return false;
    for (const tag of wanted) {
      if (tags.has(tag)) return true;
    }
    return false;
  });
};
