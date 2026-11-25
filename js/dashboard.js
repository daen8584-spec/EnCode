import { displayName, logOut, requireUser } from "./auth.js";
import { ALL_LESSONS, TRACKS } from "./content.js";
import { $, h } from "./dom.js";
import { createMascot } from "./mascot.js";
import { initProfile } from "./profile.js";
import { dailyMission, MASCOT_NAME, openChest, rankOf } from "./game.js";
import { currentStreak, loadUserData, localDate, saveUserData } from "./progress.js";
import { loadPython, runPython } from "./python.js";

const SNIPPETS = {
    hello: "print('Olá, mundo!')",
    input: "nome = input('Qual é o seu nome? ')\nprint('Prazer, ' + nome + '!')",
    loop: "for i in range(1, 6):\n    print('Contando:', i)",
    function: "def saudacao(nome):\n    return 'Olá, ' + nome + '!'\n\nprint(saudacao('EnCoder'))"
};

const TIPS = [
    "Cumpra a missão do dia para abrir o baú de recompensa.",
    "Errou algo? Em Praticar eu trago esses exercícios de volta.",
    "No Dicionário ficam todas as palavras em inglês que você aprendeu.",
    "Ganhe XP para subir de patente: Filhote, Explorador, Inventor e Mestre.",
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

const CHEST = `<svg class="chest" viewBox="0 0 64 58" aria-hidden="true">
    <g class="chest-base"><rect x="6" y="26" width="52" height="28" rx="5" fill="#b8742f" stroke="#6e4216" stroke-width="3"/>
    <rect x="6" y="34" width="52" height="5" fill="#f4a51c"/><rect x="28" y="31" width="8" height="11" rx="2" fill="#fff3d9" stroke="#6e4216" stroke-width="2"/></g>
    <g class="chest-lid"><path d="M6 28v-6a14 14 0 0 1 14-14h24a14 14 0 0 1 14 14v6z" fill="#cf8a3c" stroke="#6e4216" stroke-width="3"/>
    <rect x="6" y="20" width="52" height="5" fill="#f4a51c"/></g></svg>`;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const firstName = displayName(user).split(" ")[0];
const guide = createMascot();
$("hero-mascot").append(guide.root);

// The home screen always offers one next step: open the chest, do the day's training, or continue the course.
function nextStep(mission) {
    const next = ALL_LESSONS.find((lesson) => !completed.has(lesson.id) && !lesson.creative);
    const mistakes = data.mistakes.length;
    if (mission.done && !mission.chestOpened) {
        return { eyebrow: "Missão cumprida!", title: "Seu baú do dia está pronto", action: "Abrir baú", chest: true,
            say: `Você cumpriu a missão do dia, ${firstName}! Abra o baú.` };
    }
    if (!mission.done && mission.id === "review") {
        return { eyebrow: "Missão do dia", title: "Treino de revisão", action: "Começar treino", href: "lesson.html?review",
            say: mistakes ? `Guardei ${mistakes} ${mistakes === 1 ? "exercício que você errou" : "exercícios que você errou"}. Vamos treinar?` : "Hoje a missão é treinar o que você já aprendeu!" };
    }
    if (next) {
        return { eyebrow: completed.size ? "Sua próxima aula" : "Sua primeira aula", title: `${next.track.name}: ${next.title}`,
            action: completed.size ? "Continuar" : "Começar agora", href: `lesson.html?id=${next.id}`,
            say: mission.done ? `Missão cumprida! Quer aprender mais, ${firstName}?` : `Oi, ${firstName}! Missão do dia: ${mission.title.toLowerCase()}.` };
    }
    return { eyebrow: "Tudo concluído", title: "Você terminou todas as aulas!", action: "Treinar", href: "lesson.html?review",
        say: "Você terminou tudo! Treine para não esquecer." };
}

function renderStatus() {
    const rank = rankOf(data.xp);
    const mission = dailyMission(data);
    const streak = currentStreak(data);
    const step = nextStep(mission);

    $("hero-eyebrow").textContent = step.eyebrow;
    $("next-title").textContent = step.title;
    $("continue").textContent = step.action;
    $("continue").href = step.href ?? "#home";
    $("continue").dataset.chest = step.chest ? "true" : "";
    $("streak").textContent = streak
        ? `${streak} ${streak === 1 ? "dia seguido" : "dias seguidos"} de aula`
        : "Complete uma aula hoje para começar sua sequência.";
    guide.say(step.say);

    $("hud-rank").innerHTML = `${rank.icon}<span>${rank.name}</span>`;
    $("hud-rank").style.setProperty("--rank", rank.color);
    $("hud-streak").textContent = streak;
    $("hud-xp").textContent = data.xp;

    $("rank-card").style.setProperty("--rank", rank.color);
    $("rank-badge").innerHTML = rank.icon;
    $("rank-name").textContent = rank.name;
    $("rank-fill").style.width = `${rank.progress * 100}%`;
    $("rank-next").textContent = rank.next ? `Faltam ${rank.toNext} XP para ${rank.next.name}` : "Você chegou à patente mais alta!";

    $("mission-title").textContent = mission.title;
    $("mission-count").textContent = `${mission.value}/${mission.goal} ${mission.unit}`;
    $("mission-fill").style.width = `${(mission.value / mission.goal) * 100}%`;
    $("mission-hint").textContent = mission.chestOpened ? "Baú aberto. Uma nova missão chega amanhã!"
        : mission.done ? "Missão cumprida! Abra o baú."
        : { first: "Comece pela primeira aula de Python.", xp: "Aulas e treinos dão XP.", lessons: "Qualquer aula conta, até as repetidas.", review: "Use o Praticar para cumprir esta missão." }[mission.id];
    const chest = $("chest-button");
    chest.innerHTML = CHEST;
    chest.disabled = !mission.done || mission.chestOpened;
    chest.className = `chest-button${mission.done && !mission.chestOpened ? " is-ready" : ""}${mission.chestOpened ? " is-open" : ""}`;

    countUp($("stat-streak"), streak);
    countUp($("stat-xp"), data.xp);
    countUp($("stat-lessons"), completed.size);
    countUp($("stat-words"), words);

    const mistakes = data.mistakes.length;
    $("practice-card").hidden = completed.size === 0;
    $("practice-text").textContent = mistakes
        ? `${mistakes} ${mistakes === 1 ? "exercício que você errou espera" : "exercícios que você errou esperam"} revisão.`
        : "Revise exercícios das lições que você já fez e ganhe XP.";
}

async function openTodaysChest() {
    const dialog = $("chest-dialog");
    const stage = $("chest-stage");
    stage.className = "chest-stage is-shaking";
    stage.innerHTML = CHEST;
    $("chest-reward").textContent = "";
    $("chest-close").hidden = true;
    dialog.showModal();
    const [reward] = await Promise.all([openChest().catch(() => null), wait(1100)]);
    stage.className = "chest-stage is-open";
    $("chest-close").hidden = false;
    if (reward === null) {
        $("chest-reward").textContent = "Não foi possível abrir o baú. Tente de novo.";
        return;
    }
    $("chest-reward").textContent = `+${reward} XP`;
    const before = rankOf(data.xp);
    data.xp += reward;
    data.chestOpened = localDate();
    const after = rankOf(data.xp);
    if (after.index > before.index) $("chest-reward").textContent += `. Nova patente: ${after.name}!`;
    renderStatus();
}

function initWelcome() {
    if (data.onboarded) return;
    const dialog = $("welcome");
    const steps = [...dialog.querySelectorAll(".welcome-step")];
    const dots = [...dialog.querySelectorAll(".welcome-dots i")];
    const mascot = createMascot();
    const lines = [`Oi, ${firstName}! Eu sou o ${MASCOT_NAME}, seu professor.`, "Pode contar comigo em cada passo.", "Pronto? Vamos juntos!"];
    let current = 0;
    $("welcome-mascot").append(mascot.root);
    $("welcome-title").textContent = "Que bom ter você na turma!";

    const show = (index) => {
        current = index;
        steps.forEach((step, i) => { step.hidden = i !== index; });
        dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
        $("welcome-next").textContent = index === steps.length - 1 ? "Começar primeira aula" : "Continuar";
        mascot.mood(index === steps.length - 1 ? "happy" : "idle");
        mascot.say(lines[index]);
    };
    const finish = async (start) => {
        data.onboarded = true;
        await saveUserData({ onboarded: true }).catch(() => {});
        if (start) location.href = `lesson.html?id=${ALL_LESSONS[0].id}`;
        else dialog.close();
    };

    $("welcome-next").addEventListener("click", () => (current < steps.length - 1 ? show(current + 1) : finish(true)));
    $("welcome-skip").addEventListener("click", () => finish(false));
    dialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        finish(false);
    });
    dialog.showModal();
    show(0);
}

