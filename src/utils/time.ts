export function formatCountdown(remainingMs: number): string {
  const clampedMs = Math.max(0, remainingMs);
  const totalSeconds = Math.ceil(clampedMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hourText = String(hours).padStart(2, "0");
  const minuteText = String(minutes).padStart(2, "0");
  const secondText = String(seconds).padStart(2, "0");
  return `${hourText}:${minuteText}:${secondText}`;
}

export function formatDateTime(timestampMs: number | null): string {
  if (!timestampMs) {
    return "N/A";
  }

  return new Date(timestampMs).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export function toLocalDateTimeInputValue(endIso?: string): string {
  if (!endIso) {
    return "";
  }
  const parsed = new Date(endIso);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function localDateTimeInputToIso(value: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }
  return parsed.toISOString();
}
