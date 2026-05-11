import { Box, ButtonBase, Card, CardContent, Stack, Tooltip, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { HorizonToggle, HorizonWeeks } from "./HorizonToggle";
import { UI_COPY } from "../lib/uiCopy";
import { computeTopicHeatmap, heatmapIntensityLevel } from "../lib/topicHeatmap";
import { InterviewLanguage, InterviewTemplate, Session } from "../lib/types";

type TopicHeatmapCardProps = {
  language: InterviewLanguage;
  sessions: Session[];
  templates: InterviewTemplate[];
  onTagSelect?: (tag: string) => void;
};

const CELL_HEIGHT = 18;
const CELL_GAP = 3;

const INTENSITY_FILLS = [
  "rgba(148, 163, 184, 0.12)",
  "rgba(244, 114, 182, 0.32)",
  "rgba(244, 114, 182, 0.55)",
  "rgba(244, 114, 182, 0.78)",
  "rgba(244, 114, 182, 1)",
];

const formatWeekStart = (language: InterviewLanguage, date: Date): string => {
  const locale = language === "ru" ? "ru-RU" : "en-US";
  return date.toLocaleDateString(locale, { month: "short", day: "numeric" });
};

export const TopicHeatmapCard = ({
  language,
  sessions,
  templates,
  onTagSelect,
}: TopicHeatmapCardProps) => {
  const copy = UI_COPY[language];
  const now = useMemo(() => new Date(), []);
  const [weeks, setWeeks] = useState<HorizonWeeks>(12);
  const heatmap = useMemo(
    () => computeTopicHeatmap(sessions, templates, now, weeks),
    [sessions, templates, now, weeks],
  );

  const hasData = heatmap.rows.length > 0 && heatmap.totalSessions > 0;
  const tagClickable = Boolean(onTagSelect);

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
            <Typography variant="h6">{copy.topicHeatmapTitle}</Typography>
            <Typography variant="body2" color="text.secondary">
              {copy.topicHeatmapSubtitle(weeks)}
            </Typography>
          </Box>
          <HorizonToggle language={language} value={weeks} onChange={setWeeks} />
        </Stack>

        {!hasData ? (
          <Typography variant="body2" color="text.secondary">
            {copy.topicHeatmapEmpty}
          </Typography>
        ) : (
          <Box>
            <Box
              role="table"
              aria-label={copy.topicHeatmapTitle}
              sx={{
                display: "grid",
                gridTemplateColumns: `minmax(96px, max-content) repeat(${heatmap.weeks.length}, minmax(${CELL_HEIGHT}px, 1fr))`,
                gap: `${CELL_GAP}px`,
                alignItems: "center",
                overflowX: "auto",
                pb: 1,
              }}
            >
              {heatmap.rows.map((row) => (
                <Box key={row.tag} role="row" sx={{ display: "contents" }}>
                  {tagClickable ? (
                    <ButtonBase
                      onClick={() => onTagSelect?.(row.tag)}
                      aria-label={copy.topicHeatmapTagAriaLabel(row.tag)}
                      sx={{
                        justifyContent: "flex-start",
                        fontFamily: "monospace",
                        fontSize: "0.75rem",
                        color: "text.primary",
                        pr: 1,
                        whiteSpace: "nowrap",
                        borderRadius: "3px",
                        "&:hover": {
                          color: "primary.main",
                          textDecoration: "underline",
                        },
                        "&:focus-visible": {
                          outline: (theme) => `2px solid ${theme.palette.primary.main}`,
                          outlineOffset: 2,
                        },
                      }}
                    >
                      {row.tag}
                    </ButtonBase>
                  ) : (
                    <Typography
                      role="rowheader"
                      variant="caption"
                      sx={{
                        fontFamily: "monospace",
                        color: "text.primary",
                        pr: 1,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.tag}
                    </Typography>
                  )}
                  {row.cells.map((count, index) => {
                    const intensity = heatmapIntensityLevel(count, heatmap.maxCount);
                    const week = heatmap.weeks[index];
                    const tooltipText = copy.topicHeatmapCellTooltip(
                      row.tag,
                      formatWeekStart(language, week.weekStart),
                      count,
                    );
                    return (
                      <Tooltip key={`${row.tag}-${index}`} title={tooltipText} arrow>
                        <Box
                          role="cell"
                          aria-label={tooltipText}
                          sx={{
                            height: CELL_HEIGHT,
                            minWidth: CELL_HEIGHT,
                            borderRadius: "3px",
                            backgroundColor: INTENSITY_FILLS[intensity],
                            transition: "transform 120ms ease",
                            cursor: count > 0 ? "pointer" : "default",
                            "&:hover": {
                              transform: count > 0 ? "scale(1.08)" : "none",
                            },
                          }}
                        />
                      </Tooltip>
                    );
                  })}
                </Box>
              ))}
            </Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mt: 1.5 }}
              aria-label={copy.topicHeatmapLegend}
            >
              <Typography variant="caption" color="text.secondary">
                {copy.topicHeatmapLegendLess}
              </Typography>
              {INTENSITY_FILLS.map((fill, index) => (
                <Box
                  key={index}
                  sx={{
                    width: CELL_HEIGHT,
                    height: CELL_HEIGHT,
                    borderRadius: "3px",
                    backgroundColor: fill,
                  }}
                />
              ))}
              <Typography variant="caption" color="text.secondary">
                {copy.topicHeatmapLegendMore}
              </Typography>
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
