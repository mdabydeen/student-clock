import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TimerState, TimerStatus } from "../types";

type StartTimerOptions = {
  durationMinutes?: number;
  endIso?: string;
};

type UseExamTimerOptions = {
  onFinished?: () => void;
};

type ResolveOptions = StartTimerOptions & {
  nowMs?: number;
};

const MINUTE_MS = 60_000;

export function resolveEndTimestampMs(options: ResolveOptions): number | null {
  const nowMs = options.nowMs ?? Date.now();

  if (options.endIso) {
    const endMs = new Date(options.endIso).getTime();
    if (!Number.isNaN(endMs)) {
      return endMs;
    }
  }

  if (typeof options.durationMinutes === "number" && options.durationMinutes > 0) {
    return nowMs + options.durationMinutes * MINUTE_MS;
  }

  return null;
}

export function useExamTimer(options: UseExamTimerOptions = {}) {
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [endTimestampMs, setEndTimestampMs] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [pausedRemainingMs, setPausedRemainingMs] = useState<number | null>(null);
  const finishNotifiedRef = useRef(false);
  const onFinishedRef = useRef(options.onFinished);

  useEffect(() => {
    onFinishedRef.current = options.onFinished;
  }, [options.onFinished]);

  useEffect(() => {
    if (status !== "running") {
      return;
    }

    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [status]);

  const remainingMs = useMemo(() => {
    if (status === "idle") {
      return 0;
    }

    if (status === "paused" && pausedRemainingMs !== null) {
      return pausedRemainingMs;
    }

    if (!endTimestampMs) {
      return 0;
    }

    return Math.max(0, endTimestampMs - nowMs);
  }, [status, pausedRemainingMs, endTimestampMs, nowMs]);

  useEffect(() => {
    if (status !== "running" || remainingMs > 0) {
      return;
    }

    setStatus("finished");
    setNowMs(Date.now());
    setEndTimestampMs(Date.now());
    setPausedRemainingMs(0);

    if (!finishNotifiedRef.current) {
      finishNotifiedRef.current = true;
      onFinishedRef.current?.();
    }
  }, [status, remainingMs]);

  const start = useCallback((startOptions: StartTimerOptions): number | null => {
    const resolvedEndMs = resolveEndTimestampMs(startOptions);
    if (!resolvedEndMs) {
      return null;
    }

    const currentNowMs = Date.now();
    setNowMs(currentNowMs);
    setEndTimestampMs(resolvedEndMs);
    setPausedRemainingMs(null);

    if (resolvedEndMs <= currentNowMs) {
      setStatus("finished");
      setPausedRemainingMs(0);
      if (!finishNotifiedRef.current) {
        finishNotifiedRef.current = true;
        onFinishedRef.current?.();
      }
    } else {
      setStatus("running");
      finishNotifiedRef.current = false;
    }

    return resolvedEndMs;
  }, []);

  const pause = useCallback(() => {
    if (status !== "running" || !endTimestampMs) {
      return;
    }

    const currentNowMs = Date.now();
    const remaining = Math.max(0, endTimestampMs - currentNowMs);
    setNowMs(currentNowMs);
    setPausedRemainingMs(remaining);
    setStatus(remaining === 0 ? "finished" : "paused");
  }, [status, endTimestampMs]);

  const resume = useCallback(() => {
    if (status !== "paused" || pausedRemainingMs === null) {
      return;
    }

    const currentNowMs = Date.now();
    if (pausedRemainingMs <= 0) {
      setStatus("finished");
      return;
    }

    setNowMs(currentNowMs);
    setEndTimestampMs(currentNowMs + pausedRemainingMs);
    setPausedRemainingMs(null);
    setStatus("running");
    finishNotifiedRef.current = false;
  }, [status, pausedRemainingMs]);

  const reset = useCallback(() => {
    setStatus("idle");
    setEndTimestampMs(null);
    setPausedRemainingMs(null);
    setNowMs(Date.now());
    finishNotifiedRef.current = false;
  }, []);

  const adjustMinutes = useCallback(
    (deltaMinutes: number) => {
      if (status === "idle") {
        return;
      }

      const currentNowMs = Date.now();
      const deltaMs = Math.round(deltaMinutes * MINUTE_MS);
      const baseRemainingMs =
        status === "paused"
          ? Math.max(0, pausedRemainingMs ?? 0)
          : Math.max(0, (endTimestampMs ?? currentNowMs) - currentNowMs);

      const nextRemainingMs = Math.max(0, baseRemainingMs + deltaMs);
      const wasFinished = status === "finished";

      setNowMs(currentNowMs);
      setEndTimestampMs(currentNowMs + nextRemainingMs);

      if (nextRemainingMs === 0) {
        setStatus("finished");
        setPausedRemainingMs(0);
        if (!wasFinished && !finishNotifiedRef.current) {
          finishNotifiedRef.current = true;
          onFinishedRef.current?.();
        }
        return;
      }

      if (status === "paused") {
        setPausedRemainingMs(nextRemainingMs);
        setStatus("paused");
      } else {
        setPausedRemainingMs(null);
        setStatus("running");
      }
      finishNotifiedRef.current = false;
    },
    [status, pausedRemainingMs, endTimestampMs]
  );

  const timerState: TimerState = {
    status,
    endTimestampMs,
    nowMs,
    remainingMs
  };

  return {
    ...timerState,
    start,
    pause,
    resume,
    reset,
    adjustMinutes
  };
}
