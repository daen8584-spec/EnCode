import { requireUser } from "./auth.js";
import { findLesson, TRACKS } from "./content.js";
import { $, h, shuffle, toast } from "./dom.js";
import { checkBlank, checkCode } from "./grading.js";
import { completeLesson, loadUserData } from "./progress.js";
import { loadPython } from "./python.js";

const LESSON_XP = 10;
const EXERCISE_XP = 2;

const ui = {
    title: $("title"),
    question: $("question"),
    step: $("step"),
    progress: $("progress"),
    feedback: $("feedback"),
    action: $("action"),
    mascot: $("mascot")
};

await requireUser();
const data = await loadUserData();
const lesson = findLesson(new URLSearchParams(location.search).get("id"))
    ?? TRACKS[0].lessons.find(({ id }) => !data.completedLessons.includes(id))
    ?? TRACKS[0].lessons[0];
const language = lesson.track.id;

const queue = [...lesson.teach.map((card) => ({ type: "teach", ...card })), ...lesson.exercises];
const missed = new Set();
let index = 0;
let check = null;
let answered = false;

const setReady = (ready) => { ui.action.disabled = !ready; };
const setMood = (mood) => { ui.mascot.className = `lesson-mascot is-${mood}`; };

function codeField(tag, props) {
    const field = h(tag, { spellcheck: false, autocomplete: "off", autocapitalize: "off", ...props });
    field.setAttribute("autocorrect", "off");
    field.addEventListener("input", () => setReady(field.value.trim() !== ""));
    return field;
}

const RENDERERS = {
    teach: ({ term, lines, example }) => ({
        node: h("div", { className: "teach card" },
            h("span", { className: "teach-term", textContent: term }),
            lines.map((line) => h("p", { textContent: line })),
            h("pre", { className: "code-block", textContent: example.code }),
            h("pre", { className: "code-block is-output", textContent: example.output })
        )
    }),

    choice: ({ options }) => {
        const [answer] = options;
        let picked = null;
        const list = h("div", { className: "options" }, shuffle(options).map((option, i) => h("button", {
            type: "button",
            className: "option",
            value: option,
            onclick: ({ currentTarget }) => {
                picked = option;
                for (const button of list.children) button.ariaPressed = button === currentTarget;
                setReady(true);
            }
        }, h("kbd", { textContent: "ABCD"[i] }), option)));

        return {
            node: list,
            check: () => {
                for (const button of list.children) {
                    button.disabled = true;
                    button.classList.toggle("is-correct", button.value === answer);
                    button.classList.toggle("is-wrong", button.value === picked && picked !== answer);
                }
                return picked === answer ? { ok: true } : { ok: false, message: "A resposta certa está destacada." };
            }
        };
    },

    blank: ({ code, answer, placeholder }) => {
        const input = codeField("input", { className: "input is-code", placeholder });
        input.addEventListener("keydown", (event) => event.key === "Enter" && !ui.action.disabled && ui.action.click());
        const parts = code.split("___");
        return {
            node: h("div", { className: "stack" },
                h("pre", { className: "code-block" }, parts.flatMap((part, i) => i ? [h("mark", { textContent: "___" }), part] : part)),
                input
            ),
            focus: input,
            check: () => ({ ok: checkBlank(input.value, answer) })
        };
    },

    code: (exercise) => {
        const editor = codeField("textarea", { className: "code-input", placeholder: "Digite seu código aqui", rows: 6 });
        return {
            node: h("div", { className: "stack" },
                language === "python" && [
                    h("span", { className: "label", textContent: "Saída esperada" }),
                    h("pre", { className: "code-block is-output", textContent: exercise.expected })
                ],
                editor
            ),
            focus: editor,
            check: () => checkCode(language, editor.value, exercise)
        };
    }
};

function render() {
    const step = queue[index];
    const view = RENDERERS[step.type](step);
    check = view.check ?? null;
    answered = false;

    ui.progress.style.width = `${(index / queue.length) * 100}%`;
    ui.question.textContent = step.question ?? "";
    ui.step.replaceChildren(view.node);
    ui.feedback.hidden = true;
    ui.action.className = "button lesson-action";
    ui.action.textContent = check ? "Verificar" : "Entendi";
    setReady(!check);
    setMood("idle");
    view.focus?.focus();
}

function showResult({ ok, message }) {
    const step = queue[index];
    if (!ok) {
        missed.add(step);
        queue.push(step);
    }
    answered = true;
    ui.feedback.className = `feedback ${ok ? "is-correct" : "is-wrong"}`;
    ui.feedback.textContent = ok ? "Correto!" : `${message ?? "Resposta incorreta."} Você vai tentar de novo no fim da lição.`;
    ui.feedback.hidden = false;
    ui.action.classList.add(ok ? "is-success" : "is-error");
    ui.action.textContent = "Continuar";
    setReady(true);
    setMood(ok ? "happy" : "sad");
}

async function finish() {
    const xp = LESSON_XP + EXERCISE_XP * (lesson.exercises.length - missed.size);
    ui.progress.style.width = "100%";
    ui.action.disabled = true;
    $("xp-gained").textContent = xp;
    $("repeat").href = `lesson.html?id=${lesson.id}`;
    $("next").href = lesson.next ? `lesson.html?id=${lesson.next.id}` : `lessons.html?track=${language}`;
    $("next").textContent = lesson.next ? "Próxima lição" : "Ver trilha";
    $("celebration").showModal();

    try {
        await completeLesson(data, lesson.id, xp);
    } catch (error) {
        console.error("Could not save progress", error);
        toast("Não foi possível salvar seu progresso.", "error");
    }
}

ui.action.addEventListener("click", async () => {
    if (check && !answered) {
        setReady(false);
        ui.action.textContent = "Verificando…";
        showResult(await check());
        return;
    }
    index += 1;
    if (index < queue.length) render();
    else finish();
});

$("celebration").addEventListener("cancel", (event) => event.preventDefault());
$("close").href = `lessons.html?track=${language}`;
ui.title.textContent = lesson.title;
document.title = `${lesson.title} · EnCoder`;
if (language === "python") loadPython().catch(() => {});
render();
