// Style guide: colour roles, Bit's moods and every sprite, drawn from the same sources the site uses.
import { h } from "./dom.js";
import { createMascot } from "./mascot.js";
import { ART, frame } from "./vale-art.js";
import { animate } from "./vale-engine.js";

const COLOURS = [
    ["--outline", "Tinta", "Contornos e texto"],
    ["--primary", "Azul do moletom", "A ação principal"],
    ["--gold", "Ouro", "Agora: lição atual, bandeira atual, rótulos"],
    ["--right", "Acerto", "Resposta certa"],
    ["--wrong", "Erro", "Resposta errada"],
    ["--sky", "Céu", "O fundo do vale"],
    ["--snow", "Neve", "O chão de toda tela"],
    ["--ice", "Gelo", "Blocos de resposta"],
    ["--board", "Lousa", "Explicações e código"],
    ["--wood", "Madeira", "Detalhes de madeira nas cenas"],
    ["--paper", "Papel", "Cartões e diálogos"]
];

const style = getComputedStyle(document.documentElement);
document.getElementById("swatches").append(...COLOURS.map(([token, name, role]) => h("figure", { className: "swatch" },
    h("span", { className: "swatch-chip", style: `background: var(${token})` }),
    h("figcaption", {}, h("b", { textContent: name }), h("code", { textContent: `${token} ${style.getPropertyValue(token).trim()}` }), h("span", { textContent: role }))
)));

const MOODS = [["idle", "Parado"], ["watch", "Olhando"], ["think", "Pensando"], ["point", "Apontando"], ["happy", "Feliz"], ["wow", "Uau!"], ["sad", "Triste"]];
document.getElementById("moods").append(...MOODS.map(([mood, label]) => {
    const bit = createMascot();
    bit.mood(mood);
    return h("figure", { className: "mood" }, bit.root, h("figcaption", {}, h("code", { textContent: mood }), ` ${label}`));
}));

// Every sprite at 3x, playing its frames; night colours follow the page theme.
const dark = () => document.documentElement.dataset.theme ? document.documentElement.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
document.getElementById("sprite-list").append(...Object.entries(ART).map(([name, s]) => {
    const cv = h("canvas", { width: s.w * 3, height: s.h * 3, ariaHidden: "true" });
    const ctx = cv.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    const tile = { el: cv, t: 0, update(dt) { this.t += dt; }, render() {
        ctx.clearRect(0, 0, cv.width, cv.height);
        ctx.drawImage(frame(name, Math.floor(this.t * 6) % s.frames.length, dark()), 0, 0, cv.width, cv.height);
    } };
    if (s.frames.length > 1) animate(tile); else tile.render();
    return h("figure", { className: "sprite-card" }, h("span", { className: "sprite-art" }, cv),
        h("figcaption", { textContent: s.frames.length > 1 ? `${name} · ${s.frames.length} quadros` : name }));
}));
