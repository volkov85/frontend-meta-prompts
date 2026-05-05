import { useEffect, useMemo, useReducer } from "react";
import interviewsData from "../../../data/interviews.json";
import { composeInterviewPrompt } from "./composePrompt";
import {
  clearSessions,
  createSession,
  listSessions,
  readRawSessions,
  replaceSessions,
  updateSessionScore,
} from "./localSessions";
import {
  buildExportFilename,
  buildSessionsMarkdown,
  mergeSessions,
  parseSessionsImport,
  serializeSessionsExport,
} from "./exportSessions";
import {
  encodeConfigToUrl,
  hasShareableParams,
  parseConfigFromUrl,
  stripShareableParams,
} from "./configLink";
import { readStoredSetup, writeStoredSetup } from "./setupStorage";
import { UI_COPY } from "./uiCopy";
import { InterviewConfig, InterviewLanguage, InterviewTemplate, Level, Session } from "./types";

export const ALL_LEVELS: Level[] = ["junior", "middle", "senior"];

const config = interviewsData as InterviewConfig;
const LANGUAGE_STORAGE_KEY = "frontend_meta_prompts_ui_language_v1";

const parseCsv = (value: string): string[] => {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const readStoredLanguage = (): InterviewLanguage | null => {
  try {
    const value = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (value === "en" || value === "ru") return value;
    return null;
  } catch {
    return null;
  }
};

const writeStoredLanguage = (language: InterviewLanguage): void => {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore storage failures (private mode/quota/etc.) and keep app usable.
  }
};

type InterviewAppState = {
  templates: InterviewTemplate[];
  sessions: Session[];
  busy: boolean;
  error: string;
  templateId: string;
  level: Level;
  stackInput: string;
  focusInput: string;
  extraContext: string;
  simulation: boolean;
  language: InterviewLanguage;
  timebox: number;
  persistSession: boolean;
  prompt: string;
  activeSessionId: string;
  score: string;
  notes: string;
  snack: string;
  setupInitialized: boolean;
};

const initialState: InterviewAppState = {
  templates: [],
  sessions: [],
  busy: false,
  error: "",
  templateId: "",
  level: "junior",
  stackInput: "",
  focusInput: "",
  extraContext: "",
  simulation: true,
  language: "en",
  timebox: 30,
  persistSession: true,
  prompt: "",
  activeSessionId: "",
  score: "",
  notes: "",
  snack: "",
  setupInitialized: false,
};

type Action = {
  type: "patch";
  payload: Partial<InterviewAppState>;
};

const reducer = (state: InterviewAppState, action: Action): InterviewAppState => {
  if (action.type === "patch") {
    return { ...state, ...action.payload };
  }
  return state;
};

