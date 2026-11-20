import { requireUser } from "./auth.js";
import { ALL_LESSONS, findLesson } from "./content.js";
import { $, h, shuffle, toast } from "./dom.js";
import { checkBlank, checkCode, checkOrder } from "./grading.js";
import { createMascot } from "./mascot.js";
import { loadUserData, recordSession } from "./progress.js";
import { loadPython, normalizeCode } from "./python.js";

const LESSON_XP = 10;
const REVIEW_XP = 5;
const EXERCISE_XP = 2;
const REVIEW_SIZE = 6;
const PREVIEW_BASE = "<style>body{margin:12px;font:16px system-ui,sans-serif;color:#1a1a2e;background:#fff}</style>";

const PROMPTS = {
    choice: "Qual destas é a resposta certa?",
    blank: "Complete a parte em amarelo.",
    order: "Toque nas linhas na ordem certa.",
    python: "Escreva o código. Eu executo para conferir!",
    html: "Escreva o HTML e veja o resultado aparecer.",
    css: "Escreva o CSS e veja a página mudar ao vivo."
};
const PRAISE = ["Isso mesmo!", "Mandou bem!", "Perfeito!", "Exatamente!", "Muito bom!"];
const COMFORT = ["Quase! Leia a dica aqui embaixo.", "Errar faz parte. Veja a dica!", "Sem pressa, vamos entender o erro."];

const ui = {
    title: $("title"),
    question: $("question"),
    step: $("step"),
    progress: $("progress"),
    footer: $("footer"),
    feedback: $("feedback"),
    action: $("action")
};

const pick = (list) => list[Math.floor(Math.random() * list.length)];
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const short = (text) => text.length > 28 ? `${text.slice(0, 26)}…` : text;

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

const mascot = createMascot();
$("mascot-slot").append(mascot.root);

const queue = [...lesson.teach.map((card) => ({ type: "teach", ...card })), ...lesson.exercises];
const missed = new Set();
let index = 0;
let stepId = 0;
let check = null;
let answered = false;
let combo = 0;

const setReady = (ready) => { ui.action.disabled = !ready; };

function codeField(tag, props) {
    const field = h(tag, { spellcheck: false, autocomplete: "off", autocapitalize: "off", ...props });
    field.setAttribute("autocorrect", "off");
    field.addEventListener("input", () => setReady(field.value.trim() !== ""));
    field.addEventListener("focus", () => {
        mascot.pointAt(field);
        mascot.mood("watch");
    });
    return field;
}

const previewDocument = (language, code, sample = "") =>
    PREVIEW_BASE + (language === "css" ? `<style>${normalizeCode(code)}</style>${sample}` : normalizeCode(code));

const preview = (srcdoc) => h("iframe", { className: "preview", sandbox: "", title: "Resultado", srcdoc });

// The mascot reads the card aloud, pointing at each line, then at the example and its result.
async function explain(node, { language }, id) {
    const parts = [...node.querySelectorAll(".teach-line, .teach-example")];
    const closing = { example: "Veja este exemplo.", result: language === "python" ? "Quando o código roda, aparece isto." : "E este é o resultado na página!" };
    for (const part of parts) {
        if (id !== stepId) return;
        part.classList.add("is-shown");
        mascot.pointAt(part);
        await mascot.say(part.dataset.say ? closing[part.dataset.say] : part.textContent);
        await wait(500);
    }
    if (id !== stepId) return;
    mascot.rest();
    mascot.say("Entendeu? Toque em Entendi para continuar.");
}

const RENDERERS = {
    teach: ({ term, lines, example, language, sample }) => {
        const code = h("pre", { className: "code-block teach-example", textContent: example.code });
        const result = language === "python"
            ? h("pre", { className: "code-block is-output teach-example", textContent: example.output })
            : h("div", { className: "teach-example" }, preview(previewDocument(language, example.code, sample)));
        code.dataset.say = "example";
        result.dataset.say = "result";
        return {
            node: h("div", { className: "teach card" },
                h("span", { className: "teach-term", textContent: term }),
                lines.map((line) => h("p", { className: "teach-line", textContent: line })),
                code,
                result
            )
        };
    },

    choice: ({ options }) => {
        const [answer] = options;
        let picked = null;
        const list = h("div", { className: "options" }, shuffle(options).map((option, i) => h("button", {
            type: "button",
            className: "option",
            value: option,
            style: `--i: ${i}`,
            onclick: ({ currentTarget }) => {
                if (answered) return;
                picked = option;
                for (const button of list.children) button.ariaPressed = button === currentTarget;
                setReady(true);
                mascot.pointAt(currentTarget);
                mascot.say(`“${short(option)}”? Toque em Verificar se tiver certeza.`);
            }
        }, h("kbd", { textContent: i + 1 }), h("span", { textContent: option }))));

        return {
            node: list,
            check: () => {
                for (const button of list.children) {
                    button.disabled = true;
                    button.classList.toggle("is-correct", button.value === answer);
                    button.classList.toggle("is-wrong", button.value === picked && picked !== answer);
                }
                return picked === answer
                    ? { ok: true }
                    : { ok: false, message: "A resposta certa está destacada.", show: list.querySelector(".is-correct") };
            }
        };
    },

    blank: ({ code, answer, placeholder }) => {
        const input = codeField("input", { className: "input is-code", placeholder });
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
            if (answered) return;
            (chip.parentElement === bank ? answer : bank).append(chip);
            chip.animate([{ opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1 }], { duration: 180, easing: "ease-out" });
            const done = bank.children.length === 0;
            setReady(done);
            mascot.pointAt(answer);
            if (done) mascot.say("Tudo no lugar? Toque em Verificar.");
        };
        bank.append(...mixed.map((line, i) => h("button", { type: "button", className: "chip", textContent: line, style: `--i: ${i}`, onclick: move })));

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
    const id = ++stepId;
    check = view.check ?? null;
    answered = false;

    ui.progress.style.width = `${(index / queue.length) * 100}%`;
    ui.question.textContent = step.question ?? "";
    ui.step.replaceChildren(view.node);
    ui.footer.className = "lesson-footer";
    ui.feedback.hidden = true;
    ui.action.className = "button lesson-action";
    ui.action.textContent = check ? "Verificar" : "Entendi";
    setReady(!check);

    if (step.type === "teach") {
        explain(view.node, step, id);
        return;
    }
    mascot.pointAt(ui.question);
    mascot.say(PROMPTS[step.type === "code" ? step.language : step.type]);
}

