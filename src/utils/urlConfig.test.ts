import { describe, expect, it } from "vitest";
import { parseExamSetupFromUrl, toUrlSearch } from "./urlConfig";

describe("urlConfig", () => {
  it("parses valid URL params into setup values", () => {
    const parsed = parseExamSetupFromUrl(
      "?course=BIO%20201&exam=Midterm&rules=No%20phones&duration=120&beep=1&split=0&showTimes=1"
    );

    expect(parsed).toMatchObject({
      course: "BIO 201",
      examTitle: "Midterm",
      rules: "No phones",
      durationMinutes: 120,
      beepEnabled: true,
      splitDefault: false,
      showStartEndInfo: true
    });
  });

  it("ignores invalid duration and boolean values", () => {
    const parsed = parseExamSetupFromUrl("?duration=-2&beep=invalid&split=hello");
    expect(parsed.durationMinutes).toBeUndefined();
    expect(parsed.beepEnabled).toBeUndefined();
    expect(parsed.splitDefault).toBeUndefined();
  });

  it("serializes setup to a query string", () => {
    const query = toUrlSearch({
      course: "ENG 301",
      examTitle: "Final",
      rules: "No calculators",
      durationMinutes: 90,
      endIso: undefined,
      showStartEndInfo: true,
      beepEnabled: false,
      splitDefault: true
    });

    expect(query).toContain("course=ENG+301");
    expect(query).toContain("exam=Final");
    expect(query).toContain("duration=90");
    expect(query).toContain("split=1");
  });
});
