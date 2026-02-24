import { describe, expect, it } from "vitest";
import {
  formatCountdown,
  formatDateTime,
  localDateTimeInputToIso,
  toLocalDateTimeInputValue
} from "./time";

describe("time", () => {
  it("formats countdown values with clamping and round-up semantics", () => {
    expect(formatCountdown(-50)).toBe("00:00:00");
    expect(formatCountdown(1_500)).toBe("00:00:02");
    expect(formatCountdown(3_661_000)).toBe("01:01:01");
  });

  it("formats null date-time values as N/A", () => {
    expect(formatDateTime(null)).toBe("N/A");
  });

  it("converts between ISO and datetime-local values", () => {
    const iso = "2026-02-24T15:30:00.000Z";
    const localValue = toLocalDateTimeInputValue(iso);

    expect(localValue).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    expect(localDateTimeInputToIso(localValue)).toBe(iso);
  });

  it("returns safe empty values for invalid conversion input", () => {
    expect(toLocalDateTimeInputValue("not-a-date")).toBe("");
    expect(localDateTimeInputToIso("")).toBeUndefined();
    expect(localDateTimeInputToIso("invalid")).toBeUndefined();
  });
});
