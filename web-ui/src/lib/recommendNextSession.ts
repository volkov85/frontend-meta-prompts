import { averageRubric } from "../../../core/rubric";
import { InterviewTemplate, Level, RUBRIC_AXES, Rubric, RubricAxis, Session } from "./types";

const AXIS_KEYWORDS: Record<RubricAxis, RegExp[]> = {
  correctness: [
    /predict[- ]output/i,
    /correctness/i,
    /edge[- ]?case/i,
    /debugging/i,
    /closure/i,
    /this binding/i,
    /event loop/i,
    /async/i,
    /promise/i,
    /hooks/i,
    /typescript/i,
    /type[- ]debugging/i,
  ],
  depth: [
    /internals/i,
    /deep[- ]dive/i,
    /complexity/i,
    /algorithms/i,
    /generics/i,
    /rendering/i,
    /memory model/i,
    /reconciler/i,
    /core mechanics/i,
    /type[- ]level/i,
    /platform/i,
  ],
  clarity: [
    /behavioral/i,
    /design[- ]review/i,
    /leadership/i,
    /refactor/i,
    /api[- ]design/i,
    /component[- ]api/i,
    /communication/i,
    /explain[- ]?why/i,
    /i18n/i,
    /l10n/i,
  ],
  tradeOffs: [
    /system[- ]design/i,
    /trade[- ]?off/i,
    /optimization/i,
    /performance/i,
    /architecture/i,
    /security/i,
    /observability/i,
    /caching/i,
    /scal/i,
    /strategy/i,
  ],
  practicality: [
    /production/i,
    /incident/i,
    /migration/i,
    /resilience/i,
    /reliability/i,
    /testing/i,
    /a11y/i,
    /accessibility/i,
    /tooling/i,
    /build/i,
    /metrics/i,
    /experimentation/i,
    /pwa/i,
    /slo/i,
    /rollout/i,
    /networking/i,
    /storage/i,
    /workers/i,
  ],
};

export const inferTemplateAxes = (template: InterviewTemplate): Set<RubricAxis> => {
  const haystack = [
    template.id,
    template.title,
    ...template.focus,
    ...template.questionStyles,
    ...(template.constraints ?? []),
  ]
    .join(" ")
    .toLowerCase();

  const matched = new Set<RubricAxis>();
  for (const axis of RUBRIC_AXES) {
    if (AXIS_KEYWORDS[axis].some((pattern) => pattern.test(haystack))) {
      matched.add(axis);
    }
  }
  return matched;
};

const RECENT_RATED_LIMIT = 3;
const RECENT_USED_LIMIT = 3;

export type SessionRecommendation = {
  templateId: string;
  templateTitle: string;
  level: Level;
  weakestAxis: RubricAxis;
  weakestScore: number;
  matchesWeakAxis: boolean;
};

const pickWeakestAxis = (rubric: Rubric): { axis: RubricAxis; score: number } => {
  let weakest: RubricAxis = RUBRIC_AXES[0];
  let weakestScore = rubric[weakest];
  for (const axis of RUBRIC_AXES) {
    if (rubric[axis] < weakestScore) {
      weakest = axis;
      weakestScore = rubric[axis];
    }
  }
  return { axis: weakest, score: weakestScore };
};

export const recommendNextSession = (
  sessions: Session[],
  templates: InterviewTemplate[],
): SessionRecommendation | null => {
  if (templates.length === 0) return null;

  const ratedRubrics: Rubric[] = [];
  let recentLevel: Level | null = null;
  for (const session of sessions) {
    if (session.rubric) {
      if (ratedRubrics.length < RECENT_RATED_LIMIT) {
        ratedRubrics.push(session.rubric);
      }
      if (!recentLevel) recentLevel = session.level;
    }
  }

  if (ratedRubrics.length === 0 || !recentLevel) return null;

  const avg = averageRubric(ratedRubrics);
  if (!avg) return null;

  const { axis: weakestAxis, score: weakestScore } = pickWeakestAxis(avg);

  const recentTemplateIds = new Set(
    sessions.slice(0, RECENT_USED_LIMIT).map((session) => session.templateId),
  );

  const candidatesAtLevel = templates.filter((template) => template.levels.includes(recentLevel!));
  if (candidatesAtLevel.length === 0) return null;

  type Scored = { template: InterviewTemplate; score: number; matchesWeakAxis: boolean };
  const scored: Scored[] = candidatesAtLevel.map((template) => {
    const axes = inferTemplateAxes(template);
    const matchesWeakAxis = axes.has(weakestAxis);
    let score = 0;
    if (matchesWeakAxis) score += 10;
    if (recentTemplateIds.has(template.id)) score -= 5;
    if (axes.size > 0) score += 1;
    return { template, score, matchesWeakAxis };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.template.id.localeCompare(b.template.id);
  });

  const best = scored[0];
  return {
    templateId: best.template.id,
    templateTitle: best.template.title,
    level: recentLevel,
    weakestAxis,
    weakestScore,
    matchesWeakAxis: best.matchesWeakAxis,
  };
};
