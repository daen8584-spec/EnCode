import { sanitizeInput, createEl, createCodeToolbar, attachSymbolDebug } from "./utils.js";

const SNIPPETS = {
    hello: "print('Olá, mundo!')",
    loop: "for i in range(1, 6):\n    print('Contando:', i)",
    "function": "def saudacao(nome):\n    return 'Olá, ' + nome + '!'\n\nprint(saudacao('EnCoder'))"
};

const renderXpBar = (progress) => {
    const fill = document.getElementById("xp-fill");
    if (!fill) return;
    const xp = progress?.xp ?? 0;
    const level = Math.floor(xp / 1000) + 1;
    const xpInLevel = xp % 1000;
    const percent = Math.min((xpInLevel / 1000) * 100, 100);
    setTimeout(() => { fill.style.width = `${percent}%`; }, 200);
    const levelEl = document.getElementById("xp-level");
    const currentEl = document.getElementById("xp-current");
    if (levelEl) levelEl.textContent = String(level);
    if (currentEl) currentEl.textContent = String(xpInLevel);
};

export function initAppShell(progress = null) {
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
    renderXpBar(progress);
}

const fireConfetti = () => {
    const colors = ["#7c5cff", "#22d3ee", "#34d399", "#fbbf24", "#ff6b6b"];
    const container = createEl("div", "confetti-container");
    document.body.appendChild(container);
    for (let i = 0; i < 40; i++) {
        const piece = createEl("span", "confetti-piece");
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

export function initEditor() {
    const input = document.getElementById("code-input");
    const output = document.getElementById("code-output");
    const runButton = document.getElementById("run-button");
    const clearButton = document.getElementById("clear-button");
    const snippetSelect = document.getElementById("snippet-select");
    if (!input || !runButton || !output) return;

    input.value = SNIPPETS.hello;
    attachSymbolDebug(input);
    createCodeToolbar(input);

    snippetSelect?.addEventListener("change", () => {
        const key = snippetSelect.value;
        if (!SNIPPETS[key]) return;
        input.value = SNIPPETS[key];
        output.textContent = "";
        input.focus();
    });

    runButton.addEventListener("click", async () => {
        const code = sanitizeInput(input.value);
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
            buffer.push("", `Concluído em ${Date.now() - start}ms`);
            output.textContent = buffer.join("");
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
// 1791752158
// 1791752623
// 1791752678
