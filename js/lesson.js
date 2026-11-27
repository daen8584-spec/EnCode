import { codeKeys, insertText } from "./code-keys.js";
import { requireUser } from "./auth.js";
import { ALL_LESSONS, findLesson } from "./content.js";
import { $, h, shuffle, toast } from "./dom.js";
import { checkBlank, checkCode, checkFree, checkOrder, describeGiven, runWithGiven } from "./grading.js";
import { annotate } from "./keywords.js";
import { createMascot } from "./mascot.js";
import { baseXp as baseXpOf, dailyMission, EXERCISE_XP, maxXp, rankOf } from "./game.js";
import { afterSession, loadUserData, recordSession } from "./progress.js";
import { loadPython, normalizeCode, runPython } from "./python.js";
import { burst } from "./juice.js";
import { isMuted, play, setMuted } from "./sound.js";

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
    fix: svg('<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>'),
    bulb: svg('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>'),
    play: svg('<path d="M8 5v14l11-7z" fill="currentColor"/>')
};
ICONS.free = ICONS.bulb;
const TASK_LABELS = {
    teach: "Explicação",
    choice: "Escolha a resposta",
    blank: "Complete o código",
    order: "Monte o código",
    code: "Escreva o código",
    fix: "Conserte a máquina",
    free: "Do seu jeito"
};
const PROMPTS = {
    choice: "Qual destas é a resposta certa?",
    blank: "Complete a parte em amarelo.",
    order: "Toque nas linhas na ordem certa.",
    python: "Escreva o código. Você pode executar antes de verificar!",
    html: "Escreva o HTML e compare com o objetivo.",
    css: "Escreva o CSS e deixe igual ao objetivo.",
    fix: "Esta máquina está quebrada. Encontre o erro e conserte!",
    free: "Não importa como você faz: só precisa funcionar em todos os casos!"
};
const FILE_NAMES = { python: "main.py", html: "index.html", css: "style.css" };
const KEYS = {
    python: ["(", ")", "\"", ":", "=", "[", "]", "+", ","],
    html: ["<", ">", "/", "=", "\""],
    css: ["{", "}", ":", ";", ".", "-"]
};
const PRAISE = ["Isso mesmo!", "Mandou bem!", "Perfeito!", "Exatamente!", "Muito bom!"];
const COMFORT = ["Leia a explicação aqui embaixo.", "Errar faz parte. Veja a explicação!", "Sem pressa, vamos entender o erro."];

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
const short = (text) => text.length > 28 ? `${text.slice(0, 26)}...` : text;
const list = (items) => items.length > 1 ? `${items.slice(0, -1).join(", ")} e ${items.at(-1)}` : items.join("");

await requireUser();
const data = await loadUserData();
const params = new URLSearchParams(location.search);

const exercisesById = new Map(ALL_LESSONS.flatMap((lesson) => lesson.exercises).map((exercise) => [exercise.id, exercise]));

// A lesson in progress is kept for this tab, so reloading the page picks up where the student stopped.
const review = params.has("review");
const SAVED_KEY = `encoder-lesson:${review ? "review" : params.get("id")}`;

function readSaved() {
    try {
        return JSON.parse(sessionStorage.getItem(SAVED_KEY));
    } catch {
        return null;
    }
}

function writeSaved(state) {
    try {
        if (state) sessionStorage.setItem(SAVED_KEY, JSON.stringify(state));
        else sessionStorage.removeItem(SAVED_KEY);
    } catch {}
}

const saved = readSaved();

// Review mode practises earlier mistakes first, then random exercises from finished lessons.
function buildReview() {
    const resumed = saved?.exercises?.map((id) => exercisesById.get(id));
    if (resumed?.length && resumed.every(Boolean)) return { title: "Revisão", review: true, teach: [], exercises: resumed };
    const done = ALL_LESSONS.filter((lesson) => data.completedLessons.includes(lesson.id)).flatMap((lesson) => lesson.exercises);
    const mistakes = shuffle(done.filter((exercise) => data.mistakes.includes(exercise.id)));
    const others = shuffle(done.filter((exercise) => !data.mistakes.includes(exercise.id)));
    return { title: "Revisão", review: true, teach: [], exercises: shuffle([...mistakes, ...others].slice(0, REVIEW_SIZE)) };
}

const lesson = review ? buildReview()
    : findLesson(params.get("id")) ?? ALL_LESSONS.find(({ id }) => !data.completedLessons.includes(id)) ?? ALL_LESSONS[0];

