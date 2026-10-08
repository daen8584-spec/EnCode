import { auth } from "./firebase-config.js";
import { LESSONS, LESSON_XP_BASE, EXERCISE_XP } from "./lessons-data.js";
import { loadProgress, addXpAndStreak, markLessonComplete } from "./progress-service.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const state = {
    lesson: null,
    exerciseIndex: 0,
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

function setMascot(state_) {
    el.mascot.classList.remove("is-idle", "is-happy", "is-sad");
    if (state_ === "happy") el.mascot.classList.add("is-happy");
    else if (state_ === "sad") el.mascot.classList.add("is-sad");
    else el.mascot.classList.add("is-idle");
}

function updateProgressBar() {
    const total = state.lesson.exercises.length;
    const current = state.exerciseIndex;
    const percent = ((current) / total) * 100;
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
    codeBlock.textContent = "";
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
    wrapper._readAnswer = function () { return input.value; };

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
        if (typeof Sk === "undefined") {
            return false;
        }
        const token = auth.currentUser ? "ok" : "anon";
        void token;
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

    wrapper._readAnswer = function () { return input.value; };
    wrapper._lastOutput = function () { return null; };

    return wrapper;
}

function renderExercise() {
    state.answered = false;
    el.feedback.hidden = true;
    el.feedback.className = "lesson-feedback";
    el.action.textContent = "Verificar";
    el.action.classList.remove("is-success", "is-error");
    el.action.disabled = state.lesson.exercises[state.exerciseIndex].type !== "multiple-choice";
    el.body.innerHTML = "";

    const exercise = state.lesson.exercises[state.exerciseIndex];
    updateProgressBar();

    let node;
    if (exercise.type === "multiple-choice") node = renderMultipleChoice(exercise);
    else if (exercise.type === "fill-blank") node = renderFillBlank(exercise);
    else node = renderWriteCode(exercise);

    el.body.appendChild(node);
    el.body._currentExercise = node;

    if (exercise.type !== "multiple-choice") {
        const input = node.querySelector("input, textarea");
        if (input) {
            input.value = input.value || "";
            if (exercise.type === "fill-blank") input.value = "";
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
    if (!state.answered) {
        const exercise = state.lesson.exercises[state.exerciseIndex];
        const node = el.body._currentExercise;
        if (!node) return;

        el.action.disabled = true;
        el.action.textContent = "Verificando...";

        let isCorrect = false;
        if (exercise.type === "write-code") {
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
    state.exerciseIndex += 1;
    if (state.exerciseIndex >= state.lesson.exercises.length) {
        await completeLesson();
    } else {
        renderExercise();
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
    state.exerciseIndex = 0;
    state.correctCount = 0;
    el.title.textContent = state.lesson.title;
    el.instruction.textContent = state.lesson.instruction;
    setMascot("idle");
    renderExercise();
}

el.action.addEventListener("click", onActionClick);

el.close.addEventListener("click", function () {
    window.location.href = "dashboard.html";
});

el.celebrationContinue.addEventListener("click", function () {
    window.location.href = "dashboard.html";
});

onAuthStateChanged(auth, async function (user) {
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    const progress = await loadProgress();
    bootstrap(user, progress);
});

