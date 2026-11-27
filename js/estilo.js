// Style guide: colour roles, Bit's moods and every sprite, drawn from the same sources the site uses.
import { h } from "./dom.js";
import { createMascot } from "./mascot.js";
import { SPRITES } from "./vale-sprites.js";

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
    ["--wood", "Madeira", "Moldura da lousa, oficina"],
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

document.getElementById("sprite-list").append(...Object.entries(SPRITES).map(([name, s]) => h("figure", { className: "sprite-card" },
    h("span", { className: "sprite-art", innerHTML: `<svg viewBox="0 0 ${s.w} ${s.h}" width="${s.w * 5}" height="${s.h * 5}" shape-rendering="crispEdges" aria-hidden="true">${s.day}</svg>` }),
    h("figcaption", { textContent: name })
)));
