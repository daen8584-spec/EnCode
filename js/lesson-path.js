import { LESSONS, UNITS } from "./lessons-data.js";
import { loadProgress } from "./progress-service.js";
import { createEl } from "./utils.js";

const ICONS = {
    completed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="26" height="26"><path d="M4 12l5 5L20 6"/></svg>',
    current: '<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M8 5v14l11-7z"/></svg>',
    locked: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/></svg>'
};

let currentLang = "python";

const findLesson = (id) => LESSONS.find((l) => l.id === id);

function renderNode(lesson, isCompleted, isCurrent, isLocked) {
    const wrapper = createEl("div", "roadmap-node-wrapper");
    const node = createEl("button", "roadmap-node");
    node.type = "button";
    node.disabled = isLocked;

    if (isCompleted) node.classList.add("is-completed");
    else if (isCurrent) node.classList.add("is-current");
    else node.classList.add("is-locked");

    const circle = createEl("span", "roadmap-node-circle");
    circle.innerHTML = isCompleted ? ICONS.completed : isCurrent ? ICONS.current : ICONS.locked;

    const label = createEl("span", "roadmap-node-label", lesson.title);

    node.appendChild(circle);
    node.appendChild(label);

    if (!isLocked) {
        node.addEventListener("click", () => { window.location.href = `lesson.html?id=${lesson.id}`; });
    }

    wrapper.appendChild(node);
    return wrapper;
}

function renderUnit(unit, unitIndex, completed) {
    const unitEl = createEl("div", "roadmap-unit");
    const header = createEl("div", "roadmap-unit-header");

    header.appendChild(createEl("span", "roadmap-unit-index", `Unidade ${unitIndex + 1}`));
    header.appendChild(createEl("h2", "roadmap-unit-title", unit.title));
    header.appendChild(createEl("p", "roadmap-unit-description", unit.description));
    unitEl.appendChild(header);

    const path = createEl("div", "roadmap-path");

    unit.lessons.forEach((lessonId, index) => {
        const lesson = findLesson(lessonId);
        if (!lesson) return;

        const isCompleted = completed.includes(lessonId);
        const prevId = index === 0 ? null : unit.lessons[index - 1];
        const isPrevCompleted = prevId === null || completed.includes(prevId);
        const isCurrent = !isCompleted && isPrevCompleted;
        const isLocked = !isCompleted && !isPrevCompleted;

        const nodeWrapper = renderNode(lesson, isCompleted, isCurrent, isLocked);
        path.appendChild(nodeWrapper);

        if (index < unit.lessons.length - 1) {
            const connector = createEl("div", "roadmap-connector");
            if (isCompleted) connector.classList.add("is-completed");
            nodeWrapper.appendChild(connector);
        }
    });

    unitEl.appendChild(path);
    return unitEl;
}

async function renderPath(container) {
    let completed = [];
    try {
        completed = (await loadProgress()).completedLessons ?? [];
    } catch {}

    const units = UNITS.filter((u) => (u.lang ?? "python") === currentLang);
    container.replaceChildren();

    if (!units.length) {
        container.appendChild(createEl("div", "roadmap-empty", "Novas lições em breve."));
        return;
    }

    units.forEach((unit, index) => container.appendChild(renderUnit(unit, index, completed)));
}

export async function initLessonPath() {
    const container = document.getElementById("lessons-path-container");
    if (!container) return;

    document.querySelectorAll(".language-tab").forEach((tab) => {
        tab.disabled = false;
        tab.addEventListener("click", () => {
            const lang = tab.dataset.lang;
            if (!lang || lang === currentLang) return;
            currentLang = lang;
            document.querySelectorAll(".language-tab").forEach((t) => {
                t.classList.toggle("is-active", t.dataset.lang === lang);
            });
            renderPath(container);
        });
    });

    await renderPath(container);
}
