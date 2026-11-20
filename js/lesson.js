import { requireUser } from "./auth.js";
import { ALL_LESSONS, findLesson } from "./content.js";
import { $, h, shuffle, toast } from "./dom.js";
import { checkBlank, checkCode, checkOrder } from "./grading.js";
import { annotate } from "./keywords.js";
import { createMascot } from "./mascot.js";
import { dailyMission, rankOf } from "./game.js";
import { afterSession, loadUserData, recordSession } from "./progress.js";
import { loadPython, normalizeCode, runPython } from "./python.js";
import { isMuted, play, setMuted } from "./sound.js";

const LESSON_XP = 10;
const REVIEW_XP = 5;
const EXERCISE_XP = 2;
const REVIEW_SIZE = 6;
const PREVIEW_BASE = "<style>body{margin:12px;font:16px system-ui,sans-serif;color:#1a1a2e;background:#fff}</style>";

const svg = (path) => `<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
const ICONS = {
    teach: svg('<path d="M4 5h11a3 3 0 0 1 3 3v12H7a3 3 0 0 1-3-3z"/><path d="M4 17a3 3 0 0 1 3-3h11"/>'),
    choice: svg('<circle cx="6" cy="7" r="2"/><circle cx="6" cy="17" r="2"/><path d="M11 7h9M11 17h9"/>'),
    blank: svg('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>'),
    order: svg('<rect x="4" y="4" width="16" height="5" rx="1.5"/><rect x="4" y="15" width="16" height="5" rx="1.5"/><path d="M12 9v6"/>'),
    code: svg('<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13 6l-2 12"/>'),
    clock: svg('<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>'),
    bolt: svg('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'),
    bulb: svg('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>'),
    play: svg('<path d="M8 5v14l11-7z" fill="currentColor"/>')
};
const TASK_LABELS = {
    teach: "Explicação",
    choice: "Escolha a resposta",
    blank: "Complete o código",
    order: "Monte o código",
    code: "Escreva o código"
};
const PROMPTS = {
    choice: "Qual destas é a resposta certa?",
    blank: "Complete a parte em amarelo.",
    order: "Toque nas linhas na ordem certa.",
    python: "Escreva o código. Você pode executar antes de verificar!",
    html: "Escreva o HTML e compare com o objetivo.",
    css: "Escreva o CSS e deixe igual ao objetivo."
};
const FILE_NAMES = { python: "main.py", html: "index.html", css: "style.css" };
const KEYS = {
    python: ["(", ")", "\"", ":", "=", "[", "]", "+", ","],
    html: ["<", ">", "/", "=", "\""],
    css: ["{", "}", ":", ";", ".", "-"]
};
const PRAISE = ["Isso mesmo!", "Mandou bem!", "Perfeito!", "Exatamente!", "Muito bom!"];
const COMFORT = ["Quase! Leia a dica aqui embaixo.", "Errar faz parte. Veja a dica!", "Sem pressa, vamos entender o erro."];

const ui = {
    title: $("title"),
    taskType: $("task-type"),
    question: $("question"),
    step: $("step"),
    steps: $("steps"),
    footer: $("footer"),
    feedback: $("feedback"),
    action: $("action")
};

const pick = (items) => items[Math.floor(Math.random() * items.length)];
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const short = (text) => text.length > 28 ? `${text.slice(0, 26)}…` : text;
const list = (items) => items.length > 1 ? `${items.slice(0, -1).join(", ")} e ${items.at(-1)}` : items.join("");

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

const words = lesson.teach.filter((card) => card.meaning);
const baseXp = review ? REVIEW_XP : LESSON_XP * (lesson.challenge ? 2 : 1);
const queue = [{ type: "intro" }, ...lesson.teach.map((card) => ({ type: "teach", ...card })), ...lesson.exercises];
const results = [];
const missed = new Set();
let index = 0;
let stepId = 0;
let view = null;
let answered = false;
let combo = 0;

const setReady = (ready) => { ui.action.disabled = !ready; };

const previewDocument = (language, code, sample = "") =>
    PREVIEW_BASE + (language === "css" ? `<style>${normalizeCode(code)}</style>${sample}` : normalizeCode(code));

const preview = (srcdoc, title = "Resultado") => h("iframe", { className: "preview", sandbox: "", title, srcdoc });

// A small code editor: line numbers, auto-indent, Tab, a symbol row for phones and error-line marking.
function codeEditor(language, { value = "", tools = null } = {}) {
    const field = h("textarea", {
        className: "code-input",
        value,
        placeholder: "Digite seu código aqui",
        spellcheck: false,
        autocomplete: "off",
        autocapitalize: "off",
        ariaLabel: `Código ${language.toUpperCase()}`
    });
    field.setAttribute("autocorrect", "off");
    const gutter = h("div", { className: "gutter", ariaHidden: "true" });
    let errorLine = 0;
    let escaped = false;

    const sync = () => {
        const lines = field.value.split("\n").length;
        const marked = Math.min(errorLine, lines); // errors at the very end are reported one line past it
        gutter.replaceChildren(...Array.from({ length: lines }, (_, i) => h("span", { className: i + 1 === marked ? "is-error" : "", textContent: i + 1 })));
        field.style.height = "auto";
        field.style.height = `${field.scrollHeight}px`;
    };
    const insert = (text) => {
        field.setRangeText(text, field.selectionStart, field.selectionEnd, "end");
        field.dispatchEvent(new Event("input", { bubbles: true }));
    };

    field.addEventListener("input", () => {
        errorLine = 0;
        sync();
    });
    field.addEventListener("focus", () => {
        mascot.pointAt(field);
        mascot.mood("watch");
    });
    field.addEventListener("keydown", (event) => {
        if (event.key === "Escape") escaped = true;
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
            event.preventDefault();
            if (!ui.action.disabled) ui.action.click();
        } else if (event.key === "Tab" && !event.shiftKey && !escaped) {
            event.preventDefault();
            insert("    ");
        } else if (event.key === "Enter") {
            const before = field.value.slice(0, field.selectionStart);
            const line = before.slice(before.lastIndexOf("\n") + 1);
            let indent = line.match(/^\s*/)[0];
            if (/[:{]\s*$/.test(line) && language !== "html") indent += "    ";
            event.preventDefault();
            insert(`\n${indent}`);
        }
        if (event.key !== "Escape") escaped = false;
    });

    const keys = h("div", { className: "code-keys" }, [...KEYS[language], "tab"].map((key) => h("button", {
        type: "button",
        className: "key",
        textContent: key,
        onpointerdown: (event) => event.preventDefault(),
        onclick: () => {
            field.focus();
            insert(key === "tab" ? "    " : key);
        }
    })));

    const node = h("div", { className: "code-editor" },
        h("div", { className: "editor-head" }, h("span", { className: "file", textContent: FILE_NAMES[language] }), tools),
        h("div", { className: "editor-body" }, gutter, field),
        keys
    );
    requestAnimationFrame(sync);

    return {
        node,
        field,
        set(text) {
            field.value = text;
            field.dispatchEvent(new Event("input", { bubbles: true }));
        },
        markError(message = "") {
            errorLine = Number(message.match(/linha (\d+)/)?.[1] ?? 0);
            sync();
        }
    };
}

function pythonConsole(editor) {
    const output = h("pre", { className: "console-output", textContent: "Toque em Executar para ver a saída do seu código." });
    const run = h("button", { type: "button", className: "button is-success is-small", innerHTML: `${ICONS.play}Executar` });
    run.addEventListener("click", async () => {
        run.disabled = true;
        output.textContent = "Executando…";
        try {
            const { output: text, error } = await runPython(editor.field.value);
            output.textContent = [text.trimEnd(), error].filter(Boolean).join("\n") || "(sem saída)";
            output.classList.toggle("is-error", Boolean(error));
            editor.markError(error);
        } catch {
            output.textContent = "Não foi possível carregar o Python. Verifique sua conexão.";
        } finally {
            run.disabled = false;
        }
    });
    return h("div", { className: "console" }, h("div", { className: "console-head" }, h("span", { textContent: "Saída" }), run), output);
}

function sandbox({ example, language, sample }) {
    const editor = codeEditor(language, { value: example.code });
    if (language === "python") return h("div", { className: "sandbox" }, editor.node, pythonConsole(editor));
    const live = preview(previewDocument(language, example.code, sample));
    editor.field.addEventListener("input", () => { live.srcdoc = previewDocument(language, editor.field.value, sample); });
    return h("div", { className: "sandbox" }, editor.node, live);
}

function hintFor({ language, mustInclude = [], expected }) {
    if (language === "python") {
        return mustInclude.length ? `Dica: seu código precisa usar ${list(mustInclude.map((part) => `“${part}”`))}.` : "Dica: compare sua saída com a saída esperada.";
    }
    if (language === "html") {
        const tags = [...new Set([...expected.matchAll(/<([a-z0-9]+)/g)].map((match) => `<${match[1]}>`))];
        const attributes = [...new Set([...expected.matchAll(/([a-z-]+)=/g)].map((match) => match[1]))];
        return `Dica: use ${list(tags)}${attributes.length ? ` com ${list(attributes)}` : ""}.`;
    }
    const [, selector, body] = expected.match(/^\s*([^{]+?)\s*\{([^}]*)\}/);
    const properties = body.split(";").map((declaration) => declaration.split(":")[0].trim()).filter(Boolean);
    return `Dica: escreva ${selector} { } e use ${list(properties)} dentro.`;
}

// The mascot reads the board aloud, pointing at each line, then at the example and its result.
async function explain(node, { language }, id) {
    const parts = [...node.querySelectorAll(".teach-line, .teach-example")];
    const closing = {
        example: "Veja este exemplo. Toque nas palavras sublinhadas para ver o que significam.",
        result: language === "python" ? "Quando o código roda, aparece isto." : "E este é o resultado na página!"
    };
    for (const part of parts) {
        if (id !== stepId) return;
        part.classList.add("is-shown");
        mascot.pointAt(part);
        await mascot.say(part.dataset.say ? closing[part.dataset.say] : part.textContent);
        await wait(500);
    }
    if (id !== stepId) return;
    mascot.pointAt(node.querySelector(".try-button"));
    mascot.say("Quer testar? Toque em Experimente e mude o código!");
}

const RENDERERS = {
    intro: () => {
        const minutes = Math.max(2, Math.round((lesson.teach.length * 40 + lesson.exercises.length * 50) / 60));
        const maxXp = baseXp + EXERCISE_XP * lesson.exercises.length;
        const badge = review ? "Revisão" : lesson.challenge ? `${lesson.track.name} · Desafio` : lesson.track.name;
        const meta = [
            lesson.teach.length && [ICONS.teach, `${lesson.teach.length} ${lesson.teach.length === 1 ? "explicação" : "explicações"}`],
            [ICONS.code, `${lesson.exercises.length} exercícios`],
            [ICONS.clock, `cerca de ${minutes} min`],
            [ICONS.bolt, `até +${maxXp} XP`]
        ].filter(Boolean);
        return {
            node: h("div", { className: `lesson-intro card is-${lesson.track?.id ?? "review"}` },
                h("span", { className: "intro-badge", textContent: badge }),
                h("h2", { textContent: lesson.title }),
                words.length > 0 && h("div", { className: "intro-words" },
                    h("span", { className: "label", textContent: "Palavras em inglês desta aula" }),
                    h("ul", {}, words.map((card) => h("li", {}, h("code", { textContent: card.term }), h("span", { textContent: card.meaning }))))
                ),
                h("ul", { className: "intro-meta" }, meta.map(([icon, text]) => h("li", { innerHTML: icon }, text)))
            )
        };
    },

    teach: (card) => {
        const { term, meaning, lines, example, language, sample } = card;
        const code = h("pre", { className: "code-block teach-example" }, annotate(example.code, language));
        const result = language === "python"
            ? h("pre", { className: "code-block is-output teach-example", textContent: example.output })
            : h("div", { className: "teach-example" }, preview(previewDocument(language, example.code, sample)));
        code.dataset.say = "example";
        result.dataset.say = "result";
        const tryButton = h("button", { type: "button", className: "try-button", innerHTML: `${ICONS.code}Experimente: edite e rode o exemplo` });
        tryButton.addEventListener("click", () => {
            const box = sandbox(card);
            tryButton.replaceWith(box);
            box.querySelector("textarea").focus();
            mascot.say(language === "python" ? "Mude o código e toque em Executar." : "Mude o código e veja o resultado mudar.");
        });
        return {
            node: h("div", { className: "teach" },
                h("div", { className: "teach-head" },
                    h("span", { className: "teach-term", textContent: term }),
                    meaning && h("span", { className: "teach-meaning", textContent: `= ${meaning}` })
                ),
                lines.map((line) => h("p", { className: "teach-line", textContent: line })),
                code,
                result,
                tryButton
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
                play("tap");
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

    blank: ({ code, answer, placeholder, language }) => {
        const input = h("input", { className: "input is-code", placeholder, spellcheck: false, autocomplete: "off", autocapitalize: "off" });
        input.setAttribute("autocorrect", "off");
        input.addEventListener("input", () => setReady(input.value.trim() !== ""));
        input.addEventListener("focus", () => {
            mascot.pointAt(input);
            mascot.mood("watch");
        });
        return {
            node: h("div", { className: "stack" },
                h("pre", { className: "code-block" }, code.split("___").flatMap((part, i) => [
                    i > 0 && h("mark", { textContent: "___" }),
                    ...annotate(part, language)
                ])),
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
            play("tap");
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
        let hints = 0;
        const hint = h("button", { type: "button", className: "hint-button", innerHTML: `${ICONS.bulb}<span>Dica</span>` });
        const editor = codeEditor(language, { tools: hint });
        editor.field.addEventListener("input", () => setReady(editor.field.value.trim() !== ""));

        hint.addEventListener("click", () => {
            hints += 1;
            play("tap");
            if (hints === 1) {
                mascot.mood("idle");
                mascot.say(hintFor(exercise));
                hint.lastChild.textContent = "Ver solução";
                return;
            }
            editor.set(language === "python" ? exercise.solution : expected);
            missed.add(exercise);
            hint.disabled = true;
            mascot.pointAt(editor.field);
            mascot.say("Aqui está uma solução. Leia com calma e depois toque em Verificar.");
        });

        let goal;
        let extra = null;
        if (language === "python") {
            goal = h("div", { className: "goal" },
                h("span", { className: "label", textContent: "Saída esperada" }),
                h("pre", { className: "code-block is-output", textContent: expected })
            );
            extra = pythonConsole(editor);
        } else {
            const live = preview(previewDocument(language, "", sample), "Seu resultado");
            editor.field.addEventListener("input", () => { live.srcdoc = previewDocument(language, editor.field.value, sample); });
            goal = h("div", { className: "compare" },
                h("figure", {}, h("figcaption", { className: "label", textContent: "Objetivo" }), preview(previewDocument(language, expected, sample), "Objetivo")),
                h("figure", {}, h("figcaption", { className: "label", textContent: "Seu resultado" }), live)
            );
        }

        return {
            node: h("div", { className: "stack" }, language === "python" && goal, editor.node, extra, language !== "python" && goal),
            focus: editor.field,
            check: () => checkCode(language, editor.field.value, exercise),
            onResult: (result) => editor.markError(result.message)
        };
    }
};

function renderSteps() {
    ui.steps.replaceChildren(...queue.flatMap((step, i) => {
        if (step.type === "intro") return [];
        const state = i < index ? (results[i] === false ? "is-missed" : "is-done") : i === index ? "is-current" : "";
        return h("li", { className: `${step.type === "teach" ? "is-teach" : "is-task"} ${state}` });
    }));
}

function render() {
    const step = queue[index];
    view = RENDERERS[step.type](step);
    const id = ++stepId;
    answered = false;

    renderSteps();
    ui.title.hidden = step.type === "intro";
    ui.taskType.hidden = step.type === "intro";
    ui.taskType.innerHTML = `${ICONS[step.type] ?? ""}${TASK_LABELS[step.type] ?? ""}`;
    ui.question.textContent = step.question ?? "";
    ui.step.replaceChildren(view.node);
    ui.footer.className = "lesson-footer";
    ui.feedback.hidden = true;
    ui.action.className = "button lesson-action";
    ui.action.textContent = step.type === "intro" ? "Começar" : view.check ? "Verificar" : "Entendi";
    setReady(!view.check);

    if (step.type === "intro") {
        mascot.rest();
        const mistakes = lesson.exercises.filter((exercise) => data.mistakes.includes(exercise.id)).length;
        mascot.say(review ? `Vamos revisar ${lesson.exercises.length} exercícios${mistakes ? `, ${mistakes} deles você errou antes` : ""}.`
            : lesson.challenge ? "Hora do desafio! Sem explicação, só você e o código. Use as dicas se precisar."
            : words.length ? `Hoje vamos aprender ${list(words.map((card) => card.term))}!` : "Vamos praticar!");
        return;
    }
    if (step.type === "teach") {
        explain(view.node, step, id);
        return;
    }
    mascot.pointAt(ui.question);
    mascot.say(PROMPTS[step.type === "code" ? step.language : step.type]);
}

function showResult(result) {
    const { ok, message, show } = result;
    const step = queue[index];
    answered = true;
    results[index] = ok;
    combo = ok ? combo + 1 : 0;
    view.onResult?.(result);
    if (!ok) {
        missed.add(step);
        queue.push(step);
    }
    play(ok ? "correct" : "wrong");

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
    const colors = ["#2f6fe4", "#f4a51c", "#1c9f62", "#ff7417", "#7c4dff"];
    const layer = h("div", { className: "confetti-layer", ariaHidden: "true" }, Array.from({ length: 70 }, (_, i) => h("i", {
        style: `--x: ${(Math.random() * 2 - 1).toFixed(2)}; --y: ${(0.4 + Math.random() * 0.6).toFixed(2)}; `
            + `--r: ${Math.round(Math.random() * 720)}deg; --d: ${(Math.random() * 0.3).toFixed(2)}s; --c: ${colors[i % colors.length]}`
    })));
    container.append(layer);
    setTimeout(() => layer.remove(), 3000);
}

async function finish() {
    const firstTry = lesson.exercises.length - missed.size;
    const xp = baseXp + EXERCISE_XP * firstTry;
    const ids = (exercises) => exercises.map((exercise) => exercise.id);

    renderSteps();
    ui.action.disabled = true;
    mascot.hush();
    play("done");
    $("repeat").href = review ? "lesson.html?review" : `lesson.html?id=${lesson.id}`;
    $("next").href = review ? "dashboard.html" : lesson.next ? `lesson.html?id=${lesson.next.id}` : `lessons.html?track=${lesson.track.id}`;
    $("next").textContent = review ? "Voltar ao início" : lesson.next ? "Próxima lição" : "Ver trilha";
    $("celebration-words").hidden = words.length === 0;
    $("new-words").replaceChildren(...words.map((card) => h("li", {}, h("code", { textContent: card.term }), h("span", { textContent: card.meaning }))));

    const before = rankOf(data.xp);
    const after = rankOf(data.xp + xp);
    const rankedUp = after.index > before.index;
    const mission = dailyMission({ ...data, today: afterSession(data, { lessonId: lesson.id, xp }) });
    $("celebration-extra").replaceChildren(
        rankedUp && h("div", { className: "rank-up", style: `--rank: ${after.color}` },
            h("span", { className: "rank-up-badge", innerHTML: after.icon }),
            h("div", {}, h("span", { className: "eyebrow", textContent: "Nova patente" }), h("strong", { textContent: after.name }))
        ),
        h("div", { className: `mission-line${mission.done ? " is-done" : ""}` },
            h("div", { className: "mission-line-text" },
                h("span", { className: "eyebrow", textContent: "Missão do dia" }),
                h("span", { textContent: mission.chestOpened ? "Cumprida hoje. Nova missão amanhã!"
                    : mission.done ? "Cumprida! Abra o baú no início."
                    : `${mission.title}: ${mission.value}/${mission.goal} ${mission.unit}` })
            ),
            h("div", { className: "bar" }, h("div", { className: "bar-fill", style: `width: ${(mission.value / mission.goal) * 100}%` }))
        )
    );
    if (mission.done && !mission.chestOpened) {
        $("next").href = "dashboard.html";
        $("next").textContent = "Abrir baú";
    }

    const dialog = $("celebration");
    const host = createMascot({ className: "is-cheering" });
    $("celebration-mascot").replaceChildren(host.root);
    dialog.showModal();
    host.mood("cheer");
    host.say(rankedUp ? `Agora você é ${after.name}!`
        : review ? "Revisão feita! Seus erros estão sumindo."
        : lesson.challenge ? "Desafio vencido! Que orgulho!"
        : pick(["Você arrasou!", "Aula concluída! Bora para a próxima?"]));
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
    if (view.check && !answered) {
        setReady(false);
        ui.action.textContent = "Verificando…";
        mascot.rest("think");
        mascot.say("Deixa eu ver…");
        const [result] = await Promise.all([view.check(), wait(600)]);
        showResult(result);
        return;
    }
    results[index] ??= true;
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

const soundButton = $("sound");
const syncSound = () => {
    soundButton.ariaPressed = !isMuted();
    soundButton.ariaLabel = isMuted() ? "Som desligado" : "Som ligado";
};
soundButton.addEventListener("click", () => {
    setMuted(!isMuted());
    syncSound();
});
syncSound();

$("celebration").addEventListener("cancel", (event) => event.preventDefault());
$("close").href = review ? "dashboard.html" : `lessons.html?track=${lesson.track.id}`;
$("celebration-title").textContent = review ? "Revisão completa!" : lesson.challenge ? "Desafio vencido!" : "Lição completa!";
ui.title.textContent = lesson.title;
document.title = `${lesson.title} · EnCoder`;
if (queue.some((step) => step.language === "python")) loadPython().catch(() => {});
render();
