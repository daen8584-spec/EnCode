import { requireUser } from "./auth.js";
import { findTrack, TRACKS } from "./content.js";
import { $, h } from "./dom.js";
import { loadUserData } from "./progress.js";

const ICONS = {
    done: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l5 5L20 6"/></svg>',
    current: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>',
    locked: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
    challenge: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3"/></svg>'
};

await requireUser();
const completed = new Set((await loadUserData()).completedLessons);

const stateOf = (lesson) => completed.has(lesson.id) ? "done"
    : !lesson.previous || completed.has(lesson.previous.id) ? "current"
    : "locked";

function renderLesson(lesson) {
    const state = stateOf(lesson);
    const icon = lesson.challenge && state === "current" ? ICONS.challenge : ICONS[state];
    const content = [
        h("span", { className: "node-circle", innerHTML: icon }),
        h("span", { className: "node-label", textContent: lesson.title })
    ];
    return h("li", { className: `node is-${state}${lesson.challenge ? " is-challenge" : ""}` }, state === "locked"
        ? h("span", { className: "node-link", ariaDisabled: "true" }, content)
        : h("a", { className: "node-link", href: `lesson.html?id=${lesson.id}` }, content));
}

function show(trackId) {
    const track = findTrack(trackId);
    history.replaceState(null, "", `?track=${track.id}`);
    for (const tab of $("tabs").children) tab.ariaPressed = tab.value === track.id;
    $("units").replaceChildren(...track.units.map((unit, i) => h("section", { className: "unit" },
        h("header", { className: "unit-header card" },
            h("span", { className: "unit-index", textContent: `Unidade ${i + 1}` }),
            h("h2", { textContent: unit.title }),
            h("p", { textContent: unit.description })
        ),
        h("ol", { className: "path" }, unit.lessons.map(renderLesson))
    )));
}

$("tabs").append(...TRACKS.map((track) => h("button", {
    type: "button",
    className: "tab",
    value: track.id,
    textContent: track.name,
    onclick: () => show(track.id)
})));

show(new URLSearchParams(location.search).get("track"));
