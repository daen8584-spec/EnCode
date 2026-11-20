import { h } from "./dom.js";

const LAYERS = { body: "mascot", pointer: "mascot-pointer", blink: "mascot-blink", happy: "mascot-happy" };
const TYPE_MS = 24;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = matchMedia("(pointer: fine)");
const clamp = (value, min = -1, max = 1) => Math.min(max, Math.max(min, value));

// moods: idle, talk, point, watch, think, happy, sad, cheer
export function createMascot({ className = "" } = {}) {
    const typed = h("span", { ariaHidden: "true" });
    const pending = h("span", { className: "mascot-pending", ariaHidden: "true" });
    const spoken = h("span", { className: "visually-hidden", role: "status" });
    const bubble = h("p", { className: "mascot-bubble", hidden: true }, typed, pending);
    const pose = h("div", { className: "mascot-pose" }, Object.entries(LAYERS).map(([layer, file]) => h("img", {
        className: `mascot-layer is-${layer}`,
        src: `assets/${file}.webp`,
        alt: "",
        width: 440,
        height: 536,
        draggable: false
    })));
    const figure = h("div", { className: "mascot-figure" }, bubble, h("div", { className: "mascot-look" }, pose));
    const root = h("div", { className: `mascot ${className}` }, figure, spoken);
    root.dataset.mood = "idle";
    pose.style.setProperty("--blink-delay", `${(-Math.random() * 5).toFixed(2)}s`);

    let speech = 0;
    let skip = false;
    let target = null;

    function say(text) {
        const id = ++speech;
        skip = reducedMotion.matches;
        spoken.textContent = text;
        bubble.hidden = false;
        bubble.animate([{ opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1 }], { duration: 220, easing: "ease-out" });
        root.dataset.talking = "";

        return new Promise((resolve) => {
            let shown = 0;
            const step = () => {
                if (id !== speech) return resolve();
                shown = skip ? text.length : shown + 1;
                typed.textContent = text.slice(0, shown);
                pending.textContent = text.slice(shown);
                if (shown < text.length) return setTimeout(step, TYPE_MS);
                delete root.dataset.talking;
                resolve();
            };
            step();
        });
    }

    function hush() {
        speech += 1;
        bubble.hidden = true;
        delete root.dataset.talking;
    }

    function mood(name) {
        root.dataset.mood = name;
        for (const animation of pose.getAnimations({ subtree: true })) {
            if (animation instanceof CSSAnimation) {
                animation.cancel();
                animation.play();
            }
        }
    }

    // Slides the mascot so its pointer lines up with `target` (only where the layout allows it).
    function aim() {
        const canMove = getComputedStyle(root).getPropertyValue("--mascot-can-point").trim() === "1";
        if (!target || !canMove) {
            root.style.setProperty("--shift", "0px");
            return;
        }
        const base = root.getBoundingClientRect();
        const goal = target.getBoundingClientRect();
        const tip = base.top + base.height * 0.39;
        const shift = clamp(goal.top + goal.height / 2 - tip, -48, innerHeight - 190 - tip);
        root.style.setProperty("--shift", `${Math.round(shift)}px`);
    }

    function pointAt(element) {
        target = element;
        root.dataset.mood = "point";
        aim();
    }

    function rest(nextMood = "idle") {
        target = null;
        mood(nextMood);
        aim();
    }

    bubble.addEventListener("click", () => { skip = true; });
    addEventListener("scroll", () => requestAnimationFrame(aim), { passive: true });
    addEventListener("resize", () => requestAnimationFrame(aim));

    if (finePointer.matches && !reducedMotion.matches) {
        let frame = 0;
        addEventListener("pointermove", ({ clientX, clientY }) => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const box = root.getBoundingClientRect();
                root.style.setProperty("--look-x", clamp((clientX - box.left - box.width / 2) / 600).toFixed(3));
                root.style.setProperty("--look-y", clamp((clientY - box.top - box.height * 0.3) / 600).toFixed(3));
            });
        }, { passive: true });
    }

    return { root, say, hush, mood, pointAt, rest };
}
