import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { useId } from "react";
import { LEVEL_LABELS, UI_COPY } from "../lib/uiCopy";
import { InterviewLanguage, Session } from "../lib/types";

type ProgressChartCardProps = {
  language: InterviewLanguage;
  sessions: Session[];
};

const MAX_POINTS = 6;
const CHART_WIDTH = 560;
const CHART_HEIGHT = 220;
const CHART_PADDING = { top: 18, right: 18, bottom: 34, left: 18 };
const LEVEL_TARGETS = [
  { level: "junior", score: 4, color: "#38bdf8" },
  { level: "middle", score: 6.5, color: "#f59e0b" },
  { level: "senior", score: 8.5, color: "#34d399" },
] as const;

const formatScore = (value: number) => {
  return value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
};

const formatCoverage = (ratedCount: number, totalCount: number) => {
  if (totalCount === 0) return "0%";
  return `${Math.round((ratedCount / totalCount) * 100)}%`;
};

export const ProgressChartCard = ({ language, sessions }: ProgressChartCardProps) => {
  const copy = UI_COPY[language];
  const levelLabels = LEVEL_LABELS[language];
  const chartId = useId().replace(/:/g, "");
  const ratedSessions = sessions
    .filter((session) => session.score !== undefined)
    .slice(0, MAX_POINTS)
    .reverse();
  const latestRatedSession = ratedSessions[ratedSessions.length - 1];
  const latestScore = latestRatedSession?.score;
  const averageScore =
    ratedSessions.length > 0
      ? ratedSessions.reduce((sum, session) => sum + (session.score ?? 0), 0) / ratedSessions.length
      : undefined;

  const plotWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
  const plotHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
  const xStep = ratedSessions.length > 1 ? plotWidth / (ratedSessions.length - 1) : 0;
  const yForScore = (score: number) => CHART_PADDING.top + plotHeight - (score / 10) * plotHeight;

  const points = ratedSessions.map((session, index) => {
    const score = session.score ?? 0;
    return {
      ...session,
      x: CHART_PADDING.left + index * xStep,
      y: yForScore(score),
      score,
    };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath =
    points.length > 1
      ? `${linePath} L ${points[points.length - 1]?.x ?? 0} ${CHART_HEIGHT - CHART_PADDING.bottom} L ${
          points[0]?.x ?? 0
        } ${CHART_HEIGHT - CHART_PADDING.bottom} Z`
      : "";

  return (
    <Card
      className="fade-up"
      sx={{
        mb: 2,
        overflow: "hidden",
        border: "1px solid rgba(125, 211, 252, 0.16)",
        background:
          "radial-gradient(circle at top left, rgba(125, 211, 252, 0.2), transparent 34%), linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.78))",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack spacing={2.25}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={1.5}
          >
            <Box>
              <Typography variant="h6">{copy.progressChartTitle}</Typography>
              <Typography color="text.secondary">{copy.progressChartSubtitle}</Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {LEVEL_TARGETS.map((target) => (
                <Chip
                  key={target.level}
                  label={`${levelLabels[target.level]} ${formatScore(target.score)}+`}
                  size="small"
                  sx={{
                    backgroundColor: "rgba(15, 23, 42, 0.78)",
                    border: `1px solid ${target.color}55`,
                    color: "text.primary",
                  }}
                />
              ))}
            </Stack>
          </Stack>

          <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                borderRadius: 3,
                px: { xs: 1.25, sm: 1.5 },
                py: { xs: 1.5, sm: 1.75 },
                border: "1px solid rgba(148, 163, 184, 0.18)",
                background:
                  "linear-gradient(180deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.55))",
              }}
            >
              {points.length === 0 ? (
                <Stack
                  alignItems="center"
                  justifyContent="center"
                  spacing={1}
                  sx={{ minHeight: 220, textAlign: "center" }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: 380,
                      height: 88,
                      borderRadius: 999,
                      background:
                        "linear-gradient(90deg, rgba(56, 189, 248, 0.1), rgba(251, 113, 133, 0.18), rgba(52, 211, 153, 0.12))",
                      filter: "blur(1px)",
                    }}
                  />
                  <Typography color="text.secondary">{copy.progressChartEmpty}</Typography>
                </Stack>
              ) : (
                <Box
                  role="img"
                  aria-label={copy.progressChartTitle}
                  sx={{ width: "100%", overflow: "hidden" }}
                >
                  <Box
                    component="svg"
                    viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                    sx={{ width: "100%", height: "auto", display: "block" }}
                  >
                    <defs>
                      <linearGradient id={`${chartId}-area`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id={`${chartId}-line`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="50%" stopColor="#fb7185" />
                        <stop offset="100%" stopColor="#34d399" />
                      </linearGradient>
                    </defs>

                    <rect
                      x={CHART_PADDING.left}
                      y={CHART_PADDING.top}
                      width={plotWidth}
                      height={plotHeight}
                      rx={16}
                      fill="rgba(2, 6, 23, 0.48)"
                    />

                    {[0, 2.5, 5, 7.5, 10].map((tick) => {
                      const y = yForScore(tick);
                      return (
                        <g key={tick}>
                          <line
                            x1={CHART_PADDING.left}
                            y1={y}
                            x2={CHART_WIDTH - CHART_PADDING.right}
                            y2={y}
                            stroke="rgba(148, 163, 184, 0.18)"
                            strokeDasharray="4 8"
                          />
                          <text
                            x={CHART_WIDTH - CHART_PADDING.right - 4}
                            y={y - 6}
                            fill="#94a3b8"
                            fontSize="11"
                            textAnchor="end"
                          >
                            {formatScore(tick)}
                          </text>
                        </g>
                      );
                    })}

                    {LEVEL_TARGETS.map((target) => {
                      const y = yForScore(target.score);
                      return (
                        <g key={target.level}>
                          <line
                            x1={CHART_PADDING.left}
                            y1={y}
                            x2={CHART_WIDTH - CHART_PADDING.right}
                            y2={y}
                            stroke={target.color}
                            strokeOpacity="0.5"
                            strokeDasharray="10 10"
                          />
                          <text
                            x={CHART_PADDING.left + 8}
                            y={y - 8}
                            fill={target.color}
                            fontSize="11"
                          >
                            {levelLabels[target.level]}
                          </text>
                        </g>
                      );
                    })}

                    {points.length > 1 && (
                      <>
                        <path d={areaPath} fill={`url(#${chartId}-area)`} />
                        <path
                          d={linePath}
                          fill="none"
                          stroke={`url(#${chartId}-line)`}
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </>
                    )}

                    {points.length === 1 && (
                      <line
                        x1={points[0].x}
                        y1={points[0].y}
                        x2={points[0].x}
                        y2={CHART_HEIGHT - CHART_PADDING.bottom}
                        stroke="rgba(125, 211, 252, 0.3)"
                        strokeDasharray="6 6"
                      />
                    )}

                    {points.map((point) => (
                      <g key={point.id}>
                        <circle cx={point.x} cy={point.y} r="8" fill="rgba(15, 23, 42, 0.95)" />
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r="5"
                          fill="#0f172a"
                          stroke="#e2e8f0"
                          strokeWidth="2"
                        />
                        <text
                          x={point.x}
                          y={CHART_HEIGHT - 12}
                          textAnchor="middle"
                          fill="#cbd5e1"
                          fontSize="11"
                        >
                          {new Date(point.date).toLocaleDateString(language, {
                            month: "short",
                            day: "numeric",
                          })}
                        </text>
                      </g>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>

            <Stack
              spacing={1}
              sx={{
                width: { xs: "100%", lg: 180 },
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  minHeight: 96,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  borderRadius: 3,
                  border: "1px solid rgba(56, 189, 248, 0.22)",
                  backgroundColor: "rgba(8, 15, 28, 0.72)",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {copy.progressAverage}
                </Typography>
                <Typography variant="h4">
                  {averageScore === undefined ? "--" : formatScore(averageScore)}
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1.5,
                  minHeight: 96,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  borderRadius: 3,
                  border: "1px solid rgba(251, 113, 133, 0.22)",
                  backgroundColor: "rgba(8, 15, 28, 0.72)",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {copy.progressLatest}
                </Typography>
                <Typography variant="h4">
                  {latestScore === undefined ? "--" : formatScore(latestScore)}
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1.5,
                  minHeight: 96,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  borderRadius: 3,
                  border: "1px solid rgba(52, 211, 153, 0.22)",
                  backgroundColor: "rgba(8, 15, 28, 0.72)",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {copy.progressCoverage}
                </Typography>
                <Typography variant="h4">
                  {formatCoverage(ratedSessions.length, sessions.length)}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
