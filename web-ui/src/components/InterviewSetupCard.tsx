import {
  Button,
  Card,
  CardContent,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { ALL_LEVELS, InterviewLanguage } from "../lib/useInterviewAppState";
import { InterviewTemplate, Level } from "../lib/types";

type InterviewSetupCardProps = {
  busy: boolean;
  extraContext: string;
  focusInput: string;
  generatePrompt: () => Promise<void>;
  language: InterviewLanguage;
  level: Level;
  persistSession: boolean;
  setExtraContext: (value: string) => void;
  setFocusInput: (value: string) => void;
  setLanguage: (value: InterviewLanguage) => void;
  setLevel: (value: Level) => void;
  setPersistSession: (value: boolean) => void;
  setSimulation: (value: boolean) => void;
  setStackInput: (value: string) => void;
  setTemplateId: (value: string) => void;
  setTimebox: (value: number) => void;
  simulation: boolean;
  stackInput: string;
  templateId: string;
  templatesForLevel: InterviewTemplate[];
  timebox: number;
};

export const InterviewSetupCard = ({
  busy,
  extraContext,
  focusInput,
  generatePrompt,
  language,
  level,
  persistSession,
  setExtraContext,
  setFocusInput,
  setLanguage,
  setLevel,
  setPersistSession,
  setSimulation,
  setStackInput,
  setTemplateId,
  setTimebox,
  simulation,
  stackInput,
  templateId,
  templatesForLevel,
  timebox,
}: InterviewSetupCardProps) => {
  return (
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
                <Switch checked={simulation} onChange={(event) => setSimulation(event.target.checked)} />
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

          <Button variant="contained" size="large" onClick={generatePrompt} disabled={busy || !templateId}>
            Generate Prompt
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};
