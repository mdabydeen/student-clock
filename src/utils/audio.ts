export async function playAlertBeep(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  const Ctx = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) {
    return false;
  }

  const context = new Ctx();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  const now = context.currentTime;

  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(880, now);

  gainNode.gain.setValueAtTime(0.0001, now);
  gainNode.gain.exponentialRampToValueAtTime(0.25, now + 0.04);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.45);

  await new Promise<void>((resolve) => {
    oscillator.onended = () => resolve();
  });
  await context.close();
  return true;
}
