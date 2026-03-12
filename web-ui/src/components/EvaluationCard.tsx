import { Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { UI_COPY } from "../lib/uiCopy";
import { InterviewLanguage } from "../lib/types";

type EvaluationCardProps = {
  activeSessionId: string;
  busy: boolean;
  language: InterviewLanguage;
  notes: string;
  saveEvaluation: () => Promise<void>;
  score: string;
  setActiveSessionId: (value: string) => void;
  setNotes: (value: string) => void;
  setScore: (value: string) => void;
};

export const EvaluationCard = ({
  activeSessionId,
  busy,
  language,
  notes,
  saveEvaluation,
  score,
  setActiveSessionId,
  setNotes,
  setScore,
}: EvaluationCardProps) => {
  const copy = UI_COPY[language];

  return (
    <Card className="fade-up">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {copy.evaluationTitle}
        </Typography>
        <Stack spacing={1.5}>
          <TextField
            label={copy.sessionId}
            value={activeSessionId}
            onChange={(event) => setActiveSessionId(event.target.value)}
            fullWidth
          />
          <TextField
            label={copy.score}
            type="number"
            inputProps={{ min: 0, max: 10, step: 0.1 }}
            value={score}
            onChange={(event) => setScore(event.target.value)}
            fullWidth
          />
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
            disabled={busy || !activeSessionId || score === ""}
          >
            {copy.saveScore}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};
