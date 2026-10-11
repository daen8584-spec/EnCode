import { auth } from "./firebase-config.js";
import { LESSONS, UNITS, LESSON_XP_BASE, EXERCISE_XP } from "./lessons-data.js";
import { loadProgress, addXpAndStreak, markLessonComplete } from "./progress-service.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { sanitizeCode, createEl } from "./utils.js";

const state = {
    lesson: null,
    steps: [],
    stepIndex: 0,
    user: null,
    answered: false,
    correctCount: 0
};

const el = {
    title: document.getElementById("lesson-title"),
    instruction: document.getElementById("lesson-instruction"),
    body: document.getElementById("lesson-body"),
    feedback: document.getElementById("lesson-feedback"),
    action: document.getElementById("lesson-action"),
    progressFill: document.getElementById("lesson-progress-fill"),
    counterCurrent: document.getElementById("lesson-current"),
    counterTotal: document.getElementById("lesson-total"),
    mascot: document.getElementById("lesson-mascot"),
    celebration: document.getElementById("lesson-celebration"),
    celebrationXp: document.getElementById("celebration-xp"),
    celebrationContinue: document.getElementById("celebration-continue"),
    celebrationRepeat: document.getElementById("celebration-repeat"),
    close: document.getElementById("lesson-close")
};

const letters = ["A", "B", "C", "D", "E"];

const normalizeOutput = (text) => String(text)
    .replace(/\r\n/g, "\n")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, "\"")
    .replace(/\s+$/g, "")
    .trim();

const collapseWhitespace = (text) => text.replace(/\s+/g, " ").trim();

const sanitizeCode = (code) => code
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, "\"")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u00A0/g, " ")
    .replace(/\u2192/g, "->")
    .replace(/\u21D2/g, "=>");

function setMascot(kind) {
    el.mascot.classList.remove("is-idle", "is-happy", "is-sad");
    el.mascot.classList.add(`is-${kind}`);
}

function updateProgressBar() {
    const total = state.steps.length;
    const percent = (state.stepIndex / total) * 100;
    el.progressFill.style.width = `${percent}%`;
    el.counterCurrent.textContent = String(state.stepIndex + 1);
    el.counterTotal.textContent = String(total);
}

function buildSteps(lesson) {
    return [
        ...(lesson.teach ?? []).map((data) => ({ type: "teach", data })),
        ...lesson.exercises
    ];
}

function getLessonIdFromUrl() {
    return new URLSearchParams(window.location.search).get("id") ?? "";
}

function pickLesson(progress) {
    const urlId = getLessonIdFromUrl();
    const fromUrl = urlId && LESSONS.find((l) => l.id === urlId);
    if (fromUrl) return fromUrl;
    const next = LESSONS.find((l) => !progress.completedLessons.includes(l.id));
    return next ?? LESSONS[0];
}

function renderTeach(step) {
    const wrapper = createEl("div", "teach-card");

    wrapper.appendChild(createEl("span", "teach-term", step.data.term));

    const text = createEl("div", "teach-text");
    step.data.lines.forEach((line) => text.appendChild(createEl("p", null, line)));
    wrapper.appendChild(text);

    const example = createEl("div", "teach-example");
    example.appendChild(createEl("pre", "teach-code", step.data.example.code));
    example.appendChild(createEl("div", "teach-arrow", "↓"));
    example.appendChild(createEl("pre", "teach-output", step.data.example.output));
    wrapper.appendChild(example);

    return wrapper;
}

function renderMultipleChoice(exercise) {
    const container = createEl("div", "lesson-options");

    exercise.options.forEach((option, index) => {
        const btn = createEl("button", "lesson-option");
        btn.type = "button";
        btn.dataset.index = String(index);
        btn.innerHTML = `<span class="lesson-option-marker">${letters[index]}</span><span>${option}</span>`;

        btn.addEventListener("click", () => {
            if (state.answered) return;
            state.answered = true;
            container.querySelectorAll(".lesson-option").forEach((b) => {
                b.disabled = true;
                const i = Number(b.dataset.index);
                if (i === exercise.correct) b.classList.add("is-correct");
                else if (i === index) b.classList.add("is-wrong");
            });
            handleAnswer(index === exercise.correct);
        });

        container.appendChild(btn);
    });

    return container;
}

