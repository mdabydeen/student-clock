import type { ExamSetup } from "../types";
import { formatDateTime } from "../utils/time";

type InfoPanelProps = {
  setup: ExamSetup;
  startTimestampMs: number | null;
  endTimestampMs: number | null;
};

export function InfoPanel({ setup, startTimestampMs, endTimestampMs }: InfoPanelProps) {
  return (
    <section className="info-panel">
      <div className="info-section">
        <h2>Course Details</h2>
        <p>
          <strong>{setup.course || "Untitled course"}</strong>
        </p>
        <p>{setup.examTitle || "Untitled exam"}</p>
      </div>

      {setup.showStartEndInfo ? (
        <div className="info-section">
          <h2>Timing</h2>
          <p>
            <span className="key">Start:</span> {formatDateTime(startTimestampMs)}
          </p>
          <p>
            <span className="key">End:</span> {formatDateTime(endTimestampMs)}
          </p>
        </div>
      ) : null}

      <div className="info-section">
        <h2>Rules &amp; Notes</h2>
        <p className="rules-text">{setup.rules.trim() || "No rules or notes provided for this session."}</p>
      </div>
    </section>
  );
}
