// Short feedback tones made with Web Audio, so there are no sound files to load.
const KEY = "encoder-sound";
const NOTES = {
    correct: [[660, 0, 0.12], [880, 0.1, 0.2]],
    wrong: [[247, 0, 0.16, "triangle"], [196, 0.12, 0.26, "triangle"]],
    done: [[523, 0, 0.12], [659, 0.1, 0.12], [784, 0.2, 0.12], [1047, 0.3, 0.35]],
    tap: [[520, 0, 0.05, "triangle"]]
};

let context = null;
let muted = false;
try { muted = localStorage.getItem(KEY) === "off"; } catch {}

export const isMuted = () => muted;

export function setMuted(value) {
    muted = value;
    try { localStorage.setItem(KEY, value ? "off" : "on"); } catch {}
}

export function play(name) {
    if (muted || !window.AudioContext) return;
    context ??= new AudioContext();
    const now = context.currentTime;
    for (const [frequency, at, length, type = "sine"] of NOTES[name]) {
        const oscillator = new OscillatorNode(context, { frequency, type });
        const gain = new GainNode(context, { gain: 0 });
        gain.gain.setValueAtTime(0, now + at);
        gain.gain.linearRampToValueAtTime(0.07, now + at + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + at + length);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(now + at);
        oscillator.stop(now + at + length + 0.02);
    }
}
