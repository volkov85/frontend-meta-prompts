import { describe, it, expect, beforeEach } from "vitest";
import { readStoredThemeMode, writeStoredThemeMode, THEME_STORAGE_KEY } from "./themeStorage";

describe("themeStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns null when nothing is stored", () => {
    expect(readStoredThemeMode()).toBe(null);
  });

  it("round-trips dark mode", () => {
    writeStoredThemeMode("dark");
    expect(readStoredThemeMode()).toBe("dark");
  });

  it("round-trips light mode", () => {
    writeStoredThemeMode("light");
    expect(readStoredThemeMode()).toBe("light");
  });

  it("returns null for invalid stored value", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "blue");
    expect(readStoredThemeMode()).toBe(null);
  });

  it("returns null for corrupted JSON", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "{not json");
    expect(readStoredThemeMode()).toBe(null);
  });
});
