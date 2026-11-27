// O Vale do Bit: the pixel scenery outside Bit's workshop.
// Draws the skies (with live stars and aurora at night), the snow drifts and caps on the auth pages,
// the valley behind each unit on the map, the little scenes on the home page, welcome tour and style
// guide, and the snowball stage at the top of a lesson. Purely decorative: no other script depends on
// it, and it only reads the DOM the page scripts render.
import { ART } from "./vale-art.js";
import { Aurora, Scene, Stars, animate, cloud, drawSnowman, draw, land, rng, shadow, skyBands, sun } from "./vale-engine.js";

const root = document.documentElement;
const night = () => root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
const css = (el, name) => getComputedStyle(el).getPropertyValue(name).trim();
const q = (n, u) => Math.round(n / u) * u;
const rect = (x, y, w, h, f) => `<rect x="${Math.round(x)}" y="${Math.round(y)}" width="${Math.max(0, Math.round(w))}" height="${Math.max(0, Math.round(h))}" fill="${f}"/>`;
const hex = (h) => { const v = h.replace("#", ""); return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16)); };
const mix = (a, b, k) => { const [x, y] = [hex(a), hex(b)]; return `#${x.map((v, i) => Math.round(v + (y[i] - v) * k).toString(16).padStart(2, "0")).join("")}`; };

// ---------- skies: bands, sun or moon, mountains with gullies, clouds; stars and aurora at night ----------
// Each sky is a small canvas (one art pixel per 4 or 6 screen pixels) coloured from the CSS custom
// properties of its .sky element, so the time-of-day classes and the dark theme keep working.
const skies = new WeakMap();

function skyPalette(sky, dark) {
    const at = (n) => css(sky, n);
    const base = at("--sky") || "#8fcff0";
    const extra = at("--sky-bands").split(" ").filter(Boolean);
    // without explicit bands, a gentle gradient in six steps: deeper overhead, paler toward the mountains
    const zenith = dark ? mix(base, "#000000", 0.28) : mix(base, "#3f8fd6", 0.2);
    const horizon = dark ? mix(base, at("--mtn-far") || "#2d3b78", 0.22) : mix(base, "#ffffff", 0.2);
    const bands = extra.length ? [base, ...extra] : [0, 1, 2, 3, 4, 5].map((i) => mix(zenith, horizon, i / 5));
    const far = [at("--mtn-far"), at("--mtn-far-sh")], near = [at("--mtn"), at("--mtn-sh")], cap = at("--cap");
    return {
        bands, far, near, cap, capSh: mix(cap, far[1], 0.35), tree: [mix(near[1], "#1d2340", 0.25), mix(near[1], "#1d2340", 0.4)],
        sun: at("--sun"), ring: at("--sun-ring"), cloud: [at("--cloud"), at("--cloud"), at("--cloud-sh")]
    };
}

