import { LESSONS, UNITS } from "./lessons-data.js";
import { loadProgress } from "./progress-service.js";

const ICONS = {
    completed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="26" height="26"><path d="M4 12l5 5L20 6"/></svg>',
    current: '<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M8 5v14l11-7z"/></svg>',
    locked: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/></svg>'
};

let currentLang = "python";

export async function initLessonPath() {
    const container = document.getElementById("lessons-path-container");
    if (!container) return;

    const tabs = document.querySelectorAll(".language-tab");
    tabs.forEach(function (tab) {
        tab.disabled = false;
        tab.addEventListener("click", function () {
            const lang = tab.getAttribute("data-lang");
            if (!lang || lang === currentLang) return;
            currentLang = lang;
            tabs.forEach(function (t) {
                t.classList.toggle("is-active", t.getAttribute("data-lang") === lang);
            });
            renderPath(container);
        });
    });

    await renderPath(container);
}

async function renderPath(container) {
    let completed = [];
    try {
        const progress = await loadProgress();
        completed = progress.completedLessons || [];
    } catch (e) {
        completed = [];
    }

    const filteredUnits = UNITS.filter(function (u) {
        return (u.lang || "python") === currentLang;
    });

    container.innerHTML = "";

    if (filteredUnits.length === 0) {
        const empty = document.createElement("div");
        empty.className = "roadmap-empty";
        empty.textContent = "Novas lições em breve.";
        container.appendChild(empty);
        return;
    }

    filteredUnits.forEach(function (unit, unitIndex) {
        const unitEl = document.createElement("div");
        unitEl.className = "roadmap-unit";

        const header = document.createElement("div");
        header.className = "roadmap-unit-header";

        const indexSpan = document.createElement("span");
        indexSpan.className = "roadmap-unit-index";
        indexSpan.textContent = "Unidade " + (unitIndex + 1);

        const titleEl = document.createElement("h2");
        titleEl.className = "roadmap-unit-title";
        titleEl.textContent = unit.title;

        const descEl = document.createElement("p");
        descEl.className = "roadmap-unit-description";
        descEl.textContent = unit.description;

        header.appendChild(indexSpan);
        header.appendChild(titleEl);
        header.appendChild(descEl);
        unitEl.appendChild(header);

        const path = document.createElement("div");
        path.className = "roadmap-path";

        unit.lessons.forEach(function (lessonId, lessonIndex) {
            const lesson = LESSONS.find(function (l) { return l.id === lessonId; });
            if (!lesson) return;

            const isCompleted = completed.indexOf(lessonId) !== -1;
            const prevId = lessonIndex === 0 ? null : unit.lessons[lessonIndex - 1];
            const isPrevCompleted = prevId === null || completed.indexOf(prevId) !== -1;
            const isCurrent = !isCompleted && isPrevCompleted;
            const isLocked = !isCompleted && !isPrevCompleted;

            const wrapper = document.createElement("div");
            wrapper.className = "roadmap-node-wrapper";

            const node = document.createElement("button");
            node.type = "button";
            node.className = "roadmap-node";
            if (isCompleted) node.classList.add("is-completed");
            else if (isCurrent) node.classList.add("is-current");
            else node.classList.add("is-locked");
            node.disabled = isLocked;

            const circle = document.createElement("span");
            circle.className = "roadmap-node-circle";
            if (isCompleted) circle.innerHTML = ICONS.completed;
            else if (isCurrent) circle.innerHTML = ICONS.current;
            else circle.innerHTML = ICONS.locked;

            const label = document.createElement("span");
            label.className = "roadmap-node-label";
            label.textContent = lesson.title;

            node.appendChild(circle);
            node.appendChild(label);

            if (!isLocked) {
                node.addEventListener("click", function () {
                    window.location.href = "lesson.html?id=" + lessonId;
                });
            }

            wrapper.appendChild(node);

            if (lessonIndex < unit.lessons.length - 1) {
                const connector = document.createElement("div");
                connector.className = "roadmap-connector";
                if (isCompleted) connector.classList.add("is-completed");
                wrapper.appendChild(connector);
            }

            path.appendChild(wrapper);
        });

        unitEl.appendChild(path);
        container.appendChild(unitEl);
    });
}


// 1791514044
