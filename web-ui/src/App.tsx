import {
  Alert,
  AppBar,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Snackbar,
  Toolbar,
  Typography,
} from "@mui/material";
import { EvaluationCard, InterviewSetupCard, SessionsCard } from "./components";
import { useInterviewAppState } from "./lib/useInterviewAppState";

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

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{ backdropFilter: "blur(10px)", background: "rgba(2, 6, 23, 0.9)" }}
      >
        <Toolbar>
          <Typography variant="h6">Frontend Meta Prompts</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Chip label="React + MUI" color="secondary" />
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
              setLanguage={setLanguage}
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
                <Typography variant="h6" gutterBottom>
                  Prompt Output
                </Typography>
                <Divider sx={{ mb: 1.5 }} />
                {prompt ? (
                  <Typography className="prompt-output">{prompt}</Typography>
                ) : (
                  <Typography color="text.secondary">Generated prompt will appear here.</Typography>
                )}
              </CardContent>
            </Card>

            <SessionsCard
              handleClearSessions={handleClearSessions}
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
