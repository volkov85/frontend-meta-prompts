import { InterviewLanguage, Level, RubricAxis } from "./types";

type UiCopy = {
  appTitle: string;
  techChip: string;
  interfaceLanguage: string;
  setupTitle: string;
  template: string;
  level: string;
  stack: string;
  focusBoost: string;
  extraContext: string;
  companyBar: string;
  companyBarHelper: string;
  companyBarPresets: string;
  timebox: string;
  simulation: string;
  createSession: string;
  generatePrompt: string;
  copyShareLink: string;
  shareLinkCopied: string;
  shareLinkCopyFailed: string;
  shareLinkApplied: string;
  evaluationTitle: string;
  sessionId: string;
  score: string;
  notes: string;
  saveScore: string;
  rubricSubtitle: string;
  rubricAggregateLabel: string;
  rubricAggregatePending: string;
  rubricValidationError: string;
  rubricAxisCorrectness: string;
  rubricAxisDepth: string;
  rubricAxisClarity: string;
  rubricAxisTradeOffs: string;
  rubricAxisPracticality: string;
  rubricAxisCorrectnessHint: string;
  rubricAxisDepthHint: string;
  rubricAxisClarityHint: string;
  rubricAxisTradeOffsHint: string;
  rubricAxisPracticalityHint: string;
  rubricRadarTitle: string;
  rubricRadarEmpty: string;
  rubricRadarLatest: string;
  rubricRadarAverage: string;
  rubricRadarSourceLabel: string;
  rubricMarkdownLabel: string;
  workspaceTabPrompt: string;
  workspaceTabCharts: string;
  workspaceTabSessions: string;
  workspaceTabsAriaLabel: string;
  recommendationTitle: string;
  recommendationBody: (axis: string, score: string, template: string) => string;
  recommendationApply: string;
  recommendationDismiss: string;
  recommendationApplied: (template: string) => string;
  promptOutputTitle: string;
  promptOutputEmpty: string;
  progressChartTitle: string;
  progressChartSubtitle: string;
  progressChartEmpty: string;
  progressAverage: string;
  progressLatest: string;
  progressCoverage: string;
  copyPrompt: string;
  sharePrompt: string;
  startNewSession: string;
  recentSessions: string;
  clearSessions: string;
  clearSessionsConfirmTitle: string;
  clearSessionsConfirmBody: (count: number) => string;
  clearSessionsConfirmCancel: string;
  clearSessionsConfirmConfirm: string;
  exportJson: string;
  exportMarkdown: string;
  importJson: string;
  sessionsExportedJson: (count: number) => string;
  sessionsExportedMarkdown: (count: number) => string;
  sessionsExportFailed: (reason: string) => string;
  sessionsImported: (added: number, skipped: number, invalid: number) => string;
  sessionsImportFailed: (reason: string) => string;
  refresh: string;
  sessionSearch: string;
  sessionSearchPlaceholder: string;
  levelFilterLabel: string;
  scoreFilterLabel: string;
  filterAllLevels: string;
  filterAllScores: string;
  filterRated: string;
  filterUnrated: string;
  noSessions: string;
  noFilteredSessions: string;
  sessionPrefix: string;
  scorePrefix: string;
  notRated: string;
  sessionCreated: (sessionId: string) => string;
  evaluationSaved: string;
  sessionsCleared: string;
  promptCopied: string;
  promptCopyFailed: string;
  promptShared: string;
  promptShareFailed: string;
  promptSharedFallback: string;
  newSessionStarted: string;
  viewPrompt: string;
  viewPromptDialogTitle: string;
  viewPromptUnavailable: string;
  viewPromptContextTitle: string;
  viewPromptContextStack: string;
  viewPromptContextFocus: string;
  viewPromptContextExtra: string;
  viewPromptContextTimebox: string;
  viewPromptContextSimulation: string;
  viewPromptContextLanguage: string;
  viewPromptContextCompanyBar: string;
  viewPromptContextEmpty: string;
  viewPromptCopy: string;
  viewPromptClose: string;
  yes: string;
  no: string;
  notAvailable: string;
};

