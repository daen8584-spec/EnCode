import { auth, db, doc, getDoc, runTransaction, setDoc } from "./firebase.js";
import { h } from "./dom.js";

const DEFAULTS = { xp: 0, streak: 0, lastPlayed: "", completedLessons: [], mistakes: [], photoUrl: "" };

const userDoc = () => doc(db, "users", auth.currentUser.uid);

// YYYY-MM-DD in the user's time zone, so streaks follow their calendar day.
export const localDate = (date = new Date()) => date.toLocaleDateString("en-CA");

// Noon avoids skipping or repeating a day when the clocks change.
const dayBefore = (date) => {
    const day = new Date(`${date}T12:00:00`);
    day.setDate(day.getDate() - 1);
    return localDate(day);
};

export function currentStreak({ streak, lastPlayed }) {
    const today = localDate();
    return lastPlayed === today || lastPlayed === dayBefore(today) ? streak : 0;
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

// What one finished lesson or review changes. `missed` exercises join the review list;
// `passed` ones (right on the first try) leave it. `date` is the day it was played, which
// matters when a session is saved late, after the student was offline.
export function sessionChanges(data, { lessonId, xp, missed, passed, date }) {
    const older = data.lastPlayed > date;
    const streak = older || data.lastPlayed === date ? data.streak
        : data.lastPlayed === dayBefore(date) ? data.streak + 1
        : 1;
    return {
        xp: data.xp + xp,
        streak,
        lastPlayed: older ? data.lastPlayed : date,
        mistakes: [...new Set([...data.mistakes, ...missed])].filter((id) => !passed.includes(id)),
        ...(date === localDate() && { today: afterSession(data, { lessonId, xp }) }),
        ...(lessonId && { completedLessons: [...new Set([...data.completedLessons, lessonId])] })
    };
}

// Reads and writes happen in one transaction, so two tabs or devices cannot overwrite each other.
const applySession = (session) => runTransaction(db, async (transaction) => {
    const ref = userDoc();
    const snapshot = await transaction.get(ref);
    transaction.set(ref, sessionChanges({ ...DEFAULTS, ...snapshot.data() }, session), { merge: true });
});

// Finished sessions wait in localStorage until they are saved, so a lost connection loses nothing.
const pendingKey = () => `encoder-pending:${auth.currentUser.uid}`;

function readPending() {
    try {
        return JSON.parse(localStorage.getItem(pendingKey())) ?? [];
    } catch {
        return [];
    }
}

function writePending(sessions) {
    try {
        if (sessions.length) localStorage.setItem(pendingKey(), JSON.stringify(sessions));
        else localStorage.removeItem(pendingKey());
    } catch {}
}

// Errors that will never go away by retrying; such a session is dropped instead of retried forever.
const PERMANENT = new Set(["permission-denied", "invalid-argument"]);

// One tab at a time, so the same waiting session is not saved twice.
const exclusive = (task) => navigator.locks?.request("encoder-pending", task) ?? task();

const flush = (extra = []) => exclusive(async () => {
    const left = [];
    let failure = null;
    for (const session of [...readPending(), ...extra]) {
        if (failure) {
            left.push(session);
            continue;
        }
        try {
            await applySession(session);
        } catch (error) {
            if (PERMANENT.has(error.code)) {
                console.error("The server refused a lesson result; dropping it", session, error);
                continue;
            }
            failure = error;
            left.push(session);
        }
    }
    writePending(left);
    if (failure) throw failure;
});

export const recordSession = (session) => flush([{ ...session, date: localDate() }]);

function showLoadError() {
    document.body.classList.remove("is-loading");
    document.body.append(h("div", { className: "load-error", role: "alert" },
        h("div", { className: "load-error-card card" },
            h("h1", { textContent: "Não conseguimos carregar seu progresso" }),
            h("p", { className: "muted", textContent: "Verifique sua internet e tente de novo. Nada do que você já fez foi perdido." }),
            h("button", { type: "button", className: "button", textContent: "Tentar de novo", onclick: () => location.reload() })
        )
    ));
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function loadUserData() {
    await flush().catch((error) => console.warn("Saved lessons are still waiting to be sent", error));
    for (let attempt = 1; ; attempt++) {
        try {
            const snapshot = await getDoc(userDoc());
            const data = { ...DEFAULTS, ...snapshot.data() };
            // Show sessions that are still waiting to be saved as if they were.
            for (const session of readPending()) Object.assign(data, sessionChanges(data, session));
            return data;
        } catch (error) {
            console.error("Could not load user data", error);
            if (attempt < 2) {
                await wait(1000);
                continue;
            }
            // Never hand the page blank data: saving on top of it would overwrite the real progress.
            showLoadError();
            return new Promise(() => {});
        }
    }
}

export const saveUserData = (data) => setDoc(userDoc(), data, { merge: true });
