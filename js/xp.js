// XP for finishing a lesson, plus EXERCISE_XP for each exercise right on the first try.
// firestore.rules accepts at most 50 XP in one save; tests/content.test.mjs checks every lesson stays within it.
export const EXERCISE_XP = 2;
const REVIEW_XP = 5;
const LESSON_XP = 10;

export const baseXp = (lesson) => lesson.review ? REVIEW_XP
    : LESSON_XP * (lesson.challenge ? 2 : lesson.machine ? 1.5 : 1);

export const maxXp = (lesson) => baseXp(lesson) + EXERCISE_XP * lesson.exercises.length;