function showView() {
    const view = $(`view-${location.hash.slice(1)}`) ? location.hash.slice(1) : "home";
    for (const section of document.querySelectorAll(".view")) section.hidden = section.id !== `view-${view}`;
    for (const link of document.querySelectorAll(".nav-link")) link.ariaCurrent = link.hash === `#${view}` ? "page" : null;
    if (view === "editor") loadPython().catch(() => {});
}

const CHEVRON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';

function trackCard(track, i) {
    const done = track.lessons.filter((lesson) => completed.has(lesson.id)).length;
    return h("a", { className: `track card is-${track.id}`, href: `lessons.html?track=${track.id}`, style: `--i: ${i}` },
        h("span", { className: "track-icon", textContent: track.icon }),
        h("div", { className: "track-body" },
            h("h3", { textContent: track.name }),
            h("p", { textContent: track.description }),
            h("div", { className: "track-progress" },
                h("div", { className: "bar" }, h("div", { className: "bar-fill", style: `width: ${(done / track.lessons.length) * 100}%` })),
                h("span", { className: "track-count", textContent: `${done}/${track.lessons.length}` })
            )
        ),
        h("span", { className: "track-go", innerHTML: CHEVRON })
    );
}

function renderHome() {
    renderStatus();
    $("home-tracks").append(...TRACKS.map(trackCard));
    $("tracks").append(...TRACKS.map(trackCard));

    let tip = 0;
    $("hero-mascot").addEventListener("click", () => {
        guide.mood("happy");
        guide.say(TIPS[tip++ % TIPS.length]);
    });
    $("continue").addEventListener("click", (event) => {
        if (!$("continue").dataset.chest) return;
        event.preventDefault();
        openTodaysChest();
    });
    $("chest-button").addEventListener("click", openTodaysChest);
    $("chest-close").addEventListener("click", () => $("chest-dialog").close());
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
    let answer = null; // answers the input() the program is waiting on
    code.value = SNIPPETS.hello;

    // input() asks right in the output panel, like a terminal, instead of a browser pop-up.
    const ask = (prompt) => new Promise((resolve) => {
        const field = h("input", {
            className: "console-input",
            type: "text",
            ariaLabel: prompt.trim() || "Digite a resposta e aperte Enter",
            placeholder: "Enter para enviar",
            autocomplete: "off",
            autocapitalize: "off",
            spellcheck: false
        });
        answer = (value) => {
            answer = null;
            field.replaceWith(`${value}\n`);
            resolve(value);
        };
        field.addEventListener("keydown", (event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            answer(field.value);
        });
        output.append(prompt, field);
        field.focus();
    });

    $("snippet").addEventListener("change", ({ target }) => {
        answer?.("");
        code.value = SNIPPETS[target.value];
        output.textContent = "";
    });

    $("clear").addEventListener("click", () => {
        answer?.("");
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
        let shown = 0;
        try {
            const result = await runPython(code.value, {
                input: ask,
                onOutput: (text) => {
                    output.append(text.slice(shown));
                    shown = text.length;
                }
            });
            if (result.error) output.append(`${output.textContent && !output.textContent.endsWith("\n") ? "\n" : ""}${result.error}`);
            if (!output.textContent) output.textContent = "(sem saída)";
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
initWelcome();
