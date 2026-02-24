import type { ExamSetup } from "./types";

export const STORAGE_KEY = "student-clock:lastSetup:v1";

export const DEFAULT_EXAM_SETUP: ExamSetup = {
  course: "",
  examTitle: "",
  rules: "",
  durationMinutes: 90,
  endIso: undefined,
  showStartEndInfo: true,
  beepEnabled: false,
  splitDefault: false
};
