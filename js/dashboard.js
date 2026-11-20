import { logOut, requireUser } from "./auth.js";
import { TRACKS } from "./content.js";
import { $, h } from "./dom.js";
import { initProfile } from "./profile.js";
import { currentStreak, LEVEL_XP, levelOf, loadUserData } from "./progress.js";
import { loadPython, runPython } from "./python.js";

const SNIPPETS = {
    hello: "print('Olá, mundo!')",
    loop: "for i in range(1, 6):\n    print('Contando:', i)",
    function: "def saudacao(nome):\n    return 'Olá, ' + nome + '!'\n\nprint(saudacao('EnCoder'))"
};

const user = await requireUser();
const data = await loadUserData();
const completed = new Set(data.completedLessons);

function showView() {
    const view = $(`view-${location.hash.slice(1)}`) ? location.hash.slice(1) : "home";
    for (const section of document.querySelectorAll(".view")) section.hidden = section.id !== `view-${view}`;
    for (const link of document.querySelectorAll(".nav-link")) link.ariaCurrent = link.hash === `#${view}` ? "page" : null;
    if (view === "editor") loadPython().catch(() => {});
}

function renderHome() {
    const { level, progress } = levelOf(data.xp);
    $("level").textContent = level;
    $("xp").textContent = progress;
    $("xp-fill").style.width = `${(progress / LEVEL_XP) * 100}%`;

    const streak = currentStreak(data);
    $("streak").textContent = streak
        ? `${streak} ${streak === 1 ? "dia seguido" : "dias seguidos"}`
        : "Complete uma lição para começar sua sequência";

    const next = TRACKS.flatMap((track) => track.lessons).find((lesson) => !completed.has(lesson.id));
    $("continue").href = next ? `lesson.html?id=${next.id}` : "lessons.html";
    $("continue").textContent = next ? `Continuar: ${next.title}` : "Revisar lições";

    $("tracks").append(...TRACKS.map((track) => h("a", { className: `track card is-${track.id}`, href: `lessons.html?track=${track.id}` },
        h("span", { className: "track-icon", textContent: track.icon }),
        h("h2", { textContent: track.name }),
        h("p", { textContent: track.description }),
        h("span", {
            className: "track-count",
            textContent: `${track.lessons.filter((lesson) => completed.has(lesson.id)).length} de ${track.lessons.length} lições`
        })
    )));
}

function initEditor() {
    const code = $("code");
    const output = $("output");
    const run = $("run");
    code.value = SNIPPETS.hello;

    $("snippet").addEventListener("change", ({ target }) => {
        code.value = SNIPPETS[target.value];
        output.textContent = "";
    });

    $("clear").addEventListener("click", () => {
        code.value = output.textContent = "";
        code.focus();
    });

    run.addEventListener("click", async () => {
        if (!code.value.trim()) {
            output.textContent = "Escreva algum código Python para executar.";
            return;
        }
        run.disabled = true;
        run.ariaBusy = "true";
        output.textContent = "";
        output.classList.remove("is-error");
        try {
            const result = await runPython(code.value, {
                input: (prompt) => window.prompt(prompt) ?? "",
                onOutput: (text) => { output.textContent = text; }
            });
            output.textContent = [result.output, result.error].filter(Boolean).join("\n") || "(sem saída)";
            output.classList.toggle("is-error", Boolean(result.error));
        } catch {
            output.textContent = "Não foi possível carregar o Python. Verifique sua conexão.";
        } finally {
            run.disabled = false;
            run.ariaBusy = "false";
        }
    });
}

$("sign-out").addEventListener("click", async () => {
    await logOut();
    location.replace("login.html");
});

addEventListener("hashchange", showView);
showView();
renderHome();
initEditor();
initProfile(user, data);
document.body.classList.remove("is-loading");
