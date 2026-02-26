type Level = "junior" | "middle" | "senior";

type InterviewTemplate = {
  id: string;
  title: string;
  levels: Level[];
  focus: string[];
  questionStyles: string[];
  constraints?: string[];
};

export type InterviewConfig = {
  version: string;
  defaults: {
    companyBar: string;
    stack: string[];
    language: "ru" | "en";
    followUps: number;
    include: Array<
      | "idealAnswer"
      | "commonMistakes"
      | "edgeCases"
      | "tradeOffs"
      | "seniorVsMiddle"
      | "scoringRubric"
      | "measurementPlan"
      | "rolloutPlan"
      | "securityConsiderations"
    >;
    simulation: boolean;
    timeboxedMinutes: number;
  };
  templates: InterviewTemplate[];
};

type ComposeOptions = {
  templateId: string;
  level: Level;
  stack?: string[];
  mode?: {
    simulation?: boolean;
    english?: boolean; // interview in English + correction
    timeboxedMinutes?: number;
  };
  extraContext?: string; // your project/company context (optional)
  focusBoost?: string[]; // emphasize certain topics today
};

export function composeInterviewPrompt(config: InterviewConfig, opts: ComposeOptions): string {
  const tpl = config.templates.find((t) => t.id === opts.templateId);
  if (!tpl) throw new Error(`Unknown templateId: ${opts.templateId}`);

  if (!tpl.levels.includes(opts.level)) {
    throw new Error(`Template "${tpl.id}" doesn't support level "${opts.level}"`);
  }

  const stack = opts.stack ?? config.defaults.stack;
  const simulation = opts.mode?.simulation ?? config.defaults.simulation;
  const timeboxed = opts.mode?.timeboxedMinutes ?? config.defaults.timeboxedMinutes;
  const englishMode = opts.mode?.english ?? false;

  const include = config.defaults.include;
  const followUps = config.defaults.followUps;

  const focus = [...tpl.focus, ...(opts.focusBoost ?? [])];
  const uniqFocus = Array.from(new Set(focus));

  const lines: string[] = [];

  // ROLE
  lines.push(`ROLE:`, `You are a senior frontend interviewer at a ${config.defaults.companyBar}.`);

  // CONTEXT
  lines.push(
    ``,
    `CONTEXT:`,
    `Candidate level: ${opts.level}`,
    `Stack: ${stack.join(" + ")}`,
    `Interview module: ${tpl.title}`,
    `Focus: ${uniqFocus.join(", ")}`,
    `Question styles: ${tpl.questionStyles.join(", ")}`,
  );

  if (opts.extraContext?.trim()) {
    lines.push(`Extra context: ${opts.extraContext.trim()}`);
  }

  // TASK
  lines.push(
    ``,
    `TASK:`,
    `Run a realistic interview segment. Ask 1 main question and ${followUps} follow-up questions, progressively harder.`,
  );

  // CONSTRAINTS
  const constraints = tpl.constraints ?? [];
  if (constraints.length) {
    lines.push(``, `CONSTRAINTS:`, ...constraints.map((c) => `- ${c}`));
  }

  // MODE
  lines.push(``, `MODE:`);
  lines.push(`- Timebox: ${timeboxed} minutes`);
  if (simulation) {
    lines.push(`- Simulation: DO NOT provide the answer immediately. Wait for my response.`);
  } else {
    lines.push(`- Provide both questions and ideal answers immediately.`);
  }
  if (englishMode) {
    lines.push(
      `- Conduct the interview in English and after my reply correct my English and suggest more native phrasing.`,
    );
  } else if (config.defaults.language === "ru") {
    lines.push(`- Speak Russian unless I answer in English.`);
  }

  // OUTPUT FORMAT
  lines.push(``, `OUTPUT FORMAT:`);
  lines.push(`1) Main question`);
  lines.push(`2) Follow-ups (${followUps})`);

  if (simulation) {
    lines.push(`3) Wait for my answer`);
    lines.push(`4) Evaluate my answer strictly like a real interviewer`);
  } else {
    lines.push(`3) Ideal answer (structured)`);
  }

  if (include.includes("commonMistakes")) lines.push(`- Common mistakes`);
  if (include.includes("edgeCases")) lines.push(`- Edge cases`);
  if (include.includes("tradeOffs")) lines.push(`- Trade-offs`);
  if (include.includes("seniorVsMiddle"))
    lines.push(`- What differentiates Senior vs Middle answer`);
  if (include.includes("scoringRubric")) {
    lines.push(
      `- Scoring rubric (0-10) with criteria: correctness, depth, clarity, trade-offs, practicality`,
    );
  }
  if (include.includes("measurementPlan"))
    lines.push(`- Measurement plan (what, how, success criteria)`);
  if (include.includes("rolloutPlan")) lines.push(`- Rollout plan (flags, canary, rollback)`);
  if (include.includes("securityConsiderations"))
    lines.push(`- Security considerations (when relevant)`);

  return lines.join("\n");
}
