import { afterEach, describe, expect, it, vi } from "vitest";
import { playAlertBeep } from "./audio";

describe("audio", () => {
  const originalWebkitAudioContext = (window as Window & { webkitAudioContext?: typeof AudioContext })
    .webkitAudioContext;

  afterEach(() => {
    vi.unstubAllGlobals();
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext =
      originalWebkitAudioContext;
  });

  it("returns false when no supported audio context is available", async () => {
    vi.stubGlobal("AudioContext", undefined);
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext = undefined;

    await expect(playAlertBeep()).resolves.toBe(false);
  });
});
