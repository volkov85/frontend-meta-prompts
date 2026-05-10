import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { LEVEL_LABELS, rubricAxisLabel, UI_COPY } from "../lib/uiCopy";
import { InterviewLanguage, RUBRIC_AXES, Session, SessionContext } from "../lib/types";

type SessionPromptDialogProps = {
  language: InterviewLanguage;
  open: boolean;
  onClose: () => void;
  session: Session | null;
  onCopyPrompt: (prompt: string) => void;
};

const formatList = (value: string[] | undefined, fallback: string): string => {
  if (!value || value.length === 0) return fallback;
  return value.join(", ");
};

const formatBoolean = (
  value: boolean | undefined,
  yes: string,
  no: string,
  fallback: string,
): string => {
  if (value === undefined) return fallback;
  return value ? yes : no;
};

const formatLanguage = (
  value: InterviewLanguage | undefined,
  language: InterviewLanguage,
): string => {
  if (!value) return UI_COPY[language].notAvailable;
  return value === "en" ? "EN" : "RU";
};

const formatNumber = (value: number | undefined, fallback: string): string => {
  if (value === undefined || !Number.isFinite(value)) return fallback;
  return String(value);
};

const formatString = (value: string | undefined, fallback: string): string => {
  if (!value || !value.trim()) return fallback;
  return value;
};

type ContextRow = {
  label: string;
  value: string;
};

const buildContextRows = (
  context: SessionContext | undefined,
  language: InterviewLanguage,
): ContextRow[] => {
  if (!context) return [];
  const copy = UI_COPY[language];
  const fallback = copy.notAvailable;

  return [
    { label: copy.viewPromptContextStack, value: formatList(context.stack, fallback) },
    { label: copy.viewPromptContextFocus, value: formatList(context.focusBoost, fallback) },
    { label: copy.viewPromptContextExtra, value: formatString(context.extraContext, fallback) },
    {
      label: copy.viewPromptContextTimebox,
      value: formatNumber(context.timeboxedMinutes, fallback),
    },
    {
      label: copy.viewPromptContextSimulation,
      value: formatBoolean(context.simulation, copy.yes, copy.no, fallback),
    },
    {
      label: copy.viewPromptContextLanguage,
      value: formatLanguage(context.language, language),
    },
    {
      label: copy.viewPromptContextCompanyBar,
      value: formatString(context.companyBar, fallback),
    },
  ];
};

export const SessionPromptDialog = ({
  language,
  open,
  onClose,
  session,
  onCopyPrompt,
}: SessionPromptDialogProps) => {
  const copy = UI_COPY[language];
  const levelLabels = LEVEL_LABELS[language];
  const contextRows = buildContextRows(session?.context, language);
  const hasContext = contextRows.some((row) => row.value !== copy.notAvailable);
  const prompt = session?.prompt ?? "";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="session-prompt-dialog-title"
    >
      <DialogTitle id="session-prompt-dialog-title">{copy.viewPromptDialogTitle}</DialogTitle>
      <DialogContent dividers>
        {session && (
          <Stack spacing={2}>
            <Stack spacing={0.25}>
              <Typography sx={{ fontWeight: 700 }}>{session.templateId}</Typography>
              <Typography variant="body2" color="text.secondary">
                {levelLabels[session.level]} | {new Date(session.date).toLocaleString(language)}
              </Typography>
              <Typography variant="body2">
                {copy.sessionPrefix}: {session.id}
              </Typography>
            </Stack>

            {prompt ? (
              <Typography
                component="pre"
                sx={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
                  fontSize: "0.875rem",
                  m: 0,
                  p: 1.5,
                  borderRadius: 1,
                  border: "1px solid rgba(148, 163, 184, 0.18)",
                  backgroundColor: "rgba(2, 6, 23, 0.55)",
                  maxHeight: 360,
                  overflow: "auto",
                }}
              >
                {prompt}
              </Typography>
            ) : (
              <Alert severity="info">{copy.viewPromptUnavailable}</Alert>
            )}

            {session.rubric && (
              <>
                <Divider />
                <Stack spacing={1}>
                  <Typography variant="subtitle2">{copy.rubricMarkdownLabel}</Typography>
                  <Stack spacing={0.5}>
                    {RUBRIC_AXES.map((axis) => (
                      <Stack
                        key={axis}
                        direction={{ xs: "column", sm: "row" }}
                        spacing={{ xs: 0, sm: 1 }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ minWidth: { sm: 180 } }}
                        >
                          {rubricAxisLabel(language, axis)}
                        </Typography>
                        <Typography variant="body2">{session.rubric![axis]}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </>
            )}

            <Divider />

            <Stack spacing={1}>
              <Typography variant="subtitle2">{copy.viewPromptContextTitle}</Typography>
              {hasContext ? (
                <Stack spacing={0.5}>
                  {contextRows.map((row) => (
                    <Stack
                      key={row.label}
                      direction={{ xs: "column", sm: "row" }}
                      spacing={{ xs: 0, sm: 1 }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ minWidth: { sm: 180 } }}
                      >
                        {row.label}
                      </Typography>
                      <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                        {row.value}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {copy.viewPromptContextEmpty}
                </Typography>
              )}
            </Stack>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => prompt && onCopyPrompt(prompt)}
          disabled={!prompt}
          variant="outlined"
        >
          {copy.viewPromptCopy}
        </Button>
        <Button onClick={onClose} variant="contained">
          {copy.viewPromptClose}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
