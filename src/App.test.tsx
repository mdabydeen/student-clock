import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { STORAGE_KEY } from "./constants";

type StartSessionOptions = {
  course?: string;
  examTitle?: string;
  duration?: string;
  rules?: string;
};

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  async function startSession(user: ReturnType<typeof userEvent.setup>, options: StartSessionOptions = {}) {
    await user.type(screen.getByLabelText(/Course name/i), options.course ?? "HIST 220");
    await user.type(screen.getByLabelText(/Exam title/i), options.examTitle ?? "Unit Test 1");

    if (options.rules) {
      await user.type(screen.getByLabelText(/Rules or notes/i), options.rules);
    }

    const durationInput = screen.getByLabelText(/Duration \(minutes\)/i);
    await user.clear(durationInput);
    await user.type(durationInput, options.duration ?? "60");

    await user.click(screen.getByRole("button", { name: /Start exam/i }));
  }

  it("starts an exam and toggles split details", async () => {
    const user = userEvent.setup();
    render(<App />);

    await startSession(user);

    expect(screen.getByText("HIST 220")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Rules & Notes/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Show details/i }));
    expect(screen.getByRole("heading", { name: /Rules & Notes/i })).toBeInTheDocument();
  });

  it("shows a validation error when neither duration nor end time is provided", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/Course name/i), "MATH 101");
    await user.type(screen.getByLabelText(/Exam title/i), "Quiz 2");
    await user.clear(screen.getByLabelText(/Duration \(minutes\)/i));
    await user.click(screen.getByRole("button", { name: /Start exam/i }));

    expect(screen.getByRole("alert")).toHaveTextContent("Provide a duration or an explicit end time.");
    expect(screen.getByRole("heading", { name: /Exam Setup/i })).toBeInTheDocument();
  });

  it("requires confirmation before resetting an active session", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<App />);
    await startSession(user);

    await user.click(screen.getByRole("button", { name: /Reset/i }));
    expect(confirmSpy).toHaveBeenCalledWith("Reset the current exam timer?");
    expect(screen.getByRole("button", { name: /Pause/i })).toBeInTheDocument();

    confirmSpy.mockReturnValue(true);
    await user.click(screen.getByRole("button", { name: /Reset/i }));

    expect(screen.getByRole("heading", { name: /Exam Setup/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Pause/i })).not.toBeInTheDocument();
  });

  it("locks presentation and supports unlocking by button or keyboard shortcut", async () => {
    const user = userEvent.setup();
    render(<App />);
    await startSession(user);

    await user.click(screen.getByRole("button", { name: /Lock presentation/i }));

    expect(screen.getByText(/Presentation locked\. Active controls are hidden\./i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^Unlock$/i }));
    expect(screen.getByRole("button", { name: /Confirm unlock/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Confirm unlock/i }));
    expect(screen.getByRole("button", { name: /Lock presentation/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Lock presentation/i }));
    fireEvent.keyDown(window, { key: "L", shiftKey: true });
    expect(await screen.findByRole("button", { name: /Lock presentation/i })).toBeInTheDocument();
  });

  it("merges persisted setup with URL params during initial load", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        setup: {
          course: "Stored Course",
          examTitle: "Stored Exam",
          durationMinutes: 45,
          beepEnabled: true,
          splitDefault: false,
          showStartEndInfo: true
        }
      })
    );

    window.history.replaceState({}, "", "/?course=URL%20Course&exam=URL%20Exam&duration=30&split=1");
    render(<App />);

    expect(screen.getByLabelText(/Course name/i)).toHaveValue("URL Course");
    expect(screen.getByLabelText(/Exam title/i)).toHaveValue("URL Exam");
    expect(screen.getByLabelText(/Duration \(minutes\)/i)).toHaveValue(30);
    expect(screen.getByLabelText(/Start in split-screen mode/i)).toBeChecked();
    expect(screen.getByLabelText(/Enable end-of-time beep/i)).toBeChecked();
  });

  it("persists trimmed setup values and updates the URL", async () => {
    const user = userEvent.setup();
    render(<App />);

    await startSession(user, {
      course: "  CS 101  ",
      examTitle: "  Final Exam  ",
      duration: "62",
      rules: "  Quiet testing environment  "
    });

    expect(screen.getByText("CS 101")).toBeInTheDocument();
    expect(screen.getByText("Final Exam")).toBeInTheDocument();

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as {
      setup?: { course?: string; examTitle?: string; durationMinutes?: number; rules?: string };
    };

    expect(stored.setup).toMatchObject({
      course: "CS 101",
      examTitle: "Final Exam",
      durationMinutes: 62,
      rules: "Quiet testing environment"
    });
    expect(window.location.search).toContain("course=CS+101");
    expect(window.location.search).toContain("exam=Final+Exam");
    expect(window.location.search).toContain("duration=62");
  });
});