if (!lesson.exercises.length) {
    location.replace("lessons.html");
    await new Promise(() => {}); // nothing to practise yet; stop while the page unloads
}

const mascot = createMascot();
// Bit follows along: he thinks while the student types and watches when they pause.
let typingTimer = 0;
$("step").addEventListener("input", () => {
    if (answered) return;
    mascot.mood("think");
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => { if (!answered) mascot.mood("watch"); }, 1400);
});
$("mascot-slot").append(mascot.root);

const words = lesson.teach.filter((card) => card.meaning);
const baseXp = baseXpOf(lesson);
const queue = [{ type: "intro", key: "intro" }, ...lesson.teach.map((card, i) => ({ type: "teach", key: `teach:${i}`, ...card })), ...lesson.exercises];
const keyOf = (step) => step.key ?? step.id;
let results = [];
let missed = new Set();
let index = 0;

function saveState() {
    writeSaved({
        exercises: review ? lesson.exercises.map((exercise) => exercise.id) : undefined,
        queue: queue.map(keyOf),
        index,
        results,
        missed: [...missed].map((exercise) => exercise.id)
    });
}

// Rebuilds the queue (with any exercises sent to the end for another try) from the saved keys.
function resume() {
    if (!saved || !(saved.index > 0) || !Array.isArray(saved.queue)) return false;
    const steps = new Map(queue.map((step) => [keyOf(step), step]));
    const restored = saved.queue.map((key) => steps.get(key));
    if (restored.some((step) => !step) || saved.index >= restored.length) return false;
    queue.splice(0, queue.length, ...restored);
    index = saved.index;
    results = saved.results ?? [];
    missed = new Set((saved.missed ?? []).map((id) => exercisesById.get(id)).filter(Boolean));
    return true;
}

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

    const sync = () => {
        const lines = field.value.split("\n").length;
        const marked = Math.min(errorLine, lines); // errors at the very end are reported one line past it
        gutter.replaceChildren(...Array.from({ length: lines }, (_, i) => h("span", { className: i + 1 === marked ? "is-error" : "", textContent: i + 1 })));
        field.style.height = "auto";
        field.style.height = `${field.scrollHeight}px`;
    };
    const insert = (text) => insertText(field, text);

    field.addEventListener("input", () => {
        errorLine = 0;
        sync();
    });
    field.addEventListener("focus", () => {
        mascot.pointAt(field);
        mascot.mood("watch");
    });
    codeKeys(field, { language, onRun: () => { if (!ui.action.disabled) ui.action.click(); } });

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

// For free exercises the console runs with the first case's starting values, like n = 3.
function pythonConsole(editor, given = null) {
    const output = h("pre", { className: "console-output", textContent: "Toque em Executar para ver a saída do seu código." });
    const run = h("button", { type: "button", className: "button is-success is-small", innerHTML: `${ICONS.play}Executar` });
    run.addEventListener("click", async () => {
        run.disabled = true;
        output.textContent = "Executando...";
        try {
            const { output: text, error } = given ? await runWithGiven(editor.field.value, given) : await runPython(editor.field.value);
            output.textContent = [text.trimEnd(), error].filter(Boolean).join("\n") || "(sem saída)";
            output.classList.toggle("is-error", Boolean(error));
            editor.markError(error);
        } catch {
            output.textContent = "Não foi possível carregar o Python. Verifique sua conexão.";
        } finally {
            run.disabled = false;
        }
    });
    const title = given ? `Saída (com ${describeGiven(given)})` : "Saída";
    return h("div", { className: "console" }, h("div", { className: "console-head" }, h("span", { textContent: title }), run), output);
}

function sandbox({ example, language, sample }) {
    const editor = codeEditor(language, { value: example.code });
    if (language === "python") return h("div", { className: "sandbox" }, editor.node, pythonConsole(editor));
    const live = preview(previewDocument(language, example.code, sample));
    editor.field.addEventListener("input", () => { live.srcdoc = previewDocument(language, editor.field.value, sample); });
    return h("div", { className: "sandbox" }, editor.node, live);
}

// Challenges are the test: no hints, no solutions, no explanations. Everywhere else help comes in small steps.
const helpAllowed = () => !lesson.challenge;