function drawSky(el) {
    const W = el.clientWidth, H = el.clientHeight;
    const sky = el.closest(".sky");
    if (!W || !H || !sky) return;
    const ground = parseFloat(css(sky, "--ground")) || 0;
    const narrow = W < 640, short = H < 260, u = narrow || short ? 4 : 6;
    const w = Math.ceil(W / u), h = Math.ceil(H / u), top = Math.round((H - ground) / u);
    const aurora = sky.classList.contains("is-aurora");
    const dark = night() || aurora;
    const seed = sky.dataset.seed || "sky";
    const pal = skyPalette(sky, dark);
    el.width = w;
    el.height = h;
    const ctx = el.getContext("2d");
    const pos = sky.dataset.sun || (narrow ? "right" : "left");
    const sr = Math.max(4, Math.round((short ? 16 : narrow ? 18 : 34) / u));
    const sx = Math.round((pos === "right" ? 0.86 : pos === "center" ? 0.55 : 0.12) * w);
    const sy = Math.round(sky.dataset.sunY ? top * Number(sky.dataset.sunY) : short ? top * 0.3 : narrow ? Math.min(top * 0.14, 50 / u) : Math.max(top * 0.18, 120 / u));
    const mh = short ? 0.62 : narrow ? Math.min(0.42, 300 / Math.max(1, H - ground)) : Math.min(0.5, 380 / Math.max(1, H - ground));
    const state = {
        el, t: 0,
        hills: land(w, h, top, seed, { ...pal, snow: [] }, { ground: false, height: mh * 1.1 }),
        stars: dark ? new Stars(w, top, seed) : null,
        aurora: aurora ? new Aurora(w, top, seed, Math.min(1.4, Math.max(0.6, top / 70))) : null,
        clouds: [[0.58, 0.1, 1], [0.3, short ? 0.12 : 0.24, 0.7], ...(!narrow && !short ? [[0.04, 0.42, 0.6]] : [])].map(([x, y, s]) => ({ x: x * w, y: y * top, s })),
        update(dt) { this.t += dt; this.aurora?.update(dt); for (const c of this.clouds) { c.x += dt * 1.2 * c.s; if (c.x > w + 4) c.x = -34 * c.s; } },
        render(dt = 0) {
            skyBands(ctx, w, top, pal.bands, u < 6);
            if (h > top) { ctx.fillStyle = pal.bands[pal.bands.length - 1]; ctx.fillRect(0, top, w, h - top); }
            this.stars?.draw(ctx, this.t, dt);
            this.aurora?.draw(ctx, this.t);
            sun(ctx, sx, sy, sr, pal, dark);
            if (dark) {                      // the moon: a crescent, the night sky biting into it
                ctx.fillStyle = pal.bands[1] ?? pal.bands[0];
                for (let dy = -sr; dy <= sr; dy++) for (let dx = -sr; dx <= sr; dx++) if (Math.hypot(dx - sr * 0.5, dy + sr * 0.35) <= sr * 0.8 && Math.hypot(dx, dy) <= sr) ctx.fillRect(sx + dx, sy + dy, 1, 1);
            }
            for (const c of this.clouds) cloud(ctx, c.x, c.y, c.s, pal);
            ctx.drawImage(this.hills, 0, 0);
        }
    };
    skies.get(el)?.();
    state.render(0);
    if (dark) skies.set(el, animate(state));
    else skies.delete(el);
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
// The forest for Python, the village for HTML, the winter garden for CSS. Sprites are drawn at 2x on a
// half-resolution canvas, each with a soft shadow, and never on top of the trail, the nodes or the banner.
const BIOMES = {
    python: { big: ["pine", "pine_b", "pine", "pine_s", "pine_s2", "birch"], small: ["rock", "rock_s", "stump", "log", "pine_s2", "hare"] },
    html: { big: ["cabin_red", "cabin_green", "cabin_blue", "pine", "pine_s"], small: ["pine_s2", "lamppost", "snowman", "mailbox", "sled", "fence"] },
    css: { big: ["greenhouse", "light_tree", "holly", "camellia", "pine_s"], small: ["pansies_blue", "pansies_yellow", "pansies_pink", "birdhouse", "holly"] }
};
const TIMES = ["is-morning", "is-sunset", "is-aurora"];
const PX = 2;

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
        layer = document.createElement("canvas");
        layer.className = "unit-scenery";
        layer.setAttribute("aria-hidden", "true");
        unit.prepend(layer);
    }
    const w = Math.ceil(W / PX), h = Math.ceil(H / PX);
    layer.width = w;
    layer.height = h;
    const ctx = layer.getContext("2d");
    const dark = night();
    const r = rng(`${track}-${i}`);
    const biome = BIOMES[track] ?? BIOMES.python;
    const taken = boxesIn(unit);
    const banner = unit.querySelector(".unit-banner");
    const top = banner ? banner.offsetTop + banner.offsetHeight + 8 : 0;

    // ground: soft drift lines and a frozen pond (all in screen pixels, halved when drawn)
    const fill = (x, y, ww, hh, f) => { ctx.fillStyle = f; ctx.fillRect(Math.round(x / PX), Math.round(y / PX), Math.max(1, Math.round(ww / PX)), Math.max(1, Math.round(hh / PX))); };
    const drift = css(unit, "--drift"), ice = css(unit, "--pond"), iceEdge = css(unit, "--pond-edge");
    for (let y = top + 60; y < H; y += 140 + Math.round(r() * 80)) {
        const x0 = Math.round(r() * W * 0.6), len = 120 + Math.round(r() * 220);
        for (let x = x0; x < x0 + len; x += 4) fill(x, y + Math.round(Math.sin(x / 40) * 2) * 2, 4, 4, drift);
    }
    for (let tries = 0; tries < 40; tries++) {
        const pw = 120 + Math.round(r() * 60), ph = 44, x = Math.round(r() * (W - pw)), y = top + Math.round(r() * Math.max(0, H - top - ph));
        const box = { x, y, w: pw, h: ph };
        if (hits(box, taken)) continue;
        for (let row = 0; row < ph; row += 2) {
            const t = 1 - Math.abs(row + 1 - ph / 2) / (ph / 2);
            const rw = q(pw * Math.sqrt(Math.max(0, t)), 2);
            fill(x + (pw - rw) / 2 - 4, y + row, rw + 8, 2, iceEdge);
            fill(x + (pw - rw) / 2, y + row, rw, 2, ice);
        }
        fill(x + pw * 0.3, y + 12, 20, 2, "#ffffff");
        fill(x + pw * 0.55, y + 24, 12, 2, "#ffffff");
        taken.push({ x: x - 10, y: y - 10, w: pw + 20, h: ph + 20 });
        break;
    }

    // props grow in groves, the way trees, houses and gardens do, with a few loners in between
    const placed = [];
    const tryPut = (name, x, y) => {
        const s = ART[name];
        const sw = s.w * PX, sh = s.h * PX;
        x = Math.round(Math.min(Math.max(x - sw / 2, 0), W - sw));
        y = Math.round(Math.min(Math.max(y - sh, top), H - sh));
        const box = { x: x - 2, y: y - 2, w: sw + 4, h: sh + 4 };
        if (hits(box, taken)) return false;
        taken.push(box);
        placed.push({ name, x: Math.round(x / PX), bottom: Math.round((y + sh) / PX), flip: !name.startsWith("cabin") && r() < 0.5 });
        return true;
    };
    const gauss = () => (r() + r() + r() - 1.5) / 1.5;
    const pickFrom = (list) => list[Math.floor(r() * list.length)];
    const area = (W * (H - top)) / 10000;
    const groves = Math.max(3, Math.round(area * 0.12));
    for (let k = 0, tries = 0; k < groves && tries < 200; tries++) {
        const cx = r() * W, cy = top + 40 + r() * (H - top - 40);
        if (hits({ x: cx - 30, y: cy - 30, w: 60, h: 60 }, taken)) continue;
        k++;
        let left = 3 + Math.floor(r() * 4);
        for (let j = 0; j < 60 && left > 0; j++) if (tryPut(pickFrom(biome.big), cx + gauss() * 100, cy + gauss() * 70)) left--;
        for (let j = 0; j < 4; j++) tryPut(pickFrom(biome.small), cx + gauss() * 120, cy + gauss() * 80);
    }
    for (let j = 0; j < area * 0.25; j++) tryPut(pickFrom(biome.small), r() * W, top + r() * (H - top));
    placed.sort((a, b) => a.bottom - b.bottom);
    for (const p of placed) shadow(ctx, p.x + ART[p.name].w / 2, p.bottom - 1, ART[p.name].w * 0.85, ART[p.name].h, dark);
    for (const p of placed) draw(ctx, p.name, 0, p.x, p.bottom, p.flip, dark);
}

