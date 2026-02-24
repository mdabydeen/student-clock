import type { TimerStatus } from "../types";

type ControlBarProps = {
  status: TimerStatus;
  isSplitVisible: boolean;
  isSetupOpen: boolean;
  isPresentationLocked: boolean;
  unlockArmed: boolean;
  onPauseToggle: () => void;
  onAdjustMinutes: (minutes: number) => void;
  onReset: () => void;
  onToggleSplit: () => void;
  onToggleSetup: () => void;
  onLock: () => void;
  onUnlockAttempt: () => void;
};

export function ControlBar({
  status,
  isSplitVisible,
  isSetupOpen,
  isPresentationLocked,
  unlockArmed,
  onPauseToggle,
  onAdjustMinutes,
  onReset,
  onToggleSplit,
  onToggleSetup,
  onLock,
  onUnlockAttempt
}: ControlBarProps) {
  const canPauseToggle = status === "running" || status === "paused";

  if (isPresentationLocked) {
    return (
      <nav className="control-bar control-bar-locked" aria-label="Presentation lock controls">
        <p className="lock-message">Presentation locked. Active controls are hidden.</p>
        <div className="control-group">
          <p className="lock-hint">Press Shift+L or click unlock twice.</p>
          <button type="button" className="btn btn-primary" onClick={onUnlockAttempt}>
            {unlockArmed ? "Confirm unlock" : "Unlock"}
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="control-bar" aria-label="Exam clock controls">
      <div className="control-group">
        <button type="button" className="btn btn-primary" onClick={onPauseToggle} disabled={!canPauseToggle}>
          {status === "paused" ? "Resume" : "Pause"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => onAdjustMinutes(1)}>
          +1 min
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => onAdjustMinutes(5)}>
          +5 min
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => onAdjustMinutes(-1)}>
          -1 min
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => onAdjustMinutes(-5)}>
          -5 min
        </button>
      </div>

      <div className="control-group">
        <button type="button" className="btn btn-secondary" onClick={onToggleSplit}>
          {isSplitVisible ? "Hide details" : "Show details"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onToggleSetup}>
          {isSetupOpen ? "Hide setup" : "Setup"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onLock}>
          Lock presentation
        </button>
        <button type="button" className="btn btn-danger" onClick={onReset}>
          Reset
        </button>
      </div>
    </nav>
  );
}
