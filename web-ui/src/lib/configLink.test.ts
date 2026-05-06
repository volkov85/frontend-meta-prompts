import { describe, expect, it } from "vitest";
import {
  encodeConfigToUrl,
  hasShareableParams,
  parseConfigFromUrl,
  stripShareableParams,
  type ShareableConfig,
} from "./configLink";

const SAMPLE: ShareableConfig = {
  templateId: "middle-react-architecture",
  level: "middle",
  stackInput: "React, TypeScript, Vite",
  focusInput: "hooks, suspense",
  extraContext: "fintech onboarding flow with 100k DAU",
  companyBar: "Series-A startup",
  simulation: true,
  timebox: 45,
  language: "ru",
};

const BASE = "https://volkov85.github.io/frontend-meta-prompts/";

describe("encodeConfigToUrl", () => {
  it("encodes all setup fields as query parameters", () => {
    const url = new URL(encodeConfigToUrl(BASE, SAMPLE));
    expect(url.origin + url.pathname).toBe(BASE);
    expect(url.searchParams.get("template")).toBe(SAMPLE.templateId);
    expect(url.searchParams.get("level")).toBe(SAMPLE.level);
    expect(url.searchParams.get("stack")).toBe(SAMPLE.stackInput);
    expect(url.searchParams.get("focus")).toBe(SAMPLE.focusInput);
    expect(url.searchParams.get("extra")).toBe(SAMPLE.extraContext);
    expect(url.searchParams.get("company")).toBe(SAMPLE.companyBar);
    expect(url.searchParams.get("simulation")).toBe("1");
    expect(url.searchParams.get("timebox")).toBe(String(SAMPLE.timebox));
    expect(url.searchParams.get("lang")).toBe(SAMPLE.language);
  });

  it("omits empty optional fields", () => {
    const url = new URL(
      encodeConfigToUrl(BASE, {
        ...SAMPLE,
        stackInput: "",
        focusInput: "   ",
        extraContext: "",
        companyBar: "  ",
      }),
    );
    expect(url.searchParams.has("stack")).toBe(false);
    expect(url.searchParams.has("focus")).toBe(false);
    expect(url.searchParams.has("extra")).toBe(false);
    expect(url.searchParams.has("company")).toBe(false);
    expect(url.searchParams.has("template")).toBe(true);
  });

  it("encodes simulation=false as '0'", () => {
    const url = new URL(encodeConfigToUrl(BASE, { ...SAMPLE, simulation: false }));
    expect(url.searchParams.get("simulation")).toBe("0");
  });

  it("preserves existing path and replaces only the query", () => {
    const url = new URL(encodeConfigToUrl("https://example.com/app/?tracking=abc#section", SAMPLE));
    expect(url.pathname).toBe("/app/");
    expect(url.searchParams.has("tracking")).toBe(false);
    expect(url.searchParams.get("template")).toBe(SAMPLE.templateId);
  });
});

describe("parseConfigFromUrl", () => {
  it("round-trips with encodeConfigToUrl", () => {
    const url = new URL(encodeConfigToUrl(BASE, SAMPLE));
    const parsed = parseConfigFromUrl(url.searchParams);
    expect(parsed).toEqual({
      templateId: SAMPLE.templateId,
      level: SAMPLE.level,
      stackInput: SAMPLE.stackInput,
      focusInput: SAMPLE.focusInput,
      extraContext: SAMPLE.extraContext,
      companyBar: SAMPLE.companyBar,
      simulation: true,
      timebox: SAMPLE.timebox,
      language: SAMPLE.language,
    });
  });

  it("rejects unknown levels", () => {
    const sp = new URLSearchParams("level=architect");
    expect(parseConfigFromUrl(sp)).toEqual({});
  });

  it("rejects unknown languages", () => {
    const sp = new URLSearchParams("lang=fr");
    expect(parseConfigFromUrl(sp)).toEqual({});
  });

  it("rejects non-numeric timebox", () => {
    const sp = new URLSearchParams("timebox=abc");
    expect(parseConfigFromUrl(sp)).toEqual({});
  });

  it("rejects out-of-range timebox", () => {
    expect(parseConfigFromUrl(new URLSearchParams("timebox=0"))).toEqual({});
    expect(parseConfigFromUrl(new URLSearchParams("timebox=601"))).toEqual({});
    expect(parseConfigFromUrl(new URLSearchParams("timebox=45"))).toEqual({ timebox: 45 });
  });

  it("accepts simulation in multiple shapes", () => {
    expect(parseConfigFromUrl(new URLSearchParams("simulation=true")).simulation).toBe(true);
    expect(parseConfigFromUrl(new URLSearchParams("simulation=1")).simulation).toBe(true);
    expect(parseConfigFromUrl(new URLSearchParams("simulation=yes")).simulation).toBe(true);
    expect(parseConfigFromUrl(new URLSearchParams("simulation=false")).simulation).toBe(false);
    expect(parseConfigFromUrl(new URLSearchParams("simulation=0")).simulation).toBe(false);
    expect(parseConfigFromUrl(new URLSearchParams("simulation=no")).simulation).toBe(false);
    expect(parseConfigFromUrl(new URLSearchParams("simulation=maybe")).simulation).toBeUndefined();
  });

  it("ignores unknown params", () => {
    const sp = new URLSearchParams("template=foo&xyz=should-not-appear");
    const parsed = parseConfigFromUrl(sp);
    expect(parsed).toEqual({ templateId: "foo" });
  });

  it("treats empty stack/focus/extra explicitly as empty strings", () => {
    const sp = new URLSearchParams("stack=&focus=&extra=");
    expect(parseConfigFromUrl(sp)).toEqual({
      stackInput: "",
      focusInput: "",
      extraContext: "",
    });
  });
});

describe("hasShareableParams", () => {
  it("returns true when any tracked key is present", () => {
    expect(hasShareableParams(new URLSearchParams("level=middle"))).toBe(true);
    expect(hasShareableParams(new URLSearchParams("template=foo"))).toBe(true);
  });

  it("returns false otherwise", () => {
    expect(hasShareableParams(new URLSearchParams(""))).toBe(false);
    expect(hasShareableParams(new URLSearchParams("utm_source=x"))).toBe(false);
  });
});

describe("stripShareableParams", () => {
  it("removes our params and keeps unrelated ones", () => {
    const stripped = new URL(
      stripShareableParams(`${BASE}?template=foo&level=middle&utm_source=newsletter`),
    );
    expect(stripped.searchParams.has("template")).toBe(false);
    expect(stripped.searchParams.has("level")).toBe(false);
    expect(stripped.searchParams.get("utm_source")).toBe("newsletter");
  });

  it("returns a clean URL when there were no other params", () => {
    expect(stripShareableParams(`${BASE}?template=foo&level=middle`)).toBe(BASE);
  });
});
