import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { ALL_LEVELS } from "../lib/useInterviewAppState";
import { LEVEL_LABELS, UI_COPY } from "../lib/uiCopy";
import { InterviewLanguage, InterviewTemplate, Level } from "../lib/types";

type InterviewSetupCardProps = {
  busy: boolean;
  companyBar: string;
  companyBarPresets: readonly string[];
  extraContext: string;
  focusInput: string;
  generatePrompt: () => Promise<void>;
  handleCopyShareLink: () => Promise<void>;
  language: InterviewLanguage;
  level: Level;
  persistSession: boolean;
  setCompanyBar: (value: string) => void;
  setExtraContext: (value: string) => void;
  setFocusInput: (value: string) => void;
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
  companyBar,
  companyBarPresets,
  extraContext,
  focusInput,
  generatePrompt,
  handleCopyShareLink,
  language,
  level,
  persistSession,
  setCompanyBar,
  setExtraContext,
  setFocusInput,
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
  const copy = UI_COPY[language];
  const levelLabels = LEVEL_LABELS[language];

  return (
    <Card className="fade-up" sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {copy.setupTitle}
        </Typography>
        <Stack spacing={1.5}>
          <TextField
            select
            label={copy.level}
            value={level}
            onChange={(event) => setLevel(event.target.value as Level)}
            fullWidth
          >
            {ALL_LEVELS.map((option) => (
              <MenuItem key={option} value={option}>
                {levelLabels[option]}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label={copy.template}
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
            label={copy.stack}
            value={stackInput}
            onChange={(event) => setStackInput(event.target.value)}
            fullWidth
          />
          <TextField
            label={copy.focusBoost}
            value={focusInput}
            onChange={(event) => setFocusInput(event.target.value)}
            fullWidth
          />
          <TextField
            label={copy.extraContext}
            value={extraContext}
            onChange={(event) => setExtraContext(event.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
          <Box>
            <TextField
              label={copy.companyBar}
              value={companyBar}
              onChange={(event) => setCompanyBar(event.target.value)}
              fullWidth
              helperText={copy.companyBarHelper}
            />
            {companyBarPresets.length > 0 && (
              <Stack
                direction="row"
                spacing={0.75}
                useFlexGap
                flexWrap="wrap"
                sx={{ mt: 1 }}
                role="group"
                aria-label={copy.companyBarPresets}
              >
                {companyBarPresets.map((preset) => {
                  const selected = companyBar.trim() === preset;
                  return (
                    <Chip
                      key={preset}
                      label={preset}
                      size="small"
                      onClick={() => setCompanyBar(preset)}
                      color={selected ? "primary" : "default"}
                      variant={selected ? "filled" : "outlined"}
                    />
                  );
                })}
              </Stack>
            )}
          </Box>
          <TextField
            type="number"
            label={copy.timebox}
            value={timebox}
            onChange={(event) => setTimebox(Number(event.target.value))}
            fullWidth
          />

          <Stack direction="row" spacing={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={simulation}
                  onChange={(event) => setSimulation(event.target.checked)}
                />
              }
              label={copy.simulation}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={persistSession}
                  onChange={(event) => setPersistSession(event.target.checked)}
                />
              }
              label={copy.createSession}
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button
              variant="contained"
              size="large"
              onClick={generatePrompt}
              disabled={busy || !templateId}
              sx={{ flex: 1 }}
            >
              {copy.generatePrompt}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={handleCopyShareLink}
              disabled={busy || !templateId}
            >
              {copy.copyShareLink}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
