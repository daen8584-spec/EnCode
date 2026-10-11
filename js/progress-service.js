import { auth } from "./firebase-config.js";

const PROJECT_ID = "proyect-af2be";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users`;

const docUrl = (uid) => `${BASE_URL}/${uid}`;

const getToken = () => auth.currentUser?.getIdToken() ?? Promise.reject(new Error("Usuário não autenticado"));

const defaultProgress = () => ({ xp: 0, streak: 0, lastPlayed: "", completedLessons: [] });

const parseValue = (field) => {
    if (field.stringValue !== undefined) return field.stringValue;
    if (field.integerValue !== undefined) return parseInt(field.integerValue, 10);
    if (field.booleanValue !== undefined) return field.booleanValue;
    if (field.arrayValue !== undefined) return (field.arrayValue.values ?? []).map((v) => v.stringValue ?? v);
    return undefined;
};

const parseFields = (fields = {}) =>
    Object.entries(fields).reduce((acc, [key, value]) => { acc[key] = parseValue(value); return acc; }, {});

const toField = (value) => {
    if (typeof value === "number") return { integerValue: String(Math.round(value)) };
    if (typeof value === "boolean") return { booleanValue: value };
    if (Array.isArray(value)) return { arrayValue: { values: value.map((v) => ({ stringValue: String(v) })) } };
    return { stringValue: String(value) };
};

const toFields = (obj) =>
    Object.entries(obj).reduce((acc, [key, value]) => { acc[key] = toField(value); return acc; }, {});

const normalize = (data) => ({
    xp: typeof data.xp === "number" ? data.xp : 0,
    streak: typeof data.streak === "number" ? data.streak : 0,
    lastPlayed: data.lastPlayed || "",
    completedLessons: Array.isArray(data.completedLessons) ? data.completedLessons : []
});

export async function loadProgress() {
    try {
        const user = auth.currentUser;
        if (!user) return defaultProgress();
        const token = await getToken();
        const res = await fetch(docUrl(user.uid), { headers: { Authorization: `Bearer ${token}` } });
        if (res.status === 404 || !res.ok) return defaultProgress();
        const json = await res.json();
        return normalize(parseFields(json.fields));
    } catch {
        return defaultProgress();
    }
}

export async function saveProgress(progress) {
    const user = auth.currentUser;
    if (!user) return;
    const token = await getToken();
    const fields = toFields({
        xp: progress.xp,
        streak: progress.streak,
        lastPlayed: progress.lastPlayed,
        completedLessons: progress.completedLessons
    });
    const mask = ["xp", "streak", "lastPlayed", "completedLessons"]
        .map((k) => `updateMask.fieldPaths=${k}`).join("&");
    const res = await fetch(`${docUrl(user.uid)}?${mask}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fields })
    });
    if (!res.ok) throw new Error(`Erro ao salvar progresso: HTTP ${res.status}`);
    return res.json();
}

const dateString = (date) => date.toISOString().slice(0, 10);

export const todayString = () => dateString(new Date());

export const yesterdayString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return dateString(d);
};

export async function addXpAndStreak(amount) {
    const progress = await loadProgress();
    progress.xp += amount;
    const today = todayString();
    if (progress.lastPlayed !== today) {
        progress.streak = progress.lastPlayed === yesterdayString() ? progress.streak + 1 : 1;
        progress.lastPlayed = today;
    }
    await saveProgress(progress);
    return progress;
}

export async function markLessonComplete(lessonId) {
    const progress = await loadProgress();
    if (!progress.completedLessons.includes(lessonId)) progress.completedLessons.push(lessonId);
    await saveProgress(progress);
    return progress;
}
