import { displayName, logOut, requireUser } from "./auth.js";
import { ALL_LESSONS, TRACKS } from "./content.js";
import { $, h } from "./dom.js";
import { createMascot } from "./mascot.js";
import { initProfile } from "./profile.js";
import { currentStreak, LEVEL_XP, levelOf, loadUserData } from "./progress.js";
import { loadPython, runPython } from "./python.js";

const SNIPPETS = {
    hello: "print('Olá, mundo!')",
    loop: "for i in range(1, 6):\n    print('Contando:', i)",
    function: "def saudacao(nome):\n    return 'Olá, ' + nome + '!'\n\nprint(saudacao('EnCoder'))"
};

const TIPS = [
    "Errou algo? Em Praticar eu trago esses exercícios de volta.",
    "No Dicionário ficam todas as palavras em inglês que você aprendeu.",
    "No Editor você pode testar qualquer código Python.",
    "Estudar um pouco todo dia mantém sua sequência acesa!",
    "Nos desafios, a XP vale o dobro."
];

const user = await requireUser();
const data = await loadUserData();
const completed = new Set(data.completedLessons);
const words = ALL_LESSONS.filter((lesson) => completed.has(lesson.id)).flatMap((lesson) => lesson.teach).filter((card) => card.meaning).length;

function countUp(element, to) {
    const start = performance.now();
    const tick = (now) => {
        const t = Math.min(1, (now - start) / 800);
        element.textContent = Math.round(to * (1 - (1 - t) ** 3));
        if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

function initGuide(next) {
    const guide = createMascot();
    let tip = 0;
    $("hero-mascot").append(guide.root);
    const name = displayName(user).split(" ")[0];
    guide.say(next ? `Olá, ${name}! Que tal continuar com “${next.title}”?` : `Olá, ${name}! Você terminou tudo. Hora de revisar!`);
    $("hero-mascot").addEventListener("click", () => {
        guide.mood("happy");
        guide.say(TIPS[tip++ % TIPS.length]);
    });
}

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

    const next = ALL_LESSONS.find((lesson) => !completed.has(lesson.id));
    $("continue").href = next ? `lesson.html?id=${next.id}` : "lessons.html";
    $("continue").textContent = next ? `Continuar: ${next.title}` : "Revisar lições";
    initGuide(next);

    countUp($("stat-streak"), streak);
    countUp($("stat-xp"), data.xp);
    countUp($("stat-lessons"), completed.size);
    countUp($("stat-words"), words);

    const mistakes = data.mistakes.length;
    $("practice-card").hidden = completed.size === 0;
    $("practice-text").textContent = mistakes
        ? `${mistakes} ${mistakes === 1 ? "exercício que você errou espera" : "exercícios que você errou esperam"} revisão.`
        : "Revise exercícios das lições que você já fez e ganhe XP.";

    $("tracks").append(...TRACKS.map((track, i) => {
        const done = track.lessons.filter((lesson) => completed.has(lesson.id)).length;
        return h("a", { className: `track card is-${track.id}`, href: `lessons.html?track=${track.id}`, style: `--i: ${i}` },
            h("span", { className: "track-icon", textContent: track.icon }),
            h("h2", { textContent: track.name }),
            h("p", { textContent: track.description }),
            h("div", { className: "bar" }, h("div", { className: "bar-fill", style: `width: ${(done / track.lessons.length) * 100}%` })),
            h("span", { className: "track-count", textContent: `${done} de ${track.lessons.length} lições` })
        );
    }));
}

const fold = (text) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

function renderGlossary() {
    const entries = TRACKS.flatMap((track) => track.lessons.flatMap((lesson) => lesson.teach
        .filter((card) => card.meaning)
        .map((card) => ({ ...card, track, unlocked: completed.has(lesson.id) }))));
    const unlocked = entries.filter((entry) => entry.unlocked);
    const locked = entries.length - unlocked.length;

    const show = (query = "") => {
        const matches = unlocked.filter((entry) => fold(`${entry.term} ${entry.meaning}`).includes(fold(query)));
        $("glossary").replaceChildren(...matches.map((entry) => h("article", { className: `word card is-${entry.track.id}` },
            h("span", { className: "word-track", textContent: entry.track.name }),
            h("code", { className: "word-term", textContent: entry.term }),
            h("p", { className: "word-meaning", textContent: entry.meaning }),
            h("p", { className: "word-detail", textContent: entry.lines.slice(1).join(" ") })
        )));
        $("glossary-empty").hidden = matches.length > 0 || unlocked.length === 0;
    };

    $("glossary-count").textContent = unlocked.length
        ? `${unlocked.length} ${unlocked.length === 1 ? "palavra aprendida" : "palavras aprendidas"}${locked ? `, ${locked} para desbloquear` : ""}.`
        : `Complete lições para desbloquear ${locked} palavras.`;
    $("glossary-search").hidden = unlocked.length === 0;
    $("glossary-search").addEventListener("input", ({ target }) => show(target.value));
    show();
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
renderGlossary();
initEditor();
initProfile(user, data);
document.body.classList.remove("is-loading");
