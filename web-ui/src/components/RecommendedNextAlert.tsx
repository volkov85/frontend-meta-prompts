import { Alert, AlertTitle, Button, IconButton, Stack } from "@mui/material";
import { rubricAxisLabel, UI_COPY } from "../lib/uiCopy";
import { InterviewLanguage } from "../lib/types";
import { SessionRecommendation } from "../lib/recommendNextSession";

type RecommendedNextAlertProps = {
  language: InterviewLanguage;
  recommendation: SessionRecommendation;
  onApply: () => void;
  onDismiss: () => void;
};

export const RecommendedNextAlert = ({
  language,
  recommendation,
  onApply,
  onDismiss,
}: RecommendedNextAlertProps) => {
  const copy = UI_COPY[language];
  const axisLabel = rubricAxisLabel(language, recommendation.weakestAxis);
  const scoreText = recommendation.weakestScore.toFixed(1);
  const body = copy.recommendationBody(axisLabel, scoreText, recommendation.templateTitle);

  return (
    <Alert
      severity="info"
      variant="outlined"
      sx={{ mb: 2 }}
      role="status"
      action={
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            color="inherit"
            size="small"
            variant="contained"
            onClick={onApply}
            sx={{ whiteSpace: "nowrap" }}
          >
            {copy.recommendationApply}
          </Button>
          <IconButton
            size="small"
            aria-label={copy.recommendationDismiss}
            onClick={onDismiss}
            sx={{ color: "inherit" }}
          >
            <span aria-hidden="true">×</span>
          </IconButton>
        </Stack>
      }
    >
      <AlertTitle sx={{ mb: 0.5 }}>{copy.recommendationTitle}</AlertTitle>
      {body}
    </Alert>
  );
};
