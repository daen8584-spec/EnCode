const SNIPPETS = {
    hello: "print('Olá, mundo!')",
    loop: "for i in range(1, 6):\n    print('Contando:', i)",
    "function": "def saudacao(nome):\n    return 'Olá, ' + nome + '!'\n\nprint(saudacao('EnCoder'))"
};

export function initAppShell() {
    const navItems = document.querySelectorAll(".nav-item");
    const views = document.querySelectorAll(".view");
    navItems.forEach(function (item) {
        item.addEventListener("click", function () {
            const target = item.getAttribute("data-view");
            navItems.forEach(function (nav) { nav.classList.remove("is-active"); });
            item.classList.add("is-active");
            views.forEach(function (view) {
                view.classList.toggle("is-active", view.id === "view-" + target);
            });
        });
    });
    const xpFill = document.getElementById("xp-fill");
    if (xpFill) setTimeout(function () { xpFill.style.width = "45%"; }, 200);
}

function fireConfetti() {
    const colors = ["#7c5cff", "#22d3ee", "#34d399", "#fbbf24", "#ff6b6b"];
    const container = document.createElement("div");
    container.className = "confetti-container";
    document.body.appendChild(container);
    for (let i = 0; i < 40; i++) {
        const piece = document.createElement("span");
        piece.className = "confetti-piece";
        piece.style.left = Math.random() * 100 + "%";
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = (Math.random() * 0.3) + "s";
        piece.style.animationDuration = (1.2 + Math.random() * 0.8) + "s";
        container.appendChild(piece);
    }
    setTimeout(function () { container.remove(); }, 2400);
}

function looksLikeOtherLanguage(code) {
    const patterns = [
        /console\s*\.\s*log/,
        /\bvar\s+\w+\s*=/,
        /\blet\s+\w+\s*=/,
        /\bconst\s+\w+\s*=/,
        /=>\s*\{/,
        /\bfunction\s+\w+\s*\(/,
        /document\s*\.\s*querySelector/,
        /<[a-z][\s\S]*>/i,
        /\{\s*[\w-]+\s*:\s*[^}]+\}/
    ];
    return patterns.some(function (p) { return p.test(code); });
}

function initSkulpt() {
    const Sk = window.Sk;
    if (typeof Sk === "undefined") return null;
    Sk.configure({
        output: function () {},
        read: function (x) {
            if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) {
                throw "File not found: '" + x + "'";
            }
            return Sk.builtinFiles["files"][x];
        },
        __future__: Sk.python3,
        inputfun: function (prompt) { return window.prompt(prompt) || ""; },
        inputfunTakesPrompt: true
    });
    return Sk;
}

export function initEditor() {
    const input = document.getElementById("code-input");
    const output = document.getElementById("code-output");
    const runButton = document.getElementById("run-button");
    const clearButton = document.getElementById("clear-button");
    const snippetSelect = document.getElementById("snippet-select");
    if (!input || !runButton || !output) return;
    input.value = SNIPPETS.hello;
    if (snippetSelect) {
        snippetSelect.addEventListener("change", function () {
            const key = snippetSelect.value;
            if (SNIPPETS[key]) {
                input.value = SNIPPETS[key];
                output.textContent = "";
                input.focus();
            }
        });
    }
    runButton.addEventListener("click", async function () {
        const code = input.value;
        output.textContent = "";
        if (!code.trim()) {
            output.textContent = "Escreva algum código Python para executar.";
            return;
        }
        if (looksLikeOtherLanguage(code)) {
            output.textContent = "Este terminal aceita apenas Python.";
            return;
        }
        const Sk = initSkulpt();
        if (!Sk) {
            output.textContent = "Erro: o interpretador Python ainda não carregou. Aguarde alguns segundos e tente novamente.";
            return;
        }
        const startTime = Date.now();
        let buffer = "";
        Sk.configure({
            output: function (text) {
                buffer += text;
                output.textContent = buffer;
            },
            read: function (x) {
                if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) {
                    throw "File not found: '" + x + "'";
                }
                return Sk.builtinFiles["files"][x];
            },
            __future__: Sk.python3,
            inputfun: function (prompt) { return window.prompt(prompt) || ""; },
            inputfunTakesPrompt: true
        });
        try {
            await Sk.misceval.asyncToPromise(function () {
                return Sk.importMainWithBody("<stdin>", false, code, true);
            });
            const elapsed = Date.now() - startTime;
            buffer += (buffer ? "\n" : "") + "Concluído em " + elapsed + "ms";
            output.textContent = buffer;
            fireConfetti();
        } catch (error) {
            const message = error && error.toString ? error.toString() : String(error);
            output.textContent = "Erro: " + message;
        }
    });
    clearButton.addEventListener("click", function () {
        input.value = "";
        output.textContent = "";
        input.focus();
    });
}
