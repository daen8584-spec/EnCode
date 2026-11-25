// Checks every lesson in the browser, with the same code the site uses to grade students:
// each exercise's own answer must pass, every broken machine must fail before it is fixed,
// Python teach examples must print what their card says, and no lesson may earn more XP
// than firestore.rules accepts in one save.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const TYPES = { ".js": "text/javascript", ".html": "text/html", ".css": "text/css", ".svg": "image/svg+xml" };
const MAX_XP_PER_SAVE = 50; // MAX_XP_PER_SAVE() in firestore.rules

function serve() {
    const server = createServer((request, response) => {
        const file = normalize(join(ROOT, decodeURIComponent(new URL(request.url, "http://localhost").pathname)));
        if (!file.startsWith(ROOT) || !existsSync(file) || statSync(file).isDirectory()) {
            response.writeHead(404).end();
            return;
        }
        response.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
        createReadStream(file).pipe(response);
    });
    return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

test("every lesson can be finished and earns XP the rules accept", { timeout: 300_000 }, async () => {
    const server = await serve();
    const browser = await chromium.launch();
    try {
        const page = await browser.newPage();
        // Fonts are not needed here.
        await page.route("https://fonts.googleapis.com/**", (route) => route.fulfill({ body: "", contentType: "text/css" }));
        await page.goto(`http://127.0.0.1:${server.address().port}/404.html`);

        const { count, problems } = await page.evaluate(async (maxPerSave) => {
            const { ALL_LESSONS } = await import("/js/content.js");
            const { checkBlank, checkCode } = await import("/js/grading.js");
            const { maxXp } = await import("/js/xp.js");
            const { runPython } = await import("/js/python.js");
            const problems = [];
            const report = (where, message) => problems.push(`${where}: ${message}`);
            const ids = new Set();

            for (const lesson of ALL_LESSONS) {
                const language = lesson.track.id;
                if (ids.has(lesson.id)) report(lesson.id, "duplicate lesson id");
                ids.add(lesson.id);
                if (maxXp(lesson) > maxPerSave) report(lesson.id, `can earn ${maxXp(lesson)} XP, but one save accepts at most ${maxPerSave}`);

                for (const card of lesson.teach) {
                    if (language !== "python") continue;
                    const where = `${lesson.id} teach "${card.term}"`;
                    const { output, error } = await runPython(card.example.code);
                    if (error) report(where, `example fails: ${error}`);
                    else if (output.trim() !== card.example.output.trim()) report(where, `example prints ${JSON.stringify(output.trim())}, the card says ${JSON.stringify(card.example.output)}`);
                }

                for (const exercise of lesson.exercises) {
                    const where = `${exercise.id} (${exercise.type})`;
                    try {
                        if (exercise.type === "choice") {
                            if (exercise.options.length < 2) report(where, "needs at least 2 options");
                            if (new Set(exercise.options).size !== exercise.options.length) report(where, "has duplicate options");
                        } else if (exercise.type === "blank") {
                            if (!exercise.code.includes("___")) report(where, "code has no ___ to fill");
                            for (const answer of [exercise.answer, ...(exercise.accept ?? [])]) {
                                if (!checkBlank(answer, exercise).ok) report(where, `the answer ${JSON.stringify(answer)} does not pass`);
                            }
                            // Kids type in capitals by accident: in Python that is a near miss, never a plain "wrong".
                            const shouted = exercise.answer.toUpperCase();
                            if (shouted !== exercise.answer) {
                                const result = checkBlank(shouted, exercise);
                                if (!(language === "python" ? result.near : result.ok)) report(where, `${JSON.stringify(shouted)} should be ${language === "python" ? "a near miss" : "accepted"}`);
                            }
                            if (exercise.type === "blank" && !lesson.challenge && !exercise.hint) report(where, "needs a `hint`");
                        } else if (exercise.type === "order") {
                            if (exercise.lines.length < 2) report(where, "needs at least 2 lines");
                            if (language === "python") {
                                const { error } = await runPython(exercise.lines.join("\n"));
                                if (error) report(where, `the lines in order fail: ${error}`);
                            }
                        } else if (exercise.type === "code" || exercise.type === "fix") {
                            const answer = language === "python" ? exercise.solution : exercise.expected;
                            if (!answer) {
                                report(where, "has no solution");
                                continue;
                            }
                            const result = await checkCode(language, answer, exercise);
                            if (!result.ok) report(where, `its own solution fails: ${result.message}`);
                            for (const part of exercise.mustInclude ?? []) {
                                if (!answer.includes(part)) report(where, `solution does not use ${JSON.stringify(part)}, which it requires`);
                            }
                            if (exercise.type === "fix" && (await checkCode(language, exercise.broken, exercise)).ok) {
                                report(where, "the broken code already passes");
                            }
                            // The automatic CSS hint reads the first rule of `expected`.
                            if (language === "css" && !exercise.hint && !/^\s*([^{]+?)\s*\{([^}]*)\}/.test(exercise.expected)) {
                                report(where, "needs a `hint`: its expected CSS does not start with a rule");
                            }
                        } else {
                            report(where, "unknown exercise type");
                        }
                    } catch (error) {
                        report(where, `threw ${error}`);
                    }
                }
            }
            return { count: ALL_LESSONS.reduce((sum, lesson) => sum + lesson.exercises.length, 0), problems };
        }, MAX_XP_PER_SAVE);

        assert.ok(count > 0, "no exercises found");
        assert.deepEqual(problems, [], `${problems.length} problem(s) in lesson content`);
    } finally {
        await browser.close();
        server.close();
    }
});
