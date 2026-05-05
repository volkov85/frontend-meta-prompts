import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useRef, useState } from "react";
import { SessionPromptDialog } from "./SessionPromptDialog";
import { LEVEL_LABELS, UI_COPY } from "../lib/uiCopy";
import { InterviewLanguage, Session } from "../lib/types";

type SessionsCardProps = {
  handleClearSessions: () => void;
  language: InterviewLanguage;
  refreshSessions: () => void;
  sessions: Session[];
  onCopyPrompt?: (prompt: string) => void;
  onExportJson?: () => void;
  onExportMarkdown?: () => void;
  onImportJson?: (file: File) => void;
};

export const SessionsCard = ({
  handleClearSessions,
  language,
  refreshSessions,
  sessions,
  onCopyPrompt,
  onExportJson,
  onExportMarkdown,
  onImportJson,
}: SessionsCardProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [levelFilter, setLevelFilter] = useState<"all" | Session["level"]>("all");
  const [scoreFilter, setScoreFilter] = useState<"all" | "rated" | "unrated">("all");
  const [activePromptSessionId, setActivePromptSessionId] = useState<string | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const copy = UI_COPY[language];
  const levelLabels = LEVEL_LABELS[language];
  const activePromptSession = useMemo(
    () =>
      activePromptSessionId
        ? (sessions.find((session) => session.id === activePromptSessionId) ?? null)
        : null,
    [activePromptSessionId, sessions],
  );
  const filteredSessions = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase();

    return sessions.filter((session) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        session.id.toLowerCase().includes(normalizedQuery) ||
        session.templateId.toLowerCase().includes(normalizedQuery) ||
        session.notes?.toLowerCase().includes(normalizedQuery);
      const matchesLevel = levelFilter === "all" || session.level === levelFilter;
      const isRated = session.score !== undefined;
      const matchesScore =
        scoreFilter === "all" ||
        (scoreFilter === "rated" && isRated) ||
        (scoreFilter === "unrated" && !isRated);

      return matchesQuery && matchesLevel && matchesScore;
    });
  }, [levelFilter, scoreFilter, searchValue, sessions]);

  return (
    <Card className="fade-up">
      <CardContent>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1}
          sx={{ mb: 1 }}
        >
          <Typography variant="h6">{copy.recentSessions}</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
            {onExportJson && (
              <Button
                size="small"
                onClick={onExportJson}
                disabled={sessions.length === 0}
                aria-label={copy.exportJson}
              >
                {copy.exportJson}
              </Button>
            )}
            {onExportMarkdown && (
              <Button
                size="small"
                onClick={onExportMarkdown}
                disabled={sessions.length === 0}
                aria-label={copy.exportMarkdown}
              >
                {copy.exportMarkdown}
              </Button>
            )}
            {onImportJson && (
              <>
                <Button
                  size="small"
                  onClick={() => importInputRef.current?.click()}
                  aria-label={copy.importJson}
                >
                  {copy.importJson}
                </Button>
                <input
                  ref={importInputRef}
                  type="file"
                  accept="application/json,.json"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      onImportJson(file);
                    }
                    event.target.value = "";
                  }}
                />
              </>
            )}
            <Button
              size="small"
              color="error"
              onClick={() => setClearConfirmOpen(true)}
              disabled={sessions.length === 0}
            >
              {copy.clearSessions}
            </Button>
            <Button size="small" onClick={refreshSessions}>
              {copy.refresh}
            </Button>
          </Stack>
        </Stack>
        <Divider sx={{ mb: 1.5 }} />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ mb: 1.5 }}>
          <TextField
            size="small"
            fullWidth
            label={copy.sessionSearch}
            placeholder={copy.sessionSearchPlaceholder}
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
          <TextField
            select
            size="small"
            label={copy.levelFilterLabel}
            value={levelFilter}
            onChange={(event) => setLevelFilter(event.target.value as "all" | Session["level"])}
            sx={{ minWidth: { xs: "100%", sm: 150 } }}
          >
            <MenuItem value="all">{copy.filterAllLevels}</MenuItem>
            <MenuItem value="junior">{levelLabels.junior}</MenuItem>
            <MenuItem value="middle">{levelLabels.middle}</MenuItem>
            <MenuItem value="senior">{levelLabels.senior}</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label={copy.scoreFilterLabel}
            value={scoreFilter}
            onChange={(event) => setScoreFilter(event.target.value as "all" | "rated" | "unrated")}
            sx={{ minWidth: { xs: "100%", sm: 170 } }}
          >
            <MenuItem value="all">{copy.filterAllScores}</MenuItem>
            <MenuItem value="rated">{copy.filterRated}</MenuItem>
            <MenuItem value="unrated">{copy.filterUnrated}</MenuItem>
          </TextField>
        </Stack>
        <Stack spacing={1}>
          {sessions.length === 0 && (
            <Typography color="text.secondary">{copy.noSessions}</Typography>
          )}
          {sessions.length > 0 && filteredSessions.length === 0 && (
            <Typography color="text.secondary">{copy.noFilteredSessions}</Typography>
          )}
          {filteredSessions.slice(0, 10).map((session) => (
            <Card
              key={session.id}
              variant="outlined"
              sx={{ backgroundColor: "rgba(30, 41, 59, 0.65)" }}
            >
              <CardContent sx={{ py: 1.2 }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontWeight: 700 }}>{session.templateId}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {levelLabels[session.level]} |{" "}
                      {new Date(session.date).toLocaleString(language)}
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                      {copy.sessionPrefix}: {session.id}
                    </Typography>
                    <Typography variant="body2">
                      {copy.scorePrefix}:{" "}
                      {session.score === undefined ? copy.notRated : session.score}
                    </Typography>
                  </Stack>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setActivePromptSessionId(session.id)}
                  >
                    {copy.viewPrompt}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </CardContent>
      <SessionPromptDialog
        language={language}
        open={Boolean(activePromptSession)}
        onClose={() => setActivePromptSessionId(null)}
        session={activePromptSession}
        onCopyPrompt={(prompt) => onCopyPrompt?.(prompt)}
      />
      <Dialog
        open={clearConfirmOpen}
        onClose={() => setClearConfirmOpen(false)}
        aria-labelledby="clear-sessions-confirm-title"
        aria-describedby="clear-sessions-confirm-description"
      >
        <DialogTitle id="clear-sessions-confirm-title">
          {copy.clearSessionsConfirmTitle}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="clear-sessions-confirm-description">
            {copy.clearSessionsConfirmBody(sessions.length)}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearConfirmOpen(false)} autoFocus>
            {copy.clearSessionsConfirmCancel}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              setClearConfirmOpen(false);
              handleClearSessions();
            }}
          >
            {copy.clearSessionsConfirmConfirm}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};
