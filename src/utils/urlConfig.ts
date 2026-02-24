import type { ExamSetup } from "../types";

function parseBooleanParam(value: string | null): boolean | undefined {
  if (value === "1" || value === "true") {
    return true;
  }
  if (value === "0" || value === "false") {
    return false;
  }
  return undefined;
}

export function parseExamSetupFromUrl(search: string): Partial<ExamSetup> {
  const params = new URLSearchParams(search);
  const result: Partial<ExamSetup> = {};

  const course = params.get("course");
  const exam = params.get("exam");
  const rules = params.get("rules");
  const duration = params.get("duration");
  const end = params.get("end");
  const beep = params.get("beep");
  const split = params.get("split");
  const showTimes = params.get("showTimes");

  if (course !== null) {
    result.course = course;
  }
  if (exam !== null) {
    result.examTitle = exam;
  }
  if (rules !== null) {
    result.rules = rules;
  }
  if (duration !== null) {
    const parsedDuration = Number(duration);
    if (Number.isFinite(parsedDuration) && parsedDuration > 0) {
      result.durationMinutes = parsedDuration;
    }
  }
  if (end !== null) {
    const parsedDate = new Date(end).getTime();
    if (!Number.isNaN(parsedDate)) {
      result.endIso = new Date(parsedDate).toISOString();
    }
  }

  const parsedBeep = parseBooleanParam(beep);
  if (parsedBeep !== undefined) {
    result.beepEnabled = parsedBeep;
  }

  const parsedSplit = parseBooleanParam(split);
  if (parsedSplit !== undefined) {
    result.splitDefault = parsedSplit;
  }

  const parsedShowTimes = parseBooleanParam(showTimes);
  if (parsedShowTimes !== undefined) {
    result.showStartEndInfo = parsedShowTimes;
  }

  return result;
}

export function toUrlSearch(setup: ExamSetup): string {
  const params = new URLSearchParams();

  if (setup.course.trim()) {
    params.set("course", setup.course.trim());
  }
  if (setup.examTitle.trim()) {
    params.set("exam", setup.examTitle.trim());
  }
  if (setup.rules.trim()) {
    params.set("rules", setup.rules.trim());
  }
  if (typeof setup.durationMinutes === "number" && setup.durationMinutes > 0) {
    params.set("duration", String(Math.round(setup.durationMinutes)));
  }
  if (setup.endIso) {
    const parsedEnd = new Date(setup.endIso).getTime();
    if (!Number.isNaN(parsedEnd)) {
      params.set("end", new Date(parsedEnd).toISOString());
    }
  }

  params.set("beep", setup.beepEnabled ? "1" : "0");
  params.set("split", setup.splitDefault ? "1" : "0");
  params.set("showTimes", setup.showStartEndInfo ? "1" : "0");

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}
