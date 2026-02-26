import interviews from "./data/interviews.json";
import {
  composeInterviewPrompt,
  createSession,
  InterviewConfig,
  updateSessionScore,
} from "./engine";

type SessionLevel = "junior" | "middle" | "senior";

type CliOptions = {
  templateId: string;
  level: SessionLevel;
  notes?: string;
  stack?: string[];
  focusBoost?: string[];
  extraContext?: string;
  simulation?: boolean;
  english?: boolean;
  timeboxedMinutes?: number;
  listTemplates?: boolean;
  help?: boolean;
  persistSession: boolean;
  recordEval?: boolean;
  sessionId?: string;
  score?: number;
};

const DEFAULT_TEMPLATE_ID = "js-deep-dive-core";
const DEFAULT_LEVEL: SessionLevel = "senior";

function parseBoolean(value: string, flag: string): boolean {
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`${flag} must be either true or false`);
}

function parseCsv(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseLevel(value: string): SessionLevel {
  if (value === "junior" || value === "middle" || value === "senior") return value;
  throw new Error("--level must be one of: junior, middle, senior");
}

function parseScore(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 10) {
    throw new Error("--score must be a number between 0 and 10");
  }
  return parsed;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    templateId: DEFAULT_TEMPLATE_ID,
    level: DEFAULT_LEVEL,
    persistSession: true,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    if (arg === "--list-templates") {
      options.listTemplates = true;
      continue;
    }

    if (arg === "--english") {
      options.english = true;
      continue;
    }

    if (arg === "--record-eval") {
      options.recordEval = true;
      continue;
    }

    if (arg === "--no-session") {
      options.persistSession = false;
      continue;
    }

    const next = argv[i + 1];
    if (!next) {
      throw new Error(`Missing value for ${arg}`);
    }

    if (arg === "--template") {
      options.templateId = next;
      i += 1;
      continue;
    }

    if (arg === "--level") {
      options.level = parseLevel(next);
      i += 1;
      continue;
    }

    if (arg === "--notes") {
      options.notes = next;
      i += 1;
      continue;
    }

    if (arg === "--stack") {
      options.stack = parseCsv(next);
      i += 1;
      continue;
    }

    if (arg === "--focus") {
      options.focusBoost = parseCsv(next);
      i += 1;
      continue;
    }

    if (arg === "--extra") {
      options.extraContext = next;
      i += 1;
      continue;
    }

    if (arg === "--simulation") {
      options.simulation = parseBoolean(next, "--simulation");
      i += 1;
      continue;
    }

    if (arg === "--timebox") {
      const parsed = Number(next);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error("--timebox must be a positive number");
      }
      options.timeboxedMinutes = parsed;
      i += 1;
      continue;
    }

    if (arg === "--session-id") {
      options.sessionId = next;
      i += 1;
      continue;
    }

    if (arg === "--score") {
      options.score = parseScore(next);
      i += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function printHelp() {
  console.log(`Frontend Meta Prompts CLI

Usage:
  npm run interview -- [options]

Modes:
  1) Generate interview prompt + create session
  2) Record evaluation for an existing session (--record-eval)

Options:
  --template <id>         Interview template id (default: ${DEFAULT_TEMPLATE_ID})
  --level <junior|middle|senior> Candidate level (default: ${DEFAULT_LEVEL})
  --stack <a,b,c>         Override stack list
  --focus <a,b,c>         Add extra focus topics
  --extra <text>          Extra context for interview prompt
  --simulation <bool>     Override simulation mode (true/false)
  --timebox <minutes>     Override timebox minutes
  --english               Conduct interview in English mode
  --no-session            Do not create session in generate mode
  --session-id <id>       Session id for score update
  --score <0..10>         Score from external LLM/interviewer
  --notes <text>          Notes for evaluation
  --record-eval           Update existing session and exit
  --list-templates        Print available templates
  -h, --help              Show help

Examples:
  npm run interview -- --template js-deep-dive-core --level senior
  npm run interview -- --record-eval --session-id <id> --score 8.5 --notes "Strong trade-offs"
  npm run interview -- --list-templates`);
}

function listTemplates(config: InterviewConfig) {
  console.log("Available templates:");
  for (const template of config.templates) {
    console.log(`- ${template.id} [${template.levels.join(", ")}]`);
  }
}

function assertTemplateSupportsLevel(config: InterviewConfig, templateId: string, level: SessionLevel) {
  const template = config.templates.find((item) => item.id === templateId);
  if (!template) {
    throw new Error(`Unknown templateId: ${templateId}`);
  }

  if (!template.levels.includes(level)) {
    throw new Error(`Template \"${templateId}\" does not support level \"${level}\"`);
  }
}

function runRecordEvalMode(options: CliOptions) {
  if (!options.sessionId) {
    throw new Error("--record-eval requires --session-id");
  }
  if (options.score === undefined) {
    throw new Error("--record-eval requires --score");
  }

  updateSessionScore(options.sessionId, options.score, options.notes);
  console.log(`Evaluation saved for session: ${options.sessionId}`);
}

function main() {
  const config = interviews as InterviewConfig;
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  if (options.listTemplates) {
    listTemplates(config);
    return;
  }

  if (options.recordEval) {
    runRecordEvalMode(options);
    return;
  }

  assertTemplateSupportsLevel(config, options.templateId, options.level);

  const prompt = composeInterviewPrompt(config, {
    templateId: options.templateId,
    level: options.level,
    stack: options.stack,
    focusBoost: options.focusBoost,
    extraContext: options.extraContext,
    mode: {
      simulation: options.simulation,
      english: options.english,
      timeboxedMinutes: options.timeboxedMinutes,
    },
  });

  let sessionId: string | null = null;
  if (options.persistSession) {
    const session = createSession(options.templateId, options.level);
    sessionId = session.id;
    console.log(`Session created: ${session.id}`);
  }

  console.log("\n=== Interview Prompt ===\n");
  console.log(prompt);

  if (options.score === undefined) {
    return;
  }

  const targetSessionId = options.sessionId ?? sessionId;
  if (!targetSessionId) {
    throw new Error("Cannot save score: use --session-id or enable session creation");
  }

  updateSessionScore(targetSessionId, options.score, options.notes);
  console.log(`\nEvaluation saved for session: ${targetSessionId}`);
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`CLI error: ${message}`);
  process.exit(1);
}
