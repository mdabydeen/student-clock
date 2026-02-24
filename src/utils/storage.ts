import { STORAGE_KEY } from "../constants";
import type { ExamSetup } from "../types";

type StoredSetupPayload = {
  version: 1;
  setup: Partial<ExamSetup>;
};

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function sanitizeSetup(input: unknown): Partial<ExamSetup> | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const raw = input as Record<string, unknown>;
  const result: Partial<ExamSetup> = {};

  if (isString(raw.course)) {
    result.course = raw.course;
  }
  if (isString(raw.examTitle)) {
    result.examTitle = raw.examTitle;
  }
  if (isString(raw.rules)) {
    result.rules = raw.rules;
  }
  if (isPositiveNumber(raw.durationMinutes)) {
    result.durationMinutes = raw.durationMinutes;
  }
  if (isString(raw.endIso) && !Number.isNaN(new Date(raw.endIso).getTime())) {
    result.endIso = new Date(raw.endIso).toISOString();
  }
  if (isBoolean(raw.showStartEndInfo)) {
    result.showStartEndInfo = raw.showStartEndInfo;
  }
  if (isBoolean(raw.beepEnabled)) {
    result.beepEnabled = raw.beepEnabled;
  }
  if (isBoolean(raw.splitDefault)) {
    result.splitDefault = raw.splitDefault;
  }

  return result;
}

export function saveExamSetup(setup: ExamSetup): void {
  if (typeof window === "undefined") {
    return;
  }

  const payload: StoredSetupPayload = {
    version: 1,
    setup
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function loadExamSetup(): Partial<ExamSetup> | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const payload = JSON.parse(rawValue) as Partial<StoredSetupPayload>;
    if (payload.version !== 1) {
      return null;
    }
    return sanitizeSetup(payload.setup);
  } catch {
    return null;
  }
}
