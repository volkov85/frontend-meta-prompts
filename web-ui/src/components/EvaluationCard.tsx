import { Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";

type EvaluationCardProps = {
  activeSessionId: string;
  busy: boolean;
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
  notes,
  saveEvaluation,
  score,
  setActiveSessionId,
  setNotes,
  setScore,
}: EvaluationCardProps) => {
  return (
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
  );
};
