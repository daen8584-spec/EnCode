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
