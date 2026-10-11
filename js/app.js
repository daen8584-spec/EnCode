const SNIPPETS = {
    hello: "print('Olá, mundo!')",
    loop: "for i in range(1, 6):\n    print('Contando:', i)",
    "function": "def saudacao(nome):\n    return 'Olá, ' + nome + '!'\n\nprint(saudacao('EnCoder'))"
};

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

const sanitizeInput = (text) => [...text].map((ch) => SYMBOL_MAP[ch] ?? ch).join("");

const attachSanitizer = (textarea) => {
    let busy = false;
    const clean = () => {
        if (busy) return;
        const current = textarea.value;
        const cleaned = sanitizeInput(current);
        if (cleaned === current) return;
        busy = true;
        const pos = textarea.selectionStart;
        textarea.value = cleaned;
        const newPos = Math.max(0, pos - (current.length - cleaned.length));
        try { textarea.setSelectionRange(newPos, newPos); } catch {}
        setTimeout(() => { busy = false; }, 0);
    };
    textarea.addEventListener("input", clean);
    textarea.addEventListener("compositionend", clean);
    textarea.addEventListener("keyup", clean);
    textarea.addEventListener("paste", () => setTimeout(clean, 0));
    setInterval(clean, 80);
};

export function initAppShell() {
    const navItems = document.querySelectorAll(".nav-item");
    const views = document.querySelectorAll(".view");
    navItems.forEach((item) => item.addEventListener("click", () => {
        const href = item.dataset.href;
        if (href) { window.location.href = href; return; }
        const target = item.dataset.view;
        navItems.forEach((n) => n.classList.remove("is-active"));
        item.classList.add("is-active");
        views.forEach((v) => v.classList.toggle("is-active", v.id === `view-${target}`));
    }));
    const xpFill = document.getElementById("xp-fill");
    if (xpFill) setTimeout(() => { xpFill.style.width = "45%"; }, 200);
}

const fireConfetti = () => {
    const colors = ["#7c5cff", "#22d3ee", "#34d399", "#fbbf24", "#ff6b6b"];
    const container = document.createElement("div");
    container.className = "confetti-container";
    document.body.appendChild(container);
    for (let i = 0; i < 40; i++) {
        const piece = document.createElement("span");
        piece.className = "confetti-piece";
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = `${Math.random() * 0.3}s`;
        piece.style.animationDuration = `${1.2 + Math.random() * 0.8}s`;
        container.appendChild(piece);
    }
    setTimeout(() => container.remove(), 2400);
};

const CODE_PATTERNS = [
    /console\s*\.\s*log\s*\(/,
    /document\s*\.\s*(querySelector|getElementById)/,
    /=>\s*[{(]/,
    /\bfunction\s+\w+\s*\([^)]*\)\s*\{/,
    /<script[\s>]/i,
    /<div[\s>]/i,
    /<body[\s>]/i
];

const looksLikeOtherLanguage = (code) => CODE_PATTERNS.some((p) => p.test(code));

const setupSkulpt = () => {
    const Sk = window.Sk;
    if (typeof Sk === "undefined") return null;
    Sk.configure({
        __future__: Sk.python3,
        inputfun: (prompt) => window.prompt(prompt) ?? "",
        inputfunTakesPrompt: true,
        read: (x) => {
            if (!Sk.builtinFiles?.files?.[x]) throw `File not found: '${x}'`;
            return Sk.builtinFiles.files[x];
        }
    });
    return Sk;
};

const formatOutput = (lines) => lines.join("\n");

export function initEditor() {
    const input = document.getElementById("code-input");
    const output = document.getElementById("code-output");
    const runButton = document.getElementById("run-button");
    const clearButton = document.getElementById("clear-button");
    const snippetSelect = document.getElementById("snippet-select");
    if (!input || !runButton || !output) return;

    input.value = SNIPPETS.hello;
    attachSanitizer(input);

    snippetSelect?.addEventListener("change", () => {
        const key = snippetSelect.value;
        if (!SNIPPETS[key]) return;
        input.value = SNIPPETS[key];
        output.textContent = "";
        input.focus();
    });

    runButton.addEventListener("click", async () => {
        input.value = sanitizeInput(input.value);
        const code = input.value;
        output.textContent = "";
        if (!code.trim()) { output.textContent = "Escreva algum código Python para executar."; return; }
        if (looksLikeOtherLanguage(code)) { output.textContent = "Este terminal aceita apenas Python."; return; }

        const Sk = setupSkulpt();
        if (!Sk) { output.textContent = "Erro: o interpretador Python ainda não carregou."; return; }

        const start = Date.now();
        const buffer = [];
        Sk.configure({ output: (text) => { buffer.push(text); output.textContent = buffer.join(""); } });

        try {
            await Sk.misceval.asyncToPromise(() => Sk.importMainWithBody("<stdin>", false, code, true));
            const elapsed = Date.now() - start;
            buffer.push("", `Concluído em ${elapsed}ms`);
            output.textContent = formatOutput(buffer);
            fireConfetti();
        } catch (error) {
            output.textContent = `Erro: ${error?.toString?.() ?? error}`;
        }
    });

    clearButton.addEventListener("click", () => {
        input.value = "";
        output.textContent = "";
        input.focus();
    });
}
