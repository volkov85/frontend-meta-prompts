import {
  Box,
  Card,
  CardContent,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { MouseEvent, useMemo, useState } from "react";
import { averageRubric } from "../../../core/rubric";
import { rubricAxisLabel, UI_COPY } from "../lib/uiCopy";
import { InterviewLanguage, RUBRIC_AXES, Rubric, Session } from "../lib/types";

type RubricRadarCardProps = {
  language: InterviewLanguage;
  sessions: Session[];
};

const SIZE = 320;
const CENTER = SIZE / 2;
const MAX_RADIUS = SIZE / 2 - 60;
const RING_COUNT = 5;

const polygonPoints = (rubric: Rubric, axisCount: number): string => {
  const points: string[] = [];
  for (let i = 0; i < axisCount; i += 1) {
    const axis = RUBRIC_AXES[i];
    const angle = (Math.PI * 2 * i) / axisCount - Math.PI / 2;
    const radius = (rubric[axis] / 10) * MAX_RADIUS;
    const x = CENTER + Math.cos(angle) * radius;
    const y = CENTER + Math.sin(angle) * radius;
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return points.join(" ");
};

const axisEndpoint = (index: number, axisCount: number, radius: number) => {
  const angle = (Math.PI * 2 * index) / axisCount - Math.PI / 2;
  return {
    x: CENTER + Math.cos(angle) * radius,
    y: CENTER + Math.sin(angle) * radius,
  };
};

export const RubricRadarCard = ({ language, sessions }: RubricRadarCardProps) => {
  const copy = UI_COPY[language];
  const [source, setSource] = useState<"latest" | "average">("latest");
  const ratedSessions = useMemo(
    () => sessions.filter((session): session is Session & { rubric: Rubric } => !!session.rubric),
    [sessions],
  );

  const rubric = useMemo<Rubric | null>(() => {
    if (ratedSessions.length === 0) return null;
    if (source === "latest") {
      return ratedSessions[0].rubric;
    }
    return averageRubric(ratedSessions.map((session) => session.rubric)) ?? null;
  }, [ratedSessions, source]);

  const handleSourceChange = (_: MouseEvent<HTMLElement>, next: "latest" | "average" | null) => {
    if (next) setSource(next);
  };

  const axisCount = RUBRIC_AXES.length;
  const ringPolygons = useMemo(() => {
    const polygons: { ring: number; points: string }[] = [];
    for (let r = 1; r <= RING_COUNT; r += 1) {
      const radius = (r / RING_COUNT) * MAX_RADIUS;
      const points: string[] = [];
      for (let i = 0; i < axisCount; i += 1) {
        const { x, y } = axisEndpoint(i, axisCount, radius);
        points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
      }
      polygons.push({ ring: r, points: points.join(" ") });
    }
    return polygons;
  }, [axisCount]);

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
          <Typography variant="h6">{copy.rubricRadarTitle}</Typography>
          {rubric && (
            <ToggleButtonGroup
              size="small"
              exclusive
              value={source}
              onChange={handleSourceChange}
              aria-label={copy.rubricRadarSourceLabel}
            >
              <ToggleButton value="latest" aria-label={copy.rubricRadarLatest}>
                {copy.rubricRadarLatest}
              </ToggleButton>
              <ToggleButton value="average" aria-label={copy.rubricRadarAverage}>
                {copy.rubricRadarAverage}
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        </Stack>
        {!rubric ? (
          <Typography variant="body2" color="text.secondary">
            {copy.rubricRadarEmpty}
          </Typography>
        ) : (
          <Box
            component="svg"
            role="img"
            aria-label={copy.rubricRadarTitle}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            sx={{ width: "100%", maxWidth: SIZE, display: "block", mx: "auto" }}
          >
            {ringPolygons.map(({ ring, points }) => (
              <polygon
                key={ring}
                points={points}
                fill="none"
                stroke="rgba(148, 163, 184, 0.25)"
                strokeWidth={1}
              />
            ))}
            {RUBRIC_AXES.map((axis, index) => {
              const { x, y } = axisEndpoint(index, axisCount, MAX_RADIUS);
              const labelPoint = axisEndpoint(index, axisCount, MAX_RADIUS + 22);
              return (
                <g key={axis}>
                  <line
                    x1={CENTER}
                    y1={CENTER}
                    x2={x}
                    y2={y}
                    stroke="rgba(148, 163, 184, 0.3)"
                    strokeWidth={1}
                  />
                  <text
                    x={labelPoint.x}
                    y={labelPoint.y}
                    fontSize={12}
                    fill="rgba(226, 232, 240, 0.85)"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {rubricAxisLabel(language, axis)}
                  </text>
                </g>
              );
            })}
            <polygon
              points={polygonPoints(rubric, axisCount)}
              fill="rgba(129, 140, 248, 0.35)"
              stroke="rgba(129, 140, 248, 0.9)"
              strokeWidth={2}
            />
            {RUBRIC_AXES.map((axis, index) => {
              const angle = (Math.PI * 2 * index) / axisCount - Math.PI / 2;
              const radius = (rubric[axis] / 10) * MAX_RADIUS;
              const x = CENTER + Math.cos(angle) * radius;
              const y = CENTER + Math.sin(angle) * radius;
              return <circle key={axis} cx={x} cy={y} r={3.5} fill="#818cf8" />;
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
