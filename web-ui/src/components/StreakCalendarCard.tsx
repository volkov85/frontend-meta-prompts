import { Box, Card, CardContent, Chip, Stack, Tooltip, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { HorizonToggle, HorizonWeeks } from "./HorizonToggle";
import { UI_COPY } from "../lib/uiCopy";
import {
  calendarIntensityLevel,
  computeActivityCalendar,
  computeStreak,
} from "../lib/streakCalendar";
import { InterviewLanguage, Session } from "../lib/types";

type StreakCalendarCardProps = {
  language: InterviewLanguage;
  sessions: Session[];
  onCurrentStreakClick?: (days: number) => void;
};

const CELL_SIZE = 14;
const CELL_GAP = 3;

const INTENSITY_FILLS = [
  "rgba(148, 163, 184, 0.12)",
  "rgba(56, 189, 248, 0.32)",
  "rgba(56, 189, 248, 0.55)",
  "rgba(56, 189, 248, 0.78)",
  "rgba(56, 189, 248, 1)",
];

const FUTURE_FILL = "rgba(148, 163, 184, 0.04)";

const formatDate = (language: InterviewLanguage, date: Date): string => {
  const locale = language === "ru" ? "ru-RU" : "en-US";
  return date.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
};

export const StreakCalendarCard = ({
  language,
  sessions,
  onCurrentStreakClick,
}: StreakCalendarCardProps) => {
  const copy = UI_COPY[language];
  const now = useMemo(() => new Date(), []);
  const [weeks, setWeeks] = useState<HorizonWeeks>(12);
  const calendar = useMemo(
    () => computeActivityCalendar(sessions, now, weeks),
    [sessions, now, weeks],
  );
  const streak = useMemo(() => computeStreak(sessions, now), [sessions, now]);

  const hasActivity = calendar.totalSessions > 0;
  const currentChipClickable = streak.current > 0 && Boolean(onCurrentStreakClick);

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
          <Box>
            <Typography variant="h6">{copy.streakCalendarTitle}</Typography>
            <Typography variant="body2" color="text.secondary">
              {copy.streakCalendarSubtitle(weeks)}
            </Typography>
          </Box>
          <HorizonToggle language={language} value={weeks} onChange={setWeeks} />
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }} useFlexGap>
          <Chip
            size="small"
            color={streak.current > 0 ? "primary" : "default"}
            variant={streak.current > 0 ? "filled" : "outlined"}
            label={copy.streakCurrentChip(streak.current)}
            clickable={currentChipClickable}
            onClick={
              currentChipClickable ? () => onCurrentStreakClick?.(streak.current) : undefined
            }
          />
          <Chip size="small" variant="outlined" label={copy.streakLongestChip(streak.longest)} />
          <Chip
            size="small"
            variant="outlined"
            label={copy.streakActiveDaysChip(streak.totalActiveDays)}
          />
        </Stack>

        {!hasActivity ? (
          <Typography variant="body2" color="text.secondary">
            {copy.streakCalendarEmpty}
          </Typography>
        ) : (
          <Box>
            <Box
              role="grid"
              aria-label={copy.streakCalendarTitle}
              sx={{
                display: "grid",
                gridAutoFlow: "column",
                gridTemplateRows: `repeat(7, ${CELL_SIZE}px)`,
                gridAutoColumns: `${CELL_SIZE}px`,
                gap: `${CELL_GAP}px`,
                overflowX: "auto",
                pb: 1,
              }}
            >
              {calendar.weeks.map((week) =>
                week.days.map((cell) => {
                  const intensity = calendarIntensityLevel(cell.count, calendar.maxCount);
                  const fill = cell.isFuture ? FUTURE_FILL : INTENSITY_FILLS[intensity];
                  const tooltipText = cell.isFuture
                    ? formatDate(language, cell.date)
                    : copy.streakCalendarCellTooltip(formatDate(language, cell.date), cell.count);
                  return (
                    <Tooltip key={cell.dateKey} title={tooltipText} arrow>
                      <Box
                        role="gridcell"
                        aria-label={tooltipText}
                        sx={{
                          width: CELL_SIZE,
                          height: CELL_SIZE,
                          borderRadius: "3px",
                          backgroundColor: fill,
                          opacity: cell.isFuture ? 0.5 : 1,
                          cursor: cell.isFuture ? "default" : "pointer",
                          transition: "transform 120ms ease",
                          "&:hover": {
                            transform: cell.isFuture ? "none" : "scale(1.15)",
                          },
                        }}
                      />
                    </Tooltip>
                  );
                }),
              )}
            </Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mt: 1.5 }}
              aria-label={copy.streakCalendarLegend}
            >
              <Typography variant="caption" color="text.secondary">
                {copy.streakCalendarLegendLess}
              </Typography>
              {INTENSITY_FILLS.map((fill, index) => (
                <Box
                  key={index}
                  sx={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    borderRadius: "3px",
                    backgroundColor: fill,
                  }}
                />
              ))}
              <Typography variant="caption" color="text.secondary">
                {copy.streakCalendarLegendMore}
              </Typography>
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
