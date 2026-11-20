import { requireUser } from "./auth.js";
import { ALL_LESSONS, findLesson } from "./content.js";
import { $, h, shuffle, toast } from "./dom.js";
import { checkBlank, checkCode, checkOrder } from "./grading.js";
import { loadUserData, recordSession } from "./progress.js";
import { loadPython, normalizeCode } from "./python.js";

const LESSON_XP = 10;
const REVIEW_XP = 5;
const EXERCISE_XP = 2;
const REVIEW_SIZE = 6;
const PREVIEW_BASE = "<style>body{margin:12px;font:16px system-ui,sans-serif;color:#1a1a2e;background:#fff}</style>";

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
const params = new URLSearchParams(location.search);

// Review mode practises earlier mistakes first, then random exercises from finished lessons.
function buildReview() {
    const done = ALL_LESSONS.filter((lesson) => data.completedLessons.includes(lesson.id)).flatMap((lesson) => lesson.exercises);
    const mistakes = shuffle(done.filter((exercise) => data.mistakes.includes(exercise.id)));
    const others = shuffle(done.filter((exercise) => !data.mistakes.includes(exercise.id)));
    return { title: "Revisão", teach: [], exercises: shuffle([...mistakes, ...others].slice(0, REVIEW_SIZE)) };
}

const review = params.has("review");
const lesson = review ? buildReview()
    : findLesson(params.get("id")) ?? ALL_LESSONS.find(({ id }) => !data.completedLessons.includes(id)) ?? ALL_LESSONS[0];

if (!lesson.exercises.length) {
    location.replace("lessons.html");
    await new Promise(() => {}); // nothing to practise yet; stop while the page unloads
}

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

const previewDocument = (language, code, sample = "") =>
    PREVIEW_BASE + (language === "css" ? `<style>${normalizeCode(code)}</style>${sample}` : normalizeCode(code));

const preview = (srcdoc) => h("iframe", { className: "preview", sandbox: "", title: "Resultado", srcdoc });

const RENDERERS = {
    teach: ({ term, lines, example, language, sample }) => ({
        node: h("div", { className: "teach card" },
            h("span", { className: "teach-term", textContent: term }),
            lines.map((line) => h("p", { textContent: line })),
            h("pre", { className: "code-block", textContent: example.code }),
            language === "python"
                ? h("pre", { className: "code-block is-output", textContent: example.output })
                : preview(previewDocument(language, example.code, sample))
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

    order: ({ lines }) => {
        const answer = h("div", { className: "order-answer code-block" });
        const bank = h("div", { className: "order-bank" });
        let mixed = shuffle(lines);
        while (lines.length > 1 && checkOrder(mixed, lines)) mixed = shuffle(lines);

        const move = ({ currentTarget: chip }) => {
            (chip.parentElement === bank ? answer : bank).append(chip);
            setReady(bank.children.length === 0);
        };
        bank.append(...mixed.map((line) => h("button", { type: "button", className: "chip", textContent: line, onclick: move })));

        return {
            node: h("div", { className: "stack" }, answer, bank),
            check: () => {
                const chips = [...answer.children];
                chips.forEach((chip, i) => {
                    chip.disabled = true;
                    chip.classList.add(chip.textContent === lines[i] ? "is-correct" : "is-wrong");
                });
                const ok = checkOrder(chips.map((chip) => chip.textContent), lines);
                return ok ? { ok } : { ok, message: "As linhas em vermelho estão fora do lugar." };
            }
        };
    },

    code: (exercise) => {
        const { language, expected, sample } = exercise;
        const editor = codeField("textarea", { className: "code-input", placeholder: "Digite seu código aqui", rows: 6 });
        const live = language !== "python" && preview(previewDocument(language, "", sample));
        if (live) editor.addEventListener("input", () => { live.srcdoc = previewDocument(language, editor.value, sample); });

        return {
            node: h("div", { className: "stack" },
                language === "python" && [
                    h("span", { className: "label", textContent: "Saída esperada" }),
                    h("pre", { className: "code-block is-output", textContent: expected })
                ],
                editor,
                live && [h("span", { className: "label", textContent: "Seu resultado" }), live]
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
    ui.feedback.textContent = ok ? "Correto!" : `${message ?? "Resposta incorreta."} Você vai tentar de novo no fim.`;
    ui.feedback.hidden = false;
    ui.action.classList.add(ok ? "is-success" : "is-error");
    ui.action.textContent = "Continuar";
    setReady(true);
    setMood(ok ? "happy" : "sad");
}

async function finish() {
    const base = review ? REVIEW_XP : LESSON_XP * (lesson.challenge ? 2 : 1);
    const xp = base + EXERCISE_XP * (lesson.exercises.length - missed.size);
    const ids = (exercises) => exercises.map((exercise) => exercise.id);

    ui.progress.style.width = "100%";
    ui.action.disabled = true;
    $("xp-gained").textContent = xp;
    $("repeat").href = review ? "lesson.html?review" : `lesson.html?id=${lesson.id}`;
    $("next").href = review ? "dashboard.html" : lesson.next ? `lesson.html?id=${lesson.next.id}` : `lessons.html?track=${lesson.track.id}`;
    $("next").textContent = review ? "Voltar ao início" : lesson.next ? "Próxima lição" : "Ver trilha";
    $("celebration").showModal();

    try {
        await recordSession(data, {
            lessonId: lesson.id,
            xp,
            missed: ids([...missed]),
            passed: ids(lesson.exercises.filter((exercise) => !missed.has(exercise)))
        });
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
$("close").href = review ? "dashboard.html" : `lessons.html?track=${lesson.track.id}`;
$("celebration-title").textContent = review ? "Revisão completa!" : lesson.challenge ? "Desafio vencido!" : "Lição completa!";
ui.title.textContent = lesson.title;
document.title = `${lesson.title} · EnCoder`;
if (queue.some((step) => step.language === "python")) loadPython().catch(() => {});
render();
