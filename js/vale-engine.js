// The valley engine: small pixel canvases scaled up crisp, with live particle systems.
// Everything is drawn at 1 canvas pixel per art pixel; CSS scales the canvas with image-rendering: pixelated.
// Layers, back to front: sky bands, stars, aurora, sun or moon, clouds, mountains and ground,
// far snow, props and creatures sorted by their feet, smoke and fire, warm lights at night, near snow.
import { ART, frame } from "./vale-art.js";

export const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];

// ---------------------------------------------------------------- helpers
export function rng(seed) {
    let t = 0;
    for (const ch of String(seed)) t = Math.imul(t ^ ch.charCodeAt(0), 2654435761);
    return () => {
        t += 0x6d2b79f5;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}
const hash = (n) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
export const noise = (x) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i) * (1 - u) + hash(i + 1) * u; };
const fbm = (x) => noise(x) * 0.6 + noise(x * 2.3 + 7) * 0.3 + noise(x * 5.1 + 3) * 0.1;
const makeCanvas = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
export const size = (name) => ART[name];

export function draw(ctx, name, i, x, bottom, flip, night) {
    const s = ART[name], img = frame(name, i, night);
    const X = Math.round(x), Y = Math.round(bottom - s.h);
    if (!flip) ctx.drawImage(img, X, Y);
    else { ctx.save(); ctx.translate(X + s.w, Y); ctx.scale(-1, 1); ctx.drawImage(img, 0, 0); ctx.restore(); }
}

// ---------------------------------------------------------------- palettes
// Scenes use these; skies on the pages read the same roles from CSS custom properties instead.
export const PAL = {
    day: { bands: ["#5aa9e2", "#6fb6e8", "#84c3ee", "#9bd0f2", "#b4ddf6"], far: ["#c6ddf1", "#aac7e4"], near: ["#9fb9da", "#83a0c7"], cap: "#ffffff", capSh: "#dbe7f4",
        tree: ["#5d84a7", "#4c7397"], cloud: ["#ffffff", "#e6f0f9", "#cbdcee"], sun: "#fff4b8", ring: "#ffe48a", snow: ["#ffffff", "#f0f5fb", "#dfe9f5", "#c9d7ea"], smoke: [196, 206, 224] },
    night: { bands: ["#080d24", "#0d1433", "#131c44", "#1a2656", "#22316a"], far: ["#2c3b78", "#24326a"], near: ["#22306a", "#1b2858"], cap: "#b6c4e6", capSh: "#8a9bc8",
        tree: ["#141f48", "#101a3e"], cloud: ["#24326a", "#1f2c5e", "#1a2652"], sun: "#f4f0da", ring: "#26356f", snow: ["#c4d0ec", "#b1c0e2", "#9cadd6", "#8596c2"], smoke: [150, 162, 200] }
};

// ---------------------------------------------------------------- sky pieces
export function skyBands(ctx, W, top, bands, dither = true) {
    const n = bands.length, bh = Math.ceil(top / n);
    bands.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, i * bh, W, bh + 1); });
    for (let i = 1; i < n && dither; i++) { // dithered seams between the bands
        ctx.fillStyle = bands[i];
        for (let y = i * bh - 3; y < i * bh; y++) for (let x = 0; x < W; x++) if (BAYER[y & 3][x & 3] < (y - (i * bh - 3) + 1) * 4) ctx.fillRect(x, y, 1, 1);
    }
}

export function sun(ctx, x, y, r, p, night) {
    for (let dy = -r - 4; dy <= r + 4; dy++) for (let dx = -r - 4; dx <= r + 4; dx++) {
        const d = Math.hypot(dx + 0.5, dy + 0.5);
        if (d <= r) { ctx.fillStyle = p.sun; ctx.fillRect(x + dx, y + dy, 1, 1); }
        else if (d <= r + 3.5 && BAYER[(dy + 8) & 3][(dx + 8) & 3] < (r + 3.5 - d) * 5) { ctx.fillStyle = p.ring; ctx.fillRect(x + dx, y + dy, 1, 1); }
    }
    if (night) {                            // a few craters on the moon
        ctx.fillStyle = "#d8d2b8";
        const k = r / 7;
        for (const [cx, cy, cr] of [[-2, -2, 1.7], [2, 1, 1.3], [-1, 3, 1]]) for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (Math.hypot(dx, dy) <= cr * k) ctx.fillRect(Math.round(x + cx * k + dx), Math.round(y + cy * k + dy), 1, 1);
    }
}

export function cloud(ctx, x, y, s, p) {
    const w = Math.round(32 * s);
    x = Math.round(x); y = Math.round(y);
    ctx.fillStyle = p.cloud[0]; ctx.fillRect(x + w * 0.3, y, w * 0.35, 2); ctx.fillRect(x + w * 0.12, y + 2, w * 0.75, 3);
    ctx.fillStyle = p.cloud[1]; ctx.fillRect(x, y + 5, w, 2);
    ctx.fillStyle = p.cloud[2]; ctx.fillRect(x + w * 0.06, y + 7, w * 0.88, 1);
}

