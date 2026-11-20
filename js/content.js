// Exercise types:
//   choice — options[0] is the correct answer; options are shuffled when shown.
//   blank  — fill each ___ in `code` with `answer`.
//   order  — tap `lines` into the order they are listed in.
//   code   — write code from scratch. Python compares printed output with `expected`;
//            HTML and CSS compare the result with `expected`. `mustInclude` lists code that must appear.
// Teach cards with a `meaning` are added to the student's dictionary.

import css from "./content/css.js";
import html from "./content/html.js";
import python from "./content/python.js";

export const TRACKS = [python, html, css];

for (const track of TRACKS) {
    track.lessons = track.units.flatMap((unit) => unit.lessons);
    track.lessons.forEach((lesson, i) => {
        Object.assign(lesson, { track, previous: track.lessons[i - 1], next: track.lessons[i + 1] });
        for (const step of lesson.teach) Object.assign(step, { language: track.id, sample: lesson.sample });
        lesson.exercises.forEach((exercise, j) => {
            Object.assign(exercise, { id: `${lesson.id}:${j}`, language: track.id, sample: lesson.sample });
        });
    });
}

export const ALL_LESSONS = TRACKS.flatMap((track) => track.lessons);

export const findTrack = (id) => TRACKS.find((track) => track.id === id) ?? TRACKS[0];

export const findLesson = (id) => ALL_LESSONS.find((lesson) => lesson.id === id);