function drawMap() {
    const track = document.body.dataset.track || "python";
    document.querySelectorAll(".unit").forEach((unit, i) => {
        const banner = unit.querySelector(".unit-banner");
        unit.classList.remove(...TIMES);
        unit.classList.add(TIMES[i % TIMES.length]);
        unit.classList.toggle("is-fogged", unit.querySelector(".node:not(.is-locked)") === null);
        if (banner && !banner.querySelector(":scope > .sky")) {
            banner.insertAdjacentHTML("afterbegin", `<div class="sky" aria-hidden="true" data-sun="right" data-sun-y="0.32"><canvas class="sky-art"></canvas></div>`);
        }
        const sky = banner?.querySelector(".sky");
        if (sky) sky.className = `sky ${TIMES[i % TIMES.length]}`, sky.dataset.seed = `${track}-${i}`;
        drawUnit(unit, i, track);
    });
    document.querySelectorAll(".unit-banner .sky-art").forEach(drawSky);
}

// ---------- small scenes: the home page places, the welcome tour and the style guide ----------
// Each <canvas class="vale-scene" data-scene="python|html|css|workshop|map|stage"> becomes a live
// strip of valley at 2x: snow falling, smoke rising, creatures going about their day.
const scenes = new WeakMap();
function drawScene(el) {
    const W = el.clientWidth, H = el.clientHeight;
    if (!W || !H) return;
    let s = scenes.get(el);
    if (!s) {
        s = { el, scene: new Scene(el, el.dataset.scene, night), key: "" };
        s.update = (dt) => s.scene.update(dt);
        s.render = (dt) => s.scene.render(dt);
        scenes.set(el, s);
    }
    const key = `${Math.round(W / 2)}x${Math.round(H / 2)}|${night()}`;
    if (key === s.key) return;
    s.key = key;
    s.scene.layout(Math.max(40, Math.round(W / 2)), Math.max(30, Math.round(H / 2)));
    if (!s.live) { s.live = true; animate(s); } else s.render(0);
}