function showResult({ ok, message, show }) {
    const step = queue[index];
    answered = true;
    combo = ok ? combo + 1 : 0;
    if (!ok) {
        missed.add(step);
        queue.push(step);
    }

    $("combo").hidden = combo < 2;
    $("combo-count").textContent = combo;
    if (combo >= 2) $("combo").animate([{ scale: 1.4 }, { scale: 1 }], { duration: 300, easing: "ease-out" });

    ui.footer.className = `lesson-footer ${ok ? "is-correct" : "is-wrong"}`;
    $("feedback-title").textContent = ok ? pick(PRAISE) : "Resposta incorreta";
    $("feedback-detail").textContent = ok ? "" : `${message ?? "Confira e tente de novo."} Você vai tentar de novo no fim.`;
    ui.feedback.hidden = false;
    ui.action.classList.add(ok ? "is-success" : "is-error");
    ui.action.textContent = "Continuar";
    setReady(true);

    if (ok) {
        mascot.mood("happy");
        mascot.say(combo >= 3 ? `${combo} acertos seguidos! Você está voando!` : $("feedback-title").textContent);
    } else if (show) {
        mascot.pointAt(show);
        mascot.say("A certa é esta aqui. Vamos treinar de novo no fim!");
    } else {
        mascot.mood("sad");
        mascot.say(pick(COMFORT));
    }
}

function countUp(element, to) {
    const start = performance.now();
    const tick = (now) => {
        const t = Math.min(1, (now - start) / 900);
        element.textContent = Math.round(to * (1 - (1 - t) ** 3));
        if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

function confetti(container) {
    const colors = ["#7c5cff", "#22d3ee", "#34d399", "#fbbf24", "#ff6b6b"];
    const layer = h("div", { className: "confetti-layer", ariaHidden: "true" }, Array.from({ length: 70 }, (_, i) => h("i", {
        style: `--x: ${(Math.random() * 2 - 1).toFixed(2)}; --y: ${(0.4 + Math.random() * 0.6).toFixed(2)}; `
            + `--r: ${Math.round(Math.random() * 720)}deg; --d: ${(Math.random() * 0.3).toFixed(2)}s; --c: ${colors[i % colors.length]}`
    })));
    container.append(layer);
    setTimeout(() => layer.remove(), 3000);
}

async function finish() {
    const firstTry = lesson.exercises.length - missed.size;
    const base = review ? REVIEW_XP : LESSON_XP * (lesson.challenge ? 2 : 1);
    const xp = base + EXERCISE_XP * firstTry;
    const ids = (exercises) => exercises.map((exercise) => exercise.id);

    ui.progress.style.width = "100%";
    ui.action.disabled = true;
    mascot.hush();
    $("repeat").href = review ? "lesson.html?review" : `lesson.html?id=${lesson.id}`;
    $("next").href = review ? "dashboard.html" : lesson.next ? `lesson.html?id=${lesson.next.id}` : `lessons.html?track=${lesson.track.id}`;
    $("next").textContent = review ? "Voltar ao início" : lesson.next ? "Próxima lição" : "Ver trilha";

    const dialog = $("celebration");
    const host = createMascot({ className: "is-cheering" });
    $("celebration-mascot").replaceChildren(host.root);
    dialog.showModal();
    host.mood("cheer");
    host.say(review ? "Revisão feita! Seus erros estão sumindo." : lesson.challenge ? "Desafio vencido! Que orgulho!" : pick(["Você arrasou!", "Aula concluída! Bora para a próxima?"]));
    countUp($("xp-gained"), xp);
    countUp($("accuracy"), Math.round((firstTry / lesson.exercises.length) * 100));
    confetti(dialog);

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
        mascot.rest("think");
        mascot.say("Deixa eu ver…");
        const [result] = await Promise.all([check(), wait(600)]);
        showResult(result);
        return;
    }
    index += 1;
    if (index < queue.length) render();
    else finish();
});

addEventListener("keydown", (event) => {
    const typing = ["TEXTAREA", "INPUT", "BUTTON", "A"].includes(event.target.tagName);
    if (event.key === "Enter" && !ui.action.disabled && (!typing || event.target.tagName === "INPUT")) {
        event.preventDefault();
        ui.action.click();
    }
    if (!typing && /^[1-4]$/.test(event.key)) ui.step.querySelectorAll(".option")[event.key - 1]?.click();
});

$("celebration").addEventListener("cancel", (event) => event.preventDefault());
$("close").href = review ? "dashboard.html" : `lessons.html?track=${lesson.track.id}`;
$("celebration-title").textContent = review ? "Revisão completa!" : lesson.challenge ? "Desafio vencido!" : "Lição completa!";
ui.title.textContent = lesson.title;
document.title = `${lesson.title} · EnCoder`;
if (queue.some((step) => step.language === "python")) loadPython().catch(() => {});
render();
