import { describe, expect, it } from "vitest";
import { STORAGE_KEY } from "../constants";
import { loadExamSetup, saveExamSetup } from "./storage";

describe("storage", () => {
  it("saves and loads setup values", () => {
    saveExamSetup({
      course: "CS 110",
      examTitle: "Quiz",
      rules: "Closed notes",
      durationMinutes: 45,
      endIso: undefined,
      showStartEndInfo: true,
      beepEnabled: true,
      splitDefault: false
    });

    const loaded = loadExamSetup();
    expect(loaded).toMatchObject({
      course: "CS 110",
      examTitle: "Quiz",
      durationMinutes: 45,
      beepEnabled: true
    });
  });

  it("returns null for malformed payload", () => {
    localStorage.setItem(STORAGE_KEY, "{not valid json");
    expect(loadExamSetup()).toBeNull();
  });

  it("returns null for unsupported payload versions", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 2,
        setup: { course: "CS 101" }
      })
    );

    expect(loadExamSetup()).toBeNull();
  });

  it("sanitizes invalid setup values while normalizing valid end times", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        setup: {
          course: "MATH 220",
          durationMinutes: -10,
          endIso: "2026-02-24T15:00:00-05:00",
          beepEnabled: "yes",
          splitDefault: true
        }
      })
    );

    expect(loadExamSetup()).toEqual({
      course: "MATH 220",
      endIso: "2026-02-24T20:00:00.000Z",
      splitDefault: true
    });
  });
});
