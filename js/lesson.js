import { auth } from "./firebase-config.js";
import { LESSONS, LESSON_XP_BASE, EXERCISE_XP } from "./lessons-data.js";
import { loadProgress, addXpAndStreak, markLessonComplete } from "./progress-service.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const state = {
    lesson: null,
    steps: [],
    stepIndex: 0,
    user: null,
    progress: null,
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
    close: document.getElementById("lesson-close")
};

function getLessonIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id") || "";
}

function pickLesson(progress) {
    const idFromUrl = getLessonIdFromUrl();
    if (idFromUrl) {
        const found = LESSONS.find(function (l) { return l.id === idFromUrl; });
        if (found) return found;
    }
    const next = LESSONS.find(function (l) {
        return progress.completedLessons.indexOf(l.id) === -1;
    });
    return next || LESSONS[0];
}

function buildSteps(lesson) {
    const steps = [];
    if (lesson.teach) {
        lesson.teach.forEach(function (t) {
            steps.push({ type: "teach", data: t });
        });
    }
    lesson.exercises.forEach(function (ex) {
        steps.push(ex);
    });
    return steps;
}

function setMascot(state_) {
    el.mascot.classList.remove("is-idle", "is-happy", "is-sad");
    if (state_ === "happy") el.mascot.classList.add("is-happy");
    else if (state_ === "sad") el.mascot.classList.add("is-sad");
    else el.mascot.classList.add("is-idle");
}

function updateProgressBar() {
    const total = state.steps.length;
    const current = state.stepIndex;
    const percent = (current / total) * 100;
    el.progressFill.style.width = percent + "%";
    el.counterCurrent.textContent = String(current + 1);
    el.counterTotal.textContent = String(total);
}

function normalizeOutput(text) {
    return String(text)
        .replace(/\r\n/g, "\n")
        .replace(/\s+$/g, "")
        .trim();
}

function renderTeach(step) {
    const wrapper = document.createElement("div");
    wrapper.className = "teach-card";

    const term = document.createElement("span");
    term.className = "teach-term";
    term.textContent = step.data.term;

    const text = document.createElement("div");
    text.className = "teach-text";
    step.data.lines.forEach(function (line) {
        const p = document.createElement("p");
        p.textContent = line;
        text.appendChild(p);
    });

    const example = document.createElement("div");
    example.className = "teach-example";

    const code = document.createElement("pre");
    code.className = "teach-code";
    code.textContent = step.data.example.code;

    const arrow = document.createElement("div");
    arrow.className = "teach-arrow";
    arrow.textContent = "↓";

    const out = document.createElement("pre");
    out.className = "teach-output";
    out.textContent = step.data.example.output;

    example.appendChild(code);
    example.appendChild(arrow);
    example.appendChild(out);

    wrapper.appendChild(term);
    wrapper.appendChild(text);
    wrapper.appendChild(example);

    return wrapper;
}

function renderMultipleChoice(exercise) {
    const container = document.createElement("div");
    container.className = "lesson-options";
    const letters = ["A", "B", "C", "D", "E"];
    exercise.options.forEach(function (option, index) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "lesson-option";
        btn.dataset.index = String(index);
        btn.innerHTML = '<span class="lesson-option-marker">' + letters[index] + '</span><span>' + option + '</span>';
        btn.addEventListener("click", function () {
            if (state.answered) return;
            state.answered = true;
            const buttons = container.querySelectorAll(".lesson-option");
            buttons.forEach(function (b) {
                b.disabled = true;
                const idx = parseInt(b.dataset.index, 10);
                if (idx === exercise.correct) b.classList.add("is-correct");
                else if (idx === index) b.classList.add("is-wrong");
            });
            const isCorrect = index === exercise.correct;
            handleAnswer(isCorrect);
        });
        container.appendChild(btn);
    });
    return container;
}

function renderFillBlank(exercise) {
    const wrapper = document.createElement("div");
    wrapper.className = "lesson-editor";

    const codeBlock = document.createElement("pre");
    codeBlock.className = "lesson-output";
    const parts = exercise.codeTemplate.split("___");
    codeBlock.appendChild(document.createTextNode(parts[0]));
    const blank = document.createElement("span");
    blank.style.color = "#fbbf24";
    blank.style.fontWeight = "bold";
    blank.textContent = "___";
    codeBlock.appendChild(blank);
    codeBlock.appendChild(document.createTextNode(parts[1] || ""));

    const input = document.createElement("input");
    input.type = "text";
    input.className = "lesson-code-input";
    input.style.minHeight = "auto";
    input.style.fontSize = "15px";
    input.style.padding = "14px 16px";
    input.placeholder = exercise.placeholder || "Digite aqui";
    input.autocapitalize = "off";
    input.autocomplete = "off";
    input.spellcheck = false;

    input.addEventListener("input", function () {
        el.action.disabled = input.value.trim().length === 0;
    });

    wrapper.appendChild(codeBlock);
    wrapper.appendChild(input);

    wrapper._checkAnswer = function () {
        const value = normalizeOutput(input.value).toLowerCase();
        const expected = normalizeOutput(exercise.answer).toLowerCase();
        return value === expected;
    };

    return wrapper;
}

