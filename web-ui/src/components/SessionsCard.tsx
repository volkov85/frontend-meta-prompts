import { Button, Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import { LEVEL_LABELS, UI_COPY } from "../lib/uiCopy";
import { InterviewLanguage, Session } from "../lib/types";

type SessionsCardProps = {
  handleClearSessions: () => void;
  language: InterviewLanguage;
  refreshSessions: () => void;
  sessions: Session[];
};

export const SessionsCard = ({
  handleClearSessions,
  language,
  refreshSessions,
  sessions,
}: SessionsCardProps) => {
  const copy = UI_COPY[language];
  const levelLabels = LEVEL_LABELS[language];

  return (
    <Card className="fade-up">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h6">{copy.recentSessions}</Typography>
          <Stack direction="row" spacing={1}>
            <Button size="small" color="error" onClick={handleClearSessions}>
              {copy.clearSessions}
            </Button>
            <Button size="small" onClick={refreshSessions}>
              {copy.refresh}
            </Button>
          </Stack>
        </Stack>
        <Divider sx={{ mb: 1.5 }} />
        <Stack spacing={1}>
          {sessions.length === 0 && (
            <Typography color="text.secondary">{copy.noSessions}</Typography>
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
                  {levelLabels[session.level]} | {new Date(session.date).toLocaleString(language)}
                </Typography>
                <Typography variant="body2">
                  {copy.sessionPrefix}: {session.id}
                </Typography>
                <Typography variant="body2">
                  {copy.scorePrefix}: {session.score === undefined ? copy.notRated : session.score}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};
