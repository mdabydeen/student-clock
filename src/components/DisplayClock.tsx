import type { TimerStatus } from "../types";

type DisplayClockProps = {
  timeText: string;
  status: TimerStatus;
};

export function DisplayClock({ timeText, status }: DisplayClockProps) {
  const statusText =
    status === "paused" ? "Paused" : status === "finished" ? "Time is up" : "Time Remaining";

  return (
    <section className={`clock-display clock-status-${status}`} aria-live="polite" aria-atomic="true">
      <p className="clock-label">{statusText}</p>
      <p className="clock-time">{timeText}</p>
    </section>
  );
}
