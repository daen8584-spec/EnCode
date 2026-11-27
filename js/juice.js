// Small moments of feedback: a burst of pixel snow when an answer is right.
// Purely visual, skipped when the student asks for reduced motion.
const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export function burst(target, { colors = ["#ffffff", "#bfe6f8", "#8ccbeb", "#f2b33d"], count = 16 } = {}) {
    if (!target || still()) return;
    const box = target.getBoundingClientRect();
    const layer = document.createElement("div");
    layer.className = "burst";
    layer.setAttribute("aria-hidden", "true");
    layer.style.left = `${box.left + box.width / 2}px`;
    layer.style.top = `${box.top + box.height / 2}px`;
    document.body.append(layer);
    const done = [];
    for (let i = 0; i < count; i++) {
        const bit = document.createElement("i");
        const size = 6 + Math.round(Math.random() * 3) * 2;
        bit.style.width = bit.style.height = `${size}px`;
        bit.style.background = colors[i % colors.length];
        layer.append(bit);
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const reach = Math.min(box.width, 260) * 0.35 + 40 + Math.random() * 40;
        const x = Math.cos(angle) * reach, y = Math.sin(angle) * reach * 0.7;
        done.push(bit.animate([
            { translate: "0 0", scale: 1, opacity: 1 },
            { translate: `${x}px ${y}px`, scale: 1, opacity: 1, offset: 0.6 },
            { translate: `${x * 1.1}px ${y + 40}px`, scale: 0.5, opacity: 0 }
        ], { duration: 700 + Math.random() * 200, easing: "cubic-bezier(0.2, 0.8, 0.3, 1)" }).finished);
    }
    Promise.allSettled(done).then(() => layer.remove());
}
