import { useEffect, useRef, useState } from "react";
import { DEFAULT_EXAM_SETUP } from "./constants";
import { ControlBar } from "./components/ControlBar";
import { DisplayClock } from "./components/DisplayClock";
import { InfoPanel } from "./components/InfoPanel";
import { SetupPanel } from "./components/SetupPanel";
import { useExamTimer } from "./hooks/useExamTimer";
import type { ExamSetup } from "./types";
import { playAlertBeep } from "./utils/audio";
import { loadExamSetup, saveExamSetup } from "./utils/storage";
import { formatCountdown } from "./utils/time";
import { parseExamSetupFromUrl, toUrlSearch } from "./utils/urlConfig";

function mergeSetup(...inputs: Array<Partial<ExamSetup> | null | undefined>): ExamSetup {
  const merged: ExamSetup = { ...DEFAULT_EXAM_SETUP };

  for (const input of inputs) {
    if (!input) {
      continue;
    }
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined) {
        (merged as Record<string, unknown>)[key] = value;
      }
    }
  }

  return merged;
}

function normalizeSetup(setup: ExamSetup): ExamSetup {
  const normalizedDuration =
    typeof setup.durationMinutes === "number" && Number.isFinite(setup.durationMinutes) && setup.durationMinutes > 0
      ? Math.round(setup.durationMinutes)
      : undefined;
  const normalizedEnd = setup.endIso && !Number.isNaN(new Date(setup.endIso).getTime()) ? setup.endIso : undefined;

  return {
    ...setup,
    course: setup.course.trim(),
    examTitle: setup.examTitle.trim(),
    rules: setup.rules.trim(),
    durationMinutes: normalizedDuration,
    endIso: normalizedEnd
  };
}

function getInitialSetup(): ExamSetup {
  if (typeof window === "undefined") {
    return { ...DEFAULT_EXAM_SETUP };
  }
  const fromStorage = loadExamSetup();
  const fromUrl = parseExamSetupFromUrl(window.location.search);
  return mergeSetup(fromStorage, fromUrl);
}

function validateSetup(setup: ExamSetup): string | null {
  if (!setup.course.trim()) {
    return "Course name is required.";
  }
  if (!setup.examTitle.trim()) {
    return "Exam title is required.";
  }
  const hasDuration = typeof setup.durationMinutes === "number" && setup.durationMinutes > 0;
  const hasEnd = typeof setup.endIso === "string" && !Number.isNaN(new Date(setup.endIso).getTime());
  if (!hasDuration && !hasEnd) {
    return "Provide a duration or an explicit end time.";
  }
  return null;
}

