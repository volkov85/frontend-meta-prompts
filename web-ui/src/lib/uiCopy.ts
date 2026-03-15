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
  copyPrompt: string;
  sharePrompt: string;
  startNewSession: string;
  recentSessions: string;
  clearSessions: string;
  refresh: string;
  noSessions: string;
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
    copyPrompt: "Copy",
    sharePrompt: "Share",
    startNewSession: "Start new session",
    recentSessions: "Recent Sessions",
    clearSessions: "Clear sessions",
    refresh: "Refresh",
    noSessions: "No saved sessions yet.",
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
    copyPrompt: "Копировать",
    sharePrompt: "Поделиться",
    startNewSession: "Новая сессия",
    recentSessions: "Последние сессии",
    clearSessions: "Очистить сессии",
    refresh: "Обновить",
    noSessions: "Сохранённых сессий пока нет.",
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
  },
};

export const LEVEL_LABELS: Record<InterviewLanguage, Record<Level, string>> = {
  en: { junior: "junior", middle: "middle", senior: "senior" },
  ru: { junior: "джун", middle: "мидл", senior: "сеньор" },
};
