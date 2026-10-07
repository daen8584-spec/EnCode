const SNIPPETS = {
    hello: "console.log('Ola, mundo!');",
    loop: "for (let i = 1; i <= 5; i++) {\n    console.log('Contando: ' + i);\n}",
    "function": "function saudacao(nome) {\n    return 'Ola, ' + nome + '!';\n}\n\nconsole.log(saudacao('EnCoder'));"
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
    if (xpFill) {
        setTimeout(function () { xpFill.style.width = "45%"; }, 200);
    }
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

export function initEditor() {
    const input = document.getElementById("code-input");
    const output = document.getElementById("code-output");
    const runButton = document.getElementById("run-button");
    const clearButton = document.getElementById("clear-button");
    const snippetSelect = document.getElementById("snippet-select");
    if (!input || !runButton) return;
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
    const originalLog = console.log;
    runButton.addEventListener("click", function () {
        output.textContent = "";
        const lines = [];
        const startTime = Date.now();
        console.log = function () {
            const args = Array.prototype.slice.call(arguments);
            lines.push("> " + args.map(function (a) {
                return typeof a === "object" ? JSON.stringify(a) : String(a);
            }).join(" "));
            output.textContent = lines.join("\n");
            originalLog.apply(console, args);
        };
        let hasError = false;
        try {
            new Function(input.value)();
        } catch (error) {
            hasError = true;
            output.textContent = "Erro: " + error.message;
        } finally {
            console.log = originalLog;
        }
        if (!hasError) {
            const elapsed = Date.now() - startTime;
            lines.push("");
            lines.push("Concluido em " + elapsed + "ms");
            output.textContent = lines.join("\n");
            fireConfetti();
        }
    });
    clearButton.addEventListener("click", function () {
        input.value = "";
        output.textContent = "";
        input.focus();
    });
}
