import { InterviewLanguage, Level } from "./types";

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
  timebox: string;
  simulation: string;
  createSession: string;
  generatePrompt: string;
  evaluationTitle: string;
  sessionId: string;
  score: string;
  notes: string;
  saveScore: string;
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
    timebox: "Timebox (minutes)",
    simulation: "Simulation",
    createSession: "Create session",
    generatePrompt: "Generate Prompt",
    evaluationTitle: "Save Evaluation",
    sessionId: "Session ID",
    score: "Score (0..10)",
    notes: "Notes",
    saveScore: "Save score",
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
    timebox: "Лимит времени (минуты)",
    simulation: "Симуляция",
    createSession: "Создавать сессию",
    generatePrompt: "Сгенерировать промпт",
    evaluationTitle: "Сохранить оценку",
    sessionId: "ID сессии",
    score: "Оценка (0..10)",
    notes: "Заметки",
    saveScore: "Сохранить оценку",
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
