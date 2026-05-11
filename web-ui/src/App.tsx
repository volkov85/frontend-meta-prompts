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
  Stack,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
} from "@mui/material";
import { MouseEvent, SyntheticEvent, useState } from "react";
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

const App = () => {
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
        sx={{ backdropFilter: "blur(10px)", background: "rgba(2, 6, 23, 0.9)" }}
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
                />
                <Tab
                  label={copy.workspaceTabCharts}
                  value="charts"
                  id="workspace-tab-charts"
                  aria-controls="workspace-panel-charts"
                />
                <Tab
                  label={copy.workspaceTabSessions}
                  value="sessions"
                  id="workspace-tab-sessions"
                  aria-controls="workspace-panel-sessions"
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
                <Stack spacing={2}>
                  <ProgressChartCard
                    language={language}
                    sessions={sessions}
                    levelTargets={levelTargets}
                  />
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
                </Stack>
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
