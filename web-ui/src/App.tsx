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

type Level = "junior" | "middle" | "senior";

type Template = {
  id: string;
  title: string;
  levels: Level[];
  focus: string[];
};

type Session = {
  id: string;
  date: string;
  templateId: string;
  level: Level;
  score?: number;
  notes?: string;
};

type TemplatesResponse = {
  defaults: {
    stack: string[];
    simulation: boolean;
    timeboxedMinutes: number;
  };
  templates: Template[];
};

type SessionsResponse = {
  sessions: Session[];
};

type InterviewLanguage = "en" | "ru";

const ALL_LEVELS: Level[] = ["junior", "middle", "senior"];
const API_BASE = import.meta.env.VITE_API_BASE ?? "";

function parseCsv(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, init);
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? "Request failed");
  }
  return payload as T;
}

export default function App() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
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

  async function refreshSessions() {
    const payload = await requestJson<SessionsResponse>("/api/sessions");
    setSessions(payload.sessions);
  }

  async function loadInitial() {
    try {
      setLoading(true);
      const [templatesPayload, sessionsPayload] = await Promise.all([
        requestJson<TemplatesResponse>("/api/templates"),
        requestJson<SessionsResponse>("/api/sessions"),
      ]);

      setTemplates(templatesPayload.templates);
      setSessions(sessionsPayload.sessions);

      const juniorTemplate = templatesPayload.templates.find((template) =>
        template.levels.includes("junior"),
      );
      setLevel("junior");
      setTemplateId(juniorTemplate?.id ?? templatesPayload.templates[0]?.id ?? "");

      setStackInput((templatesPayload.defaults.stack ?? []).join(", "));
      setSimulation(Boolean(templatesPayload.defaults.simulation));
      setTimebox(Number(templatesPayload.defaults.timeboxedMinutes ?? 30));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : String(loadError));
    } finally {
      setLoading(false);
    }
  }

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

  async function generatePrompt() {
    try {
      setBusy(true);
      setError("");
      const payload = await requestJson<{ prompt: string; sessionId: string | null }>(
        "/api/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateId,
            level,
            stack: parseCsv(stackInput),
            focusBoost: parseCsv(focusInput),
            extraContext,
            simulation,
            english: language === "en",
            timeboxedMinutes: Number(timebox),
            persistSession,
          }),
        },
      );

      setPrompt(payload.prompt);
      if (payload.sessionId) {
        setActiveSessionId(payload.sessionId);
        setSnack(`Session created: ${payload.sessionId}`);
      } else {
        setActiveSessionId("");
      }
      await refreshSessions();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setBusy(false);
    }
  }

  async function saveEvaluation() {
    try {
      setBusy(true);
      setError("");
      await requestJson("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          score: Number(score),
          notes,
        }),
      });

      setSnack("Evaluation saved");
      setScore("");
      setNotes("");
      await refreshSessions();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setBusy(false);
    }
  }

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
        {loading && <LinearProgress />}
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
                  <Button size="small" onClick={refreshSessions}>
                    Refresh
                  </Button>
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
}
