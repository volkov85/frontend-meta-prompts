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
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
} from "@mui/material";
import { MouseEvent } from "react";
import { EvaluationCard, InterviewSetupCard, SessionsCard } from "./components";
import { useInterviewAppState } from "./lib/useInterviewAppState";
import { UI_COPY } from "./lib/uiCopy";
import { InterviewLanguage } from "./lib/types";

const App = () => {
  const {
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
  } = useInterviewAppState();
  const copy = UI_COPY[language];

  const handleLanguageChange = (
    _: MouseEvent<HTMLElement>,
    nextLanguage: InterviewLanguage | null,
  ) => {
    if (nextLanguage) {
      setLanguage(nextLanguage);
    }
  };

  const handleCopyPrompt = async () => {
    if (!prompt) return;

    try {
      await navigator.clipboard.writeText(prompt);
      setSnack(copy.promptCopied);
    } catch {
      setError(copy.promptCopyFailed);
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
          <Alert sx={{ mb: 2 }} severity="error" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <InterviewSetupCard
              busy={busy}
              extraContext={extraContext}
              focusInput={focusInput}
              generatePrompt={generatePrompt}
              language={language}
              level={level}
              persistSession={persistSession}
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
              language={language}
              notes={notes}
              saveEvaluation={saveEvaluation}
              score={score}
              setActiveSessionId={setActiveSessionId}
              setNotes={setNotes}
              setScore={setScore}
            />
          </Grid>

          <Grid item xs={12} md={7}>
            <Card className="fade-up" sx={{ mb: 2 }}>
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
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleCopyPrompt}
                    disabled={!prompt}
                  >
                    {copy.copyPrompt}
                  </Button>
                </Box>
                <Divider sx={{ mb: 1.5 }} />
                {prompt ? (
                  <Typography className="prompt-output">{prompt}</Typography>
                ) : (
                  <Typography color="text.secondary">{copy.promptOutputEmpty}</Typography>
                )}
              </CardContent>
            </Card>

            <SessionsCard
              handleClearSessions={handleClearSessions}
              language={language}
              refreshSessions={refreshSessions}
              sessions={sessions}
            />
          </Grid>
        </Grid>
      </Container>

      <Snackbar open={Boolean(snack)} autoHideDuration={2500} onClose={() => setSnack("")}>
        <Alert severity="success" variant="filled" onClose={() => setSnack("")}>
          {snack}
        </Alert>
      </Snackbar>
    </>
  );
};

export default App;