// ---------- the lesson: roll a snowball along the trail, build a snowman ----------
// The steps stay in the page as the list they are; the canvas over the header draws them as flags in
// the snow (a small lantern post for the teaching steps), the snowball rolling to the current one and
// growing with every right answer, and the snowman's parts dropping into place at the end.
function setupStage() {
    const header = document.querySelector(".lesson-header");
    const steps = document.getElementById("steps");
    if (!header || !steps) return;
    header.insertAdjacentHTML("afterbegin", `
        <div class="sky stage-sky" aria-hidden="true" data-sun="center" data-sun-y="0.4"><canvas class="sky-art"></canvas></div>
        <svg class="drifts stage-drifts" aria-hidden="true" shape-rendering="crispEdges" preserveAspectRatio="none"></svg>`);
    const goal = document.createElement("div");
    goal.className = "stage-goal";
    goal.setAttribute("aria-hidden", "true");
    steps.after(goal);
    const art = document.createElement("canvas");
    art.className = "stage-art";
    art.setAttribute("aria-hidden", "true");
    header.append(art);
    const ctx = art.getContext("2d");

    const st = { el: art, t: 0, ball: null, target: 0, dist: 0, size: 10, parts: 0, drops: [], marks: [], goal: null, hidden: false, missed: 0 };
    const measure = () => {
        const W = header.clientWidth, H = header.clientHeight;
        if (!W || !H) return;
        art.width = Math.ceil(W / PX);
        art.height = Math.ceil(H / PX);
        const host = header.getBoundingClientRect();
        const items = [...steps.children];
        st.marks = items.map((li) => {
            const b = li.getBoundingClientRect();
            const kind = li.classList.contains("is-teach") ? "teach" : "flag";
            const state = li.classList.contains("is-current") ? "now" : li.classList.contains("is-missed") ? "miss" : li.classList.contains("is-done") ? "done" : "next";
            return { kind, state, x: Math.round((b.left - host.left + b.width / 2) / PX), y: Math.round((b.bottom - host.top - 4) / PX) };
        });
        const g = goal.getBoundingClientRect();
        st.goal = { x: Math.round((g.left - host.left + g.width / 2) / PX) - 11, y: Math.round((g.bottom - host.top) / PX) };
        const done = items.filter((li) => li.classList.contains("is-done")).length;
        const right = items.filter((li) => li.classList.contains("is-done") && !li.classList.contains("is-missed")).length;
        const share = items.length ? done / items.length : 0;
        const parts = share >= 1 ? 3 : share >= 0.6 ? 2 : share >= 0.25 ? 1 : 0;
        for (let p = st.parts; p < parts; p++) st.drops.push({ part: p, t: 0 });
        st.parts = parts;
        st.size = [10, 12, 14, 16, 18, 20][Math.min(5, Math.floor((right / Math.max(1, items.length)) * 6))];
        const current = st.marks.find((m) => m.state === "now");
        st.hidden = share >= 1;
        st.target = current ? current.x - st.size - 3 : st.marks.length ? st.marks[0].x - st.size - 3 : 0;
        st.ground = current ? current.y + 1 : st.marks[0]?.y ?? art.height - 8;
        const missed = items.filter((li) => li.classList.contains("is-missed")).length;
        if (missed > st.missed) st.shake = 0.45;
        st.missed = missed;
        if (st.ball === null) st.ball = st.target;
        st.render(0);
    };
    st.update = (dt) => {
        st.t += dt;
        const d = st.target - st.ball;
        if (Math.abs(d) > 0.2) { const step = Math.sign(d) * Math.min(Math.abs(d), 70 * dt); st.ball += step; st.dist += step; }
        st.shake = Math.max(0, (st.shake || 0) - dt);
        for (const dr of st.drops) dr.t += dt;
    };
    st.render = () => {
        const dark = night();
        ctx.clearRect(0, 0, art.width, art.height);
        if (!st.marks.length) return;
        const y = st.marks[0].y;
        ctx.fillStyle = dark ? "#a8b8da" : "#cddff2";
        ctx.fillRect(st.marks[0].x - 10, y - 1, (st.goal?.x ?? art.width) + 24 - (st.marks[0].x - 10), 3);
        ctx.fillStyle = dark ? "#8596c2" : "#b4c8e2";
        ctx.fillRect(st.marks[0].x - 10, y + 2, (st.goal?.x ?? art.width) + 24 - (st.marks[0].x - 10), 1);
        st.marks.forEach((m, i) => {
            if (m.kind === "teach") {
                // a little lantern post: lit once you have passed it
                const lit = m.state === "done" || m.state === "now";
                shadow(ctx, m.x, m.y, 6, 10, dark);
                ctx.fillStyle = "#3a2414"; ctx.fillRect(m.x - 1, m.y - 11, 3, 11);
                ctx.fillStyle = "#76502f"; ctx.fillRect(m.x - 1, m.y - 11, 1, 11);
                ctx.fillStyle = "#1d2340"; ctx.fillRect(m.x - 3, m.y - 16, 7, 6);
                ctx.fillStyle = lit ? (Math.sin(st.t * 5 + i) > 0.85 ? "#fff1b8" : "#ffd770") : "#8a96b4";
                ctx.fillRect(m.x - 2, m.y - 15, 5, 4);
                return;
            }
            const name = { now: "flag_now", done: "flag_done", miss: "flag_miss", next: "flag_next" }[m.state];
            draw(ctx, name, Math.floor(st.t * 9 + i * 1.7) % 6, m.x - 3, m.y, false, dark);
        });
        if (st.goal) drawSnowman(ctx, st.goal.x, st.goal.y, st.parts, st.drops, dark);
        if (!st.hidden && st.ball !== null) {
            const f = ((Math.floor(st.dist / (st.size / 2) / (Math.PI / 4)) % 8) + 8) % 8;
            const j = st.shake > 0 ? (Math.floor(st.shake * 30) % 2 ? 1 : -1) : 0;
            shadow(ctx, st.ball + st.size / 2, st.ground, st.size, 2, dark);
            draw(ctx, `ball${st.size}`, f, st.ball + j, st.ground, false, dark);
        }
    };
    let pending = 0;
    const soonMeasure = () => { cancelAnimationFrame(pending); pending = requestAnimationFrame(measure); };
    new MutationObserver(soonMeasure).observe(steps, { childList: true, subtree: true, attributes: true });
    new ResizeObserver(soonMeasure).observe(header);
    measure();
    animate(st);
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

// ---------- the workshop window shows the valley at the real time of day ----------
function setupWindow() {
    const pane = document.querySelector(".window-pane");
    const sky = pane?.querySelector(".sky");
    if (!sky) return;
    const now = new Date();
    const hour = now.getHours();
    const time = hour >= 20 || hour < 6 ? "is-aurora" : hour >= 17 ? "is-sunset" : "is-morning";
    sky.classList.add(time);
    sky.dataset.seed = now.toDateString();
    // The weather changes once a day: same for the whole day, different tomorrow.
    pane.classList.toggle("is-snowing", rng(now.toDateString())() < 0.5);
    pane.title = `${time === "is-aurora" ? "Noite" : time === "is-sunset" ? "Fim de tarde" : "Dia"} no vale${pane.classList.contains("is-snowing") ? ", nevando" : ""}`;
}

// ---------- wiring ----------
function drawAll() {
    document.querySelectorAll(".sky-art").forEach(drawSky);
    document.querySelectorAll(".drifts").forEach(drawDrifts);
    document.querySelectorAll(".snowcap").forEach(drawCap);
    document.querySelectorAll(".vale-scene").forEach(drawScene);
    if (document.querySelector(".map")) drawMap();
}

let frameId = 0;
const soon = () => { cancelAnimationFrame(frameId); frameId = requestAnimationFrame(drawAll); };

if (document.querySelector(".lesson")) setupStage();
setupBoards();
setupWindow();
const resize = new ResizeObserver(soon);
resize.observe(document.body);
// Scenes inside dialogs or hidden views have no size until they appear; draw each one when it gets a size.
const pieces = new ResizeObserver((entries) => entries.forEach(({ target }) => (target.matches(".vale-scene") ? drawScene(target) : drawSky(target))));
document.querySelectorAll(".vale-scene, .sky-art").forEach((el) => pieces.observe(el));
const retheme = () => { for (const el of document.querySelectorAll(".vale-scene")) { const s = scenes.get(el); if (s) s.key = ""; } soon(); };
new MutationObserver(retheme).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", retheme);
const units = document.getElementById("units");
if (units) {
    // the map script re-renders the units when the student picks another track or opens a lesson card
    new MutationObserver((records) => {
        const ours = (n) => n.nodeType !== 1 || n.closest?.("canvas, svg, .sky") || n.matches?.(".unit-scenery, .sky");
        if (records.some((r) => !r.target.closest?.("svg, .sky") && [...r.addedNodes, ...r.removedNodes].some((n) => !ours(n)))) soon();
    }).observe(units, { childList: true, subtree: true });
}
document.fonts?.ready.then(soon);
soon();
