// Short feedback tones made with Web Audio, so there are no sound files to load.
const KEY = "encoder-sound";
// One small chiptune palette: square for rewards, triangle for soft taps and mistakes.
const NOTES = {
    correct: [[660, 0, 0.09, "square"], [990, 0.08, 0.16, "square"]],
    wrong: [[247, 0, 0.14, "triangle"], [196, 0.12, 0.24, "triangle"]],
    near: [[523, 0, 0.08, "triangle"], [494, 0.09, 0.14, "triangle"]],
    hint: [[880, 0, 0.06, "triangle"], [1175, 0.06, 0.1, "triangle"]],
    done: [[523, 0, 0.1, "square"], [659, 0.1, 0.1, "square"], [784, 0.2, 0.1, "square"], [1047, 0.3, 0.32, "square"]],
    unit: [[523, 0, 0.1, "square"], [784, 0.1, 0.1, "square"], [1047, 0.2, 0.1, "square"], [1319, 0.3, 0.1, "square"], [1568, 0.42, 0.4, "square"]],
    tap: [[520, 0, 0.05, "triangle"]]
};
const LOUDNESS = { square: 0.035, triangle: 0.08, sine: 0.07 };

let context = null;
let muted = false;
try { muted = localStorage.getItem(KEY) === "off"; } catch {}

export const isMuted = () => muted;

export function setMuted(value) {
    muted = value;
    try { localStorage.setItem(KEY, value ? "off" : "on"); } catch {}
}

// `rise` lifts the pitch a little, so a streak of right answers climbs.
export function play(name, { rise = 0 } = {}) {
    if (muted || !window.AudioContext) return;
    context ??= new AudioContext();
    const now = context.currentTime;
    const lift = 2 ** (Math.min(rise, 8) / 12);
    for (const [frequency, at, length, type = "sine"] of NOTES[name] ?? []) {
        const oscillator = new OscillatorNode(context, { frequency: frequency * lift, type });
        const gain = new GainNode(context, { gain: 0 });
        gain.gain.setValueAtTime(0, now + at);
        gain.gain.linearRampToValueAtTime(LOUDNESS[type], now + at + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + at + length);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(now + at);
        oscillator.stop(now + at + length + 0.02);
    }
}
