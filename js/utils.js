const SYMBOL_MAP = {
    "\u2192": "->", "\u21D2": "=>", "\u2190": "<-", "\u21D0": "<=",
    "\u21D4": "<=>", "\u2265": ">=", "\u2267": ">=", "\u226B": ">>",
    "\u2264": "<=", "\u2266": "<=", "\u226A": "<<", "\u2260": "!=",
    "\u2212": "-", "\u2013": "-", "\u2014": "--", "\u2015": "--",
    "\u00D7": "*", "\u00F7": "/", "\u2018": "'", "\u2019": "'",
    "\u201A": "'", "\u201C": "\"", "\u201D": "\"", "\u201E": "\"",
    "\u2026": "...", "\u00AB": "<<", "\u00BB": ">>", "\u00A0": " ",
    "\uFF1C": "<", "\uFF1E": ">", "\uFF1D": "=", "\uFF0B": "+",
    "\uFF0D": "-", "\uFF0A": "*", "\uFF0F": "/"
};

const SMART_REPLACEMENTS = [
    [/[\u2018\u2019\u201A]/g, "'"],
    [/[\u201C\u201D\u201E]/g, "\""],
    [/[\u2013\u2014\u2015]/g, "-"],
    [/\u00A0/g, " "],
    [/\u2192/g, "->"],
    [/\u21D2/g, "=>"],
    [/\u2212/g, "-"],
    [/\u00D7/g, "*"],
    [/\u00F7/g, "/"]
];

export const sanitizeInput = (text) =>
    [...text].map((char) => SYMBOL_MAP[char] ?? char).join("");

export const sanitizeCode = (code) =>
    SMART_REPLACEMENTS.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), code);

export const createEl = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
};

const PYTHON_KEYWORDS = [
    "print", "input", "range", "int", "str", "float", "len", "type",
    "list", "dict", "set", "tuple", "sum", "max", "min", "abs", "round",
    "sorted", "reversed", "enumerate", "zip", "map", "filter"
];

export const friendlyError = (rawMessage, userCode) => {
    const msg = String(rawMessage ?? "");
    const code = String(userCode ?? "");

    const nameMatch = msg.match(/name '(\w+)' is not defined/i);
    if (nameMatch) {
        const name = nameMatch[1];
        const lower = name.toLowerCase();
        if (PYTHON_KEYWORDS.includes(lower)) {
            if (name !== lower) {
                return `Python diferencia maiúsculas de minúsculas. Use ${lower} com letra minúscula.`;
            }
            return `A função ${lower} não foi usada corretamente.`;
        }
        return `A palavra '${name}' não está entre aspas. Textos precisam de aspas: "${name}"`;
    }

    if (msg.includes("unterminated string") || msg.includes("EOL while scanning")) {
        return "Aspas não fechadas. Cada texto precisa de duas aspas.";
    }

    if (msg.includes("IndentationError") || msg.includes("expected an indented block")) {
        return "Falta indentação. Use 4 espaços no início da linha dentro do if/for/def.";
    }

    if (msg.includes("expected ':'")) {
        return "Falta dois pontos (:) no final da linha do if/for/def.";
    }

    if (msg.includes("SyntaxError")) {
        return "Erro de sintaxe. Verifique parênteses, aspas e dois pontos.";
    }

    if (msg.includes("ZeroDivisionError")) {
        return "Não é possível dividir por zero.";
    }

    if (msg.includes("TypeError") && msg.includes("can only concatenate str")) {
        return "Não é possível juntar texto com número. Use str() para converter o número.";
    }

    return msg.split("\n")[0];
};
// 1791696887

export const insertAtCursor = (textarea, text) => {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);
    textarea.value = before + text + after;
    const newPos = start + text.length;
    textarea.setSelectionRange(newPos, newPos);
    textarea.focus();
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
};

const CODE_SYMBOLS = ["->", "=>", ">=", "<=", "!=", ":", "(", ")", "[", "]", "\"", "'", "_"];

export const createCodeToolbar = (textarea) => {
    if (!textarea || textarea.dataset.toolbar === "1") return;
    textarea.dataset.toolbar = "1";

    const toolbar = document.createElement("div");
    toolbar.className = "code-toolbar";

    CODE_SYMBOLS.forEach((sym) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "code-toolbar-btn";
        btn.textContent = sym;
        btn.addEventListener("click", () => insertAtCursor(textarea, sym));
        toolbar.appendChild(btn);
    });

    textarea.insertAdjacentElement("afterend", toolbar);
};
// 1791752158
