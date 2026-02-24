import type { FormEvent } from "react";
import type { ExamSetup } from "../types";
import { localDateTimeInputToIso, toLocalDateTimeInputValue } from "../utils/time";

type SetupPanelProps = {
  setup: ExamSetup;
  onSetupChange: (nextSetup: ExamSetup) => void;
  onStart: () => void;
  onClose?: () => void;
  error?: string | null;
  isActiveSession: boolean;
};

function updateSetup<K extends keyof ExamSetup>(
  setup: ExamSetup,
  key: K,
  value: ExamSetup[K]
): ExamSetup {
  return {
    ...setup,
    [key]: value
  };
}

export function SetupPanel({
  setup,
  onSetupChange,
  onStart,
  onClose,
  error,
  isActiveSession
}: SetupPanelProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onStart();
  };

  return (
    <section className="setup-panel">
      <header className="setup-header">
        <h2>{isActiveSession ? "Restart Exam Session" : "Exam Setup"}</h2>
        <p>Set the timer, course details, and classroom rules before you begin.</p>
      </header>

      <form className="setup-form" onSubmit={handleSubmit}>
        <label htmlFor="courseName">Course name</label>
        <input
          id="courseName"
          required
          value={setup.course}
          onChange={(event) => onSetupChange(updateSetup(setup, "course", event.target.value))}
          placeholder="BIO 201"
        />

        <label htmlFor="examTitle">Exam title</label>
        <input
          id="examTitle"
          required
          value={setup.examTitle}
          onChange={(event) => onSetupChange(updateSetup(setup, "examTitle", event.target.value))}
          placeholder="Midterm Exam"
        />

        <label htmlFor="durationMinutes">Duration (minutes)</label>
        <input
          id="durationMinutes"
          type="number"
          min={1}
          step={1}
          value={setup.durationMinutes ?? ""}
          onChange={(event) => {
            const next = event.target.value.trim();
            const parsed = Number(next);
            const durationMinutes = next && Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
            onSetupChange(updateSetup(setup, "durationMinutes", durationMinutes));
          }}
        />

        <label htmlFor="endTime">Or set explicit end time</label>
        <input
          id="endTime"
          type="datetime-local"
          value={toLocalDateTimeInputValue(setup.endIso)}
          onChange={(event) =>
            onSetupChange(updateSetup(setup, "endIso", localDateTimeInputToIso(event.target.value)))
          }
        />

        <label htmlFor="examRules">Rules or notes</label>
        <textarea
          id="examRules"
          rows={6}
          value={setup.rules}
          onChange={(event) => onSetupChange(updateSetup(setup, "rules", event.target.value))}
          placeholder="No phones. Raise your hand for questions."
        />

        <label className="checkbox-row" htmlFor="showStartEndInfo">
          <input
            id="showStartEndInfo"
            type="checkbox"
            checked={setup.showStartEndInfo}
            onChange={(event) => onSetupChange(updateSetup(setup, "showStartEndInfo", event.target.checked))}
          />
          <span>Show start/end timestamps in details panel</span>
        </label>

        <label className="checkbox-row" htmlFor="beepEnabled">
          <input
            id="beepEnabled"
            type="checkbox"
            checked={setup.beepEnabled}
            onChange={(event) => onSetupChange(updateSetup(setup, "beepEnabled", event.target.checked))}
          />
          <span>Enable end-of-time beep</span>
        </label>

        <label className="checkbox-row" htmlFor="splitDefault">
          <input
            id="splitDefault"
            type="checkbox"
            checked={setup.splitDefault}
            onChange={(event) => onSetupChange(updateSetup(setup, "splitDefault", event.target.checked))}
          />
          <span>Start in split-screen mode</span>
        </label>

        {error ? (
          <p role="alert" className="setup-error">
            {error}
          </p>
        ) : null}

        <div className="setup-actions">
          <button type="submit" className="btn btn-primary">
            Start exam
          </button>
          {onClose ? (
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