function hintButton(steps) {
    if (!helpAllowed() || !steps.length) return null;
    let used = 0;
    const label = h("span", { textContent: "Dica" });
    const button = h("button", { type: "button", className: "hint-button", innerHTML: ICONS.bulb }, label);
    button.addEventListener("click", () => {
        if (answered) return;
        play("hint");
        steps[used]();
        used += 1;
        if (used >= steps.length) button.disabled = true;
        else label.textContent = used === steps.length - 1 && steps.solution ? "Ver solução" : "Mais uma dica";
    });
    return button;
}

// Shows what the answer looks like without giving it away: strings, text and values become "...".
function skeleton(language, code) {
    if (language === "python") return code.replace(/"[^"\n]*"|'[^'\n]*'/g, "\"...\"").replace(/\b\d+\b/g, "...");
    if (language === "html") return code.replace(/>([^<]+)</g, (whole, text) => (text.trim() ? ">...<" : whole)).replace(/="[^"]*"/g, "=\"...\"");
    return code.replace(/:\s*([^;}]+)/g, ": ...");
}

function hintFor({ language, mustInclude = [], expected, hint }) {
    if (hint) return `Dica: ${hint}`;
    if (language === "python") {
        return mustInclude.length ? `Dica: seu código precisa usar ${list(mustInclude.map((part) => `"${part}"`))}.` : "Dica: compare sua saída com a saída esperada.";
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
        const xpLimit = maxXp(lesson);
        const badge = review ? "Revisão" : lesson.challenge ? `${lesson.track.name}: Desafio`
            : lesson.creative ? `${lesson.track.name}: Desafio criativo`
            : lesson.machine ? `${lesson.track.name}: Máquina quebrada` : lesson.track.name;
        const meta = [
            lesson.teach.length && [ICONS.teach, `${lesson.teach.length} ${lesson.teach.length === 1 ? "explicação" : "explicações"}`],
            [ICONS.code, `${lesson.exercises.length} exercícios`],
            [ICONS.clock, `cerca de ${minutes} min`],
            [ICONS.bolt, `até +${xpLimit} XP`]
        ].filter(Boolean);
        return {
            node: h("div", { className: `lesson-intro card is-${lesson.track?.id ?? "review"}` },
                h("span", { className: "intro-badge", textContent: badge }),
                h("h2", { textContent: lesson.title }),
                words.length > 0 && h("div", { className: "intro-words" },
                    h("span", { className: "label", textContent: "Palavras em inglês desta aula" }),
                    h("ul", {}, words.map((card) => h("li", {}, h("code", { textContent: card.term }), h("span", { textContent: card.meaning }))))
                ),
                lesson.reuses?.length > 0 && h("div", { className: "intro-reuses" },
                    h("span", { className: "label", textContent: words.length ? "Junto com palavras que você já sabe" : "Palavras que você já sabe" }),
                    h("ul", {}, lesson.reuses.map((card) => h("li", { title: card.meaning }, h("code", { textContent: card.term }))))
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

    choice: ({ options, hint: tip, explain: why }) => {
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
                mascot.say(`"${short(option)}"? Toque em Verificar se tiver certeza.`);
            }
        }, h("kbd", { textContent: i + 1 }), h("span", { textContent: option }))));

        // The hint takes away wrong options, leaving the answer and one other.
        const hint = hintButton([() => {
            const wrong = shuffle([...list.children].filter((button) => button.value !== answer));
            for (const button of wrong.slice(0, Math.max(1, wrong.length - 1))) {
                button.disabled = true;
                button.classList.add("is-removed");
                if (button.value === picked) {
                    picked = null;
                    button.ariaPressed = false;
                    setReady(false);
                }
            }
            mascot.say(tip ? `Dica: ${tip}` : "Tirei as erradas. Qual das que sobraram é a certa?");
        }]);
        return {
            node: hint ? h("div", { className: "stack" }, list, h("div", { className: "hint-row" }, hint)) : list,
            check: () => {
                for (const button of list.children) {
                    button.disabled = true;
                    button.classList.toggle("is-correct", button.value === answer);
                    button.classList.toggle("is-wrong", button.value === picked && picked !== answer);
                }
                if (picked === answer) return { ok: true };
                if (!helpAllowed()) {
                    list.querySelector(".is-correct")?.classList.remove("is-correct");
                    return { ok: false, message: "" };
                }
                return { ok: false, message: `A resposta certa está destacada. ${why ?? ""}`.trim(), show: list.querySelector(".is-correct") };
            }
        };
    },

    blank: (exercise) => {
        const { code, answer, placeholder, language, hint: tip, explain: why } = exercise;
        const input = h("input", { className: "input is-code", placeholder, spellcheck: false, autocomplete: "off", autocapitalize: "off" });
        input.setAttribute("autocorrect", "off");
        const marks = code.split("___").slice(1).map(() => h("mark", { textContent: "___" }));
        // One answer fills every blank (like both ends of <___>...</___>), so the code shows it as you type.
        input.addEventListener("input", () => {
            const value = input.value.trim();
            for (const mark of marks) mark.textContent = value || "___";
            setReady(value !== "");
        });
        input.addEventListener("focus", () => {
            mascot.pointAt(input);
            mascot.mood("watch");
        });
        // First the idea, then the shape of the word. The answer itself only appears after a wrong try.
        const hint = hintButton([
            () => mascot.say(`Dica: ${tip ?? "Leia a pergunta de novo e veja o que vem antes e depois do espaço amarelo."}`),
            () => mascot.say(`Começa com "${answer.slice(0, Math.min(2, answer.length - 1)) || answer[0]}" e tem ${answer.length} ${answer.length === 1 ? "caractere" : "caracteres"}.`)
        ]);
        return {
            node: h("div", { className: "stack" },
                h("pre", { className: "code-block" }, code.split("___").flatMap((part, i) => [
                    i > 0 && marks[i - 1],
                    ...annotate(part, language)
                ])),
                input,
                hint && h("div", { className: "hint-row" }, hint)
            ),
            focus: input,
            check: () => {
                const result = checkBlank(input.value, exercise);
                if (result.ok || result.near) return result;
                return { ok: false, message: helpAllowed() ? `A resposta era ${answer}. ${why ?? ""}`.trim() : "" };
            }
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

        const hint = hintButton([() => {
            const first = [...bank.children, ...answer.children].find((chip) => chip.textContent === lines[0]);
            answer.prepend(first);
            first.disabled = true;
            first.classList.add("is-given");
            setReady(bank.children.length === 0);
            mascot.pointAt(first);
            mascot.say("Comecei para você: esta é a primeira linha. Agora continue!");
        }]);
        return {
            node: h("div", { className: "stack" }, answer, bank, hint && h("div", { className: "hint-row" }, hint)),
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

    code: (exercise) => codeTask(exercise),
    free: (exercise) => freeTask(exercise),
    fix: (exercise) => codeTask(exercise, { broken: true })
};

// Writing code from scratch and fixing a broken machine share one layout. A machine starts with its broken code.
function codeTask(exercise, { broken = false } = {}) {
    const { language, expected, sample } = exercise;
    const solution = language === "python" ? exercise.solution : expected;
    const shape = skeleton(language, solution);
    const steps = [() => {
        mascot.mood("idle");
        mascot.say(hintFor(exercise));
    }];
    const shapeBox = h("figure", { className: "hint-shape", hidden: true },
        h("figcaption", { className: "label", textContent: "Formato do código" }),
        h("pre", { className: "code-block", textContent: shape }));
    if (shape !== solution) {
        steps.push(() => {
            shapeBox.hidden = false;
            mascot.pointAt(shapeBox);
            mascot.say("Veja o formato do código. Troque cada ... pelo que falta.");
        });
    }
    steps.push(() => {
        editor.set(solution);
        missed.add(exercise);
        mascot.pointAt(editor.field);
        mascot.say("Aqui está uma solução. Leia com calma e depois toque em Verificar.");
    });
    steps.solution = true;
    const hint = hintButton(steps);
    const editor = codeEditor(language, { tools: hint, value: broken ? exercise.broken : "" });
    editor.field.addEventListener("input", () => setReady(editor.field.value.trim() !== "" && editor.field.value !== exercise.broken));
    const machine = broken && h("div", { className: "machine is-broken" },
        h("div", { className: "machine-head" },
            h("span", { className: "machine-light", ariaHidden: "true" }),
            h("strong", { textContent: exercise.machine }),
            h("span", { className: "machine-status", textContent: "Quebrada" })
        ),
        h("p", { textContent: exercise.story })
    );


    let goal;
    let extra = null;
    if (language === "python") {
        goal = h("div", { className: "goal" },
            h("span", { className: "label", textContent: broken ? "A máquina deveria mostrar" : "Saída esperada" }),
            h("pre", { className: "code-block is-output", textContent: expected })
        );
        extra = pythonConsole(editor);
    } else {
        const live = preview(previewDocument(language, broken ? exercise.broken : "", sample), "Seu resultado");
        editor.field.addEventListener("input", () => { live.srcdoc = previewDocument(language, editor.field.value, sample); });
        goal = h("div", { className: "compare" },
            h("figure", {}, h("figcaption", { className: "label", textContent: "Objetivo" }), preview(previewDocument(language, expected, sample), "Objetivo")),
            h("figure", {}, h("figcaption", { className: "label", textContent: "Seu resultado" }), live)
        );
    }

    return {
        node: h("div", { className: "stack" }, machine, language === "python" && goal, editor.node, shapeBox, extra, language !== "python" && goal),
        focus: broken ? null : editor.field,
        check: () => checkCode(language, editor.field.value, exercise),
        onResult: (result) => {
            editor.markError(result.message);
            if (machine && result.ok) {
                machine.className = "machine is-fixed";
                machine.querySelector(".machine-status").textContent = "Consertada!";
            }
        }
    };
}

// Free exercises: the goal is the result, the way there is the student's. One hint with an idea, never a solution.
function freeTask(exercise) {
    const { cases, hint: tip, example, bonus } = exercise;
    const hint = hintButton(tip ? [() => {
        mascot.mood("idle");
        mascot.say(`Dica: ${tip}`);
    }] : []);
    const editor = codeEditor("python", { tools: hint });
    editor.field.addEventListener("input", () => setReady(editor.field.value.trim() !== ""));
    const several = cases.length > 1;
    const goal = h("div", { className: "goal free-cases" },
        h("span", { className: "label", textContent: several ? "Seu código precisa funcionar em todos estes casos" : "Saída esperada" }),
        h("div", { className: "free-case-list" }, cases.map(({ given, expected }) => h("div", { className: "free-case" },
            given && h("span", { className: "free-given", textContent: `Se ${describeGiven(given)}` }),
            h("pre", { className: "code-block is-output", textContent: expected })
        )))
    );
    const bonusNote = h("p", { className: "free-bonus" });
    const other = h("figure", { className: "free-example", hidden: true },
        h("figcaption", { className: "label", textContent: "Funcionou! Veja outro jeito de resolver" }),
        h("pre", { className: "code-block", textContent: example ?? "" }),
        bonusNote
    );
    return {
        node: h("div", { className: "stack" }, goal, editor.node, pythonConsole(editor, cases[0].given ?? null), other),
        focus: editor.field,
        check: () => checkFree(editor.field.value, exercise),
        onResult: (result) => {
            editor.markError(result.message);
            if (!result.ok) return;
            other.hidden = !example && !bonus;
            other.querySelector("pre").hidden = !example;
            if (bonus) {
                const lines = editor.field.value.split("\n").filter((line) => line.trim()).length;
                bonusNote.textContent = lines <= bonus.lines
                    ? `Bônus conquistado: você resolveu em ${lines} ${lines === 1 ? "linha" : "linhas"}!`
                    : `Bônus: dá para resolver em até ${bonus.lines} linhas. Quer tentar outro dia?`;
            }
        }
    };
}

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
            : lesson.machine ? "Ih, umas máquinas quebraram! Vamos descobrir o que aconteceu e consertar juntos?"
            : lesson.challenge ? "Hora do desafio! Sem dicas e sem ajuda desta vez: só você e o código."
            : lesson.creative ? "Desafio criativo! Eu mostro o resultado, e você escolhe como chegar lá. Pense com calma!"
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

// A near miss (letter case, a typo, an accent) is not a mistake: say what to fix and let the student try again.
function showNear({ message }) {
    view.onResult?.({ ok: false, message });
    play("near");
    ui.footer.className = "lesson-footer is-near";
    $("feedback-title").textContent = "Quase!";
    $("feedback-detail").textContent = helpAllowed() ? message.replace(/^Quase! /, "") : "Tem um pequeno detalhe diferente. Confira e verifique de novo.";
    ui.feedback.hidden = false;
    ui.action.className = "button lesson-action";
    ui.action.textContent = "Verificar de novo";
    setReady(true);
    mascot.mood("watch");
    mascot.say(helpAllowed() ? message : "Quase! Confira os detalhes.");
    view.focus?.focus();
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
    // A streak climbs: each right answer in a row plays a little higher and the flame grows.
    play(ok ? "correct" : "wrong", { rise: Math.max(0, combo - 1) });
    if (ok) burst(ui.step.querySelector(".option[aria-pressed='true'], .is-correct, .order-answer, .input.is-code, .editor") ?? ui.step);

    $("combo").hidden = combo < 2;
    $("combo-count").textContent = combo;
    $("combo").dataset.level = String(Math.min(combo, 6));
    if (combo >= 2) $("combo").animate([{ scale: 1.5 }, { scale: 1 }], { duration: 320, easing: "cubic-bezier(0.3, 1.6, 0.5, 1)" });

    ui.footer.className = `lesson-footer ${ok ? "is-correct" : "is-wrong"}`;
    $("feedback-title").textContent = ok ? pick(PRAISE) : "Resposta incorreta";
    $("feedback-detail").textContent = ok ? "" : `${message || "Confira e tente de novo."} Você vai tentar de novo no fim.`;
    ui.feedback.hidden = false;
    ui.action.classList.add(ok ? "is-success" : "is-error");
    ui.action.textContent = "Continuar";
    setReady(true);

    if (ok) {
        clearTimeout(typingTimer);
        mascot.mood(combo >= 3 ? "wow" : "happy");
        mascot.say(combo >= 3 ? `${combo} acertos seguidos! Você está voando!` : $("feedback-title").textContent);
    } else if (show) {
        mascot.pointAt(show);
        mascot.say("A certa é esta aqui. Vamos treinar de novo no fim!");
    } else {
        mascot.mood("sad");
        mascot.say(helpAllowed() ? pick(COMFORT) : "Não foi dessa vez. Você tenta de novo no fim!");
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
    // Finishing the last main lesson of a unit is its own moment: the aurora lights up.
    const unit = lesson.track.units?.find((candidate) => candidate.lessons.includes(lesson));
    const unitDone = !review && unit && unit.lessons.filter((other) => !other.creative)
        .every((other) => other === lesson || data.completedLessons.includes(other.id));
    $("celebration").classList.toggle("is-unit-done", Boolean(unitDone));
    if (unitDone) $("celebration-title").textContent = "Unidade completa!";
    play(unitDone ? "unit" : "done");
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
        : unitDone ? `Unidade completa! A aurora acendeu sobre "${unit.title}".`
        : review ? "Revisão feita! Seus erros estão sumindo."
        : lesson.machine ? "Tudo funcionando de novo! Você é demais!"
        : lesson.challenge ? "Desafio vencido! Que orgulho!"
        : lesson.creative ? "Você resolveu do seu jeito. Isso é pensar como programador!"
        : pick(["Você arrasou!", "Aula concluída! Bora para a próxima?"]));
    countUp($("xp-gained"), xp);
    countUp($("accuracy"), Math.round((firstTry / lesson.exercises.length) * 100));
    confetti(dialog);

    try {
        await recordSession({
            lessonId: lesson.id,
            xp,
            missed: ids([...missed]),
            passed: ids(lesson.exercises.filter((exercise) => !missed.has(exercise)))
        });
    } catch (error) {
        // The result stays on this device and is sent the next time a page loads.
        console.error("Could not save progress", error);
        toast("Sem conexão agora. Seu progresso ficou guardado e será salvo quando você voltar.", "error");
    }
}

ui.action.addEventListener("click", async () => {
    if (view.check && !answered) {
        setReady(false);
        ui.action.textContent = "Verificando...";
        mascot.rest("think");
        mascot.say("Deixa eu ver...");
        const [result] = await Promise.all([view.check(), wait(600)]);
        if (result.near) showNear(result);
        else showResult(result);
        return;
    }
    results[index] ??= true;
    index += 1;
    if (index < queue.length) {
        saveState();
        render();
    } else {
        writeSaved(null);
        finish();
    }
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
$("celebration-title").textContent = review ? "Revisão completa!" : lesson.challenge ? "Desafio vencido!"
    : lesson.creative ? "Desafio criativo completo!"
    : lesson.machine ? "Máquinas consertadas!" : "Lição completa!";
ui.title.textContent = lesson.title;
document.title = `${lesson.title} | EnCoder`;
if (queue.some((step) => step.language === "python")) loadPython().catch(() => {});
const resumed = resume();
render();
if (resumed) toast("Continuando de onde você parou.", "info");
