/**
 * Notification tone, synthesized with the Web Audio API — no audio asset to
 * ship. A short two-note "ding-dong" via an oscillator + gain envelope.
 *
 * Browsers block audio until the user has interacted with the page, so
 * `unlockAudio()` must run once from a real user gesture (see DashboardLayout).
 */

const MUTE_KEY = 'emenu.admin.sound';

let ctx: AudioContext | null = null;

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

/** True when the tone is muted (persisted across reloads). */
export function isMuted(): boolean {
  return localStorage.getItem(MUTE_KEY) === 'off';
}

/** Persist the mute preference. Returns the new muted state. */
export function setMuted(muted: boolean): void {
  localStorage.setItem(MUTE_KEY, muted ? 'off' : 'on');
}

/**
 * Resume/create the AudioContext from a user gesture so later programmatic
 * playback is allowed. Safe to call repeatedly.
 */
export function unlockAudio(): void {
  const audio = getContext();
  if (audio && audio.state === 'suspended') {
    void audio.resume();
  }
}

/** Play the notification tone unless muted. No-op if audio is unavailable. */
export function playChime(): void {
  if (isMuted()) return;
  const audio = getContext();
  if (!audio) return;
  if (audio.state === 'suspended') void audio.resume();

  const now = audio.currentTime;
  // Two descending notes for a recognisable "new order" cue.
  playNote(audio, 880, now, 0.18); // A5
  playNote(audio, 660, now + 0.16, 0.28); // E5
}

function playNote(
  audio: AudioContext,
  frequency: number,
  start: number,
  duration: number,
): void {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = 'sine';
  osc.frequency.value = frequency;

  // Quick attack, smooth exponential decay — avoids clicks.
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(gain).connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}
