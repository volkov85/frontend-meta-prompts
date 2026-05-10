import { RUBRIC_AXES, Rubric, RubricAxis } from "./types";

const isValidAxisValue = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 10;

export const isRubric = (value: unknown): value is Rubric => {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return RUBRIC_AXES.every((axis) => isValidAxisValue(record[axis]));
};

export const sanitizeRubric = (value: unknown): Rubric | undefined => {
  if (!value || typeof value !== "object") return undefined;
  const record = value as Record<string, unknown>;
  const out = {} as Rubric;
  for (const axis of RUBRIC_AXES) {
    const raw = record[axis];
    if (!isValidAxisValue(raw)) return undefined;
    out[axis] = raw;
  }
  return out;
};

export const computeAggregateScore = (rubric: Rubric): number => {
  const sum = RUBRIC_AXES.reduce((acc, axis) => acc + rubric[axis], 0);
  return Number((sum / RUBRIC_AXES.length).toFixed(2));
};

export const emptyRubric = (): Rubric =>
  RUBRIC_AXES.reduce<Rubric>((acc, axis) => {
    acc[axis] = 0;
    return acc;
  }, {} as Rubric);

export const averageRubric = (rubrics: Rubric[]): Rubric | undefined => {
  if (rubrics.length === 0) return undefined;
  const sums = emptyRubric();
  for (const rubric of rubrics) {
    for (const axis of RUBRIC_AXES) {
      sums[axis] += rubric[axis];
    }
  }
  const avg = {} as Rubric;
  for (const axis of RUBRIC_AXES) {
    avg[axis] = Number((sums[axis] / rubrics.length).toFixed(2));
  }
  return avg;
};

export const axisOrder = (): readonly RubricAxis[] => RUBRIC_AXES;