function renderWriteCode(exercise) {
    const wrapper = document.createElement("div");
    wrapper.className = "lesson-editor";

    const header = document.createElement("div");
    header.className = "lesson-output-header";
    header.textContent = "Saída esperada";
    const expected = document.createElement("pre");
    expected.className = "lesson-output";
    expected.style.minHeight = "auto";
    expected.textContent = exercise.expectedOutput;

    const input = document.createElement("textarea");
    input.className = "lesson-code-input";
    input.spellcheck = false;
    input.autocapitalize = "off";
    input.autocomplete = "off";
    input.value = exercise.starter || "";

    input.addEventListener("input", function () {
        el.action.disabled = input.value.trim().length === 0;
    });

    wrapper.appendChild(header);
    wrapper.appendChild(expected);
    wrapper.appendChild(input);

    wrapper._checkAnswer = function () {
        const Sk = window.Sk;
        if (typeof Sk === "undefined") return Promise.resolve(false);
        let buffer = "";
        Sk.configure({
            output: function (text) { buffer += text; },
            read: function (x) {
                if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) {
                    throw "File not found: '" + x + "'";
                }
                return Sk.builtinFiles["files"][x];
            },
            __future__: Sk.python3,
            inputfun: function () { return ""; },
            inputfunTakesPrompt: true
        });
        return Sk.miseval.asyncToPromise(function () {
            return Sk.importMainWithBody("<stdin>", false, input.value, true);
        }).then(function () {
            const userOut = normalizeOutput(buffer);
            const expectedOut = normalizeOutput(exercise.expectedOutput);
            return userOut === expectedOut;
        }).catch(function () { return false; });
    };

    return wrapper;
}

function renderStep() {
    state.answered = false;
    el.feedback.hidden = true;
    el.feedback.className = "lesson-feedback";
    el.action.classList.remove("is-success", "is-error");
    el.body.innerHTML = "";

    const step = state.steps[state.stepIndex];
    updateProgressBar();

    if (step.type === "teach") {
        el.title.textContent = "";
        el.instruction.textContent = "";
        el.title.style.display = "none";
        el.instruction.style.display = "none";
        const node = renderTeach(step);
        el.body.appendChild(node);
        el.action.textContent = "Entendi";
        el.action.disabled = false;
        setMascot("idle");
        return;
    }

    el.title.style.display = "";
    el.instruction.style.display = "";
    el.title.textContent = state.lesson.title;
    el.instruction.textContent = step.question || "";
    el.action.textContent = "Verificar";
    el.action.disabled = step.type !== "multiple-choice";

    let node;
    if (step.type === "multiple-choice") node = renderMultipleChoice(step);
    else if (step.type === "fill-blank") node = renderFillBlank(step);
    else node = renderWriteCode(step);

    el.body.appendChild(node);
    el.body._currentExercise = node;

    if (step.type !== "multiple-choice") {
        const input = node.querySelector("input, textarea");
        if (input) {
            if (step.type === "fill-blank") input.value = "";
            el.action.disabled = input.value.trim().length === 0;
            setTimeout(function () { input.focus(); }, 100);
        }
    }
}

function handleAnswer(isCorrect) {
    state.answered = true;
    el.feedback.hidden = false;
    el.feedback.className = "lesson-feedback is-" + (isCorrect ? "correct" : "wrong");
    const icon = document.createElement("span");
    icon.className = "lesson-feedback-icon";
    icon.textContent = isCorrect ? "✓" : "✕";
    const text = document.createElement("span");
    text.textContent = isCorrect ? "Correto!" : "Não foi dessa vez. Continue!";
    el.feedback.innerHTML = "";
    el.feedback.appendChild(icon);
    el.feedback.appendChild(text);

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

async function onActionClick() {
    const step = state.steps[state.stepIndex];

    if (step.type === "teach") {
        advanceStep();
        return;
    }

    if (!state.answered) {
        const node = el.body._currentExercise;
        if (!node) return;

        el.action.disabled = true;
        el.action.textContent = "Verificando...";

        let isCorrect = false;
        if (step.type === "write-code") {
            try {
                const result = await node._checkAnswer();
                isCorrect = result === true;
            } catch (e) {
                isCorrect = false;
            }
        } else {
            isCorrect = node._checkAnswer();
        }

        handleAnswer(isCorrect);
        return;
    }

    setMascot("idle");
    advanceStep();
}

async function advanceStep() {
    state.stepIndex += 1;
    if (state.stepIndex >= state.steps.length) {
        await completeLesson();
    } else {
        renderStep();
    }
}

async function completeLesson() {
    const gained = LESSON_XP_BASE + state.correctCount * EXERCISE_XP;
    el.celebrationXp.textContent = String(gained);
    el.celebration.hidden = false;
    try {
        await addXpAndStreak(gained);
        await markLessonComplete(state.lesson.id);
    } catch (e) {}
}

function bootstrap(user, progress) {
    state.user = user;
    state.progress = progress;
    state.lesson = pickLesson(progress);
    state.steps = buildSteps(state.lesson);
    state.stepIndex = 0;
    state.correctCount = 0;
    renderStep();
}

el.action.addEventListener("click", onActionClick);

el.close.addEventListener("click", function () {
    window.location.href = "dashboard.html#licoes";
});

el.celebrationContinue.addEventListener("click", function () {
    window.location.href = "dashboard.html#licoes";
});

onAuthStateChanged(auth, async function (user) {
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    const progress = await loadProgress();
    bootstrap(user, progress);
});

