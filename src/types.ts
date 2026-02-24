export type TimerStatus = "idle" | "running" | "paused" | "finished";

export type ExamSetup = {
  course: string;
  examTitle: string;
  rules: string;
  durationMinutes?: number;
  endIso?: string;
  showStartEndInfo: boolean;
  beepEnabled: boolean;
  splitDefault: boolean;
};

export type TimerState = {
  status: TimerStatus;
  endTimestampMs: number | null;
  nowMs: number;
  remainingMs: number;
};
