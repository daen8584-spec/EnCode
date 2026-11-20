import { arrayUnion, auth, db, doc, getDoc, increment, setDoc } from "./firebase.js";

const userDoc = () => doc(db, "users", auth.currentUser.uid);

// YYYY-MM-DD in the user's time zone, so streaks follow their calendar day.
export const localDate = (date = new Date()) => date.toLocaleDateString("en-CA");

const yesterday = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return localDate(date);
};

export async function loadUserData() {
    const defaults = { xp: 0, streak: 0, lastPlayed: "", completedLessons: [], mistakes: [], photoUrl: "" };
    try {
        const snapshot = await getDoc(userDoc());
        return { ...defaults, ...snapshot.data() };
    } catch (error) {
        console.error("Could not load user data", error);
        return defaults;
    }
}

export const saveUserData = (data) => setDoc(userDoc(), data, { merge: true });

export function currentStreak({ streak, lastPlayed }) {
    return lastPlayed === localDate() || lastPlayed === yesterday() ? streak : 0;
}

// Today's counters drive the daily mission. The mission is picked once per day and kept with them.
const MISSION_POOL = ["xp", "lessons", "review"];

export function todayCounts(data) {
    const date = localDate();
    if (data.today?.date === date) return data.today;
    const seed = [...date].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const mission = data.completedLessons.length ? MISSION_POOL[seed % MISSION_POOL.length] : "first";
    return { date, mission, xp: 0, lessons: 0, reviews: 0 };
}

export function afterSession(data, { lessonId, xp }) {
    const counts = todayCounts(data);
    return { ...counts, xp: counts.xp + xp, lessons: counts.lessons + (lessonId ? 1 : 0), reviews: counts.reviews + (lessonId ? 0 : 1) };
}

// `missed` exercises join the review list; `passed` ones (right on the first try) leave it.
export function recordSession(data, { lessonId, xp, missed, passed }) {
    const today = localDate();
    const streak = data.lastPlayed === today ? data.streak
        : data.lastPlayed === yesterday() ? data.streak + 1
        : 1;
    const mistakes = [...new Set([...data.mistakes, ...missed])].filter((id) => !passed.includes(id));

    return saveUserData({
        xp: increment(xp),
        streak,
        lastPlayed: today,
        mistakes,
        today: afterSession(data, { lessonId, xp }),
        ...(lessonId && { completedLessons: arrayUnion(lessonId) })
    });
}