export const useInterviewAppState = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const templatesForLevel = useMemo(
    () => state.templates.filter((item) => item.levels.includes(state.level)),
    [state.level, state.templates],
  );

  const refreshSessions = () => {
    dispatch({ type: "patch", payload: { sessions: listSessions() } });
  };

  useEffect(() => {
    try {
      const juniorTemplate = config.templates.find((template) =>
        template.levels.includes("junior"),
      );
      const storedLanguage = readStoredLanguage();
      const storedSetup = readStoredSetup();

      let urlSetup: ReturnType<typeof parseConfigFromUrl> = {};
      let urlSnack = "";
      let urlHadParams = false;
      if (typeof window !== "undefined") {
        const searchParams = new URLSearchParams(window.location.search);
        if (hasShareableParams(searchParams)) {
          urlHadParams = true;
          urlSetup = parseConfigFromUrl(searchParams);
          const linkLanguage =
            urlSetup.language ?? storedLanguage ?? config.defaults.language ?? "en";
          urlSnack = UI_COPY[linkLanguage].shareLinkApplied;
        }
      }

      const defaultLevel: Level = "junior";
      const defaultTemplateId = juniorTemplate?.id ?? config.templates[0]?.id ?? "";
      const defaultStackInput = (config.defaults.stack ?? []).join(", ");
      const defaultSimulation = Boolean(config.defaults.simulation);
      const defaultTimebox = Number(config.defaults.timeboxedMinutes ?? 30);

      const candidateTemplateId =
        urlSetup.templateId ??
        (storedSetup?.templateId &&
        config.templates.some((template) => template.id === storedSetup.templateId)
          ? storedSetup.templateId
          : defaultTemplateId);
      const restoredTemplateId = config.templates.some(
        (template) => template.id === candidateTemplateId,
      )
        ? candidateTemplateId
        : defaultTemplateId;

      dispatch({
        type: "patch",
        payload: {
          templates: config.templates,
          sessions: listSessions(),
          level: urlSetup.level ?? storedSetup?.level ?? defaultLevel,
          templateId: restoredTemplateId,
          stackInput: urlSetup.stackInput ?? storedSetup?.stackInput ?? defaultStackInput,
          focusInput: urlSetup.focusInput ?? storedSetup?.focusInput ?? "",
          extraContext: urlSetup.extraContext ?? storedSetup?.extraContext ?? "",
          language: urlSetup.language ?? storedLanguage ?? config.defaults.language ?? "en",
          simulation: urlSetup.simulation ?? storedSetup?.simulation ?? defaultSimulation,
          timebox: urlSetup.timebox ?? storedSetup?.timebox ?? defaultTimebox,
          persistSession: storedSetup?.persistSession ?? true,
          setupInitialized: true,
          snack: urlSnack,
        },
      });

      if (urlHadParams && typeof window !== "undefined") {
        // Defer the URL cleanup: first ensure the dispatched setup is committed
        // (and React StrictMode's dev-only second mount has had a chance to
        // re-read the same URL params identically) before stripping them.
        window.setTimeout(() => {
          if (typeof window === "undefined") return;
          if (!window.history?.replaceState) return;
          const current = new URLSearchParams(window.location.search);
          if (!hasShareableParams(current)) return;
          window.history.replaceState(
            window.history.state,
            "",
            stripShareableParams(window.location.href),
          );
        }, 0);
      }
    } catch (loadError) {
      dispatch({
        type: "patch",
        payload: {
          error: loadError instanceof Error ? loadError.message : String(loadError),
          setupInitialized: true,
        },
      });
    }
  }, []);

  useEffect(() => {
    if (!templatesForLevel.length) return;
    const stillValid = templatesForLevel.some((template) => template.id === state.templateId);
    if (!stillValid) {
      dispatch({ type: "patch", payload: { templateId: templatesForLevel[0].id } });
    }
  }, [state.templateId, templatesForLevel]);

  useEffect(() => {
    writeStoredLanguage(state.language);
  }, [state.language]);

  useEffect(() => {
    if (!state.setupInitialized) return;
    writeStoredSetup({
      templateId: state.templateId,
      level: state.level,
      stackInput: state.stackInput,
      focusInput: state.focusInput,
      extraContext: state.extraContext,
      simulation: state.simulation,
      timebox: state.timebox,
      persistSession: state.persistSession,
    });
  }, [
    state.setupInitialized,
    state.templateId,
    state.level,
    state.stackInput,
    state.focusInput,
    state.extraContext,
    state.simulation,
    state.timebox,
    state.persistSession,
  ]);

  const generatePrompt = async () => {
    try {
      dispatch({ type: "patch", payload: { busy: true, error: "" } });
      const stack = parseCsv(state.stackInput);
      const focusBoost = parseCsv(state.focusInput);
      const extraContext = state.extraContext;
      const timeboxedMinutes = Number(state.timebox);
      const nextPrompt = composeInterviewPrompt(config, {
        templateId: state.templateId,
        level: state.level,
        stack,
        focusBoost,
        extraContext,
        mode: {
          simulation: state.simulation,
          language: state.language,
          timeboxedMinutes,
        },
      });

      if (state.persistSession) {
        const session = createSession({
          templateId: state.templateId,
          level: state.level,
          prompt: nextPrompt,
          context: {
            stack,
            focusBoost,
            extraContext,
            simulation: state.simulation,
            language: state.language,
            timeboxedMinutes,
            companyBar: config.defaults.companyBar,
          },
        });
        dispatch({
          type: "patch",
          payload: {
            prompt: nextPrompt,
            activeSessionId: session.id,
            snack: UI_COPY[state.language].sessionCreated(session.id),
          },
        });
      } else {
        dispatch({ type: "patch", payload: { prompt: nextPrompt, activeSessionId: "" } });
      }

      refreshSessions();
    } catch (requestError) {
      dispatch({
        type: "patch",
        payload: {
          error: requestError instanceof Error ? requestError.message : String(requestError),
        },
      });
    } finally {
      dispatch({ type: "patch", payload: { busy: false } });
    }
  };

  const saveEvaluation = async () => {
    try {
      dispatch({ type: "patch", payload: { busy: true, error: "" } });
      updateSessionScore(state.activeSessionId, Number(state.score), state.notes);

      dispatch({
        type: "patch",
        payload: { snack: UI_COPY[state.language].evaluationSaved, score: "", notes: "" },
      });
      refreshSessions();
    } catch (requestError) {
      dispatch({
        type: "patch",
        payload: {
          error: requestError instanceof Error ? requestError.message : String(requestError),
        },
      });
    } finally {
      dispatch({ type: "patch", payload: { busy: false } });
    }
  };

  const handleCopyShareLink = async () => {
    try {
      if (typeof window === "undefined") {
        throw new Error("window is not available");
      }
      const url = encodeConfigToUrl(window.location.href, {
        templateId: state.templateId,
        level: state.level,
        stackInput: state.stackInput,
        focusInput: state.focusInput,
        extraContext: state.extraContext,
        simulation: state.simulation,
        timebox: state.timebox,
        language: state.language,
      });
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        throw new Error("clipboard unavailable");
      }
      dispatch({
        type: "patch",
        payload: { snack: UI_COPY[state.language].shareLinkCopied },
      });
    } catch {
      dispatch({
        type: "patch",
        payload: { error: UI_COPY[state.language].shareLinkCopyFailed },
      });
    }
  };

  const handleClearSessions = () => {
    clearSessions();
    dispatch({
      type: "patch",
      payload: {
        sessions: [],
        activeSessionId: "",
        snack: UI_COPY[state.language].sessionsCleared,
      },
    });
  };

  const triggerDownload = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    try {
      const sessions = readRawSessions();
      const json = serializeSessionsExport(sessions);
      triggerDownload(buildExportFilename("json"), json, "application/json");
      dispatch({
        type: "patch",
        payload: { snack: UI_COPY[state.language].sessionsExportedJson(sessions.length) },
      });
    } catch (exportError) {
      dispatch({
        type: "patch",
        payload: {
          error:
            exportError instanceof Error
              ? UI_COPY[state.language].sessionsExportFailed(exportError.message)
              : UI_COPY[state.language].sessionsExportFailed(String(exportError)),
        },
      });
    }
  };

  const handleExportMarkdown = () => {
    try {
      const sessions = readRawSessions();
      const markdown = buildSessionsMarkdown(sessions);
      triggerDownload(buildExportFilename("md"), markdown, "text/markdown");
      dispatch({
        type: "patch",
        payload: { snack: UI_COPY[state.language].sessionsExportedMarkdown(sessions.length) },
      });
    } catch (exportError) {
      dispatch({
        type: "patch",
        payload: {
          error:
            exportError instanceof Error
              ? UI_COPY[state.language].sessionsExportFailed(exportError.message)
              : UI_COPY[state.language].sessionsExportFailed(String(exportError)),
        },
      });
    }
  };

  const handleImportJson = async (file: File) => {
    try {
      const text = await file.text();
      const { sessions: incoming, invalidCount } = parseSessionsImport(text);
      const existing = readRawSessions();
      const { added, skipped } = mergeSessions(existing, incoming);
      replaceSessions(existing);
      const refreshed = listSessions();
      dispatch({
        type: "patch",
        payload: {
          sessions: refreshed,
          snack: UI_COPY[state.language].sessionsImported(added, skipped, invalidCount),
        },
      });
    } catch (importError) {
      dispatch({
        type: "patch",
        payload: {
          error:
            importError instanceof Error
              ? UI_COPY[state.language].sessionsImportFailed(importError.message)
              : UI_COPY[state.language].sessionsImportFailed(String(importError)),
        },
      });
    }
  };

  const startNewSession = () => {
    dispatch({
      type: "patch",
      payload: {
        activeSessionId: "",
        error: "",
        notes: "",
        prompt: "",
        score: "",
        snack: UI_COPY[state.language].newSessionStarted,
      },
    });
  };

  const setActiveSessionId = (value: string) =>
    dispatch({ type: "patch", payload: { activeSessionId: value } });
  const setError = (value: string) => dispatch({ type: "patch", payload: { error: value } });
  const setExtraContext = (value: string) =>
    dispatch({ type: "patch", payload: { extraContext: value } });
  const setFocusInput = (value: string) =>
    dispatch({ type: "patch", payload: { focusInput: value } });
  const setLanguage = (value: InterviewLanguage) =>
    dispatch({ type: "patch", payload: { language: value } });
  const setLevel = (value: Level) => dispatch({ type: "patch", payload: { level: value } });
  const setNotes = (value: string) => dispatch({ type: "patch", payload: { notes: value } });
  const setPersistSession = (value: boolean) =>
    dispatch({ type: "patch", payload: { persistSession: value } });
  const setScore = (value: string) => dispatch({ type: "patch", payload: { score: value } });
  const setSimulation = (value: boolean) =>
    dispatch({ type: "patch", payload: { simulation: value } });
  const setSnack = (value: string) => dispatch({ type: "patch", payload: { snack: value } });
  const setStackInput = (value: string) =>
    dispatch({ type: "patch", payload: { stackInput: value } });
  const setTemplateId = (value: string) =>
    dispatch({ type: "patch", payload: { templateId: value } });
  const setTimebox = (value: number) => dispatch({ type: "patch", payload: { timebox: value } });

  return {
    activeSessionId: state.activeSessionId,
    busy: state.busy,
    error: state.error,
    extraContext: state.extraContext,
    focusInput: state.focusInput,
    generatePrompt,
    handleClearSessions,
    handleCopyShareLink,
    handleExportJson,
    handleExportMarkdown,
    handleImportJson,
    language: state.language,
    level: state.level,
    notes: state.notes,
    persistSession: state.persistSession,
    prompt: state.prompt,
    refreshSessions,
    saveEvaluation,
    score: state.score,
    startNewSession,
    sessions: state.sessions,
    setActiveSessionId,
    setError,
    setExtraContext,
    setFocusInput,
    setLanguage,
    setLevel,
    setNotes,
    setPersistSession,
    setScore,
    setSimulation,
    setSnack,
    setStackInput,
    setTemplateId,
    setTimebox,
    simulation: state.simulation,
    snack: state.snack,
    stackInput: state.stackInput,
    templateId: state.templateId,
    templatesForLevel,
    timebox: state.timebox,
  };
};
