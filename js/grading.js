import { normalizeCode, runPython } from "./python.js";

const collapse = (text) => text.replace(/\s+/g, " ").trim();
const compact = (text) => normalizeCode(text).replace(/\s+/g, "");

const pass = { ok: true };
const fail = (message) => ({ ok: false, message });

export const checkBlank = (value, answer) => collapse(normalizeCode(value)).toLowerCase() === answer.toLowerCase();

export const checkOrder = (picked, lines) => picked.length === lines.length && picked.every((line, i) => line === lines[i]);

async function checkPython(code, { expected, mustInclude = [] }) {
    const { output, error } = await runPython(code);
    if (error) return fail(error);
    if (collapse(output) !== collapse(expected)) {
        return fail(output.trim() ? `Sua saída: ${output.trim()}` : "O programa não mostrou nada. Use print para mostrar o resultado.");
    }
    const missing = mustInclude.find((part) => !compact(code).includes(compact(part)));
    return missing ? fail(`A saída está certa, mas use ${missing} como o exercício pede.`) : pass;
}

// Compares elements, attributes and text, so formatting, quotes and letter case don't matter.
const attributes = (element) => [...element.attributes]
    .map(({ name, value }) => ` ${name}="${collapse(value).toLowerCase()}"`)
    .sort()
    .join("");

const canonical = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return collapse(node.data).toLowerCase();
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    return `<${node.localName}${attributes(node)}>${[...node.childNodes].map(canonical).join("")}</${node.localName}>`;
};
const parseHtml = (markup) => canonical(new DOMParser().parseFromString(normalizeCode(markup), "text/html").body);

function checkHtml(code, { expected }) {
    const closingTags = expected.match(/<\/\w+>/g) ?? [];
    const unclosed = closingTags.find((tag) => !code.toLowerCase().includes(tag));
    if (unclosed) return fail(`Não esqueça de fechar a tag com ${unclosed}.`);
    return parseHtml(code) === parseHtml(expected) ? pass : fail("Confira as tags, os atributos e o texto pedido.");
}

const parseCss = (css) => {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(normalizeCode(css));
    return new Map([...sheet.cssRules].map((rule) => [rule.selectorText, rule.style]));
};

// Values are compared after the browser resolves them, so "red" and "#f00" both pass.
function checkCss(code, { expected }) {
    // The probe sits inside a hidden parent so its own `display` can still be compared.
    const container = document.body.appendChild(Object.assign(document.createElement("div"), { hidden: true }));
    const probe = container.appendChild(document.createElement("div"));
    const resolve = (style, property) => {
        probe.style.cssText = style?.cssText ?? "";
        return getComputedStyle(probe).getPropertyValue(property);
    };

    try {
        const actual = parseCss(code);
        for (const [selector, style] of parseCss(expected)) {
            if (!actual.has(selector)) return fail(`Crie uma regra para o seletor ${selector}.`);
            if ([...style].some((property) => resolve(style, property) !== resolve(actual.get(selector), property))) {
                return fail(`Confira as propriedades dentro de ${selector} { }.`);
            }
        }
        return pass;
    } finally {
        container.remove();
    }
}

const CHECKERS = { python: checkPython, html: checkHtml, css: checkCss };

export const checkCode = (language, code, exercise) => CHECKERS[language](code, exercise);
