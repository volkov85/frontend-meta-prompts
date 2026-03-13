import { ComposeInterviewPromptOptions, InterviewConfig } from "./types";

export const composeInterviewPrompt = (
  config: InterviewConfig,
  opts: ComposeInterviewPromptOptions,
): string => {
  const tpl = config.templates.find((template) => template.id === opts.templateId);
  if (!tpl) throw new Error(`Unknown templateId: ${opts.templateId}`);

  if (!tpl.levels.includes(opts.level)) {
    throw new Error(`Template "${tpl.id}" doesn't support level "${opts.level}"`);
  }

  const stack = opts.stack ?? config.defaults.stack;
  const simulation = opts.mode?.simulation ?? config.defaults.simulation;
  const timeboxed = opts.mode?.timeboxedMinutes ?? config.defaults.timeboxedMinutes;
  const promptLanguage =
    opts.mode?.language ??
    (opts.mode?.english === undefined ? config.defaults.language : opts.mode.english ? "en" : "ru");
  const isEnglish = promptLanguage === "en";

  const followUps = tpl.promptOverrides?.followUps ?? config.defaults.followUps;
  const include = tpl.promptOverrides?.include ?? config.defaults.include;
  const plainLanguage = tpl.promptOverrides?.plainLanguage ?? false;

  const focus = [...tpl.focus, ...(opts.focusBoost ?? [])];
  const uniqFocus = Array.from(new Set(focus));
  const levelText = isEnglish
    ? opts.level
    : opts.level === "junior"
      ? "джун"
      : opts.level === "middle"
        ? "мидл"
        : "сеньор";

  const lines: string[] = [];

  lines.push(
    isEnglish ? "ROLE:" : "РОЛЬ:",
    isEnglish
      ? `You are a senior frontend interviewer at a ${config.defaults.companyBar}.`
      : `Ты senior frontend интервьюер в ${config.defaults.companyBar}.`,
  );

  lines.push(
    "",
    isEnglish ? "CONTEXT:" : "КОНТЕКСТ:",
    isEnglish ? `Candidate level: ${levelText}` : `Уровень кандидата: ${levelText}`,
    isEnglish ? `Stack: ${stack.join(" + ")}` : `Стек: ${stack.join(" + ")}`,
    isEnglish ? `Interview module: ${tpl.title}` : `Модуль интервью: ${tpl.title}`,
    isEnglish ? `Focus: ${uniqFocus.join(", ")}` : `Фокус: ${uniqFocus.join(", ")}`,
    isEnglish
      ? `Question styles: ${tpl.questionStyles.join(", ")}`
      : `Формат вопросов: ${tpl.questionStyles.join(", ")}`,
  );

  if (opts.extraContext?.trim()) {
    lines.push(
      isEnglish
        ? `Extra context: ${opts.extraContext.trim()}`
        : `Доп. контекст: ${opts.extraContext.trim()}`,
    );
  }

  lines.push(
    "",
    isEnglish ? "TASK:" : "ЗАДАЧА:",
    isEnglish
      ? `Run a realistic interview segment. Ask 1 main question and ${followUps} follow-up questions, progressively harder.`
      : `Проведи реалистичный сегмент интервью. Задай 1 основной вопрос и ${followUps} уточняющих вопроса с нарастающей сложностью.`,
  );

  const constraints = tpl.constraints ?? [];
  if (constraints.length) {
    lines.push(
      "",
      isEnglish ? "CONSTRAINTS:" : "ОГРАНИЧЕНИЯ:",
      ...constraints.map((constraint) => `- ${constraint}`),
    );
  }

  lines.push("", isEnglish ? "MODE:" : "РЕЖИМ:");
  lines.push(isEnglish ? `- Timebox: ${timeboxed} minutes` : `- Таймбокс: ${timeboxed} минут`);
  if (simulation) {
    lines.push(
      isEnglish
        ? "- Simulation: DO NOT provide the answer immediately. Wait for my response."
        : "- Симуляция: НЕ давай ответ сразу. Дождись моего ответа.",
    );
  } else {
    lines.push(
      isEnglish
        ? "- Provide both questions and ideal answers immediately."
        : "- Сразу дай и вопросы, и идеальные ответы.",
    );
  }

  if (isEnglish) {
    lines.push(
      "- Conduct the interview in English and after my reply correct my English and suggest more native phrasing.",
    );
  } else {
    lines.push("- Веди интервью на русском, если я не отвечаю на английском.");
  }

  if (plainLanguage) {
    lines.push(
      isEnglish
        ? "- Use plain language, short sentences, and avoid heavy jargon."
        : "- Используй простой язык, короткие предложения и избегай тяжёлого жаргона.",
    );
    lines.push(
      isEnglish
        ? "- Briefly explain terms before using them in follow-up questions."
        : "- Кратко объясняй термины перед тем, как использовать их в уточняющих вопросах.",
    );
  }

  lines.push("", isEnglish ? "OUTPUT FORMAT:" : "ФОРМАТ ОТВЕТА:");
  lines.push(isEnglish ? "1) Main question" : "1) Основной вопрос");
  lines.push(isEnglish ? `2) Follow-ups (${followUps})` : `2) Уточняющие вопросы (${followUps})`);

  if (simulation) {
    lines.push(isEnglish ? "3) Wait for my answer" : "3) Дождись моего ответа");
    lines.push(
      isEnglish
        ? "4) Evaluate my answer strictly like a real interviewer"
        : "4) Строго оцени мой ответ как реальный интервьюер",
    );
  } else {
    lines.push(isEnglish ? "3) Ideal answer (structured)" : "3) Идеальный ответ (структурно)");
  }

  if (include.includes("commonMistakes")) {
    lines.push(isEnglish ? "- Common mistakes" : "- Частые ошибки");
  }
  if (include.includes("edgeCases")) {
    lines.push(isEnglish ? "- Edge cases" : "- Пограничные случаи");
  }
  if (include.includes("tradeOffs")) {
    lines.push(isEnglish ? "- Trade-offs" : "- Компромиссы");
  }
  if (include.includes("seniorVsMiddle")) {
    lines.push(
      isEnglish
        ? "- What differentiates Senior vs Middle answer"
        : "- Чем отличается ответ Senior от Middle",
    );
  }
  if (include.includes("scoringRubric")) {
    lines.push(
      isEnglish
        ? "- Scoring rubric (0-10) with criteria: correctness, depth, clarity, trade-offs, practicality"
        : "- Шкала оценки (0-10) с критериями: корректность, глубина, ясность, компромиссы, практичность",
    );
  }
  if (include.includes("measurementPlan")) {
    lines.push(
      isEnglish
        ? "- Measurement plan (what, how, success criteria)"
        : "- План измерений (что, как, критерии успеха)",
    );
  }
  if (include.includes("rolloutPlan")) {
    lines.push(
      isEnglish
        ? "- Rollout plan (flags, canary, rollback)"
        : "- План выката (флаги, канарейка, откат)",
    );
  }
  if (include.includes("securityConsiderations")) {
    lines.push(
      isEnglish
        ? "- Security considerations (when relevant)"
        : "- Аспекты безопасности (когда релевантно)",
    );
  }

  const goodAnswerCriteria = tpl.promptOverrides?.goodAnswerCriteria ?? [];
  if (goodAnswerCriteria.length) {
    lines.push("", isEnglish ? "GOOD ANSWER CRITERIA:" : "КРИТЕРИИ ХОРОШЕГО ОТВЕТА:");
    lines.push(...goodAnswerCriteria.map((criterion) => `- ${criterion}`));
  }

  return lines.join("\n");
};