export const UI_COPY: Record<InterviewLanguage, UiCopy> = {
  en: {
    appTitle: "Frontend Meta Prompts",
    techChip: "React + MUI",
    interfaceLanguage: "Interface language",
    setupTitle: "Interview Setup",
    template: "Template",
    level: "Level",
    stack: "Stack (comma separated)",
    focusBoost: "Focus boost (comma separated)",
    extraContext: "Extra context",
    companyBar: "Company bar",
    companyBarHelper: "Sets the interviewer's company tier in the prompt",
    companyBarPresets: "Company bar presets",
    timebox: "Timebox (minutes)",
    simulation: "Simulation",
    createSession: "Create session",
    generatePrompt: "Generate Prompt",
    copyShareLink: "Copy share link",
    shareLinkCopied: "Share link copied to clipboard",
    shareLinkCopyFailed: "Unable to copy share link",
    shareLinkApplied: "Setup loaded from shared link",
    evaluationTitle: "Save Evaluation",
    sessionId: "Session ID",
    score: "Score (0..10)",
    notes: "Notes",
    saveScore: "Save score",
    rubricSubtitle: "Score each axis from 0 to 10",
    rubricAggregateLabel: "Overall score",
    rubricAggregatePending: "Fill in all 5 axes to see the overall score",
    rubricValidationError: "Each rubric axis must be a number between 0 and 10",
    rubricAxisCorrectness: "Correctness",
    rubricAxisDepth: "Depth",
    rubricAxisClarity: "Clarity",
    rubricAxisTradeOffs: "Trade-offs",
    rubricAxisPracticality: "Practicality",
    rubricAxisCorrectnessHint: "Did the answer match what was asked?",
    rubricAxisDepthHint: "How deep did the candidate go into the problem?",
    rubricAxisClarityHint: "Were explanations clear and structured?",
    rubricAxisTradeOffsHint: "Were alternatives and trade-offs discussed?",
    rubricAxisPracticalityHint: "Could this run in real production?",
    rubricRadarTitle: "Rubric breakdown",
    rubricRadarEmpty: "Rate a session with the 5-axis rubric to unlock the radar.",
    rubricRadarLatest: "Latest",
    rubricRadarAverage: "Average",
    rubricRadarSourceLabel: "Source",
    rubricMarkdownLabel: "Rubric",
    workspaceTabPrompt: "Prompt",
    workspaceTabCharts: "Charts",
    workspaceTabSessions: "Sessions",
    workspaceTabsAriaLabel: "Workspace sections",
    recommendationTitle: "Recommended next session",
    recommendationBody: (axis: string, score: string, template: string) =>
      `${axis} scored lowest in your recent rubrics (${score}/10). Try ${template} to focus on it.`,
    recommendationApply: "Apply",
    recommendationDismiss: "Dismiss recommendation",
    recommendationApplied: (template: string) => `Applied recommendation: ${template}`,
    promptOutputTitle: "Prompt Output",
    promptOutputEmpty: "Generated prompt will appear here.",
    progressChartTitle: "Interview Momentum",
    progressChartSubtitle: "Recent scored sessions against level targets",
    progressChartEmpty: "Save a few scored sessions to unlock the chart.",
    progressAverage: "Average",
    progressLatest: "Latest",
    progressCoverage: "Coverage",
    copyPrompt: "Copy",
    sharePrompt: "Share",
    startNewSession: "Start new session",
    recentSessions: "Recent Sessions",
    clearSessions: "Clear sessions",
    clearSessionsConfirmTitle: "Clear all sessions?",
    clearSessionsConfirmBody: (count: number) =>
      count === 1
        ? "This will permanently delete 1 saved session. This action cannot be undone."
        : `This will permanently delete ${count} saved sessions. This action cannot be undone.`,
    clearSessionsConfirmCancel: "Cancel",
    clearSessionsConfirmConfirm: "Yes, clear all",
    exportJson: "Export JSON",
    exportMarkdown: "Export Markdown",
    importJson: "Import JSON",
    sessionsExportedJson: (count: number) =>
      count === 1 ? "Exported 1 session as JSON" : `Exported ${count} sessions as JSON`,
    sessionsExportedMarkdown: (count: number) =>
      count === 1 ? "Exported 1 session as Markdown" : `Exported ${count} sessions as Markdown`,
    sessionsExportFailed: (reason: string) => `Export failed: ${reason}`,
    sessionsImported: (added: number, skipped: number, invalid: number) => {
      const parts = [`Imported ${added} new`];
      if (skipped > 0) parts.push(`skipped ${skipped} duplicate${skipped === 1 ? "" : "s"}`);
      if (invalid > 0) parts.push(`ignored ${invalid} invalid`);
      return parts.join(", ");
    },
    sessionsImportFailed: (reason: string) => `Import failed: ${reason}`,
    refresh: "Refresh",
    sessionSearch: "Search",
    sessionSearchPlaceholder: "Session ID, template, note",
    levelFilterLabel: "Level filter",
    scoreFilterLabel: "Score filter",
    filterAllLevels: "All levels",
    filterAllScores: "All scores",
    filterRated: "Rated",
    filterUnrated: "Not rated",
    noSessions: "No saved sessions yet.",
    noFilteredSessions: "No sessions match the current filters.",
    sessionPrefix: "Session",
    scorePrefix: "Score",
    notRated: "not rated",
    sessionCreated: (sessionId: string) => `Session created: ${sessionId}`,
    evaluationSaved: "Evaluation saved",
    sessionsCleared: "Sessions cleared",
    promptCopied: "Prompt copied",
    promptCopyFailed: "Unable to copy prompt",
    promptShared: "Prompt shared",
    promptShareFailed: "Unable to share prompt",
    promptSharedFallback: "Share not available, prompt copied instead",
    newSessionStarted: "Ready for a new session",
    viewPrompt: "View prompt",
    viewPromptDialogTitle: "Session prompt",
    viewPromptUnavailable:
      "This session was saved before the prompt-history feature was added, so the original prompt is not available.",
    viewPromptContextTitle: "Session context",
    viewPromptContextStack: "Stack",
    viewPromptContextFocus: "Focus",
    viewPromptContextExtra: "Extra context",
    viewPromptContextTimebox: "Timebox (minutes)",
    viewPromptContextSimulation: "Simulation",
    viewPromptContextLanguage: "Language",
    viewPromptContextCompanyBar: "Company bar",
    viewPromptContextEmpty: "No context was saved for this session.",
    viewPromptCopy: "Copy prompt",
    viewPromptClose: "Close",
    yes: "Yes",
    no: "No",
    notAvailable: "\u2014",
  },
  ru: {
    appTitle: "Frontend Meta Prompts",
    techChip: "React + MUI",
    interfaceLanguage: "Язык интерфейса",
    setupTitle: "Настройка интервью",
    template: "Шаблон",
    level: "Уровень",
    stack: "Стек (через запятую)",
    focusBoost: "Фокус тем (через запятую)",
    extraContext: "Доп. контекст",
    companyBar: "Уровень компании",
    companyBarHelper: "Задаёт уровень компании интервьюера в промпте",
    companyBarPresets: "Пресеты уровня компании",
    timebox: "Лимит времени (минуты)",
    simulation: "Симуляция",
    createSession: "Создавать сессию",
    generatePrompt: "Сгенерировать промпт",
    copyShareLink: "Копировать ссылку шеринга",
    shareLinkCopied: "Ссылка скопирована в буфер обмена",
    shareLinkCopyFailed: "Не удалось скопировать ссылку",
    shareLinkApplied: "Настройка загружена из ссылки",
    evaluationTitle: "Сохранить оценку",
    sessionId: "ID сессии",
    score: "Оценка (0..10)",
    notes: "Заметки",
    saveScore: "Сохранить оценку",
    rubricSubtitle: "Оцени каждую ось от 0 до 10",
    rubricAggregateLabel: "Общая оценка",
    rubricAggregatePending: "Заполни все 5 осей, чтобы увидеть общую оценку",
    rubricValidationError: "Каждая ось рубрики должна быть числом от 0 до 10",
    rubricAxisCorrectness: "Точность",
    rubricAxisDepth: "Глубина",
    rubricAxisClarity: "Ясность",
    rubricAxisTradeOffs: "Компромиссы",
    rubricAxisPracticality: "Практичность",
    rubricAxisCorrectnessHint: "Ответ соответствует вопросу?",
    rubricAxisDepthHint: "Насколько глубоко копнули в проблему?",
    rubricAxisClarityHint: "Объяснения чёткие и структурированные?",
    rubricAxisTradeOffsHint: "Обсуждались альтернативы и компромиссы?",
    rubricAxisPracticalityHint: "Решение применимо в реальном проде?",
    rubricRadarTitle: "Разбор по рубрике",
    rubricRadarEmpty: "Оцени сессию по 5 осям, чтобы разлочить радар.",
    rubricRadarLatest: "Последняя",
    rubricRadarAverage: "Среднее",
    rubricRadarSourceLabel: "Источник",
    rubricMarkdownLabel: "Рубрика",
    workspaceTabPrompt: "Промпт",
    workspaceTabCharts: "Графики",
    workspaceTabSessions: "Сессии",
    workspaceTabsAriaLabel: "Разделы рабочей области",
    recommendationTitle: "Рекомендация для следующей сессии",
    recommendationBody: (axis: string, score: string, template: string) =>
      `${axis} — самая слабая ось в последних рубриках (${score}/10). Попробуй ${template}, чтобы прокачать её.`,
    recommendationApply: "Применить",
    recommendationDismiss: "Скрыть рекомендацию",
    recommendationApplied: (template: string) => `Применена рекомендация: ${template}`,
    promptOutputTitle: "Сгенерированный промпт",
    promptOutputEmpty: "Здесь появится сгенерированный промпт.",
    progressChartTitle: "Динамика интервью",
    progressChartSubtitle: "Последние оценённые сессии относительно целевых зон",
    progressChartEmpty: "Сохраните несколько оценённых сессий, чтобы увидеть график.",
    progressAverage: "Среднее",
    progressLatest: "Последняя",
    progressCoverage: "Покрытие",
    copyPrompt: "Копировать",
    sharePrompt: "Поделиться",
    startNewSession: "Новая сессия",
    recentSessions: "Последние сессии",
    clearSessions: "Очистить сессии",
    clearSessionsConfirmTitle: "Очистить все сессии?",
    clearSessionsConfirmBody: (count: number) =>
      count === 1
        ? "Это безвозвратно удалит 1 сохранённую сессию. Действие нельзя отменить."
        : `Это безвозвратно удалит сохранённых сессий: ${count}. Действие нельзя отменить.`,
    clearSessionsConfirmCancel: "Отмена",
    clearSessionsConfirmConfirm: "Да, очистить всё",
    exportJson: "Экспорт JSON",
    exportMarkdown: "Экспорт Markdown",
    importJson: "Импорт JSON",
    sessionsExportedJson: (count: number) =>
      count === 1 ? "Экспортирована 1 сессия в JSON" : `Экспортировано сессий в JSON: ${count}`,
    sessionsExportedMarkdown: (count: number) =>
      count === 1
        ? "Экспортирована 1 сессия в Markdown"
        : `Экспортировано сессий в Markdown: ${count}`,
    sessionsExportFailed: (reason: string) => `Не удалось экспортировать: ${reason}`,
    sessionsImported: (added: number, skipped: number, invalid: number) => {
      const parts = [`Импортировано новых: ${added}`];
      if (skipped > 0) parts.push(`пропущено дубликатов: ${skipped}`);
      if (invalid > 0) parts.push(`проигнорировано некорректных: ${invalid}`);
      return parts.join(", ");
    },
    sessionsImportFailed: (reason: string) => `Не удалось импортировать: ${reason}`,
    refresh: "Обновить",
    sessionSearch: "Поиск",
    sessionSearchPlaceholder: "ID сессии, шаблон, заметка",
    levelFilterLabel: "Фильтр уровня",
    scoreFilterLabel: "Фильтр оценки",
    filterAllLevels: "Все уровни",
    filterAllScores: "Все оценки",
    filterRated: "С оценкой",
    filterUnrated: "Без оценки",
    noSessions: "Сохранённых сессий пока нет.",
    noFilteredSessions: "По текущим фильтрам сессий не найдено.",
    sessionPrefix: "Сессия",
    scorePrefix: "Оценка",
    notRated: "без оценки",
    sessionCreated: (sessionId: string) => `Сессия создана: ${sessionId}`,
    evaluationSaved: "Оценка сохранена",
    sessionsCleared: "Сессии очищены",
    promptCopied: "Промпт скопирован",
    promptCopyFailed: "Не удалось скопировать промпт",
    promptShared: "Промпт отправлен",
    promptShareFailed: "Не удалось поделиться промптом",
    promptSharedFallback: "Шаринг недоступен, промпт скопирован",
    newSessionStarted: "Готово к новой сессии",
    viewPrompt: "Открыть промпт",
    viewPromptDialogTitle: "Промпт сессии",
    viewPromptUnavailable:
      "Эта сессия была сохранена до появления истории промптов, исходный текст недоступен.",
    viewPromptContextTitle: "Контекст сессии",
    viewPromptContextStack: "Стек",
    viewPromptContextFocus: "Фокус",
    viewPromptContextExtra: "Доп. контекст",
    viewPromptContextTimebox: "Таймбокс (минуты)",
    viewPromptContextSimulation: "Симуляция",
    viewPromptContextLanguage: "Язык",
    viewPromptContextCompanyBar: "Уровень компании",
    viewPromptContextEmpty: "Контекст для этой сессии не сохранён.",
    viewPromptCopy: "Копировать промпт",
    viewPromptClose: "Закрыть",
    yes: "Да",
    no: "Нет",
    notAvailable: "\u2014",
  },
};

export const LEVEL_LABELS: Record<InterviewLanguage, Record<Level, string>> = {
  en: { junior: "Junior", middle: "Middle", senior: "Senior" },
  ru: { junior: "Джун", middle: "Мидл", senior: "Сеньор" },
};

export const rubricAxisLabel = (language: InterviewLanguage, axis: RubricAxis): string => {
  const copy = UI_COPY[language];
  switch (axis) {
    case "correctness":
      return copy.rubricAxisCorrectness;
    case "depth":
      return copy.rubricAxisDepth;
    case "clarity":
      return copy.rubricAxisClarity;
    case "tradeOffs":
      return copy.rubricAxisTradeOffs;
    case "practicality":
      return copy.rubricAxisPracticality;
  }
};

export const rubricAxisHint = (language: InterviewLanguage, axis: RubricAxis): string => {
  const copy = UI_COPY[language];
  switch (axis) {
    case "correctness":
      return copy.rubricAxisCorrectnessHint;
    case "depth":
      return copy.rubricAxisDepthHint;
    case "clarity":
      return copy.rubricAxisClarityHint;
    case "tradeOffs":
      return copy.rubricAxisTradeOffsHint;
    case "practicality":
      return copy.rubricAxisPracticalityHint;
  }
};