export default function App() {
  const initialSetupRef = useRef<ExamSetup>(getInitialSetup());
  const [setupDraft, setSetupDraft] = useState<ExamSetup>(initialSetupRef.current);
  const [sessionSetup, setSessionSetup] = useState<ExamSetup | null>(null);
  const [sessionStartTimestampMs, setSessionStartTimestampMs] = useState<number | null>(null);
  const [isSplitVisible, setIsSplitVisible] = useState<boolean>(initialSetupRef.current.splitDefault);
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(true);
  const [isPresentationLocked, setIsPresentationLocked] = useState<boolean>(false);
  const [unlockArmed, setUnlockArmed] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const unlockTimeoutRef = useRef<number | null>(null);

  const beepEnabledRef = useRef<boolean>(false);
  useEffect(() => {
    beepEnabledRef.current = sessionSetup?.beepEnabled ?? false;
  }, [sessionSetup]);

  const { status, remainingMs, endTimestampMs, start, pause, resume, reset, adjustMinutes } = useExamTimer({
    onFinished: () => {
      if (beepEnabledRef.current) {
        void playAlertBeep();
      }
    }
  });

  const disarmUnlock = () => {
    if (unlockTimeoutRef.current !== null) {
      window.clearTimeout(unlockTimeoutRef.current);
      unlockTimeoutRef.current = null;
    }
    setUnlockArmed(false);
  };

  const unlockPresentation = () => {
    disarmUnlock();
    setIsPresentationLocked(false);
  };

  useEffect(() => {
    return () => {
      if (unlockTimeoutRef.current !== null) {
        window.clearTimeout(unlockTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isPresentationLocked) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key.toLowerCase() === "l") {
        event.preventDefault();
        unlockPresentation();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPresentationLocked]);

  const handleStart = () => {
    const normalizedSetup = normalizeSetup(setupDraft);
    const validationError = validateSetup(normalizedSetup);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const endMs = start({
      durationMinutes: normalizedSetup.durationMinutes,
      endIso: normalizedSetup.endIso
    });

    if (!endMs) {
      setFormError("Unable to start timer. Check duration and end time values.");
      return;
    }

    setSessionSetup(normalizedSetup);
    setSessionStartTimestampMs(Date.now());
    setIsSplitVisible(normalizedSetup.splitDefault);
    setIsPresentationLocked(false);
    disarmUnlock();
    setIsSetupOpen(false);
    setFormError(null);
    setSetupDraft(normalizedSetup);
    saveExamSetup(normalizedSetup);

    if (typeof window !== "undefined") {
      const search = toUrlSearch(normalizedSetup);
      window.history.replaceState({}, "", `${window.location.pathname}${search}`);
    }
  };

  const handlePauseToggle = () => {
    if (status === "paused") {
      resume();
      return;
    }
    if (status === "running") {
      pause();
    }
  };

  const handleReset = () => {
    if (typeof window !== "undefined" && !window.confirm("Reset the current exam timer?")) {
      return;
    }
    reset();
    setSessionSetup(null);
    setSessionStartTimestampMs(null);
    setIsPresentationLocked(false);
    disarmUnlock();
    setIsSetupOpen(true);
    setFormError(null);
  };

  const handleLock = () => {
    setIsPresentationLocked(true);
    disarmUnlock();
    setIsSetupOpen(false);
  };

  const handleUnlockAttempt = () => {
    if (unlockArmed) {
      unlockPresentation();
      return;
    }

    setUnlockArmed(true);
    if (unlockTimeoutRef.current !== null) {
      window.clearTimeout(unlockTimeoutRef.current);
    }
    unlockTimeoutRef.current = window.setTimeout(() => {
      setUnlockArmed(false);
      unlockTimeoutRef.current = null;
    }, 5_000);
  };

  const hasActiveSession = status !== "idle";
  const activeSetup = sessionSetup ?? setupDraft;

  return (
    <div className="app-shell">
      <div className="ambient-shape ambient-shape-a" />
      <div className="ambient-shape ambient-shape-b" />

      {hasActiveSession ? (
        <>
          <main className={`session-layout ${isSplitVisible ? "session-layout-split" : "session-layout-clock-only"}`}>
            <section className="clock-pane">
              <header className="session-header">
                <p className="session-course">{activeSetup.course}</p>
                <h1 className="session-exam">{activeSetup.examTitle}</h1>
                {isPresentationLocked ? <p className="lock-badge">Presentation Locked</p> : null}
              </header>
              <DisplayClock status={status} timeText={formatCountdown(remainingMs)} />
            </section>

            {isSplitVisible ? (
              <aside className="details-pane">
                <InfoPanel setup={activeSetup} startTimestampMs={sessionStartTimestampMs} endTimestampMs={endTimestampMs} />
              </aside>
            ) : null}
          </main>

          <ControlBar
            status={status}
            isSplitVisible={isSplitVisible}
            isSetupOpen={isSetupOpen}
            isPresentationLocked={isPresentationLocked}
            unlockArmed={unlockArmed}
            onPauseToggle={handlePauseToggle}
            onAdjustMinutes={adjustMinutes}
            onReset={handleReset}
            onToggleSplit={() => setIsSplitVisible((current) => !current)}
            onToggleSetup={() => setIsSetupOpen((current) => !current)}
            onLock={handleLock}
            onUnlockAttempt={handleUnlockAttempt}
          />

          {isSetupOpen && !isPresentationLocked ? (
            <div className="setup-overlay">
              <SetupPanel
                setup={setupDraft}
                onSetupChange={setSetupDraft}
                onStart={handleStart}
                onClose={() => setIsSetupOpen(false)}
                error={formError}
                isActiveSession
              />
            </div>
          ) : null}
        </>
      ) : (
        <main className="setup-layout">
          <SetupPanel
            setup={setupDraft}
            onSetupChange={setSetupDraft}
            onStart={handleStart}
            error={formError}
            isActiveSession={false}
          />
        </main>
      )}
    </div>
  );
}
