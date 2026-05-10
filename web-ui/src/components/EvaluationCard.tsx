import { Box, Button, Card, CardContent, Chip, Stack, TextField, Typography } from "@mui/material";
import { rubricAxisHint, rubricAxisLabel, UI_COPY } from "../lib/uiCopy";
import { InterviewLanguage, RUBRIC_AXES, RubricAxis } from "../lib/types";

type EvaluationCardProps = {
  activeSessionId: string;
  busy: boolean;
  language: InterviewLanguage;
  notes: string;
  rubricAggregate: number | null;
  rubricInputs: Record<RubricAxis, string>;
  saveEvaluation: () => Promise<void>;
  setActiveSessionId: (value: string) => void;
  setNotes: (value: string) => void;
  setRubricAxis: (axis: RubricAxis, value: string) => void;
};

export const EvaluationCard = ({
  activeSessionId,
  busy,
  language,
  notes,
  rubricAggregate,
  rubricInputs,
  saveEvaluation,
  setActiveSessionId,
  setNotes,
  setRubricAxis,
}: EvaluationCardProps) => {
  const copy = UI_COPY[language];
  const allAxesFilled = RUBRIC_AXES.every((axis) => rubricInputs[axis] !== "");

  return (
    <Card className="fade-up">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {copy.evaluationTitle}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {copy.rubricSubtitle}
        </Typography>
        <Stack spacing={1.5}>
          <TextField
            label={copy.sessionId}
            value={activeSessionId}
            onChange={(event) => setActiveSessionId(event.target.value)}
            fullWidth
          />
          <Box
            sx={{
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            }}
          >
            {RUBRIC_AXES.map((axis) => (
              <TextField
                key={axis}
                label={rubricAxisLabel(language, axis)}
                helperText={rubricAxisHint(language, axis)}
                type="number"
                inputProps={{
                  min: 0,
                  max: 10,
                  step: 0.5,
                  "aria-label": rubricAxisLabel(language, axis),
                }}
                value={rubricInputs[axis]}
                onChange={(event) => setRubricAxis(axis, event.target.value)}
                fullWidth
              />
            ))}
          </Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" color="text.secondary">
              {copy.rubricAggregateLabel}:
            </Typography>
            {allAxesFilled && rubricAggregate !== null ? (
              <Chip
                label={rubricAggregate.toFixed(2)}
                color="primary"
                size="small"
                role="status"
                aria-live="polite"
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                {copy.rubricAggregatePending}
              </Typography>
            )}
          </Stack>
          <TextField
            label={copy.notes}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            multiline
            minRows={3}
            fullWidth
          />
          <Button
            variant="outlined"
            onClick={saveEvaluation}
            disabled={busy || !activeSessionId || !allAxesFilled}
          >
            {copy.saveScore}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};
