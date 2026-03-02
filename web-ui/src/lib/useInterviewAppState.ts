import { useEffect, useMemo, useState } from "react";
import interviewsData from "../../../data/interviews.json";
import { composeInterviewPrompt } from "./composePrompt";
import { clearSessions, createSession, listSessions, updateSessionScore } from "./localSessions";
import { InterviewConfig, InterviewTemplate, Level, Session } from "./types";

export type InterviewLanguage = "en" | "ru";

export const ALL_LEVELS: Level[] = ["junior", "middle", "senior"];

const config = interviewsData as InterviewConfig;

const parseCsv = (value: string): string[] => {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const useInterviewAppState = () => {
  const [templates, setTemplates] = useState<InterviewTemplate[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [templateId, setTemplateId] = useState("");
  const [level, setLevel] = useState<Level>("junior");
  const [stackInput, setStackInput] = useState("");
  const [focusInput, setFocusInput] = useState("");
  const [extraContext, setExtraContext] = useState("");
  const [simulation, setSimulation] = useState(true);
  const [language, setLanguage] = useState<InterviewLanguage>("en");
  const [timebox, setTimebox] = useState(30);
  const [persistSession, setPersistSession] = useState(true);

  const [prompt, setPrompt] = useState("");
  const [activeSessionId, setActiveSessionId] = useState("");
  const [score, setScore] = useState("");
  const [notes, setNotes] = useState("");
  const [snack, setSnack] = useState("");

  const templatesForLevel = useMemo(
    () => templates.filter((item) => item.levels.includes(level)),
    [templates, level],
  );

  const refreshSessions = () => {
    setSessions(listSessions());
  };

  useEffect(() => {
    try {
      setTemplates(config.templates);
      setSessions(listSessions());

      const juniorTemplate = config.templates.find((template) => template.levels.includes("junior"));
      setLevel("junior");
      setTemplateId(juniorTemplate?.id ?? config.templates[0]?.id ?? "");

      setStackInput((config.defaults.stack ?? []).join(", "));
      setSimulation(Boolean(config.defaults.simulation));
      setTimebox(Number(config.defaults.timeboxedMinutes ?? 30));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : String(loadError));
    }
  }, []);

  useEffect(() => {
    if (!templatesForLevel.length) return;
    const stillValid = templatesForLevel.some((template) => template.id === templateId);
    if (!stillValid) {
      setTemplateId(templatesForLevel[0].id);
    }
  }, [templatesForLevel, templateId]);

  const generatePrompt = async () => {
    try {
      setBusy(true);
      setError("");
      const nextPrompt = composeInterviewPrompt(config, {
        templateId,
        level,
        stack: parseCsv(stackInput),
        focusBoost: parseCsv(focusInput),
        extraContext,
        mode: {
          simulation,
          english: language === "en",
          timeboxedMinutes: Number(timebox),
        },
      });

      setPrompt(nextPrompt);
      if (persistSession) {
        const session = createSession(templateId, level);
        setActiveSessionId(session.id);
        setSnack(`Session created: ${session.id}`);
      } else {
        setActiveSessionId("");
      }

      refreshSessions();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setBusy(false);
    }
  };

  const saveEvaluation = async () => {
    try {
      setBusy(true);
      setError("");
      updateSessionScore(activeSessionId, Number(score), notes);

      setSnack("Evaluation saved");
      setScore("");
      setNotes("");
      refreshSessions();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setBusy(false);
    }
  };

  const handleClearSessions = () => {
    clearSessions();
    setSessions([]);
    setActiveSessionId("");
    setSnack("Sessions cleared");
  };

  return {
    activeSessionId,
    busy,
    error,
    extraContext,
    focusInput,
    generatePrompt,
    handleClearSessions,
    language,
    level,
    notes,
    persistSession,
    prompt,
    refreshSessions,
    saveEvaluation,
    score,
    sessions,
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
    simulation,
    snack,
    stackInput,
    templateId,
    templatesForLevel,
    timebox,
  };
};
