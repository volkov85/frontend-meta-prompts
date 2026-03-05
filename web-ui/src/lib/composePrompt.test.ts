import { describe, expect, it } from "vitest";
import interviewsData from "../../../data/interviews.json";
import { composeInterviewPrompt } from "./composePrompt";
import { InterviewConfig } from "./types";

const config = interviewsData as InterviewConfig;

describe("composeInterviewPrompt", () => {
  it("builds a junior prompt with plain language overrides", () => {
    const prompt = composeInterviewPrompt(config, {
      templateId: "junior-react-fundamentals",
      level: "junior",
      stack: ["React", "TypeScript"],
      focusBoost: ["render lifecycle", "state and events"],
      extraContext: "Candidate built two pet projects",
      mode: {
        simulation: true,
        english: false,
        timeboxedMinutes: 25,
      },
    });

    expect(prompt).toContain("Candidate level: junior");
    expect(prompt).toContain("Stack: React + TypeScript");
    expect(prompt).toContain("Extra context: Candidate built two pet projects");
    expect(prompt).toContain("Follow-ups (2)");
    expect(prompt).toContain("Simulation: DO NOT provide the answer immediately");
    expect(prompt).toContain("Use plain language, short sentences, and avoid heavy jargon.");
    expect(prompt).toContain("- Scoring rubric (0-10)");
    expect(prompt).toContain("render lifecycle");
  });

  it("supports non-simulation mode", () => {
    const prompt = composeInterviewPrompt(config, {
      templateId: "testing-strategy",
      level: "middle",
      mode: {
        simulation: false,
        english: true,
        timeboxedMinutes: 40,
      },
    });

    expect(prompt).toContain("- Provide both questions and ideal answers immediately.");
    expect(prompt).toContain("3) Ideal answer (structured)");
    expect(prompt).not.toContain("3) Wait for my answer");
  });

  it("throws for unknown template", () => {
    expect(() =>
      composeInterviewPrompt(config, {
        templateId: "missing-template",
        level: "junior",
      }),
    ).toThrowError("Unknown templateId: missing-template");
  });

  it("throws for unsupported level", () => {
    expect(() =>
      composeInterviewPrompt(config, {
        templateId: "frontend-system-design-dashboard",
        level: "middle",
      }),
    ).toThrowError('Template "frontend-system-design-dashboard" doesn\'t support level "middle"');
  });
});