// Mountains with snow caps and gullies, a band of distant firs, and the snowy ground with drifts.
export function land(W, H, top, seed, p, { ground = true, height = 0.66 } = {}) {
    const c = makeCanvas(W, H), ctx = c.getContext("2d");
    const range = (count, h0, cols, capFrom, s) => {
        const r = rng(s);
        for (let i = 0; i < count; i++) {
            const cx = (i + 0.25 + r() * 0.5) * (W / count), hw = W / count * (0.8 + r() * 0.35), h = h0 * (0.7 + r() * 0.3);
            for (let x = Math.floor(cx - hw); x < cx + hw; x++) {
                const t = 1 - Math.abs(x + 0.5 - cx) / hw;
                if (t <= 0) continue;
                const y0 = top - Math.round(t * h) + Math.round(noise(x * 0.35 + i * 9) * 2.2);
                const cap = Math.round((t - capFrom) * h * 0.9 + noise(x * 0.9 + i) * 3);
                const lit = x < cx;
                for (let y = y0; y < top; y++) {
                    const g = noise((x + (y - top) * 0.45) * 0.42 + i * 31 + (lit ? 0 : 5));
                    const g2 = noise(y * 0.28 + x * 0.06 + i * 3);
                    const depth = y - y0;
                    let col = lit ? cols[0] : cols[1];
                    if (depth < cap) col = lit ? p.cap : p.capSh;
                    else if (depth < cap + 9 && g < 0.26 && g2 > 0.35) col = lit ? p.capSh : cols[0];
                    else if (lit && g > 0.7 && g2 > 0.42) col = cols[1];
                    else if (!lit && g > 0.78 && g2 > 0.5) col = p.tree[1];
                    if (lit && depth === 0) col = p.cap;
                    ctx.fillStyle = col;
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
    };
    range(Math.max(2, Math.round(W / 80)), top * height, p.far, 0.6, seed + "f");
    range(Math.max(3, Math.round(W / 53)), top * height * 0.64, p.near, 0.66, seed + "n");
    const tr = rng(seed + "t");
    for (let x = -2; x < W + 2; x += 2 + Math.floor(tr() * 3)) {
        const h = 4 + Math.round(noise(x * 0.21) * 4 + tr() * 2);
        for (let k = 0; k < h; k++) {
            const half = Math.floor(k * 0.42), y = top - h + k;
            ctx.fillStyle = p.tree[0]; ctx.fillRect(x - half, y, half + 1, 1);
            ctx.fillStyle = p.tree[1]; ctx.fillRect(x + 1, y, half, 1);
        }
        ctx.fillStyle = p.capSh; ctx.fillRect(x, top - h, 1, 1);
    }
    if (ground) {
        ctx.fillStyle = p.snow[1];
        ctx.fillRect(0, top, W, H - top);
        const r = rng(seed + "g");
        const drifts = Math.max(3, Math.round(W * (H - top) / 1300));
        for (let i = 0; i < drifts; i++) {
            const x0 = Math.floor(r() * W) - 20, len = 30 + Math.floor(r() * 70), y0 = top + 5 + Math.floor(r() * Math.max(1, H - top - 8));
            for (let x = x0; x < x0 + len; x++) {
                const t = (x - x0) / len, bump = Math.round(Math.sin(t * Math.PI) * 2.2);
                ctx.fillStyle = p.snow[0]; ctx.fillRect(x, y0 - bump, 1, 1);
                ctx.fillStyle = p.snow[2]; ctx.fillRect(x, y0 - bump + 1, 1, 1);
                if (t > 0.12 && t < 0.88) { ctx.fillStyle = p.snow[3]; ctx.fillRect(x, y0 - bump + 2, 1, 1); }
            }
        }
        ctx.fillStyle = p.snow[2];
        ctx.fillRect(0, top, W, 1);
    }
    return c;
}

// ---------------------------------------------------------------- light and shade
export function glow(ctx, cx, cy, radius, [r, g, b], strength, night) {
    // warm light in three soft bands; the band edges are dithered so they read as a halo, not rings
    if (strength <= 0) return;
    ctx.save();
    ctx.globalCompositeOperation = night ? "lighter" : "source-over";
    const k = night ? 0.11 : 0.07;
    for (let y = Math.floor(cy - radius); y <= cy + radius; y++) for (let x = Math.floor(cx - radius); x <= cx + radius; x++) {
        const d = Math.hypot(x + 0.5 - cx, (y + 0.5 - cy) * 1.15) / radius;
        if (d > 1) continue;
        const level = Math.min(3, Math.floor(strength * (1 - d) * (1 - d) * 3.2 + BAYER[y & 3][x & 3] / 32));
        if (level <= 0) continue;
        ctx.fillStyle = `rgba(${r},${g},${b},${k * level})`;
        ctx.fillRect(x, y, 1, 1);
    }
    ctx.restore();
}

// A soft oval cast down and to the right, away from the light; two tones with a dithered rim.
export function shadow(ctx, cx, bottom, w, tall, night) {
    const [r, g, b] = night ? [8, 14, 44] : [96, 126, 178];
    const ox = cx + Math.min(6, tall * 0.12), rx = w * 0.46 + tall * 0.08, ry = Math.max(1.6, w * 0.08 + tall * 0.02);
    for (let y = Math.floor(bottom - ry); y <= bottom + ry; y++) for (let x = Math.floor(ox - rx); x <= ox + rx; x++) {
        const d = Math.hypot((x + 0.5 - ox) / rx, (y + 0.5 - bottom) / ry);
        if (d > 1 || (d > 0.62 && (x + y) % 2)) continue;
        ctx.fillStyle = `rgba(${r},${g},${b},${d < 0.62 ? 0.34 : 0.26})`;
        ctx.fillRect(x, y, 1, 1);
    }
}

// ---------------------------------------------------------------- particle systems
export class Snow {
    // two depths of flakes with gusts that come and go
    constructor(W, H, seed, far = 70, near = 45) {
        const r = rng(seed);
        this.W = W; this.H = H;
        this.flakes = Array.from({ length: far + near }, (_, i) => ({
            near: i >= far, x: r() * W, y: r() * H, sp: i >= far ? 18 + r() * 16 : 7 + r() * 7,
            ph: r() * 6.28, amp: 0.6 + r() * 1.6, size: i >= far && r() < 0.35 ? 2 : 1, a: i >= far ? 0.85 + r() * 0.15 : 0.45 + r() * 0.3
        }));
    }
    update(dt, t) {
        const wind = 4 + Math.sin(t * 0.21) * 5 + Math.sin(t * 0.07) * 3;
        for (const f of this.flakes) {
            f.y += f.sp * dt;
            f.x += (wind * (f.near ? 1 : 0.5) + Math.sin(t * 1.3 + f.ph) * f.amp * 6) * dt;
            if (f.y > this.H) f.y -= this.H + 2;
            if (f.x > this.W + 2) f.x -= this.W + 4;
            if (f.x < -2) f.x += this.W + 4;
        }
    }
    draw(ctx, near, night) {
        ctx.fillStyle = night ? "#dfe7ff" : "#ffffff";
        for (const f of this.flakes) {
            if (f.near !== near) continue;
            ctx.globalAlpha = f.a;
            ctx.fillRect(Math.round(f.x), Math.round(f.y), f.size, f.size);
        }
        ctx.globalAlpha = 1;
    }
}

export class Smoke {
    // soft puffs that rise, drift with the wind, grow and fade; drawn as dithered pixel discs
    constructor(x, y, seed, rate = 0.22) {
        this.x = x; this.y = y; this.r = rng(seed); this.rate = rate; this.acc = 0; this.p = [];
        for (let i = 0; i < 16; i++) this.update(rate, i * rate);
    }
    update(dt, t) {
        this.acc += dt;
        while (this.acc > this.rate) {
            this.acc -= this.rate;
            this.p.push({ x: this.x + (this.r() - 0.5) * 2, y: this.y, vx: 2 + this.r() * 2, vy: -(6 + this.r() * 3), life: 0, max: 3.2 + this.r() * 1.2 });
        }
        const wind = 3 + Math.sin(t * 0.21) * 3;
        for (const q of this.p) { q.life += dt; q.x += (q.vx + wind * q.life * 0.6) * dt; q.y += q.vy * dt; q.vy *= 1 - 0.12 * dt; }
        this.p = this.p.filter((q) => q.life < q.max);
    }
    draw(ctx, night) {
        const [r, g, b] = (night ? PAL.night : PAL.day).smoke;
        for (const q of this.p) {
            const k = q.life / q.max, rad = 1.4 + k * 5, alpha = (1 - k * k) * 0.95;
            for (let y = Math.floor(q.y - rad); y <= q.y + rad; y++) for (let x = Math.floor(q.x - rad); x <= q.x + rad; x++) {
                const d = Math.hypot(x + 0.5 - q.x, y + 0.5 - q.y) / rad;
                if (d > 1) continue;
                const a = alpha * (1 - d * d) * (x + 0.5 > q.x + rad * 0.25 ? 0.75 : 1);
                if (a * 16 > BAYER[y & 3][x & 3]) {
                    const e = d > 0.6 ? 24 : 0;
                    ctx.fillStyle = `rgb(${r - e},${g - e},${b - e * 0.7})`;
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
    }
}

export class Fire {
    // flame tongues that sway and stretch on their own rhythms, layered from a pale core through yellow
    // and orange to a red rim; loose flame bits break off the tips; embers rise and cool
    constructor(cx, baseY, seed = "fire") {
        this.cx = cx; this.baseY = baseY; this.r = rng(seed); this.t = 0;
        this.tongues = [
            { dx: -2.6, h: 8, w: 2.4, ph: 0.0, sp: 1.0, back: true },
            { dx: 2.8, h: 9, w: 2.4, ph: 2.1, sp: 1.2, back: true },
            { dx: -1.4, h: 12, w: 3.2, ph: 4.0, sp: 0.9 },
            { dx: 1.2, h: 14, w: 3.4, ph: 1.3, sp: 1.1 },
            { dx: 0.0, h: 9, w: 2.6, ph: 3.2, sp: 1.4 }
        ];
        this.bits = []; this.embers = [];
    }
    update(dt) {
        this.t += dt;
        const r = this.r;
        if (r() < dt * 3.5) { const tg = this.tongues[2 + Math.floor(r() * 2)]; this.bits.push({ x: this.cx + tg.dx + (r() - 0.5) * 2, y: this.baseY - tg.h * 0.9, vy: -(10 + r() * 8), life: 0, max: 0.35 + r() * 0.3 }); }
        if (r() < dt * 6) this.embers.push({ x: this.cx + (r() - 0.5) * 6, y: this.baseY - 4, vx: (r() - 0.5) * 6, vy: -(12 + r() * 12), life: 0, max: 0.9 + r() * 1.2 });
        for (const b of this.bits) { b.life += dt; b.y += b.vy * dt; }
        for (const e of this.embers) { e.life += dt; e.x += (e.vx + Math.sin(e.life * 8) * 5) * dt; e.y += e.vy * dt; e.vy *= 1 - 0.6 * dt; }
        this.bits = this.bits.filter((b) => b.life < b.max);
        this.embers = this.embers.filter((e) => e.life < e.max);
    }
    tongue(ctx, tg, t) {
        const h = tg.h * (0.82 + 0.2 * noise(t * 3.2 * tg.sp + tg.ph * 7) + 0.08 * Math.sin(t * 12 * tg.sp + tg.ph));
        for (let yy = 0; yy < Math.ceil(h); yy++) {
            const k = yy / h;
            const half = tg.w * Math.pow(1 - k, 0.7) * Math.min(1, 0.65 + k * 2.4);
            if (half < 0.35) continue;
            const c = this.cx + tg.dx + Math.sin(t * 7 * tg.sp + tg.ph + k * 2.6) * 1.5 * Math.pow(k, 1.3);
            for (let x = Math.round(c - half); x <= Math.round(c + half); x++) {
                const d = Math.abs(x + 0.5 - c) / Math.max(0.6, half);
                if (d > 1.05) continue;
                let col;
                if (tg.back) col = k > 0.7 ? "#a8321c" : d > 0.6 ? "#c9431f" : "#e8662a";
                else if (k > 0.86) col = "#c2361c";
                else if (d < 0.32 && k < 0.55) col = "#fff2c4";
                else if (d < 0.6 && k < 0.72) col = "#ffd25a";
                else if (d < 0.86) col = "#f7902e";
                else col = "#e2512a";
                ctx.fillStyle = col;
                ctx.fillRect(x, this.baseY - yy, 1, 1);
            }
        }
    }
    draw(ctx) {
        for (const tg of this.tongues) if (tg.back) this.tongue(ctx, tg, this.t);
        for (const tg of this.tongues) if (!tg.back) this.tongue(ctx, tg, this.t);
        for (const b of this.bits) {
            const k = b.life / b.max;
            ctx.fillStyle = k < 0.4 ? "#ffd25a" : k < 0.7 ? "#f7902e" : "#c2361c";
            ctx.fillRect(Math.round(b.x), Math.round(b.y), 1, k < 0.5 ? 2 : 1);
        }
        for (const e of this.embers) {
            const k = e.life / e.max;
            ctx.fillStyle = k < 0.4 ? "#ffe98a" : k < 0.75 ? "#f78a2e" : "#a8321c";
            ctx.fillRect(Math.round(e.x), Math.round(e.y), 1, 1);
        }
    }
    glow(ctx, night) {
        if (!night) return;
        const f = 0.92 + 0.08 * noise(this.t * 9);
        glow(ctx, this.cx, this.baseY - 4, 28 * f, [255, 140, 60], 0.75, true);
        glow(ctx, this.cx, this.baseY + 4, 16 * f, [255, 120, 50], 0.35, true);
    }
}

export class Aurora {
    // Three curtains of light at different depths. Each column has a wavy lower edge, a curtain height
    // from noise, and rays: vertical streaks that drift and flicker. Folds, where a curtain turns,
    // burn brighter. Colour runs from a pale mint edge through green and teal to a faint violet top,
    // quantized into dithered levels. Particles stream up the rays and sparkle along the edge.
    constructor(W, top, seed, scale = 1) {
        this.W = W; this.top = top; this.r = rng(seed);
        this.c = makeCanvas(W, top); this.ctx = this.c.getContext("2d"); this.img = this.ctx.createImageData(W, top);
        this.acc = new Float32Array(W * top * 3);
        const s = scale;
        this.curtains = [
            { y: 0.4, amp: 6 * s, len: 22 * s, sp: 0.07, k: 0.016 / s, ray: 0.26 / s, gain: 0.78, hue: 0 },
            { y: 0.29, amp: 4 * s, len: 15 * s, sp: -0.05, k: 0.024 / s, ray: 0.34 / s, gain: 0.5, hue: 1 },
            { y: 0.18, amp: 3 * s, len: 9 * s, sp: 0.04, k: 0.034 / s, ray: 0.42 / s, gain: 0.28, hue: 2 }
        ];
        this.parts = Array.from({ length: Math.round(W * 0.22) }, () => this.spawn(true));
    }
    base(cu, x, t) { return this.top * cu.y + cu.amp * Math.sin(x * cu.k + t * cu.sp * 3) + cu.amp * 0.45 * Math.sin(x * cu.k * 2.7 - t * cu.sp * 5 + cu.hue) + 1.4 * Math.sin(x * 0.09 + t * 0.7); }
    length(cu, x, t) { return cu.len * (0.55 + 0.7 * fbm(x * 0.028 + t * 0.12 + cu.hue * 9)); }
    rays(cu, x, t) {
        const r = fbm(x * cu.ray + t * 0.5 + cu.hue * 5);
        const s = Math.min(1, Math.max(0, (r - 0.3) / 0.45));
        return s * s * (3 - 2 * s) * (0.85 + 0.15 * hash(x * 3.1 + Math.floor(t * 14)));
    }
    spawn(anywhere = false) {
        const cu = this.curtains[this.r() < 0.7 ? 0 : 1];
        return { cu, x: this.r() * this.W, h: anywhere ? this.r() : 0, sp: 0.25 + this.r() * 0.45, life: anywhere ? this.r() * 2 : 0, max: 1.4 + this.r() * 1.6, spark: this.r() < 0.18 };
    }
    color(f) {
        const stops = [[0, [180, 240, 214]], [0.12, [92, 222, 160]], [0.42, [50, 180, 140]], [0.7, [40, 130, 150]], [1, [110, 72, 150]]];
        for (let i = 1; i < stops.length; i++) if (f <= stops[i][0]) {
            const [f0, c0] = stops[i - 1], [f1, c1] = stops[i], k = (f - f0) / (f1 - f0);
            return [c0[0] + (c1[0] - c0[0]) * k, c0[1] + (c1[1] - c0[1]) * k, c0[2] + (c1[2] - c0[2]) * k];
        }
        return stops[stops.length - 1][1];
    }
    update(dt) {
        for (const q of this.parts) {
            q.life += dt;
            q.h += q.sp * dt;
            if (q.life > q.max || q.h > 1) Object.assign(q, this.spawn());
        }
    }
    draw(ctx, t) {
        const { W, top, img, acc } = this;
        acc.fill(0);
        for (const cu of this.curtains) {
            let prev = this.base(cu, -1, t);
            for (let x = 0; x < W; x++) {
                const yb = this.base(cu, x, t), slope = Math.abs(yb - prev); prev = yb;
                const len = this.length(cu, x, t), ray = this.rays(cu, x, t);
                const fold = 0.75 + Math.min(0.9, slope * 1.6), sheet = 0.35 + 0.65 * ray;
                for (let y = Math.max(0, Math.floor(yb - len * 1.15)); y < Math.min(top, Math.ceil(yb + 2)); y++) {
                    const f = (yb - y) / len;
                    let a;
                    if (f < 0) a = Math.max(0, 1 + f * 12);
                    else if (f < 0.07) a = 1;
                    else a = Math.exp(-f * (2.6 - ray * 1.6)) * (0.35 + 0.65 * ray);
                    a *= cu.gain * fold * sheet;
                    if (a <= 0.02) continue;
                    const col = this.color(Math.max(0, Math.min(1, f)) * (cu.hue === 2 ? 0.6 : 1) + (cu.hue === 2 ? 0.4 : 0));
                    const o = (y * W + x) * 3;
                    acc[o] += col[0] * a; acc[o + 1] += col[1] * a; acc[o + 2] += col[2] * a;
                }
            }
        }
        const d = img.data;
        for (let y = 0, o = 0, i = 0; y < top; y++) for (let x = 0; x < W; x++, o += 3, i += 4) {
            const m = Math.max(acc[o], acc[o + 1], acc[o + 2]);
            if (m < 6) { d[i + 3] = 0; continue; }
            const lvl = Math.min(5, Math.floor((m / 255) * 5.5 + BAYER[y & 3][x & 3] / 16));
            if (lvl <= 0) { d[i + 3] = 0; continue; }
            const s = (lvl / 6) * 255 / m;
            d[i] = Math.min(255, acc[o] * s); d[i + 1] = Math.min(255, acc[o + 1] * s); d[i + 2] = Math.min(255, acc[o + 2] * s); d[i + 3] = 255;
        }
        this.ctx.putImageData(img, 0, 0);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 0.8;
        ctx.drawImage(this.c, 0, 0);
        ctx.globalAlpha = 1;
        for (const q of this.parts) {
            const yb = this.base(q.cu, q.x, t), len = this.length(q.cu, q.x, t), ray = this.rays(q.cu, q.x, t);
            if (ray < 0.25) continue;
            const fade = Math.sin(Math.PI * Math.min(1, q.life / q.max)) * (1 - q.h * 0.7) * ray;
            if (q.spark) {
                ctx.fillStyle = `rgba(235,255,240,${0.6 * (0.5 + 0.5 * Math.sin(t * 9 + q.x)) * fade + 0.2})`;
                ctx.fillRect(Math.round(q.x), Math.round(yb - 1), 1, 1);
            } else {
                const [r, g, b] = this.color(q.h * 0.8);
                ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${Math.min(0.7, fade * 0.8)})`;
                ctx.fillRect(Math.round(q.x), Math.round(yb - q.h * len * (0.6 + ray * 0.6)), 1, 2);
            }
        }
        ctx.restore();
    }
    wash(ctx, ground, H) {                     // the aurora lights the snow a little
        const g = ctx.createLinearGradient(0, ground, 0, H);
        g.addColorStop(0, "rgba(70,220,150,0.07)");
        g.addColorStop(1, "rgba(70,220,150,0)");
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = g;
        ctx.fillRect(0, ground, this.W, H - ground);
        ctx.restore();
    }
}

export class Sparkles {
    constructor(W, H, seed, count = 26) {
        this.W = W; this.H = H; this.r = rng(seed);
        this.p = Array.from({ length: count }, () => this.spawn(true));
    }
    spawn(any = false) {
        const cols = ["#ffe48a", "#ffffff", "#9fe0ff", "#ffb3c7", "#a8f5c0"];
        return { x: this.r() * this.W, y: this.H * (0.15 + this.r() * 0.55), life: any ? this.r() * 1.6 : 0, max: 0.9 + this.r() * 1.2, c: cols[Math.floor(this.r() * cols.length)] };
    }
    update(dt) { for (const s of this.p) { s.life += dt; s.y -= 6 * dt; if (s.life > s.max) Object.assign(s, this.spawn()); } }
    draw(ctx) {
        for (const s of this.p) {
            const k = s.life / s.max, x = Math.round(s.x), y = Math.round(s.y);
            ctx.fillStyle = s.c;
            ctx.globalAlpha = k < 0.15 ? k / 0.15 : 1 - Math.max(0, k - 0.6) / 0.4;
            ctx.fillRect(x, y, 1, 1);
            if (k > 0.2 && k < 0.7) { ctx.fillRect(x - 1, y, 1, 1); ctx.fillRect(x + 1, y, 1, 1); ctx.fillRect(x, y - 1, 1, 1); ctx.fillRect(x, y + 1, 1, 1); }
            if (k > 0.35 && k < 0.55) { ctx.fillRect(x - 2, y, 1, 1); ctx.fillRect(x + 2, y, 1, 1); ctx.fillRect(x, y - 2, 1, 1); ctx.fillRect(x, y + 2, 1, 1); }
        }
        ctx.globalAlpha = 1;
    }
}

export class Stars {
    constructor(W, top, seed) {
        const r = rng(seed);
        this.s = Array.from({ length: Math.round(W / 5) }, () => ({ x: Math.floor(r() * W), y: Math.floor(r() * top * 0.75), b: r(), ph: r() * 6.28, sp: 1 + r() * 3 }));
        this.shoot = null; this.next = 3 + r() * 5; this.r = r; this.W = W; this.top = top;
    }
    draw(ctx, t, dt) {
        for (const s of this.s) {
            ctx.fillStyle = `rgba(255,255,255,${(0.35 + s.b * 0.65) * (0.55 + 0.45 * Math.sin(t * s.sp + s.ph))})`;
            ctx.fillRect(s.x, s.y, s.b > 0.85 ? 2 : 1, s.b > 0.85 ? 2 : 1);
        }
        this.next -= dt;
        if (!this.shoot && this.next <= 0) { this.shoot = { x: this.r() * this.W * 0.7, y: this.r() * this.top * 0.3, life: 0 }; this.next = 5 + this.r() * 7; }
        if (this.shoot) {
            const s = this.shoot;
            s.life += dt;
            const k = s.life / 0.7;
            for (let i = 0; i < 9; i++) { ctx.fillStyle = `rgba(255,255,255,${(1 - i / 9) * (1 - k)})`; ctx.fillRect(Math.round(s.x + s.life * 140 - i * 2), Math.round(s.y + s.life * 50 - i * 0.7), 1, 1); }
            if (k >= 1) this.shoot = null;
        }
    }
}

// ---------------------------------------------------------------- creatures
export class Hare {
    // hops along a lane facing the way it goes; sits, blinks, twitches an ear and sniffs between hops
    constructor(x0, x1, bottom, seed) { this.x = x0 + 4; this.x0 = x0; this.x1 = x1; this.bottom = bottom; this.dir = 1; this.r = rng(seed); this.mode = "sit"; this.timer = 1.2; this.f = 0; this.k = 0; this.acc = 0; this.hops = 0; }
    update(dt) {
        this.timer -= dt;
        if (this.mode === "sit") {
            this.f = this.timer % 2.4 < 0.25 ? 8 : this.timer % 3.1 < 0.35 ? 9 : this.timer % 1.9 < 0.12 ? 7 : 0;
            if (this.timer <= 0) { this.mode = "hop"; this.k = 0; this.acc = 0; this.hops = 2 + Math.floor(this.r() * 4); }
            return;
        }
        const SEQ = [1, 2, 3, 4, 5, 6], DX = [0, 2, 4, 4, 2, 0], T = [0.09, 0.07, 0.08, 0.08, 0.07, 0.09];
        this.acc += dt;
        while (this.acc > T[this.k]) {
            this.acc -= T[this.k];
            this.x += DX[this.k] * this.dir;
            this.k++;
            if (this.k >= SEQ.length) {
                this.k = 0; this.hops--;
                if (this.x > this.x1) this.dir = -1;
                if (this.x < this.x0) this.dir = 1;
                if (this.hops <= 0) { this.mode = "sit"; this.timer = 1.5 + this.r() * 2.5; break; }
            }
        }
        this.f = this.mode === "hop" ? SEQ[this.k] : 0;
    }
    draw(ctx, night) {
        const air = [0, 0, 2, 5, 4, 1, 0, 0, 0, 0][this.f] || 0;
        shadow(ctx, this.x + 12, this.bottom - 1, 18 - air * 1.2, 6, night);
        draw(ctx, "hare", this.f, this.x, this.bottom, this.dir < 0, night);
    }
}

export class Looper {
    // plays poses on a schedule: [frame, seconds] pairs, where seconds may be a {min, max} range
    constructor(name, x, bottom, script, { flip = false, seed = "l", noShadow = false } = {}) {
        Object.assign(this, { name, x, bottom, flip, noShadow });
        this.script = script.map(([f, d]) => [f, typeof d === "object" ? { ...d } : d]);
        this.r = rng(seed); this.i = Math.floor(this.r() * script.length); this.t = 0;
    }
    update(dt) {
        this.t += dt;
        let dur = this.script[this.i][1];
        if (typeof dur === "object") dur = dur.v ??= dur.min + this.r() * (dur.max - dur.min);
        if (this.t >= dur) {
            this.t = 0;
            const d = this.script[this.i][1];
            if (typeof d === "object") d.v = undefined;
            this.i = (this.i + 1) % this.script.length;
        }
    }
    draw(ctx, night) { draw(ctx, this.name, this.script[this.i][0], this.x, this.bottom, this.flip, night); }
}
const R = (min, max) => ({ min, max });
export const OWL = [[0, R(2.5, 5)], [1, 0.06], [2, 0.12], [1, 0.06], [0, R(1.5, 3)], [3, 1.1], [0, 0.4], [4, 1.1], [0, R(2, 4)], [5, 0.5], [0, 0.6]];
export const DEER = [[0, 0.9], [1, 0.9], [0, 0.9], [4, 0.25], [0, 0.9], [1, 0.9], [2, 0.5], [3, 0.4], [2, 0.4], [3, 0.4], [2, 0.6], [3, 0.4], [0, 0.6], [5, 0.3], [0, R(1, 2.5)]];
export const FINCH = [[0, R(0.8, 2)], [1, 0.18], [0, 0.25], [1, 0.18], [0, 0.6], [3, 0.3], [0, R(0.6, 1.6)], [2, 0.15]];
export const TWINKLE = [[0, 0.5], [1, 0.5], [2, 0.5]];
export const WAVE = [0, 1, 2, 3, 4, 5].map((f) => [f, 0.11]);

// ---------------------------------------------------------------- scenes
// A scene is built for its canvas size: x positions are fractions of the width, bottoms are measured
// from the ground line, so the same scene works as a narrow card or a wide strip.
const at = (name, fx, below, opts = {}) => ({ name, fx, below, ...opts });
const BUILDERS = {
    python: (W) => ({
        props: [at("pine_s", 0.04, 4), at("pine_s2", 0.2, 3), at("pine_s", 0.78, 4), at("pine_s2", 0.96, 3),
            at("pine", 0.1, 16), at("birch", 0.32, 12, { flip: true, min: 200 }), at("pine_b", 0.88, 15),
            at("stump", 0.44, 22), at("rock_s", 0.95, 26), at("log", 0.22, 26, { min: 240 }),
            at("campfire_base", 0.68, 24, { noShadow: true })],
        actors: [["owl", 0.44 + 3 / W, 10, OWL, { noShadow: true, on: "stump" }], ["hare", 0.04, 0.6]],
        fire: 0.68, smoke: [[0.68, -4, 0.4]]
    }),
    html: () => ({
        props: [at("pine_s", 0.02, 3), at("pine_s2", 0.42, 2), at("pine_s", 0.97, 3),
            at("cabin_red", 0.17, 13), at("cabin_blue", 0.66, 15), at("lamppost", 0.42, 21), at("snowman", 0.9, 27, { min: 220 }),
            at("fence", 0.84, 18, { min: 200 }), at("sled", 0.12, 26, { min: 180 })],
        actors: [["reindeer", 0.88, 30, DEER, { flip: true }]],
        chimneys: [[0.17, 9], [0.66, 9]],
        lights: [[0.42, -16, 10]]
    }),
    css: () => ({
        props: [at("pine_s", 0.03, 3), at("pine_s2", 0.97, 3),
            at("greenhouse", 0.5, 12), at("holly", 0.2, 20), at("camellia", 0.8, 21), at("birdhouse", 0.08, 22),
            at("pansies_blue", 0.34, 27), at("pansies_yellow", 0.62, 28), at("pansies_pink", 0.48, 29, { min: 200 })],
        actors: [["light_tree", 0.92, 16, TWINKLE], ["bullfinch", 0.08, -8, FINCH, { noShadow: true, perch: true }], ["bullfinch", 0.72, 30, FINCH, { flip: true }]],
        lights: [[0.5, -12, 18, [255, 225, 160]], [0.92, -12, 10, [140, 200, 255]]]
    }),
    cabin: () => ({
        props: [at("pine_s", 0.06, 3), at("pine_s2", 0.95, 3), at("pine", 0.88, 18),
            at("cabin_green", 0.36, 16), at("mailbox", 0.6, 22), at("campfire_base", 0.74, 26, { noShadow: true }), at("rock_s", 0.1, 24)],
        actors: [["hare", 0.02, 0.45]],
        fire: 0.74, chimneys: [[0.36, 9]], smoke: [[0.74, -4, 0.4]]
    }),
    map: () => ({ props: [at("pine_s", 0.05, 4), at("pine_s2", 0.24, 3), at("pine", 0.64, 6), at("pine_s", 0.95, 4), at("birch", 0.82, 8, { min: 200 })], trail: true }),
    stage: () => ({ props: [], stage: true }),
    // the end of a lesson: the snowman is built, every flag is green, sparkles in the air
    celebrate: () => ({
        props: [at("pine_s", 0.04, 3), at("pine_s2", 0.96, 3), at("pine", 0.12, 14), at("pine_b", 0.9, 15),
            at("snowman", 0.74, 24)],
        actors: [["hare", 0.04, 0.7], ["flag_done", 0.5, 12, WAVE, { seed: "a" }], ["flag_done", 0.58, 10, WAVE, { seed: "b" }],
            ["flag_done", 0.86, 12, WAVE, { seed: "c" }]],
        sparkles: true
    })
};

export class Scene {
    constructor(canvas, kind, isNight) {
        this.el = canvas; this.kind = kind; this.isNight = isNight; this.t = 0;
        this.ctx = canvas.getContext("2d");
    }
    layout(W, H) {
        this.W = W; this.H = H;
        this.el.width = W; this.el.height = H;
        const def = (BUILDERS[this.kind] ?? BUILDERS.python)(W, H);
        const top = this.top = Math.round(H * 0.6);
        const seed = `${this.kind}-${W}`;
        this.night = this.isNight();
        this.pal = this.night ? PAL.night : PAL.day;
        this.land = land(W, H, top, seed, this.pal);
        this.snow = new Snow(W, H, seed, Math.round(W * H / 500), Math.round(W * H / 800));
        this.stars = new Stars(W, top, seed);
        this.aurora = new Aurora(W, top, seed, Math.min(1, top / 80));
        this.clouds = [[0.15, 0.16, 0.8], [0.6, 0.06, 0.6]].map(([x, y, s]) => ({ x: x * W, y: y * top, s }));
        const X = (fx, name) => Math.round(fx * W - (ART[name]?.w ?? 0) / 2);
        const B = (below) => (below < 1 && below > 0 ? Math.round(top + (H - top) * below) : top + below);
        this.props = (def.props || []).filter((p) => !p.min || W >= p.min).map((p) => ({ ...p, x: X(p.fx, p.name), bottom: Math.min(H - 1, B(p.below)) }));
        const stump = this.props.find((p) => p.name === "stump"), house = this.props.find((p) => p.name === "birdhouse");
        this.actors = (def.actors || []).map(([name, fx, below, script, opts = {}]) => {
            if (name === "hare") return new Hare(Math.round(fx * W), W - 30, Math.round(H - 2 - (H - top) * (0.15 - below * 0.1)), seed + "hare");
            let bottom = B(below);
            if (opts.on === "stump" && stump) bottom = stump.bottom - ART.stump.h + 2;
            if (opts.perch && house) bottom = house.bottom - ART.birdhouse.h + 9;
            return new Looper(name, X(fx, name), Math.min(H - 1, bottom), script, { ...opts, seed: seed + name + fx });
        });
        this.fx = [];
        for (const [fx, dy, rate] of def.smoke || []) this.fx.push(new Smoke(Math.round(fx * W), this.fireY(def) + dy - 14, seed + "smoke" + fx, rate));
        for (const [fx, dy] of def.chimneys || []) {
            const cab = this.props.find((p) => p.name.startsWith("cabin") && Math.abs(p.fx - fx) < 0.01);
            if (cab) this.fx.push(new Smoke(cab.x + 27, cab.bottom - ART.cabin_red.h + 4, seed + "chim" + fx));
        }
        if (def.fire) {
            const base = this.props.find((p) => p.name === "campfire_base");
            if (base) this.fx.push(new Fire(base.x + 12, base.bottom - 6, seed + "fire"));
        }
        this.lights = (def.lights || []).map(([fx, dy, r, c]) => ({ x: Math.round(fx * W), y: top + dy, r, c }));
        for (const p of this.props) if (p.name.startsWith("cabin")) {
            const y = p.bottom - 13;
            this.lights.push({ x: p.x + 10, y, r: 7, n: 0.3 }, { x: p.x + 27, y, r: 7, n: 0.3 });
        }
        for (const p of this.props) if (p.name === "lamppost") this.lights.push({ x: p.x + 7, y: p.bottom - ART.lamppost.h + 6, r: 11 });
        this.trail = def.trail; this.stageDemo = def.stage ? new StageDemo(W, H, top) : null;
        this.sparkles = def.sparkles ? new Sparkles(W, H, seed) : null;
    }
    fireY() { const b = this.props.find((p) => p.name === "campfire_base"); return b ? b.bottom - 6 : this.top; }
    update(dt) {
        this.t += dt;
        this.snow.update(dt, this.t);
        if (this.night) this.aurora.update(dt);
        for (const a of this.actors) a.update(dt);
        for (const f of this.fx) f.update(dt, this.t);
        for (const c of this.clouds) { c.x += dt * 1.6 * c.s; if (c.x > this.W + 10) c.x = -40; }
        this.stageDemo?.update(dt);
        this.sparkles?.update(dt);
    }
    render(dt = 0) {
        const { ctx, W, H, top, t, night, pal } = this;
        skyBands(ctx, W, top, pal.bands);
        if (night) { this.stars.draw(ctx, t, dt); this.aurora.draw(ctx, t); }
        sun(ctx, Math.round(W * 0.82), Math.round(top * 0.28), Math.max(4, Math.round(top / 10)), pal, night);
        for (const c of this.clouds) cloud(ctx, c.x, c.y, c.s, pal);
        ctx.drawImage(this.land, 0, 0);
        if (night) this.aurora.wash(ctx, top, H);
        this.snow.draw(ctx, false, night);
        if (this.trail) this.drawTrail(ctx);
        const items = [...this.props.map((p) => ({ bottom: p.bottom, p, draw: () => draw(ctx, p.name, 0, p.x, p.bottom, p.flip, night) })),
            ...this.actors.map((a) => ({ bottom: a.bottom, a, draw: () => a.draw(ctx, night) }))];
        for (const it of items) {
            const s = it.p ?? (it.a instanceof Looper ? it.a : null);
            if (s && !s.noShadow) shadow(ctx, s.x + ART[s.name].w / 2, s.bottom - 1, ART[s.name].w * 0.85, ART[s.name].h, night);
        }
        items.sort((a, b) => a.bottom - b.bottom).forEach((it) => it.draw());
        this.stageDemo?.draw(ctx, night);
        for (const f of this.fx) f.draw(ctx, night);
        for (const l of this.lights) {
            const flick = 0.9 + 0.1 * noise(t * 6 + l.x);
            glow(ctx, l.x, l.y, l.r * flick, l.c ?? [255, 205, 110], (night ? l.n ?? 0.5 : 0) * flick, night);
        }
        for (const f of this.fx) f.glow?.(ctx, night);
        this.sparkles?.draw(ctx);
        this.snow.draw(ctx, true, night);
    }
    drawTrail(ctx) {
        // a winding trail of lesson stones: done, current (pulsing gold) and the ones still to come
        const { W, H, top, t } = this;
        const pts = [[0.1, 0.78], [0.3, 0.45], [0.5, 0.72], [0.7, 0.4], [0.9, 0.66]].map(([x, y]) => [Math.round(W * x), Math.round(top + (H - top) * y)]);
        ctx.fillStyle = this.pal.snow[3];
        for (let i = 1; i < pts.length; i++) for (let k = 0; k <= 12; k++) {
            const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
            if (k % 3 === 2) continue;
            ctx.fillRect(Math.round(x0 + (x1 - x0) * k / 12) - 1, Math.round(y0 + (y1 - y0) * k / 12), 2, 1);
        }
        pts.forEach(([x, y], i) => {
            const col = i < 2 ? ["#3a63c9", "#6a8fe0", "#1d2f6e"] : i === 2 ? ["#f2b33d", "#ffe48a", "#a8721a"] : ["#dbe6f3", "#ffffff", "#8a9bbd"];
            const r = i === 2 ? 4 + (Math.sin(t * 4) > 0.6 ? 1 : 0) : 4;
            for (let dy = -r - 1; dy <= r + 1; dy++) for (let dx = -r - 1; dx <= r + 1; dx++) {
                const d = Math.hypot(dx + 0.5, (dy + 0.5) * 1.3);
                if (d > r + 0.6) continue;
                ctx.fillStyle = d > r - 0.4 ? "#1d2340" : dx + dy < -2 ? col[1] : dx + dy > 2 ? col[2] : col[0];
                ctx.fillRect(x + dx, y + dy, 1, 1);
            }
        });
    }
}

// ---------------------------------------------------------------- the snowball stage (demo loop)
// Flags along a trail; the snowball rolls flag to flag, growing with each right answer; the snowman's
// parts drop into place; then it starts over. Used on the home page and in the welcome tour.
class StageDemo {
    constructor(W, H, top) {
        this.W = W; this.H = H; this.y = Math.min(H - 6, top + Math.round((H - top) * 0.62));
        this.n = Math.max(3, Math.min(6, Math.floor((W - 60) / 24)));
        this.script = [true, true, false, true, true, true].slice(0, this.n);
        this.reset();
    }
    reset() { this.results = []; this.ball = this.flagX(0) - 14; this.target = this.ball; this.dist = 0; this.shake = 0; this.wait = 1.2; this.drops = []; this.end = 0; }
    flagX(i) { return Math.round(this.W * 0.06 + i * (this.W * 0.7) / (this.n - 1)); }
    right() { return this.results.filter(Boolean).length; }
    parts() { const r = this.right(); return this.results.length >= this.n ? 3 : r >= 4 ? 2 : r >= 2 ? 1 : 0; }
    ballSize() { return [10, 12, 14, 16, 18, 20][Math.min(5, this.right())]; }
    update(dt) {
        const d = this.target - this.ball;
        if (Math.abs(d) > 0.2) { const step = Math.sign(d) * Math.min(Math.abs(d), 50 * dt); this.ball += step; this.dist += step; }
        this.shake = Math.max(0, this.shake - dt);
        for (const dr of this.drops) dr.t += dt;
        if (this.results.length >= this.n) { this.end += dt; if (this.end > 3) this.reset(); return; }
        this.wait -= dt;
        if (this.wait <= 0) {
            const before = this.parts(), ok = this.script[this.results.length];
            this.results.push(ok);
            if (ok) this.target = this.results.length < this.n ? this.flagX(this.results.length) - this.ballSize() - 2 : this.W - 46;
            else this.shake = 0.45;
            for (let p = before; p < this.parts(); p++) this.drops.push({ part: p, t: 0 });
            this.wait = 1.3;
        }
    }
    draw(ctx, night) {
        const { y } = this;
        ctx.fillStyle = night ? "#8596c2" : "#c9d7ea";
        ctx.fillRect(Math.round(this.W * 0.03), y - 1, Math.round(this.W * 0.94), 3);
        const done = this.results.length, t = performance.now() / 1000;
        for (let i = 0; i < this.n; i++) {
            const st = i < done ? (this.results[i] ? "flag_done" : "flag_miss") : i === done ? "flag_now" : "flag_next";
            draw(ctx, st, Math.floor(t * 9 + i * 1.7) % 6, this.flagX(i), y, false, night);
        }
        drawSnowman(ctx, this.W - 30, y + 2, this.parts(), this.drops, night);
        if (!(done >= this.n && Math.abs(this.target - this.ball) < 0.5)) {
            const s = this.ballSize(), f = ((Math.floor(this.dist / (s / 2) / (Math.PI / 4)) % 8) + 8) % 8;
            const j = this.shake > 0 ? (Math.floor(this.shake * 30) % 2 ? 1 : -1) : 0;
            draw(ctx, `ball${s}`, f, this.ball + j, y + 1, false, night);
        }
    }
}

// The snowman at the end of the trail: dotted ghosts for parts still to build, real parts drop in with a bounce.
export function drawSnowman(ctx, x, bottom, have, drops, night) {
    const spots = [["sm_base", x, bottom], ["sm_mid", x + 2.5, bottom - 14], ["sm_head", x + 4, bottom - 25]];
    spots.forEach(([name, sx, b], i) => {
        const s = ART[name], drop = drops.find((dr) => dr.part === i);
        if (i >= have) {
            ctx.fillStyle = night ? "rgba(160,180,230,0.45)" : "rgba(110,140,195,0.45)";
            for (let yy = 0; yy < s.h; yy++) for (let xx = 0; xx < s.w; xx++) {
                const nx = (xx + 0.5 - s.w / 2) / (s.w / 2 - 0.5), ny = (yy + 0.5 - s.h / 2) / (s.h / 2 - 0.5), dd = nx * nx + ny * ny;
                if (dd < 1 && dd > 0.7 && (xx + yy) % 3 === 0) ctx.fillRect(Math.round(sx) + xx, Math.round(b - s.h) + yy, 1, 1);
            }
            return;
        }
        let off = 0;
        if (drop && drop.t < 0.55) { const k = drop.t / 0.55; off = k < 0.7 ? -30 * (1 - k / 0.7) ** 2 : -3 * Math.sin((k - 0.7) / 0.3 * Math.PI); }
        draw(ctx, name, 0, sx, b + Math.round(off), false, night);
    });
}

// ---------------------------------------------------------------- one loop for everything animated
// Pixel art reads best at a steady 30 frames a second. Only things on screen are drawn; with reduced
// motion (or the page hidden) nothing ticks and each piece shows a single still frame.
const items = new Set();
const visible = new WeakSet();
const io = typeof IntersectionObserver === "function" ? new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) visible.add(e.target); else visible.delete(e.target);
})) : null;
let running = false, last = 0, acc = 0;
export const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export function animate(item) {
    // item: { el, update(dt), render(dt) }
    items.add(item);
    io?.observe(item.el);
    item.render(0);
    if (!running) { running = true; last = performance.now(); requestAnimationFrame(loop); }
    return () => { items.delete(item); io?.unobserve(item.el); };
}
function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    acc += dt;
    if (acc >= 1 / 30 && !document.hidden && !reduced()) {
        const step = acc;
        acc = 0;
        for (const it of items) {
            if (!it.el.isConnected) { items.delete(it); continue; }
            if (io && !visible.has(it.el)) continue;
            it.update(step);
            it.render(step);
        }
    }
    if (items.size) requestAnimationFrame(loop); else running = false;
}
