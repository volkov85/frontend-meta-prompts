import { Button, Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import { Session } from "../lib/types";

type SessionsCardProps = {
  handleClearSessions: () => void;
  refreshSessions: () => void;
  sessions: Session[];
};

export const SessionsCard = ({
  handleClearSessions,
  refreshSessions,
  sessions,
}: SessionsCardProps) => {
  return (
    <Card className="fade-up">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
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
  );
};
