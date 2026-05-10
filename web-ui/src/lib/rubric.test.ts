import { describe, expect, it } from "vitest";
import {
  averageRubric,
  computeAggregateScore,
  emptyRubric,
  isRubric,
  sanitizeRubric,
} from "../../../core/rubric";
import { Rubric } from "./types";

const sampleRubric: Rubric = {
  correctness: 8,
  depth: 7,
  clarity: 9,
  tradeOffs: 6,
  practicality: 10,
};

describe("rubric helpers", () => {
  it("isRubric accepts a fully populated rubric within 0..10", () => {
    expect(isRubric(sampleRubric)).toBe(true);
    expect(isRubric(emptyRubric())).toBe(true);
  });

  it("isRubric rejects out-of-range or non-numeric values", () => {
    expect(isRubric({ ...sampleRubric, correctness: 11 })).toBe(false);
    expect(isRubric({ ...sampleRubric, depth: -1 })).toBe(false);
    expect(isRubric({ ...sampleRubric, clarity: Number.NaN })).toBe(false);
    expect(isRubric({ ...sampleRubric, clarity: "8" as unknown as number })).toBe(false);
  });

  it("isRubric rejects missing axes or non-objects", () => {
    const partial: Partial<Rubric> = { ...sampleRubric };
    delete partial.correctness;
    expect(isRubric(partial)).toBe(false);
    expect(isRubric(null)).toBe(false);
    expect(isRubric(undefined)).toBe(false);
    expect(isRubric([])).toBe(false);
  });

  it("sanitizeRubric returns a fresh rubric when valid", () => {
    const cloned = sanitizeRubric({ ...sampleRubric, extra: "ignored" });
    expect(cloned).toEqual(sampleRubric);
  });

  it("sanitizeRubric returns undefined for invalid inputs", () => {
    expect(sanitizeRubric(undefined)).toBeUndefined();
    expect(sanitizeRubric({ ...sampleRubric, correctness: 99 })).toBeUndefined();
    expect(sanitizeRubric("rubric")).toBeUndefined();
  });

  it("computeAggregateScore returns the mean rounded to 2 decimals", () => {
    expect(computeAggregateScore(sampleRubric)).toBe(8);
    expect(
      computeAggregateScore({
        correctness: 8.5,
        depth: 8.5,
        clarity: 8.5,
        tradeOffs: 8.5,
        practicality: 8.5,
      }),
    ).toBe(8.5);
    expect(
      computeAggregateScore({
        correctness: 1,
        depth: 2,
        clarity: 3,
        tradeOffs: 4,
        practicality: 5,
      }),
    ).toBe(3);
  });

  it("averageRubric returns undefined for empty input and averages otherwise", () => {
    expect(averageRubric([])).toBeUndefined();
    const averaged = averageRubric([
      sampleRubric,
      {
        correctness: 4,
        depth: 5,
        clarity: 5,
        tradeOffs: 8,
        practicality: 4,
      },
    ]);
    expect(averaged).toEqual({
      correctness: 6,
      depth: 6,
      clarity: 7,
      tradeOffs: 7,
      practicality: 7,
    });
  });
});
