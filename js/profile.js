import { auth } from "./firebase-config.js";
import { updateProfile } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const PROJECT_ID = "proyect-af2be";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp"];
const AVATAR_SIZE = 256;

const docUrl = (uid) => `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${uid}`;

const getToken = () => auth.currentUser.getIdToken();

async function saveToFirestore(uid, data) {
    const token = await getToken();
    const fields = Object.entries(data).reduce((acc, [k, v]) => { acc[k] = { stringValue: String(v) }; return acc; }, {});
    const mask = Object.keys(data).map((k) => `updateMask.fieldPaths=${k}`).join("&");
    const res = await fetch(`${docUrl(uid)}?${mask}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fields })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    return res.json();
}

async function loadFromFirestore(uid) {
    try {
        const token = await getToken();
        const res = await fetch(docUrl(uid), { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return {};
        const json = await res.json();
        return Object.entries(json.fields ?? {}).reduce((acc, [k, v]) => { acc[k] = v.stringValue ?? ""; return acc; }, {});
    } catch {
        return {};
    }
}

const getInitials = (name, email) => {
    const source = name?.trim() || email?.split("@")[0] || "";
    if (!source) return "?";
    const parts = source.trim().split(/\s+/);
    return parts.length === 1
        ? parts[0][0].toUpperCase()
        : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatDate = (value) => {
    if (!value) return "-";
    try {
        return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    } catch {
        return "-";
    }
};

const compressImage = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = ({ target }) => {
        const img = new Image();
        img.onload = () => {
            const size = Math.min(img.width, img.height);
            const canvas = Object.assign(document.createElement("canvas"), { width: AVATAR_SIZE, height: AVATAR_SIZE });
            canvas.getContext("2d").drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
            resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.onerror = reject;
        img.src = target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };

const cacheKey = (uid) => `encoder_photo_${uid}`;
const cachePhoto = (uid, url) => { try { localStorage.setItem(cacheKey(uid), url); } catch {} };
const readCachedPhoto = (uid) => { try { return localStorage.getItem(cacheKey(uid)) ?? ""; } catch { return ""; } };

let currentPhotoUrl = "";

function renderAvatar(photoUrl, name, email) {
    const img = document.getElementById("profile-avatar-img");
    const initials = document.getElementById("profile-avatar-initials");
    const top = document.getElementById("user-avatar");
    if (!img || !initials) return;
    if (photoUrl) {
        img.src = photoUrl;
        img.removeAttribute("hidden");
        initials.setAttribute("hidden", "");
        if (top) {
            Object.assign(top.style, { backgroundImage: `url('${photoUrl}')`, backgroundSize: "cover", backgroundPosition: "center" });
            top.textContent = "";
        }
    } else {
        img.setAttribute("hidden", "");
        initials.removeAttribute("hidden");
        initials.textContent = getInitials(name, email);
        if (top) { top.style.backgroundImage = ""; top.textContent = getInitials(name, email); }
    }
}

function renderFields(user, photoUrl) {
    const name = user.displayName || "Usuário";
    const email = user.email || "email@exemplo.com";
    setText("profile-name", name);
    setText("profile-email", email);
    setText("profile-info-name", name);
    setText("profile-info-email", email);
    setText("profile-info-created", formatDate(user.metadata?.creationTime));
    const editInput = document.getElementById("profile-edit-name");
    if (editInput) editInput.value = user.displayName || "";
    renderAvatar(photoUrl, name, email);
}

function syncName(displayName) {
    setText("user-name", displayName);
    const avatar = document.getElementById("user-avatar");
    if (avatar && !currentPhotoUrl) avatar.textContent = getInitials(displayName, "");
    setText("dashboard-greeting", `Olá, ${displayName.split(" ")[0]}`);
}

export function initProfile(user) {
    currentPhotoUrl = readCachedPhoto(user.uid) || user.photoURL || "";
    renderFields(user, currentPhotoUrl);

    loadFromFirestore(user.uid).then((data) => {
        if (data.photoUrl && data.photoUrl !== currentPhotoUrl) {
            currentPhotoUrl = data.photoUrl;
            cachePhoto(user.uid, data.photoUrl);
            renderAvatar(data.photoUrl, user.displayName || "Usuário", user.email || "");
        }
    });

    const photoInput = document.getElementById("profile-photo-input");
    const photoLabel = document.querySelector(".profile-avatar-upload");
    const form = document.getElementById("profile-edit-form");
    const nameInput = document.getElementById("profile-edit-name");

    photoLabel?.addEventListener("click", (e) => { e.preventDefault(); photoInput?.click(); });

    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newName = nameInput.value.trim();
        if (newName.length < 2) return;
        try {
            await updateProfile(user, { displayName: newName });
            await saveToFirestore(user.uid, { displayName: newName }).catch(() => {});
            syncName(newName);
            renderFields(user, currentPhotoUrl);
        } catch {}
    });

    photoInput?.addEventListener("change", async () => {
        const file = photoInput.files?.[0];
        if (!file || !ALLOWED.includes(file.type) || file.size > MAX_BYTES) {
            photoInput.value = "";
            return;
        }
        try {
            const base64 = await compressImage(file);
            currentPhotoUrl = base64;
            cachePhoto(user.uid, base64);
            renderAvatar(base64, user.displayName || "Usuário", user.email || "");
            await saveToFirestore(user.uid, { photoUrl: base64 });
        } catch {}
        finally { photoInput.value = ""; }
    });
}
