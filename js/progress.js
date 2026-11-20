import { arrayUnion, auth, db, doc, getDoc, increment, setDoc } from "./firebase.js";

export const LEVEL_XP = 100;

const userDoc = () => doc(db, "users", auth.currentUser.uid);

// YYYY-MM-DD in the user's time zone, so streaks follow their calendar day.
const localDate = (date) => date.toLocaleDateString("en-CA");

const yesterday = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return localDate(date);
};

export async function loadUserData() {
    const defaults = { xp: 0, streak: 0, lastPlayed: "", completedLessons: [], photoUrl: "" };
    try {
        const snapshot = await getDoc(userDoc());
        return { ...defaults, ...snapshot.data() };
    } catch (error) {
        console.error("Could not load user data", error);
        return defaults;
    }
}

export const saveUserData = (data) => setDoc(userDoc(), data, { merge: true });

export const levelOf = (xp) => ({ level: Math.floor(xp / LEVEL_XP) + 1, progress: xp % LEVEL_XP });

export function currentStreak({ streak, lastPlayed }) {
    return lastPlayed === localDate(new Date()) || lastPlayed === yesterday() ? streak : 0;
}

export function completeLesson(data, lessonId, xp) {
    const today = localDate(new Date());
    const streak = data.lastPlayed === today ? data.streak
        : data.lastPlayed === yesterday() ? data.streak + 1
        : 1;

    return saveUserData({
        xp: increment(xp),
        streak,
        lastPlayed: today,
        completedLessons: arrayUnion(lessonId)
    });
}
