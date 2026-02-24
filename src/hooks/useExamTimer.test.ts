import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveEndTimestampMs, useExamTimer } from "./useExamTimer";

describe("resolveEndTimestampMs", () => {
  it("prefers explicit end time when valid", () => {
    const nowMs = new Date("2026-02-24T15:00:00Z").getTime();
    const end = resolveEndTimestampMs({
      nowMs,
      durationMinutes: 60,
      endIso: "2026-02-24T17:00:00.000Z"
    });

    expect(end).toBe(new Date("2026-02-24T17:00:00.000Z").getTime());
  });

  it("falls back to duration", () => {
    const nowMs = new Date("2026-02-24T10:00:00Z").getTime();
    const end = resolveEndTimestampMs({
      nowMs,
      durationMinutes: 90
    });

    expect(end).toBe(nowMs + 90 * 60_000);
  });
});

describe("useExamTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-24T10:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts, pauses, and resumes", () => {
    const { result } = renderHook(() => useExamTimer());

    act(() => {
      result.current.start({ durationMinutes: 10 });
    });
    expect(result.current.status).toBe("running");
    expect(result.current.remainingMs).toBe(10 * 60_000);

    act(() => {
      vi.advanceTimersByTime(2_000);
    });
    expect(result.current.remainingMs).toBeLessThan(10 * 60_000);

    act(() => {
      result.current.pause();
    });
    const pausedRemaining = result.current.remainingMs;
    expect(result.current.status).toBe("paused");

    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(result.current.remainingMs).toBe(pausedRemaining);

    act(() => {
      result.current.resume();
    });
    expect(result.current.status).toBe("running");
  });

  it("supports time adjustments and finished transition", () => {
    const { result } = renderHook(() => useExamTimer());

    act(() => {
      result.current.start({ durationMinutes: 1 });
    });

    act(() => {
      result.current.adjustMinutes(-1);
    });
    expect(result.current.status).toBe("finished");
    expect(result.current.remainingMs).toBe(0);

    act(() => {
      result.current.adjustMinutes(5);
    });
    expect(result.current.status).toBe("running");
    expect(result.current.remainingMs).toBe(5 * 60_000);
  });

  it("finishes immediately when started with an expired end time", () => {
    const onFinished = vi.fn();
    const { result } = renderHook(() => useExamTimer({ onFinished }));

    act(() => {
      result.current.start({
        endIso: "2026-02-24T09:59:00.000Z"
      });
    });

    expect(result.current.status).toBe("finished");
    expect(result.current.remainingMs).toBe(0);
    expect(onFinished).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(onFinished).toHaveBeenCalledTimes(1);
  });
});
