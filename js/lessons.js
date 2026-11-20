import { requireUser } from "./auth.js";
import { findTrack, TRACKS } from "./content.js";
import { $, h } from "./dom.js";
import { createMascot } from "./mascot.js";
import { currentStreak, loadUserData } from "./progress.js";

const svg = (path) => `<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
const ICONS = {
    done: svg('<path d="M4 12l5 5L20 6"/>'),
    current: svg('<path d="M8 5v14l11-7z" fill="currentColor"/>'),
    locked: svg('<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>'),
    machine: svg('<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>'),
    challenge: svg('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3"/>')
};
const SVG_NS = "http://www.w3.org/2000/svg";

await requireUser();
const data = await loadUserData();
const completed = new Set(data.completedLessons);
$("hud-streak").textContent = currentStreak(data);
$("hud-xp").textContent = data.xp;

const stateOf = (lesson) => completed.has(lesson.id) ? "done"
    : !lesson.previous || completed.has(lesson.previous.id) ? "current"
    : "locked";
const wordsOf = (lessons) => lessons.flatMap((lesson) => lesson.teach.filter((card) => card.meaning).map((card) => ({ ...card, learned: completed.has(lesson.id) })));
const xpOf = (lesson) => 10 * (lesson.challenge ? 2 : 1) + 2 * lesson.exercises.length;
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

function closePreviews() {
    for (const node of document.querySelectorAll(".node.is-open")) {
        node.classList.remove("is-open");
        node.querySelector(".node-button").ariaExpanded = "false";
    }
}

function preview(lesson, state) {
    const words = wordsOf([lesson]);
    const meta = [
        lesson.teach.length && plural(lesson.teach.length, "explicação", "explicações"),
        plural(lesson.exercises.length, "exercício", "exercícios"),
        `+${xpOf(lesson)} XP`
    ].filter(Boolean).join(" · ");
    return h("div", { className: "node-pop", onclick: (event) => event.stopPropagation() },
        h("strong", { textContent: lesson.title }),
        h("span", { className: "pop-meta", textContent: meta }),
        words.length > 0 && h("ul", { className: "pop-words" }, words.map((card) => h("li", {}, h("code", { textContent: card.term }), card.meaning))),
        state === "locked"
            ? h("p", { className: "pop-locked", textContent: `Termine “${lesson.previous.title}” para desbloquear.` })
            : h("a", {
                className: `button is-small${state === "done" ? " is-ghost" : ""}`,
                href: `lesson.html?id=${lesson.id}`,
                textContent: state === "done" ? "Revisar aula" : lesson.challenge ? "Aceitar desafio" : lesson.machine ? "Consertar máquinas" : "Começar aula"
            })
    );
}

// Lessons wind left and right; a trail is drawn through them and the mascot waits at the current one.
function renderLesson(lesson, i) {
    const state = stateOf(lesson);
    const offset = Math.round(Math.sin(i * 0.95) * 90);
    const special = lesson.challenge ? "challenge" : lesson.machine ? "machine" : null;
    const icon = special && state !== "done" ? ICONS[special] : ICONS[state];
    const button = h("button", { type: "button", className: "node-button", ariaExpanded: "false" },
        h("span", { className: "node-circle", innerHTML: icon }),
        h("span", { className: "node-label", textContent: lesson.title })
    );
    const classes = ["node", `is-${state}`, special && `is-${special}`, offset > 0 && "is-label-left"].filter(Boolean).join(" ");
    const node = h("li", { className: classes, style: `--x: ${offset}px; --i: ${i}` },
        state === "current" && h("span", { className: "node-start", textContent: completed.size ? "Continuar" : "Começar" }),
        button,
        preview(lesson, state)
    );
    node.dataset.x = offset;
    button.addEventListener("click", (event) => {
        event.stopPropagation();
        const open = !node.classList.contains("is-open");
        closePreviews();
        node.classList.toggle("is-open", open);
        button.ariaExpanded = open;
    });

    if (state === "current") {
        // Names sit on the inner side of each lesson, so the mascot stands on the outer side.
        const guide = createMascot({ className: `map-mascot ${offset > 0 ? "is-right" : "is-left"}` });
        guide.mood("point");
        node.append(guide.root);
    }
    return node;
}

// Layout positions (offsetTop/Left) ignore the entrance animation, so the trail is stable while nodes animate in.
function drawTrail(trail) {
    const path = trail.querySelector(".path");
    const points = [...trail.querySelectorAll(".node")].map((node) => {
        const circle = node.querySelector(".node-circle");
        return {
            x: path.offsetLeft + node.offsetLeft + circle.offsetLeft + circle.offsetWidth / 2 + Number(node.dataset.x),
            y: path.offsetTop + node.offsetTop + circle.offsetTop + circle.offsetHeight / 2,
            done: node.classList.contains("is-done")
        };
    });
    const curve = (list) => list.map((p, i) => i === 0 ? `M${p.x} ${p.y}`
        : `C${list[i - 1].x} ${(list[i - 1].y + p.y) / 2} ${p.x} ${(list[i - 1].y + p.y) / 2} ${p.x} ${p.y}`).join(" ");
    const reached = points.findIndex((p) => !p.done);
    const line = document.createElementNS(SVG_NS, "svg");
    line.setAttribute("class", "trail-line");
    line.setAttribute("aria-hidden", "true");
    line.setAttribute("viewBox", `0 0 ${trail.clientWidth} ${trail.clientHeight}`);
    const base = document.createElementNS(SVG_NS, "path");
    base.setAttribute("class", "trail-base");
    base.setAttribute("d", curve(points));
    line.append(base);
    const doneUntil = reached === -1 ? points.length : reached + 1;
    if (doneUntil > 1) {
        const progress = document.createElementNS(SVG_NS, "path");
        progress.setAttribute("class", "trail-done");
        progress.setAttribute("d", curve(points.slice(0, doneUntil)));
        line.append(progress);
    }
    trail.querySelector(".trail-line")?.remove();
    trail.prepend(line);
}

const drawAll = () => document.querySelectorAll(".trail").forEach(drawTrail);

function renderSide(track) {
    const done = track.lessons.filter((lesson) => completed.has(lesson.id)).length;
    const percent = Math.round((done / track.lessons.length) * 100);
    const next = track.lessons.find((lesson) => !completed.has(lesson.id));
    const words = wordsOf(track.lessons);
    const learned = words.filter((word) => word.learned).length;

    $("side").replaceChildren(
        h("section", { className: "side-card side-progress" },
            h("div", { className: "ring", style: `--p: ${done / track.lessons.length}` }, h("b", { textContent: `${percent}%` })),
            h("div", {},
                h("strong", { textContent: track.name }),
                h("p", { className: "muted", textContent: `${done} de ${plural(track.lessons.length, "aula concluída", "aulas concluídas")}` })
            )
        ),
        h("section", { className: "side-card side-next" },
            h("span", { className: "eyebrow", textContent: next ? "Próxima aula" : "Trilha concluída" }),
            h("strong", { textContent: next ? next.title : "Você terminou todas as aulas!" }),
            next && h("p", { className: "muted", textContent: plural(next.exercises.length, "exercício", "exercícios") + ` · +${xpOf(next)} XP` }),
            h("a", { className: "button", href: next ? `lesson.html?id=${next.id}` : "lesson.html?review", textContent: next ? (done ? "Continuar" : "Começar") : "Praticar" })
        ),
        h("section", { className: "side-card side-words" },
            h("div", { className: "side-head" },
                h("strong", { textContent: "Palavras da trilha" }),
                h("span", { className: "muted", textContent: `${learned}/${words.length}` })
            ),
            h("ul", {}, words.map((word) => word.learned
                ? h("li", { className: "is-learned", title: word.meaning }, h("code", { textContent: word.term }), h("span", { textContent: word.meaning }))
                : h("li", { className: "is-hidden" }, h("code", { textContent: "•".repeat(Math.min(word.term.length, 6)) }), h("span", { textContent: "bloqueada" }))))
        )
    );
}

function show(trackId) {
    const track = findTrack(trackId);
    history.replaceState(null, "", `?track=${track.id}`);
    document.body.dataset.track = track.id;
    for (const tab of $("tabs").children) tab.ariaPressed = tab.value === track.id;

    $("units").replaceChildren(...track.units.map((unit, i) => {
        const done = unit.lessons.filter((lesson) => completed.has(lesson.id)).length;
        const words = wordsOf(unit.lessons);
        return h("section", { className: "unit" },
            h("header", { className: "unit-banner" },
                h("span", { className: "unit-index", textContent: `Unidade ${i + 1} · ${done}/${unit.lessons.length}` }),
                h("h2", { textContent: unit.title }),
                h("p", { textContent: unit.description }),
                words.length > 0 && h("ul", { className: "unit-words" }, words.map((word) => h("li", { textContent: word.term })))
            ),
            h("div", { className: "trail" }, h("ol", { className: "path" }, unit.lessons.map(renderLesson)))
        );
    }));
    renderSide(track);
    requestAnimationFrame(drawAll);
}

$("tabs").append(...TRACKS.map((track) => {
    const done = track.lessons.filter((lesson) => completed.has(lesson.id)).length;
    return h("button", { type: "button", className: `tab is-${track.id}`, value: track.id, onclick: () => show(track.id) },
        h("span", { className: "tab-icon", textContent: track.icon }),
        h("span", { className: "tab-name", textContent: track.name }),
        h("span", { className: "tab-count", textContent: `${done}/${track.lessons.length}` }),
        h("span", { className: "tab-bar" }, h("i", { style: `width: ${(done / track.lessons.length) * 100}%` }))
    );
}));

document.addEventListener("click", closePreviews);
addEventListener("keydown", (event) => event.key === "Escape" && closePreviews());
new ResizeObserver(() => requestAnimationFrame(drawAll)).observe($("units"));
document.fonts?.ready.then(drawAll);

show(new URLSearchParams(location.search).get("track"));
document.body.classList.remove("is-loading");
const current = document.querySelector(".node.is-current");
if (current && current.getBoundingClientRect().bottom > innerHeight - 40) current.scrollIntoView({ block: "center" });