function renderFillBlank(exercise) {
    const wrapper = createEl("div", "lesson-editor");
    const [before, after] = exercise.codeTemplate.split("___");

    const block = createEl("pre", "lesson-output");
    block.appendChild(document.createTextNode(before));
    const blank = createEl("span", null, "___");
    blank.classList.add("lesson-blank-marker");
    block.appendChild(blank);
    block.appendChild(document.createTextNode(after ?? ""));

    const input = createEl("input", "lesson-code-input");
    input.type = "text";
    input.classList.add("lesson-code-input--inline");
    input.placeholder = exercise.placeholder ?? "Digite aqui";
    input.autocapitalize = "off";
    input.autocomplete = "off";
    input.spellcheck = false;

    input.addEventListener("input", () => {
        el.action.disabled = !input.value.trim().length;
    });

    wrapper.appendChild(block);
    wrapper.appendChild(input);
    wrapper._checkAnswer = () => normalizeOutput(input.value).toLowerCase() === normalizeOutput(exercise.answer).toLowerCase();

    return wrapper;
}

function renderWriteCode(exercise) {
    const wrapper = createEl("div", "lesson-editor");

    wrapper.appendChild(createEl("div", "lesson-output-header", "Saída esperada"));
    const expected = createEl("pre", "lesson-output lesson-output--hint", exercise.expectedOutput);
    wrapper.appendChild(expected);

    const input = createEl("textarea", "lesson-code-input");
    input.spellcheck = false;
    input.autocapitalize = "off";
    input.autocomplete = "off";
    input.value = exercise.starter ?? "";

    input.addEventListener("input", () => {
        el.action.disabled = !input.value.trim().length;
    });

    wrapper.appendChild(input);

    wrapper._checkAnswer = () => {
        const Sk = window.Sk;
        if (typeof Sk === "undefined") return Promise.resolve(false);

        let buffer = "";
        Sk.configure({
            output: (text) => { buffer += text; },
            read: (x) => {
                if (!Sk.builtinFiles?.files?.[x]) throw `File not found: '${x}'`;
                return Sk.builtinFiles.files[x];
            },
            __future__: Sk.python3,
            inputfun: () => "",
            inputfunTakesPrompt: true
        });

        const code = sanitizeCode(input.value);
        const expectedOut = normalizeOutput(exercise.expectedOutput);

        return Sk.misceval.asyncToPromise(() => Sk.importMainWithBody("<stdin>", false, code, true))
            .then(() => new Promise((resolve) => {
                setTimeout(() => {
                    const userOut = normalizeOutput(buffer);
                    if (userOut === expectedOut) return resolve(true);
                    resolve(collapseWhitespace(userOut) === collapseWhitespace(expectedOut));
                }, 80);
            }))
            .catch(() => false);
    };

    return wrapper;
}

function renderWriteHtml(exercise) {
    const wrapper = createEl("div", "lesson-editor");

    wrapper.appendChild(createEl("div", "lesson-output-header", "Escreva seu código HTML"));

    const hint = createEl("pre", "lesson-output lesson-output--hint", `Exemplo: ${exercise.expectedPattern}`);
    wrapper.appendChild(hint);

    const input = createEl("textarea", "lesson-code-input");
    input.spellcheck = false;
    input.autocapitalize = "off";
    input.autocomplete = "off";
    input.value = exercise.starter ?? "";
    input.placeholder = "<h1>Olá</h1>";

    input.addEventListener("input", () => {
        el.action.disabled = !input.value.trim().length;
    });

    wrapper.appendChild(input);

    wrapper._checkAnswer = () => {
        const clean = (str) => String(str).replace(/\s+/g, "").toLowerCase();
        return clean(input.value) === clean(exercise.expectedPattern);
    };

    return wrapper;
}

