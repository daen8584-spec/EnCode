import { auth } from "./firebase-config.js";

const PROJECT_ID = "proyect-af2be";

function docUrl(uid) {
    return "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/(default)/documents/users/" + uid;
}

async function getToken() {
    if (!auth.currentUser) throw new Error("Usuário não autenticado");
    return await auth.currentUser.getIdToken();
}

function fieldsToObject(fields) {
    const result = {};
    if (!fields) return result;
    Object.keys(fields).forEach(function (k) {
        const f = fields[k];
        if (f.stringValue !== undefined) result[k] = f.stringValue;
        else if (f.integerValue !== undefined) result[k] = parseInt(f.integerValue, 10);
        else if (f.booleanValue !== undefined) result[k] = f.booleanValue;
        else if (f.arrayValue !== undefined) {
            result[k] = (f.arrayValue.values || []).map(function (v) {
                return v.stringValue !== undefined ? v.stringValue : v;
            });
        }
    });
    return result;
}

function objectToFields(obj) {
    const fields = {};
    Object.keys(obj).forEach(function (k) {
        const v = obj[k];
        if (typeof v === "number") fields[k] = { integerValue: String(Math.round(v)) };
        else if (typeof v === "boolean") fields[k] = { booleanValue: v };
        else if (Array.isArray(v)) {
            fields[k] = {
                arrayValue: {
                    values: v.map(function (item) {
                        return { stringValue: String(item) };
                    })
                }
            };
        } else {
            fields[k] = { stringValue: String(v) };
        }
    });
    return fields;
}

export async function loadProgress() {
    try {
        const user = auth.currentUser;
        if (!user) return defaultProgress();
        const token = await getToken();
        const res = await fetch(docUrl(user.uid), {
            headers: { "Authorization": "Bearer " + token }
        });
        if (res.status === 404) return defaultProgress();
        if (!res.ok) return defaultProgress();
        const json = await res.json();
        const data = fieldsToObject(json.fields);
        return normalizeProgress(data);
    } catch (e) {
        return defaultProgress();
    }
}

function defaultProgress() {
    return {
        xp: 0,
        streak: 0,
        lastPlayed: "",
        completedLessons: []
    };
}

function normalizeProgress(data) {
    return {
        xp: typeof data.xp === "number" ? data.xp : 0,
        streak: typeof data.streak === "number" ? data.streak : 0,
        lastPlayed: data.lastPlayed || "",
        completedLessons: Array.isArray(data.completedLessons) ? data.completedLessons : []
    };
}

export async function saveProgress(progress) {
    const user = auth.currentUser;
    if (!user) return;
    const token = await getToken();
    const fields = objectToFields({
        xp: progress.xp,
        streak: progress.streak,
        lastPlayed: progress.lastPlayed,
        completedLessons: progress.completedLessons
    });
    const mask = ["xp", "streak", "lastPlayed", "completedLessons"].map(function (k) {
        return "updateMask.fieldPaths=" + k;
    }).join("&");
    const url = docUrl(user.uid) + "?" + mask;
    const res = await fetch(url, {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ fields: fields })
    });
    if (!res.ok) throw new Error("Erro ao salvar progresso: HTTP " + res.status);
    return await res.json();
}

export function todayString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
}

export function yesterdayString() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
}

export async function addXpAndStreak(amount) {
    const progress = await loadProgress();
    progress.xp = progress.xp + amount;
    const today = todayString();
    if (progress.lastPlayed !== today) {
        if (progress.lastPlayed === yesterdayString()) {
            progress.streak = progress.streak + 1;
        } else {
            progress.streak = 1;
        }
        progress.lastPlayed = today;
    }
    await saveProgress(progress);
    return progress;
}

export async function markLessonComplete(lessonId) {
    const progress = await loadProgress();
    if (progress.completedLessons.indexOf(lessonId) === -1) {
        progress.completedLessons.push(lessonId);
    }
    await saveProgress(progress);
    return progress;
}
