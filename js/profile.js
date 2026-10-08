import { auth, db } from "./firebase-config.js";
import { updateProfile } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { setFieldError, clearFieldError, showToast } from "./form-errors.js";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp"];
const AVATAR_SIZE = 256;


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
        const date = new Date(value);
        return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    } catch (e) {
        return "-";
    }
}

function compressImage(file) {
    return new Promise(function (resolve, reject) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const img = new Image();
            img.onload = function () {
                const canvas = document.createElement("canvas");
                const size = Math.min(img.width, img.height);
                const offsetX = (img.width - size) / 2;
                const offsetY = (img.height - size) / 2;
                canvas.width = AVATAR_SIZE;
                canvas.height = AVATAR_SIZE;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
                const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
                resolve(dataUrl);
            };
            img.onerror = function (e) {
                reject(e);
            };
            img.src = event.target.result;
        };
        reader.onerror = function (e) {
            reject(e);
        };
        reader.readAsDataURL(file);
    });
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

let currentPhotoUrl = "";

function renderAvatar(photoUrl, displayName, email) {
    const img = document.getElementById("profile-avatar-img");
    const initials = document.getElementById("profile-avatar-initials");
    const topAvatar = document.getElementById("user-avatar");
    if (!img || !initials) {
        return;
    }
    if (photoUrl) {
        img.src = photoUrl;
        img.hidden = false;
        initials.hidden = true;
        if (topAvatar) {
            topAvatar.style.backgroundImage = "url('" + photoUrl + "')";
            topAvatar.style.backgroundSize = "cover";
            topAvatar.style.backgroundPosition = "center";
            topAvatar.textContent = "";
        }
    } else {
        img.hidden = true;
        initials.hidden = false;
        initials.textContent = getInitials(displayName, email);
    }
}

function syncNameEverywhere(displayName) {
    const sidebarName = document.getElementById("user-name");
    const sidebarAvatar = document.getElementById("user-avatar");
    const greeting = document.getElementById("dashboard-greeting");
    if (sidebarName) sidebarName.textContent = displayName;
    if (sidebarAvatar && !currentPhotoUrl) sidebarAvatar.textContent = getInitials(displayName, "");
    if (greeting) greeting.textContent = "Olá, " + displayName.split(" ")[0];
}

function renderProfileFields(user, photoUrl) {
    const name = user.displayName || "Usuário";
    const email = user.email || "email@exemplo.com";
    setText("profile-name", name);
    setText("profile-email", email);
    setText("profile-info-name", name);
    setText("profile-info-email", email);
    setText("profile-info-created", formatDate(user.metadata && user.metadata.creationTime));
    setText("profile-info-uid", user.uid);
    const editInput = document.getElementById("profile-edit-name");
    if (editInput) editInput.value = user.displayName || "";
    renderAvatar(photoUrl, name, email);
}

async function loadPhotoUrlFromFirestore(uid) {
    try {
        const { getDoc, doc } = await import("https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js");
        const snap = await getDoc(doc(db, "users", uid));
        return snap.exists() ? (snap.data().photoUrl || "") : "";
    } catch (e) {
        return "";
    }
}

async function savePhotoUrlToFirestore(uid, photoUrl) {
    try {
        const { setDoc, doc } = await import("https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js");
        await setDoc(doc(db, "users", uid), { photoUrl: photoUrl }, { merge: true });
    } catch (e) {
        throw e;
    }
}

async function saveNameToFirestore(uid, displayName) {
    try {
        const { setDoc, doc } = await import("https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js");
        await setDoc(doc(db, "users", uid), { displayName: displayName }, { merge: true });
    } catch (e) {}
}

export function initProfile(user) {

    currentPhotoUrl = user.photoURL || "";
    renderProfileFields(user, currentPhotoUrl);

    loadPhotoUrlFromFirestore(user.uid).then(function (stored) {
        if (stored) {
            currentPhotoUrl = stored;
            renderAvatar(stored, user.displayName || "Usuário", user.email || "");
        }
    });

    const form = document.getElementById("profile-edit-form");
    const input = document.getElementById("profile-edit-name");
    const photoInput = document.getElementById("profile-photo-input");
    const photoLabel = document.querySelector(".profile-avatar-upload");



    if (photoLabel && photoInput) {
        photoLabel.addEventListener("click", function (event) {
            event.preventDefault();
            photoInput.click();
        });
    }

    if (form && input) {
        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            const newName = input.value.trim();
            if (newName.length < 2) {
                setFieldError(input, "O nome deve ter pelo menos 2 caracteres.");
                return;
            }
            clearFieldError(input);
            try {
                await updateProfile(user, { displayName: newName });
                try { await saveNameToFirestore(user.uid, newName); } catch (e) {}
                syncNameEverywhere(newName);
                renderProfileFields(user, currentPhotoUrl);
                showToast("Perfil atualizado com sucesso!", "success");
            } catch (error) {
                showToast("Não foi possível salvar o nome.", "error");
            }
        });
    }

    if (photoInput) {
        photoInput.addEventListener("change", async function () {
            const file = photoInput.files && photoInput.files[0];
            if (!file) {
                return;
            }
            if (ALLOWED.indexOf(file.type) === -1) {
                showToast("Formato não suportado. Use PNG, JPG ou WebP.", "error");
                photoInput.value = "";
                return;
            }
            if (file.size > MAX_BYTES) {
                showToast("A imagem deve ter no máximo 5 MB.", "error");
                photoInput.value = "";
                return;
            }
            try {
                const base64 = await compressImage(file);
                currentPhotoUrl = base64;
                renderAvatar(base64, user.displayName || "Usuário", user.email || "");
                await savePhotoUrlToFirestore(user.uid, base64);
                showToast("Foto atualizada!", "success");
            } catch (error) {
                showToast("Erro: " + (error && error.message ? error.message : error), "error");
            } finally {
                photoInput.value = "";
            }
        });
    }
}
