import { describe, expect, it } from "vitest";
import { inferTemplateAxes, recommendNextSession } from "./recommendNextSession";
import type { InterviewTemplate, Rubric, Session } from "./types";

const baseTemplate = (overrides: Partial<InterviewTemplate>): InterviewTemplate => ({
  id: "tpl",
  title: "Template",
  levels: ["middle"],
  focus: [],
  questionStyles: [],
  constraints: [],
  ...overrides,
});

const baseSession = (overrides: Partial<Session>): Session => ({
  id: "session-x",
  date: new Date().toISOString(),
  templateId: "tpl",
  level: "middle",
  ...overrides,
});

const rubric = (overrides: Partial<Rubric> = {}): Rubric => ({
  correctness: 8,
  depth: 8,
  clarity: 8,
  tradeOffs: 8,
  practicality: 8,
  ...overrides,
});

describe("inferTemplateAxes", () => {
  it("tags system-design templates with tradeOffs", () => {
    const axes = inferTemplateAxes(
      baseTemplate({
        id: "frontend-system-design-dashboard",
        title: "Frontend System Design — Dashboard",
        focus: ["caching", "scalability"],
        questionStyles: ["system-design"],
      }),
    );
    expect(axes.has("tradeOffs")).toBe(true);
  });

  it("tags behavioral templates with clarity", () => {
    const axes = inferTemplateAxes(
      baseTemplate({
        id: "behavioral-senior",
        title: "Behavioral",
        focus: ["communication"],
        questionStyles: ["leadership"],
      }),
    );
    expect(axes.has("clarity")).toBe(true);
  });

  it("tags hooks-internals templates with correctness + depth", () => {
    const axes = inferTemplateAxes(
      baseTemplate({
        id: "react-hooks-internals",
        title: "React Hooks Deep Dive",
        focus: ["hooks rules", "closures"],
        questionStyles: ["predict-output"],
      }),
    );
    expect(axes.has("correctness")).toBe(true);
    expect(axes.has("depth")).toBe(true);
  });

  it("tags testing templates with practicality", () => {
    const axes = inferTemplateAxes(
      baseTemplate({
        id: "testing-strategy",
        title: "Testing Strategy",
        focus: ["testing"],
        questionStyles: [],
      }),
    );
    expect(axes.has("practicality")).toBe(true);
  });
});

describe("recommendNextSession", () => {
  const templates: InterviewTemplate[] = [
    baseTemplate({
      id: "react-hooks-internals",
      title: "React Hooks Deep Dive",
      focus: ["hooks rules", "closures"],
      questionStyles: ["predict-output"],
    }),
    baseTemplate({
      id: "frontend-system-design-dashboard",
      title: "Frontend System Design — Dashboard",
      focus: ["caching", "scalability"],
      questionStyles: ["system-design"],
    }),
    baseTemplate({
      id: "behavioral-senior",
      title: "Behavioral",
      focus: ["communication"],
      questionStyles: ["leadership"],
    }),
    baseTemplate({
      id: "testing-strategy",
      title: "Testing Strategy",
      focus: ["testing"],
      questionStyles: [],
    }),
  ];

  it("returns null when there are no rated sessions", () => {
    const result = recommendNextSession([], templates);
    expect(result).toBeNull();
  });

  it("returns null when sessions exist but none are rated", () => {
    const result = recommendNextSession([baseSession({ id: "unrated-1" })], templates);
    expect(result).toBeNull();
  });

  it("returns null when template list is empty", () => {
    const result = recommendNextSession(
      [baseSession({ id: "s1", rubric: rubric({ tradeOffs: 4 }) })],
      [],
    );
    expect(result).toBeNull();
  });

  it("recommends a system-design template when tradeOffs is weakest", () => {
    const result = recommendNextSession(
      [
        baseSession({
          id: "s1",
          rubric: rubric({ tradeOffs: 4, depth: 9, correctness: 9, clarity: 8, practicality: 8 }),
        }),
      ],
      templates,
    );
    expect(result).not.toBeNull();
    expect(result!.weakestAxis).toBe("tradeOffs");
    expect(result!.templateId).toBe("frontend-system-design-dashboard");
    expect(result!.matchesWeakAxis).toBe(true);
    expect(result!.level).toBe("middle");
  });

  it("recommends a behavioral template when clarity is weakest", () => {
    const result = recommendNextSession(
      [
        baseSession({
          id: "s1",
          rubric: rubric({ clarity: 3 }),
        }),
      ],
      templates,
    );
    expect(result).not.toBeNull();
    expect(result!.weakestAxis).toBe("clarity");
    expect(result!.templateId).toBe("behavioral-senior");
  });

  it("avoids the template used in the most recent session", () => {
    const result = recommendNextSession(
      [
        baseSession({
          id: "s1",
          templateId: "frontend-system-design-dashboard",
          rubric: rubric({ tradeOffs: 4 }),
        }),
        baseSession({
          id: "s0",
          templateId: "react-hooks-internals",
          rubric: rubric({ tradeOffs: 4 }),
        }),
      ],
      templates,
    );
    expect(result).not.toBeNull();
    expect(result!.templateId).not.toBe("frontend-system-design-dashboard");
  });

  it("averages across the last 3 rated sessions when determining weakest axis", () => {
    const result = recommendNextSession(
      [
        baseSession({ id: "s1", rubric: rubric({ tradeOffs: 6, clarity: 6 }) }),
        baseSession({ id: "s2", rubric: rubric({ tradeOffs: 3, clarity: 8 }) }),
        baseSession({ id: "s3", rubric: rubric({ tradeOffs: 3, clarity: 9 }) }),
      ],
      templates,
    );
    expect(result).not.toBeNull();
    expect(result!.weakestAxis).toBe("tradeOffs");
  });

  it("uses the level from the most recent rated session", () => {
    const seniorTemplates: InterviewTemplate[] = [
      baseTemplate({
        id: "frontend-system-design-senior",
        title: "Senior System Design",
        levels: ["senior"],
        focus: ["scalability"],
        questionStyles: ["system-design"],
      }),
    ];
    const result = recommendNextSession(
      [baseSession({ id: "s1", level: "senior", rubric: rubric({ tradeOffs: 4 }) })],
      seniorTemplates,
    );
    expect(result).not.toBeNull();
    expect(result!.level).toBe("senior");
    expect(result!.templateId).toBe("frontend-system-design-senior");
  });
});
