import { useEffect, useMemo, useState } from "react";
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
  FormControlLabel,
  Grid,
  LinearProgress,
  MenuItem,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import interviewsData from "./data/interviews.json";
import { composeInterviewPrompt } from "./lib/composePrompt";
import { clearSessions, createSession, listSessions, updateSessionScore } from "./lib/localSessions";
import { InterviewConfig, InterviewTemplate, Level, Session } from "./lib/types";

type InterviewLanguage = "en" | "ru";

const ALL_LEVELS: Level[] = ["junior", "middle", "senior"];
const config = interviewsData as InterviewConfig;

const parseCsv = (value: string): string[] => {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const App = () => {
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

  const loadInitial = () => {
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
  };

  useEffect(() => {
    loadInitial();
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
            <Card className="fade-up" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Interview Setup
                </Typography>
                <Stack spacing={1.5}>
                  <TextField
                    select
                    label="Template"
                    value={templateId}
                    onChange={(event) => setTemplateId(event.target.value)}
                    fullWidth
                  >
                    {templatesForLevel.map((template) => (
                      <MenuItem key={template.id} value={template.id}>
                        {template.title}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Level"
                    value={level}
                    onChange={(event) => setLevel(event.target.value as Level)}
                    fullWidth
                  >
                    {ALL_LEVELS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Stack (comma separated)"
                    value={stackInput}
                    onChange={(event) => setStackInput(event.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Focus boost (comma separated)"
                    value={focusInput}
                    onChange={(event) => setFocusInput(event.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Extra context"
                    value={extraContext}
                    onChange={(event) => setExtraContext(event.target.value)}
                    multiline
                    minRows={2}
                    fullWidth
                  />
                  <TextField
                    type="number"
                    label="Timebox (minutes)"
                    value={timebox}
                    onChange={(event) => setTimebox(Number(event.target.value))}
                    fullWidth
                  />

                  <Stack direction="row" spacing={1}>
                    <TextField
                      select
                      size="small"
                      label="Language"
                      value={language}
                      onChange={(event) => setLanguage(event.target.value as InterviewLanguage)}
                      sx={{ minWidth: 150 }}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="ru">Russian</MenuItem>
                    </TextField>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={simulation}
                          onChange={(event) => setSimulation(event.target.checked)}
                        />
                      }
                      label="Simulation"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={persistSession}
                          onChange={(event) => setPersistSession(event.target.checked)}
                        />
                      }
                      label="Create session"
                    />
                  </Stack>

                  <Button
                    variant="contained"
                    size="large"
                    onClick={generatePrompt}
                    disabled={busy || !templateId}
                  >
                    Generate Prompt
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Card className="fade-up">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Save Evaluation
                </Typography>
                <Stack spacing={1.5}>
                  <TextField
                    label="Session ID"
                    value={activeSessionId}
                    onChange={(event) => setActiveSessionId(event.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Score (0..10)"
                    type="number"
                    inputProps={{ min: 0, max: 10, step: 0.1 }}
                    value={score}
                    onChange={(event) => setScore(event.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    multiline
                    minRows={3}
                    fullWidth
                  />
                  <Button
                    variant="outlined"
                    onClick={saveEvaluation}
                    disabled={busy || !activeSessionId || score === ""}
                  >
                    Save score
                  </Button>
                </Stack>
              </CardContent>
            </Card>
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

            <Card className="fade-up">
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Typography variant="h6">Recent Sessions</Typography>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" color="error" onClick={handleClearSessions}>
                      Clear sessions
                    </Button>
                    <Button size="small" onClick={refreshSessions}>
                      Refresh
                    </Button>
                  </Stack>
                </Stack>
                <Divider sx={{ mb: 1.5 }} />
                <Stack spacing={1}>
                  {sessions.length === 0 && (
                    <Typography color="text.secondary">No saved sessions yet.</Typography>
                  )}
                  {sessions.slice(0, 10).map((session) => (
                    <Card
                      key={session.id}
                      variant="outlined"
                      sx={{ backgroundColor: "rgba(30, 41, 59, 0.65)" }}
                    >
                      <CardContent sx={{ py: 1.2 }}>
                        <Typography sx={{ fontWeight: 700 }}>{session.templateId}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {session.level} | {new Date(session.date).toLocaleString()}
                        </Typography>
                        <Typography variant="body2">Session: {session.id}</Typography>
                        <Typography variant="body2">
                          Score: {session.score === undefined ? "not rated" : session.score}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </CardContent>
            </Card>
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
