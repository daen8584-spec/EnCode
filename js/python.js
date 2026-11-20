const SKULPT_URL = "https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/";
const TIME_LIMIT_MS = 5000;

// Phones and some keyboards replace typed symbols with typographic ones.
const SYMBOLS = {
    "‘": "'", "’": "'", "‚": "'", "“": "\"", "”": "\"", "„": "\"",
    "–": "-", "−": "-", "—": "--", "―": "--", "…": "...", " ": " ",
    "→": "->", "⇒": "=>", "←": "<-", "⇐": "<=", "⇔": "<=>",
    "≥": ">=", "≧": ">=", "≤": "<=", "≦": "<=", "≠": "!=",
    "≫": ">>", "≪": "<<", "»": ">>", "«": "<<", "×": "*", "÷": "/",
    "＜": "<", "＞": ">", "＝": "=", "＋": "+", "－": "-", "＊": "*", "／": "/"
};
const SYMBOL_PATTERN = new RegExp(`[${Object.keys(SYMBOLS).join("")}]`, "g");

export const normalizeCode = (code) => code.replace(SYMBOL_PATTERN, (char) => SYMBOLS[char]);

const BUILTINS = new Set(["print", "input", "range", "int", "str", "float", "len", "type", "list", "dict",
    "set", "tuple", "sum", "max", "min", "abs", "round", "sorted", "reversed", "enumerate", "zip"]);

const ERROR_HINTS = [
    [/TimeLimitError/, () => "Seu código demorou demais. Verifique se existe um laço infinito."],
    [/unterminated string|EOL while scanning|EOF in multi-line string/, () => "Aspas não fechadas. Cada texto precisa abrir e fechar aspas."],
    [/IndentationError|expected an indented block/, () => "Falta indentação. Use 4 espaços no início das linhas dentro do if, for ou def."],
    [/expected ':'/, () => "Falta dois pontos (:) no final da linha do if, for ou def."],
    [/ZeroDivisionError/, () => "Não é possível dividir por zero."],
    [/can only concatenate str/, () => "Não é possível juntar texto com número. Use str() para converter o número."],
    [/name '(\w+)' is not defined/, ([, name]) => {
        const lower = name.toLowerCase();
        if (BUILTINS.has(lower) && name !== lower) return `Python diferencia maiúsculas de minúsculas. Escreva ${lower} com letras minúsculas.`;
        return `'${name}' não foi definido. Se é um texto, coloque entre aspas: "${name}".`;
    }],
    [/SyntaxError/, () => "Erro de sintaxe. Verifique parênteses, aspas e dois pontos."]
];

export function explainError(raw) {
    const line = raw.match(/on line (\d+)/)?.[1];
    for (const [pattern, explain] of ERROR_HINTS) {
        const match = raw.match(pattern);
        if (match) return line ? `${explain(match)} (linha ${line})` : explain(match);
    }
    return raw.split("\n")[0];
}

const loadScript = (src) => new Promise((resolve, reject) => {
    document.head.append(Object.assign(document.createElement("script"), { src, onload: resolve, onerror: reject }));
});

let loading = null;

export function loadPython() {
    loading ??= loadScript(`${SKULPT_URL}skulpt.min.js`)
        .then(() => loadScript(`${SKULPT_URL}skulpt-stdlib.js`))
        .catch((error) => {
            loading = null;
            throw error;
        });
    return loading;
}

export async function runPython(code, { input = () => "", onOutput } = {}) {
    await loadPython();
    const { Sk } = window;
    let output = "";

    Sk.configure({
        __future__: Sk.python3,
        execLimit: TIME_LIMIT_MS,
        yieldLimit: 100,
        inputfun: input,
        inputfunTakesPrompt: true,
        output: (text) => {
            output += text;
            onOutput?.(output);
        },
        read: (file) => {
            const source = Sk.builtinFiles?.files[file];
            if (source === undefined) throw new Error(`File not found: '${file}'`);
            return source;
        }
    });

    try {
        await Sk.misceval.asyncToPromise(() => Sk.importMainWithBody("<stdin>", false, normalizeCode(code), true));
        return { output };
    } catch (error) {
        return { output, error: explainError(String(error)) };
    }
}
