import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Snackbar,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
} from "@mui/material";
import { MouseEvent, SyntheticEvent, useEffect, useState } from "react";
import {
  EvaluationCard,
  InterviewSetupCard,
  ProgressChartCard,
  RecommendedNextAlert,
  RubricRadarCard,
  SessionsCard,
  StreakCalendarCard,
  TopicHeatmapCard,
} from "./components";
import { useInterviewAppState } from "./lib/useInterviewAppState";
import { UI_COPY } from "./lib/uiCopy";
import { InterviewLanguage } from "./lib/types";

import type { ThemeMode } from "./theme";

type AppProps = {
  themeMode: ThemeMode;
  onThemeModeChange: (mode: ThemeMode) => void;
};

const App = ({ themeMode, onThemeModeChange }: AppProps) => {
  const {
    activeSessionId,
    busy,
    companyBar,
    companyBarPresets,
    error,
    extraContext,
    focusInput,
    generatePrompt,
    handleClearSessions,
    handleCopyShareLink,
    handleExportJson,
    handleExportMarkdown,
    handleImportJson,
    language,
    level,
    levelTargets,
    notes,
    persistSession,
    prompt,
    recommendation,
    applyRecommendation,
    dismissRecommendation,
    refreshSessions,
    rubricAggregate,
    rubricInputs,
    saveEvaluation,
    sessions,
    startNewSession,
    setActiveSessionId,
    setCompanyBar,
    setError,
    setExtraContext,
    setFocusInput,
    setLanguage,
    setLevel,
    setNotes,
    setPersistSession,
    setRubricAxis,
    setSimulation,
    setSnack,
    setStackInput,
    setTemplateId,
    setTimebox,
    simulation,
    snack,
    stackInput,
    templateId,
    templates,
    templatesForLevel,
    timebox,
  } = useInterviewAppState();
  const copy = UI_COPY[language];
  const [workspaceTab, setWorkspaceTab] = useState<"prompt" | "charts" | "sessions">("prompt");
  const [sessionsSelectedTags, setSessionsSelectedTags] = useState<string[]>([]);
  const [sessionsDateFilterDays, setSessionsDateFilterDays] = useState<number | null>(null);
  const handleWorkspaceTabChange = (_: SyntheticEvent, next: "prompt" | "charts" | "sessions") => {
    setWorkspaceTab(next);
  };

  const handleSelectTagFromHeatmap = (tag: string) => {
    setSessionsSelectedTags([tag]);
    setSessionsDateFilterDays(null);
    setWorkspaceTab("sessions");
  };

  const handleSelectCurrentStreakWindow = (days: number) => {
    setSessionsDateFilterDays(days);
    setSessionsSelectedTags([]);
    setWorkspaceTab("sessions");
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const TAB_BY_KEY: Record<string, "prompt" | "charts" | "sessions"> = {
      "1": "prompt",
      "2": "charts",
      "3": "sessions",
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey) return;
      if (event.ctrlKey || event.metaKey || event.shiftKey) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }
      const next = TAB_BY_KEY[event.key];
      if (!next) return;
      event.preventDefault();
      setWorkspaceTab(next);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleLanguageChange = (
    _: MouseEvent<HTMLElement>,
    nextLanguage: InterviewLanguage | null,
  ) => {
    if (nextLanguage) {
      setLanguage(nextLanguage);
    }
  };

  const copyPromptText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSnack(copy.promptCopied);
    } catch {
      setError(copy.promptCopyFailed);
    }
  };

  const handleCopyPrompt = async () => {
    if (!prompt) return;
    await copyPromptText(prompt);
  };

  const handleSharePrompt = async () => {
    if (!prompt) return;

    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          title: copy.promptOutputTitle,
          text: prompt,
        });
        setSnack(copy.promptShared);
        return;
      }

      await navigator.clipboard.writeText(prompt);
      setSnack(copy.promptSharedFallback);
    } catch {
      setError(copy.promptShareFailed);
    }
  };

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backdropFilter: "blur(10px)",
          background: themeMode === "dark" ? "rgba(2, 6, 23, 0.9)" : "rgba(255, 255, 255, 0.88)",
        }}
      >
        <Toolbar>
          <Typography variant="h6">{copy.appTitle}</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              {copy.interfaceLanguage}
            </Typography>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={language}
              onChange={handleLanguageChange}
              color="secondary"
            >
              <ToggleButton value="en">EN</ToggleButton>
              <ToggleButton value="ru">RU</ToggleButton>
            </ToggleButtonGroup>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, opacity: 0.3 }} />
            <ToggleButtonGroup
              size="small"
              exclusive
              value={themeMode}
              onChange={(_, next: ThemeMode | null) => {
                if (next) onThemeModeChange(next);
              }}
              aria-label={copy.themeToggleAriaLabel}
            >
              <ToggleButton value="dark">{copy.themeToggleDark}</ToggleButton>
              <ToggleButton value="light">{copy.themeToggleLight}</ToggleButton>
            </ToggleButtonGroup>
            <Chip label={copy.techChip} color="secondary" />
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {error && (
          <Alert
            sx={{ mb: 2 }}
            severity="error"
            role="alert"
            aria-live="assertive"
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 5 }}>
            {recommendation && (
              <RecommendedNextAlert
                language={language}
                recommendation={recommendation}
                onApply={applyRecommendation}
                onDismiss={dismissRecommendation}
              />
            )}
            <InterviewSetupCard
              busy={busy}
              companyBar={companyBar}
              companyBarPresets={companyBarPresets}
              extraContext={extraContext}
              focusInput={focusInput}
              generatePrompt={generatePrompt}
              handleCopyShareLink={handleCopyShareLink}
              language={language}
              level={level}
              persistSession={persistSession}
              setCompanyBar={setCompanyBar}
              setExtraContext={setExtraContext}
              setFocusInput={setFocusInput}
              setLevel={setLevel}
              setPersistSession={setPersistSession}
              setSimulation={setSimulation}
              setStackInput={setStackInput}
              setTemplateId={setTemplateId}
              setTimebox={setTimebox}
              simulation={simulation}
              stackInput={stackInput}
              templateId={templateId}
              templatesForLevel={templatesForLevel}
              timebox={timebox}
            />

            <EvaluationCard
              activeSessionId={activeSessionId}
              busy={busy}
              rubricAggregate={rubricAggregate}
              rubricInputs={rubricInputs}
              language={language}
              notes={notes}
              saveEvaluation={saveEvaluation}
              setActiveSessionId={setActiveSessionId}
              setNotes={setNotes}
              setRubricAxis={setRubricAxis}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs
                value={workspaceTab}
                onChange={handleWorkspaceTabChange}
                aria-label={copy.workspaceTabsAriaLabel}
              >
                <Tab
                  label={copy.workspaceTabPrompt}
                  value="prompt"
                  id="workspace-tab-prompt"
                  aria-controls="workspace-panel-prompt"
                  aria-keyshortcuts="Alt+1"
                  title={copy.workspaceTabShortcut(1)}
                />
                <Tab
                  label={copy.workspaceTabCharts}
                  value="charts"
                  id="workspace-tab-charts"
                  aria-controls="workspace-panel-charts"
                  aria-keyshortcuts="Alt+2"
                  title={copy.workspaceTabShortcut(2)}
                />
                <Tab
                  label={copy.workspaceTabSessions}
                  value="sessions"
                  id="workspace-tab-sessions"
                  aria-controls="workspace-panel-sessions"
                  aria-keyshortcuts="Alt+3"
                  title={copy.workspaceTabShortcut(3)}
                />
              </Tabs>
            </Box>

            <Box
              role="tabpanel"
              hidden={workspaceTab !== "prompt"}
              id="workspace-panel-prompt"
              aria-labelledby="workspace-tab-prompt"
            >
              {workspaceTab === "prompt" && (
                <Card className="fade-up">
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2,
                        mb: 1,
                      }}
                    >
                      <Typography variant="h6">{copy.promptOutputTitle}</Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: "auto" }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={handleCopyPrompt}
                          disabled={!prompt}
                        >
                          {copy.copyPrompt}
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={handleSharePrompt}
                          disabled={!prompt}
                        >
                          {copy.sharePrompt}
                        </Button>
                        <Button
                          variant="text"
                          size="small"
                          onClick={startNewSession}
                          disabled={!prompt}
                        >
                          {copy.startNewSession}
                        </Button>
                      </Box>
                    </Box>
                    <Divider sx={{ mb: 1.5 }} />
                    {prompt ? (
                      <Typography className="prompt-output">{prompt}</Typography>
                    ) : (
                      <Typography color="text.secondary">{copy.promptOutputEmpty}</Typography>
                    )}
                  </CardContent>
                </Card>
              )}
            </Box>

            <Box
              role="tabpanel"
              hidden={workspaceTab !== "charts"}
              id="workspace-panel-charts"
              aria-labelledby="workspace-tab-charts"
            >
              {workspaceTab === "charts" && (
                <Box
                  sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: { xs: "1fr", xl: "1fr 1fr" },
                    alignItems: "start",
                  }}
                >
                  <Box sx={{ gridColumn: { xl: "1 / -1" } }}>
                    <ProgressChartCard
                      language={language}
                      sessions={sessions}
                      levelTargets={levelTargets}
                    />
                  </Box>
                  <RubricRadarCard language={language} sessions={sessions} />
                  <StreakCalendarCard
                    language={language}
                    sessions={sessions}
                    onCurrentStreakClick={handleSelectCurrentStreakWindow}
                  />
                  <TopicHeatmapCard
                    language={language}
                    sessions={sessions}
                    templates={templates}
                    onTagSelect={handleSelectTagFromHeatmap}
                  />
                </Box>
              )}
            </Box>

            <Box
              role="tabpanel"
              hidden={workspaceTab !== "sessions"}
              id="workspace-panel-sessions"
              aria-labelledby="workspace-tab-sessions"
            >
              {workspaceTab === "sessions" && (
                <SessionsCard
                  handleClearSessions={handleClearSessions}
                  language={language}
                  refreshSessions={refreshSessions}
                  sessions={sessions}
                  templates={templates}
                  selectedTags={sessionsSelectedTags}
                  onSelectedTagsChange={setSessionsSelectedTags}
                  dateFilterDays={sessionsDateFilterDays}
                  onDateFilterChange={setSessionsDateFilterDays}
                  onCopyPrompt={copyPromptText}
                  onExportJson={handleExportJson}
                  onExportMarkdown={handleExportMarkdown}
                  onImportJson={handleImportJson}
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Snackbar open={Boolean(snack)} autoHideDuration={2500} onClose={() => setSnack("")}>
        <Alert
          severity="success"
          variant="filled"
          role="status"
          aria-live="polite"
          onClose={() => setSnack("")}
        >
          {snack}
        </Alert>
      </Snackbar>
    </>
  );
};

export default App;
