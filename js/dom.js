export const $ = (id) => document.getElementById(id);

export function h(tag, props = {}, ...children) {
    const element = Object.assign(document.createElement(tag), props);
    element.append(...children.flat().filter((child) => child != null && child !== false));
    return element;
}

export function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

export function toast(message, type = "info") {
    const region = document.querySelector(".toasts")
        ?? document.body.appendChild(h("div", { className: "toasts", role: "status" }));
    const item = region.appendChild(h("div", { className: `toast is-${type}`, textContent: message }));
    setTimeout(() => item.remove(), 3200);
}
