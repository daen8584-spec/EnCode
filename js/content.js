// Exercise types:
//   choice: options[0] is the correct answer; options are shuffled when shown.
//   blank:  fill each ___ in `code` with `answer`.
//   order:  tap `lines` into the order they are listed in.
//   code:   write code from scratch. Python compares printed output with `expected`;
//            HTML and CSS compare the result with `expected`. `mustInclude` lists code that must appear.
//   fix:    a broken machine. Like `code`, but the editor starts with `broken` code to repair.
//            `machine` and `story` describe it; `hint` is the first hint.
// Python code and fix exercises carry a `solution`; for HTML and CSS the solution is `expected`.
// Lessons marked `machine` or `challenge` have no teach cards and appear differently on the map.
// Teach cards with a `meaning` are added to the student's dictionary.

import css from "./content/css.js";
import html from "./content/html.js";
import python from "./content/python.js";

export const TRACKS = [python, html, css];

// Whether a lesson's code uses a word from an earlier lesson.
const USES_WORD = {
    python: (term) => new RegExp(`(?<![\\w"])${term}\\b`),
    html: (term) => new RegExp(`<${term}[\\s>/]|\\s${term}=`),
    css: (term) => new RegExp(`(^|[\\s{;])${term}\\s*:`, "m")
};

// All the code a student reads or writes in a lesson (Python's `expected` is output, not code).
const codeOf = (lesson, language) => lesson.exercises
    .flatMap(({ code, lines = [], solution, expected, broken }) => [code, ...lines, solution, language === "python" ? "" : expected, broken])
    .filter(Boolean)
    .join("\n");

for (const track of TRACKS) {
    track.lessons = track.units.flatMap((unit) => unit.lessons);
    const learned = [];
    track.lessons.forEach((lesson, i) => {
        Object.assign(lesson, { track, previous: track.lessons[i - 1], next: track.lessons[i + 1] });
        for (const step of lesson.teach) Object.assign(step, { language: track.id, sample: lesson.sample });
        lesson.exercises.forEach((exercise, j) => {
            Object.assign(exercise, { id: `${lesson.id}:${j}`, language: track.id, sample: lesson.sample });
        });
        // Lessons build on each other: list the earlier words this one puts to work again.
        const code = codeOf(lesson, track.id);
        lesson.reuses = learned.filter((card) => USES_WORD[track.id](card.term).test(code));
        learned.push(...lesson.teach.filter((card) => card.meaning && /^[a-z][\w-]*$/.test(card.term)));
    });
}

export const ALL_LESSONS = TRACKS.flatMap((track) => track.lessons);

export const findTrack = (id) => TRACKS.find((track) => track.id === id) ?? TRACKS[0];

export const findLesson = (id) => ALL_LESSONS.find((lesson) => lesson.id === id);