function renderWriteCss(exercise) {
    const wrapper = createEl("div", "lesson-editor");

    wrapper.appendChild(createEl("div", "lesson-output-header", "Escreva seu código CSS"));

    const input = createEl("textarea", "lesson-code-input");
    input.spellcheck = false;
    input.autocapitalize = "off";
    input.autocomplete = "off";
    input.value = exercise.starter ?? "";
    input.placeholder = "p { color: red; }";

    input.addEventListener("input", () => {
        el.action.disabled = !input.value.trim().length;
    });

    wrapper.appendChild(input);

    wrapper._checkAnswer = () => {
        const clean = (str) => String(str).replace(/\s+/g, "").replace(/"/g, "'").toLowerCase();
        return clean(input.value) === clean(exercise.expectedPattern);
    };

    return wrapper;
}

const RENDERERS = {
    "multiple-choice": renderMultipleChoice,
    "fill-blank": renderFillBlank,
    "write-code": renderWriteCode,
    "write-html": renderWriteHtml,
    "write-css": renderWriteCss
};

function renderStep() {
    state.answered = false;
    el.feedback.hidden = true;
    el.feedback.className = "lesson-feedback";
    el.action.classList.remove("is-success", "is-error");
    el.body.replaceChildren();

    const step = state.steps[state.stepIndex];
    updateProgressBar();

    if (step.type === "teach") {
        el.title.style.display = "none";
        el.instruction.style.display = "none";
        el.body.appendChild(renderTeach(step));
        el.action.textContent = "Entendi";
        el.action.disabled = false;
        setMascot("idle");
        return;
    }

    el.title.style.display = "";
    el.instruction.style.display = "";
    el.title.textContent = state.lesson.title;
    el.instruction.textContent = step.question ?? "";
    el.action.textContent = "Verificar";
    el.action.disabled = step.type !== "multiple-choice";

    const renderer = RENDERERS[step.type] ?? renderWriteCode;
    const node = renderer(step);
    el.body.appendChild(node);
    el.body._currentExercise = node;

    if (step.type !== "multiple-choice") {
        const input = node.querySelector("input, textarea");
        if (input) {
            if (step.type === "fill-blank") input.value = "";
            el.action.disabled = !input.value.trim().length;
            setTimeout(() => input.focus(), 100);
        }
    }
}

function handleAnswer(isCorrect) {
    state.answered = true;
    el.feedback.hidden = false;
    el.feedback.className = `lesson-feedback is-${isCorrect ? "correct" : "wrong"}`;

    const icon = createEl("span", "lesson-feedback-icon", isCorrect ? "✓" : "✕");
    const text = createEl("span", null, isCorrect ? "Correto!" : "Não foi dessa vez. Continue!");
    el.feedback.replaceChildren(icon, text);

    if (isCorrect) {
        state.correctCount += 1;
        setMascot("happy");
    } else {
        setMascot("sad");
    }

    el.action.disabled = false;
    el.action.classList.add(isCorrect ? "is-success" : "is-error");
    el.action.textContent = "Continuar";
}

async function advanceStep() {
    state.stepIndex += 1;
    if (state.stepIndex >= state.steps.length) {
        await completeLesson();
        return;
    }
    renderStep();
}

async function completeLesson() {
    const gained = LESSON_XP_BASE + state.correctCount * EXERCISE_XP;
    el.celebrationXp.textContent = String(gained);
    el.celebration.hidden = false;
    try {
        await addXpAndStreak(gained);
        await markLessonComplete(state.lesson.id);
    } catch (error) {
        console.error("Falha ao salvar progresso:", error);
    }
}

function getNextLessonId(currentId) {
    const unit = UNITS.find((u) => u.lessons.includes(currentId));
    if (!unit) return null;

    const index = unit.lessons.indexOf(currentId);
    if (index < unit.lessons.length - 1) return unit.lessons[index + 1];

    const lang = unit.lang ?? "python";
    const sameLang = UNITS.filter((u) => (u.lang ?? "python") === lang);
    const unitIndex = sameLang.indexOf(unit);
    if (unitIndex < sameLang.length - 1) return sameLang[unitIndex + 1].lessons[0];
    return null;
}

el.action.addEventListener("click", async () => {
    const step = state.steps[state.stepIndex];
    if (step.type === "teach") { advanceStep(); return; }

    if (!state.answered) {
        const node = el.body._currentExercise;
        if (!node) return;
        el.action.disabled = true;
        el.action.textContent = "Verificando...";

        let correct = false;
        try {
            const result = await node._checkAnswer();
            correct = result === true;
        } catch {}

        handleAnswer(correct);
        return;
    }

    setMascot("idle");
    advanceStep();
});

el.close.addEventListener("click", () => { window.location.href = "lessons.html"; });

el.celebrationContinue.addEventListener("click", () => {
    const nextId = getNextLessonId(state.lesson.id);
    window.location.href = nextId ? `lesson.html?id=${nextId}` : "lessons.html";
});

el.celebrationRepeat?.addEventListener("click", () => {
    state.stepIndex = 0;
    state.correctCount = 0;
    state.answered = false;
    el.celebration.hidden = true;
    renderStep();
});

function bootstrap(user, progress) {
    state.user = user;
    state.lesson = pickLesson(progress);
    state.steps = buildSteps(state.lesson);
    state.stepIndex = 0;
    state.correctCount = 0;
    renderStep();
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    const progress = await loadProgress();
    bootstrap(user, progress);
});
