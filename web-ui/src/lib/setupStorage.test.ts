import { beforeEach, describe, expect, it } from "vitest";
import {
  SETUP_STORAGE_KEY,
  clearStoredSetup,
  readStoredSetup,
  writeStoredSetup,
} from "./setupStorage";

describe("setupStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns null when nothing is stored", () => {
    expect(readStoredSetup()).toBeNull();
  });

  it("round-trips a full setup object", () => {
    writeStoredSetup({
      templateId: "junior-react-fundamentals",
      level: "middle",
      stackInput: "React, TypeScript",
      focusInput: "closures, hydration",
      extraContext: "Pet project context",
      simulation: false,
      timebox: 17,
      persistSession: false,
    });

    expect(readStoredSetup()).toEqual({
      templateId: "junior-react-fundamentals",
      level: "middle",
      stackInput: "React, TypeScript",
      focusInput: "closures, hydration",
      extraContext: "Pet project context",
      simulation: false,
      timebox: 17,
      persistSession: false,
    });
  });

  it("ignores malformed JSON gracefully", () => {
    localStorage.setItem(SETUP_STORAGE_KEY, "{not-json");
    expect(readStoredSetup()).toBeNull();
  });

  it("ignores fields with wrong types", () => {
    localStorage.setItem(
      SETUP_STORAGE_KEY,
      JSON.stringify({
        templateId: 123,
        level: "lord",
        stackInput: ["React"],
        focusInput: "closures",
        extraContext: null,
        simulation: "yes",
        timebox: "30",
        persistSession: 1,
      }),
    );
    expect(readStoredSetup()).toEqual({ focusInput: "closures" });
  });

  it("clearStoredSetup removes the entry", () => {
    writeStoredSetup({
      templateId: "x",
      level: "junior",
      stackInput: "",
      focusInput: "",
      extraContext: "",
      simulation: true,
      timebox: 30,
      persistSession: true,
    });
    clearStoredSetup();
    expect(localStorage.getItem(SETUP_STORAGE_KEY)).toBeNull();
  });
});
