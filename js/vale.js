// O Vale do Bit: the pixel scenery outside Bit's workshop.
// Draws the sky, snow drifts and snow caps on the auth pages, the landscape behind the map,
// and the snowball stage at the top of a lesson. Purely decorative: no other script depends on it,
// and it only reads the DOM the page scripts render.
import { SPRITES } from "./vale-sprites.js";

const root = document.documentElement;
const night = () => root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const css = (el, name) => getComputedStyle(el).getPropertyValue(name).trim();
const q = (n, u) => Math.round(n / u) * u;
const rect = (x, y, w, h, f) => `<rect x="${Math.round(x)}" y="${Math.round(y)}" width="${Math.max(0, Math.round(w))}" height="${Math.max(0, Math.round(h))}" fill="${f}"/>`;

function sprite(name, x, y, px, flip = false) {
    const s = SPRITES[name];
    const w = s.w * px, h = s.h * px;
    const art = night() ? s.night : s.day;
    const inner = flip ? `<g transform="translate(${s.w} 0) scale(-1 1)">${art}</g>` : art;
    return `<svg x="${Math.round(x)}" y="${Math.round(y)}" width="${w}" height="${h}" viewBox="0 0 ${s.w} ${s.h}">${inner}</svg>`;
}

// seeded random, so the same unit always gets the same landscape
function rng(seed) {
    let t = 0;
    for (const ch of String(seed)) t = Math.imul(t ^ ch.charCodeAt(0), 2654435761);
    return () => {
        t += 0x6d2b79f5;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

// ---------- sky: sun or moon, mountains with snow caps, clouds, stars, aurora ----------
function disc(cx, cy, r, u, f) {
    let g = "";
    for (let y = -r; y < r; y += u) {
        const w = q(Math.sqrt(Math.max(0, r * r - (y + u / 2) ** 2)), u);
        g += rect(cx - w, cy + y, w * 2, u, f);
    }
    return g;
}
function mountain(cx, base, hw, h, u, fill, shade, cap) {
    let g = "";
    for (let x = -hw; x < hw; x += u) {
        const t = 1 - Math.abs(x + u / 2) / hw, hh = q(t * h, u);
        if (hh <= 0) continue;
        g += rect(cx + x, base - hh, u, hh, x < 0 ? fill : shade);
        const capH = hh - h * 0.62, k = Math.round(x / u);
        if (capH > 0) g += rect(cx + x, base - hh, u, q(capH, u) + [0, u, u * 2, u * 3, u * 2, u, u, 0][((k % 8) + 8) % 8], cap);
    }
    return g;
}
const cloud = (x, y, u, f, s) => rect(x + u * 2, y, u * 5, u, f) + rect(x + u, y + u, u * 8, u, f) + rect(x, y + u * 2, u * 11, u, f) + rect(x, y + u * 3, u * 11, u, s);

function drawSky(svg) {
    const W = svg.clientWidth, H = svg.clientHeight;
    if (!W || !H) return;
    const sky = svg.closest(".sky");
    const ground = parseFloat(css(sky, "--ground")) || 0;
    const narrow = W < 640, short = H < 260, u = narrow || short ? 4 : 6;
    const base = H - ground;
    const at = (name) => css(sky, name);
    const dark = night() || sky.classList.contains("is-aurora");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    let g = "";
    const bands = at("--sky-bands").split(" ").filter(Boolean); // sunset sky: stacked pixel bands
    bands.forEach((c, i) => { g += rect(0, q((i * base) / (bands.length + 1), u), W, base, c); });
    if (dark) {
        const r = rng(sky.dataset.seed || "stars");
        for (let i = 0; i < Math.round(W / 22); i++) {
            const z = r() < 0.25 ? 4 : 2;
            g += rect(r() * W, r() * base * 0.62, z, z, "#ffffff");
        }
    }
    if (sky.classList.contains("is-aurora")) {
        const green = at("--aurora"), pink = at("--aurora-2");
        for (let x = 0; x < W; x += u * 2) {
            const y = base * 0.1 + Math.sin(x / 90) * base * 0.06 + Math.sin(x / 31) * u;
            g += rect(x, q(y, u), u * 2, q(base * 0.07, u), green);
            g += rect(x, q(y + base * 0.07, u), u * 2, u, pink);
        }
    }
    const pos = sky.dataset.sun || (narrow ? "right" : "left");
    const sr = q(short ? 16 : narrow ? 18 : 34, u);
    const sx = pos === "right" ? W * 0.86 : pos === "center" ? W * 0.55 : W * 0.12;
    const sy = sky.dataset.sunY ? base * Number(sky.dataset.sunY) : short ? base * 0.3 : narrow ? Math.min(base * 0.14, 50) : Math.max(base * 0.18, 120);
    g += disc(sx, sy, sr + u * 3, u, at("--sun-ring")) + disc(sx, sy, sr, u, at("--sun"));
    if (dark) g += disc(sx + sr * 0.5, sy - sr * 0.35, q(sr * 0.8, u), u, at("--sky"));
    const mh = short ? base * 0.62 : narrow ? Math.min(base * 0.42, 300) : Math.min(base * 0.5, 380);
    const far = [at("--mtn-far"), at("--mtn-far-sh")], near = [at("--mtn"), at("--mtn-sh")], cap = at("--cap");
    g += mountain(W * 0.16, base + 2, W * 0.2, mh * 0.95, u, ...far, cap);
    g += mountain(W * 0.52, base + 2, W * 0.24, mh * 0.78, u, ...far, cap);
    g += mountain(W * 0.88, base + 2, W * 0.22, mh * 0.9, u, ...far, cap);
    g += mountain(W * 0.34, base + 2, W * 0.17, mh * 0.55, u, ...near, cap);
    g += mountain(W * 0.72, base + 2, W * 0.18, mh * 0.6, u, ...near, cap);
    const cf = at("--cloud"), cs = at("--cloud-sh");
    g += cloud(W * 0.58, base * 0.1, u, cf, cs) + cloud(W * 0.3, base * (short ? 0.12 : 0.24), u * 0.7, cf, cs);
    if (!narrow && !short) g += cloud(W * 0.04, base * 0.42, u * 0.6, cf, cs);
    svg.innerHTML = g;
}

function drawDrifts(svg) {
    const W = svg.clientWidth, H = svg.clientHeight || 28;
    if (!W) return;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const back = css(svg, "--snow-back"), front = css(svg, "--snow");
    let g = "";
    for (let x = 0; x < W; x += 8) {
        const hb = q(H * 0.5 + H * 0.28 * Math.sin(x / 110 + 1.3) + H * 0.18 * Math.sin(x / 41), 4);
        const hf = q(H * 0.32 + H * 0.24 * Math.sin(x / 95) + H * 0.14 * Math.sin(x / 33 + 2), 4);
        g += rect(x, H - hb, 8, hb, back) + rect(x, H - hf, 8, hf + 1, front);
    }
    svg.innerHTML = g;
}

function drawCap(svg) {
    const W = svg.clientWidth;
    if (!W) return;
    svg.setAttribute("viewBox", `0 0 ${W} 22`);
    const ink = css(svg, "--outline"), snow = css(svg, "--snow");
    let g = "";
    for (let x = 0; x < W; x += 6) {
        const h = q(9 + 6 * Math.sin(x / 38 + 0.5) + 3 * Math.sin(x / 13), 3);
        g += rect(x, 22 - h - 3, 6, 3, ink) + rect(x, 22 - h, 6, h, snow);
    }
    svg.innerHTML = g;
}

// ---------- the map: a stretch of valley behind each unit ----------
const BIOMES = {
    python: { big: ["pine", "pine", "pine", "pine_small", "pine_small"], small: ["rock", "lantern", "pine_small", "pine_small", "bunny"] },
    html: { big: ["cabin", "cabin", "pine", "pine_small"], small: ["pine_small", "rock", "snowman", "penguin", "lantern"] },
    css: { big: ["crystal", "crystal_pink", "crystal_blue", "pine_small"], small: ["flower", "flower", "crystal_blue", "bunny"] }
};
const TIMES = ["is-morning", "is-sunset", "is-aurora"];

function boxesIn(unit) {
    const base = unit.getBoundingClientRect();
    const pad = 14;
    return [...unit.querySelectorAll(".unit-banner, .node-circle, .node-label, .node-start, .map-mascot, .node-pop")]
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width)
        .map((r) => ({ x: r.left - base.left - pad, y: r.top - base.top - pad, w: r.width + pad * 2, h: r.height + pad * 2 }));
}
const hits = (a, list) => list.some((b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y);

function drawUnit(unit, i, track) {
    const W = unit.clientWidth, H = unit.clientHeight;
    if (!W || !H) return;
    let layer = unit.querySelector(":scope > .unit-scenery");
    if (!layer) {
        layer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        layer.classList.add("unit-scenery");
        layer.setAttribute("aria-hidden", "true");
        layer.setAttribute("shape-rendering", "crispEdges");
        unit.prepend(layer);
    }
    layer.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const r = rng(`${track}-${i}`);
    const biome = BIOMES[track] ?? BIOMES.python;
    const taken = boxesIn(unit);
    const banner = unit.querySelector(".unit-banner");
    const top = banner ? banner.offsetTop + banner.offsetHeight + 8 : 0;
    const px = W < 560 ? 3 : 4;
    let g = "";

    // ground: soft drift lines and a frozen pond
    const drift = css(unit, "--drift"), ice = css(unit, "--pond"), iceEdge = css(unit, "--pond-edge");
    for (let y = top + 60; y < H; y += 140 + Math.round(r() * 80)) {
        const x0 = Math.round(r() * W * 0.6), len = 120 + Math.round(r() * 220);
        for (let x = x0; x < x0 + len; x += 8) g += rect(x, y + Math.round(Math.sin(x / 40) * 4 / 2) * 2, 8, 4, drift);
    }
    for (let tries = 0; tries < 40; tries++) {
        const w = 120 + Math.round(r() * 60), h = 44, x = Math.round(r() * (W - w)), y = top + Math.round(r() * Math.max(0, H - top - h));
        const box = { x, y, w, h };
        if (hits(box, taken)) continue;
        for (let row = 0; row < h; row += 4) {
            const t = 1 - Math.abs(row + 2 - h / 2) / (h / 2);
            const rw = q(w * Math.sqrt(Math.max(0, t)), 4);
            g += rect(x + (w - rw) / 2 - 4, y + row, rw + 8, 4, iceEdge) + rect(x + (w - rw) / 2, y + row, rw, 4, ice);
        }
        g += rect(x + w * 0.3, y + 12, 20, 4, "#ffffff") + rect(x + w * 0.55, y + 24, 12, 4, "#ffffff");
        taken.push({ x: x - 10, y: y - 10, w: w + 20, h: h + 20 });
        break;
    }

    // props grow in groves, the way trees, houses and crystals do, with a few loners in between
    const tryPut = (name, x, y) => {
        const s = SPRITES[name];
        const w = s.w * px, h = s.h * px;
        x = Math.round(Math.min(Math.max(x - w / 2, 0), W - w));
        y = Math.round(Math.min(Math.max(y - h, top), H - h));
        const box = { x: x - 2, y: y - 2, w: w + 4, h: h + 4 };
        if (hits(box, taken)) return false;
        taken.push(box);
        g += sprite(name, x, y, px, r() < 0.5);
        return true;
    };
    const gauss = () => (r() + r() + r() - 1.5) / 1.5;
    const pickFrom = (list) => list[Math.floor(r() * list.length)];
    const area = (W * (H - top)) / 10000;
    const groves = Math.max(3, Math.round(area * 0.13));
    for (let k = 0, tries = 0; k < groves && tries < 200; tries++) {
        const cx = r() * W, cy = top + 40 + r() * (H - top - 40);
        if (hits({ x: cx - 30, y: cy - 30, w: 60, h: 60 }, taken)) continue;
        k++;
        let left = 4 + Math.floor(r() * 4);
        for (let j = 0; j < 60 && left > 0; j++) if (tryPut(pickFrom(biome.big), cx + gauss() * 90, cy + gauss() * 60)) left--;
        for (let j = 0; j < 4; j++) tryPut(pickFrom(biome.small), cx + gauss() * 110, cy + gauss() * 70);
    }
    for (let j = 0; j < area * 0.3; j++) tryPut(pickFrom(biome.small), r() * W, top + r() * (H - top));
    layer.innerHTML = g;
}

function drawMap() {
    const track = document.body.dataset.track || "python";
    document.querySelectorAll(".unit").forEach((unit, i) => {
        const banner = unit.querySelector(".unit-banner");
        unit.classList.remove(...TIMES);
        unit.classList.add(TIMES[i % TIMES.length]);
        unit.classList.toggle("is-fogged", unit.querySelector(".node:not(.is-locked)") === null);
        if (banner && !banner.querySelector(":scope > .sky")) {
            banner.insertAdjacentHTML("afterbegin", `<div class="sky" aria-hidden="true" data-sun="right" data-sun-y="0.32"><svg class="sky-art" shape-rendering="crispEdges"></svg></div>`);
        }
        const sky = banner?.querySelector(".sky");
        if (sky) sky.className = `sky ${TIMES[i % TIMES.length]}`, sky.dataset.seed = `${track}-${i}`;
        drawUnit(unit, i, track);
    });
}

// ---------- the lesson: roll a snowball along the trail, build a snowman ----------
function setupStage() {
    const header = document.querySelector(".lesson-header");
    const steps = document.getElementById("steps");
    if (!header || !steps) return;
    header.insertAdjacentHTML("afterbegin", `
        <div class="sky stage-sky" aria-hidden="true" data-sun="center" data-sun-y="0.4"><svg class="sky-art" shape-rendering="crispEdges"></svg></div>
        <svg class="drifts stage-drifts" aria-hidden="true" shape-rendering="crispEdges" preserveAspectRatio="none"></svg>`);
    const goal = document.createElement("div");
    goal.className = "stage-goal";
    goal.setAttribute("aria-hidden", "true");
    goal.innerHTML = `<span class="sm-base"></span><span class="sm-mid"></span><span class="sm-head"></span>`;
    const ball = document.createElement("span");
    ball.className = "snowball";
    ball.setAttribute("aria-hidden", "true");
    steps.after(goal);
    steps.parentElement.append(ball);

    const update = () => {
        const items = [...steps.children];
        if (!items.length) return;
        const done = items.filter((li) => li.classList.contains("is-done")).length;
        const current = items.find((li) => li.classList.contains("is-current"));
        const total = items.length;
        const share = done / total;
        goal.dataset.parts = String(share >= 1 ? 3 : share >= 0.6 ? 2 : share >= 0.25 ? 1 : 0);
        const anchor = current ?? (share >= 1 ? goal : items[0]);
        const box = anchor.getBoundingClientRect(), host = steps.parentElement.getBoundingClientRect();
        const size = Math.round(28 + 22 * share);
        ball.style.setProperty("--size", `${size}px`);
        ball.style.setProperty("--x", `${box.left - host.left + box.width / 2 - size / 2}px`);
        ball.style.setProperty("--spin", `${done * 120}deg`);
        ball.hidden = share >= 1;
    };
    new MutationObserver(update).observe(steps, { childList: true, subtree: true, attributes: true });
    new ResizeObserver(update).observe(steps);
    update();
}

// ---------- auth pages: the chalkboard on the easel shows lesson 1 of each track ----------
function setupBoards() {
    document.querySelectorAll("[data-board-tabs]").forEach((board) => {
        const tabs = [...board.querySelectorAll(".board-tab")];
        const panel = board.querySelector("[role=tabpanel]");
        const pick = (i, focus) => {
            tabs.forEach((t, j) => { t.setAttribute("aria-selected", String(j === i)); t.tabIndex = j === i ? 0 : -1; });
            const tpl = board.querySelector(`template[data-for="${tabs[i].id}"]`);
            if (tpl) panel.replaceChildren(tpl.content.cloneNode(true));
            panel.setAttribute("aria-labelledby", tabs[i].id);
            if (focus) tabs[i].focus();
        };
        tabs.forEach((t, i) => t.addEventListener("click", () => pick(i)));
        board.querySelector(".board-tabs").addEventListener("keydown", (e) => {
            const i = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
            if (e.key === "ArrowRight") { e.preventDefault(); pick((i + 1) % tabs.length, true); }
            if (e.key === "ArrowLeft") { e.preventDefault(); pick((i + tabs.length - 1) % tabs.length, true); }
        });
    });
}

// ---------- wiring ----------
function drawAll() {
    document.querySelectorAll(".sky-art").forEach(drawSky);
    document.querySelectorAll(".drifts").forEach(drawDrifts);
    document.querySelectorAll(".snowcap").forEach(drawCap);
    if (document.querySelector(".map")) drawMap();
}

let frame = 0;
const soon = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(drawAll); };

if (document.querySelector(".lesson")) setupStage();
setupBoards();
const resize = new ResizeObserver(soon);
resize.observe(document.body);
new MutationObserver(soon).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", soon);
const units = document.getElementById("units");
if (units) {
    // the map script re-renders the units when the student picks another track or opens a lesson card
    new MutationObserver((records) => {
        const ours = (n) => n.nodeType !== 1 || n.closest?.("svg, .sky") || n.matches?.(".unit-scenery, .sky");
        if (records.some((r) => !r.target.closest?.("svg, .sky") && [...r.addedNodes, ...r.removedNodes].some((n) => !ours(n)))) soon();
    }).observe(units, { childList: true, subtree: true });
}
document.fonts?.ready.then(soon);
soon();
