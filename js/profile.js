import { auth } from "./firebase-config.js";
import { updateProfile } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const PROJECT_ID = "proyect-af2be";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp"];
const AVATAR_SIZE = 256;

function docUrl(uid) {
    return "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/default/documents/users/" + uid;
}

async function getToken() {
    if (!auth.currentUser) throw new Error("Usuário não autenticado");
    return await auth.currentUser.getIdToken();
}

async function saveToFirestore(uid, data) {
    const token = await getToken();
    const fields = {};
    Object.keys(data).forEach(function (k) {
        fields[k] = { stringValue: String(data[k]) };
    });
    const mask = Object.keys(data).map(function (k) { return "updateMask.fieldPaths=" + k; }).join("&");
    const url = docUrl(uid) + "?" + mask;
    const res = await fetch(url, {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ fields: fields })
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error("HTTP " + res.status + ": " + err);
    }
    return await res.json();
}

async function loadFromFirestore(uid) {
    const token = await getToken();
    const res = await fetch(docUrl(uid), {
        headers: { "Authorization": "Bearer " + token }
    });
    if (res.status === 404) return {};
    if (!res.ok) return {};
    const json = await res.json();
    const result = {};
    if (json.fields) {
        Object.keys(json.fields).forEach(function (k) {
            result[k] = json.fields[k].stringValue || "";
        });
    }
    return result;
}

function getInitials(name, email) {
    const source = (name && name.trim()) || (email ? email.split("@")[0] : "");
    if (!source) return "?";
    const parts = source.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function formatDate(value) {
    if (!value) return "-";
    try {
        return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    } catch (e) {
        return "-";
    }
}

function compressImage(file) {
    return new Promise(function (resolve, reject) {
        const reader = new FileReader();
        reader.onload = function (ev) {
            const img = new Image();
            img.onload = function () {
                const canvas = document.createElement("canvas");
                const size = Math.min(img.width, img.height);
                canvas.width = AVATAR_SIZE;
                canvas.height = AVATAR_SIZE;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
                resolve(canvas.toDataURL("image/jpeg", 0.85));
            };
            img.onerror = reject;
            img.src = ev.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

let currentPhotoUrl = "";

function cachePhoto(uid, photoUrl) {
    try { localStorage.setItem("encoder_photo_" + uid, photoUrl); } catch (e) {}
}

function readCachedPhoto(uid) {
    try { return localStorage.getItem("encoder_photo_" + uid) || ""; } catch (e) { return ""; }
}

function renderAvatar(photoUrl, displayName, email) {
    const img = document.getElementById("profile-avatar-img");
    const initials = document.getElementById("profile-avatar-initials");
    const topAvatar = document.getElementById("user-avatar");
    if (!img || !initials) return;
    if (photoUrl) {
        img.src = photoUrl;
        img.removeAttribute("hidden");
        initials.setAttribute("hidden", "");
        if (topAvatar) {
            topAvatar.style.backgroundImage = "url('" + photoUrl + "')";
            topAvatar.style.backgroundSize = "cover";
            topAvatar.style.backgroundPosition = "center";
            topAvatar.textContent = "";
        }
    } else {
        img.setAttribute("hidden", "");
        initials.removeAttribute("hidden");
        initials.textContent = getInitials(displayName, email);
        if (topAvatar) {
            topAvatar.style.backgroundImage = "";
            topAvatar.textContent = getInitials(displayName, email);
        }
    }
}

function renderProfileFields(user, photoUrl) {
    const name = user.displayName || "Usuário";
    const email = user.email || "email@exemplo.com";
    setText("profile-name", name);
    setText("profile-email", email);
    setText("profile-info-name", name);
    setText("profile-info-email", email);
    setText("profile-info-created", formatDate(user.metadata && user.metadata.creationTime));
    const editInput = document.getElementById("profile-edit-name");
    if (editInput) editInput.value = user.displayName || "";
    renderAvatar(photoUrl, name, email);
}

export function initProfile(user) {
    const cached = readCachedPhoto(user.uid);
    currentPhotoUrl = cached || user.photoURL || "";
    renderProfileFields(user, currentPhotoUrl);

    loadFromFirestore(user.uid).then(function (data) {
        if (data.photoUrl && data.photoUrl !== currentPhotoUrl) {
            currentPhotoUrl = data.photoUrl;
            cachePhoto(user.uid, data.photoUrl);
            renderAvatar(data.photoUrl, user.displayName || "Usuário", user.email || "");
        }
        if (data.displayName && data.displayName !== user.displayName) {
            setText("profile-info-name", data.displayName);
            setText("profile-name", data.displayName);
        }
    }).catch(function () {});

    const photoInput = document.getElementById("profile-photo-input");
    const photoLabel = document.querySelector(".profile-avatar-upload");
    const form = document.getElementById("profile-edit-form");
    const input = document.getElementById("profile-edit-name");

    if (photoLabel && photoInput) {
        photoLabel.addEventListener("click", function (e) {
            e.preventDefault();
            photoInput.click();
        });
    }

    if (form && input) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();
            const newName = input.value.trim();
            if (newName.length < 2) return;
            try {
                await updateProfile(user, { displayName: newName });
                await saveToFirestore(user.uid, { displayName: newName });
                const sidebarName = document.getElementById("user-name");
                const greeting = document.getElementById("dashboard-greeting");
                if (sidebarName) sidebarName.textContent = newName;
                if (greeting) greeting.textContent = "Olá, " + newName.split(" ")[0];
                renderProfileFields(user, currentPhotoUrl);
            } catch (err) {
                console.error("Erro nome:", err);
            }
        });
    }

    if (photoInput) {
        photoInput.addEventListener("change", async function () {
            const file = photoInput.files && photoInput.files[0];
            if (!file) return;
            if (ALLOWED.indexOf(file.type) === -1) return;
            if (file.size > MAX_BYTES) return;
            try {
                const base64 = await compressImage(file);
                currentPhotoUrl = base64;
                cachePhoto(user.uid, base64);
                renderAvatar(base64, user.displayName || "Usuário", user.email || "");
                await saveToFirestore(user.uid, { photoUrl: base64 });
            } catch (err) {
                console.error("Erro foto:", err);
            } finally {
                photoInput.value = "";
            }
        });
    }
}

