import { normalizeCode, runPython } from "./python.js";

const collapse = (text) => text.replace(/\s+/g, " ").trim();
// Single and double quotes mean the same thing in Python, HTML and CSS.
const compact = (text) => normalizeCode(text).replace(/\s+/g, "").replace(/'/g, "\"");
// For spotting near misses: no letter case, accents, punctuation or extra spaces.
const loose = (text) => collapse(text).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ").trim();

const pass = { ok: true };
const fail = (message) => ({ ok: false, message });
// A near miss is not counted as wrong: the student fixes the detail and checks again.
const near = (message) => ({ ok: false, near: true, message });

function distance(a, b) {
    let row = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
        const next = [i];
        for (let j = 1; j <= b.length; j++) {
            next[j] = Math.min(row[j] + 1, next[j - 1] + 1, row[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        }
        row = next;
    }
    return row[b.length];
}
const typoLimit = (answer) => (answer.length >= 8 ? 2 : answer.length >= 4 ? 1 : 0);

// Drops what the code already has around the blank, so "print()", ".upper", "<h1>" or "href=" count as the word itself.
function trimAround(typed, code, answer) {
    const [before = "", after = ""] = code.split("___");
    let value = typed;
    const lead = before.match(/[<\/.]+$/)?.[0] ?? "";
    for (const char of lead) if (value.startsWith(char) && !answer.startsWith(char)) value = value.slice(1);
    if (after.startsWith("(") && !answer.includes("(")) value = value.replace(/\(\)?$/, "");
    const tail = after.match(/^\s*([>=:;])/)?.[1];
    if (tail && value.endsWith(tail) && !answer.endsWith(tail)) value = value.slice(0, -1);
    return value;
}

// HTML and CSS ignore letter case; Python does not, so a case slip there is a near miss with an explanation.
export function checkBlank(value, { answer, accept = [], code = "___", language = "python" }) {
    const answers = [answer, ...accept];
    const typed = normalizeCode(value).replace(/\s+/g, "").replace(/'/g, "\"");
    if (!typed) return fail("Escreva a resposta no espaço.");
    const sensitive = language === "python";
    for (const option of answers) {
        const goal = option.replace(/\s+/g, "").replace(/'/g, "\"");
        const mine = trimAround(typed, code, goal);
        if (sensitive ? mine === goal : mine.toLowerCase() === goal.toLowerCase()) return pass;
    }
    for (const option of answers) {
        const goal = option.replace(/\s+/g, "").toLowerCase();
        const mine = trimAround(typed, code, goal).toLowerCase();
        if (mine === goal) return near(goal === option ? "Quase! Em Python, maiúsculas e minúsculas fazem diferença. Escreva tudo com letras minúsculas." : "Quase! Em Python, maiúsculas e minúsculas fazem diferença. Confira as letras.");
        if (typoLimit(goal) && distance(mine, goal) <= typoLimit(goal)) return near("Quase! Tem uma letrinha diferente. Confira a escrita.");
    }
    return fail("");
}

export const checkOrder = (picked, lines) => picked.length === lines.length && picked.every((line, i) => line === lines[i]);

async function checkPython(code, { expected, mustInclude = [] }) {
    const { output, error } = await runPython(code);
    if (error) return fail(error);
    if (collapse(output) !== collapse(expected)) {
        if (!output.trim()) return fail("O programa não mostrou nada. Use print para mostrar o resultado.");
        if (loose(output) === loose(expected)) {
            return near(`Quase! A saída tem uma diferença de maiúsculas, acentos ou pontuação. Esperado: ${expected.trim()} · Sua saída: ${output.trim()}`);
        }
        return fail(`Sua saída: ${output.trim()}`);
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
    const mine = parseHtml(code), goal = parseHtml(expected);
    if (mine === goal) return pass;
    // Same tags and attributes, text off only by accents or punctuation: a near miss.
    const tagsOnly = (markup) => markup.replace(/>[^<]*</g, "><");
    if (tagsOnly(mine) === tagsOnly(goal) && loose(mine.replace(/<[^>]*>/g, " ")) === loose(goal.replace(/<[^>]*>/g, " "))) {
        return near("Quase! As tags estão certas. Confira os acentos e a pontuação do texto.");
    }
    return fail("Confira as tags, os atributos e o texto pedido.");
}

const parseCss = (css) => {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(normalizeCode(css));
    // Selectors are compared without letter case or extra spaces, so "H1" and "h1" are the same rule.
    const key = (selector) => selector.toLowerCase().replace(/\s+/g, " ").replace(/\s*([>+~,])\s*/g, "$1").trim();
    return new Map([...sheet.cssRules].map((rule) => [key(rule.selectorText), rule.style]));
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

// A free exercise only checks the result, so any way that works passes.
// Each case gives the starting values (like n = 3); the same code has to work for every case, which rules out
// printing the answer directly and asks for real logic.
const pyValue = (value) => typeof value === "boolean" ? (value ? "True" : "False")
    : Array.isArray(value) ? `[${value.map(pyValue).join(", ")}]` : JSON.stringify(value);
export const givenCode = (given = {}) => Object.entries(given).map(([name, value]) => `${name} = ${pyValue(value)}`).join("\n");
export const describeGiven = (given = {}) => Object.entries(given).map(([name, value]) => `${name} = ${pyValue(value)}`).join(", ");

export async function runWithGiven(code, given) {
    const setup = givenCode(given);
    const shift = setup ? setup.split("\n").length : 0;
    const result = await runPython(setup ? `${setup}\n${code}` : code);
    // Error messages count lines from the student's own code, not from the hidden starting values.
    if (result.error) result.error = result.error.replace(/linha (\d+)/, (_, n) => `linha ${Math.max(1, Number(n) - shift)}`);
    return result;
}

export async function checkFree(code, { cases }) {
    for (const { given, expected } of cases) {
        const { output, error } = await runWithGiven(code, given);
        const when = given ? `Com ${describeGiven(given)}: ` : "";
        if (error) return fail(`${when}${error}`);
        if (collapse(output) === collapse(expected)) continue;
        if (!output.trim()) return fail(`${when}o programa não mostrou nada. Use print para mostrar o resultado.`);
        if (loose(output) === loose(expected)) {
            return near(`Quase! ${when}a saída tem uma diferença de maiúsculas, acentos ou pontuação. Esperado: ${expected.trim()} · Sua saída: ${output.trim()}`);
        }
        return fail(`${when}sua saída foi ${output.trim()}, mas deveria ser ${expected.trim()}.`);
    }
    return pass;
}

const CHECKERS = { python: checkPython, html: checkHtml, css: checkCss };

export const checkCode = (language, code, exercise) => CHECKERS[language](code, exercise);
