import { auth, db, appId } from "./firebase-config.js";
import { updateProfile } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp"];
const AVATAR_SIZE = 256;

let logBox = null;

function log(msg, isError) {
    if (!logBox) {
        logBox = document.createElement("div");
        logBox.style.cssText = "position:fixed;top:70px;left:10px;right:10px;max-height:180px;overflow:auto;padding:10px;background:rgba(0,0,0,0.9);color:#0f0;font-size:11px;font-family:monospace;z-index:99999;border-radius:8px;white-space:pre-wrap;";
        document.body.appendChild(logBox);
    }
    const line = document.createElement("div");
    line.textContent = msg;
    if (isError) line.style.color = "#ff6b6b";
    logBox.appendChild(line);
    logBox.scrollTop = logBox.scrollHeight;
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

function cacheKey(uid) {
    return "encoder_photo_" + uid;
}

function cachePhoto(uid, photoUrl) {
    try { localStorage.setItem(cacheKey(uid), photoUrl); } catch (e) {}
}

function readCachedPhoto(uid) {
    try { return localStorage.getItem(cacheKey(uid)) || ""; } catch (e) { return ""; }
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
    setText("profile-info-uid", user.uid);
    const editInput = document.getElementById("profile-edit-name");
    if (editInput) editInput.value = user.displayName || "";
    renderAvatar(photoUrl, name, email);
}

export function initProfile(user) {
    log("Projeto: " + appId + " | UID: " + user.uid);

    const cached = readCachedPhoto(user.uid);
    currentPhotoUrl = cached || user.photoURL || "";
    renderProfileFields(user, currentPhotoUrl);

    log("Testando Firestore...");
    setDoc(doc(db, "users", user.uid), { lastSeen: new Date().toISOString() }, { merge: true })
        .then(function () {
            log("Firestore OK (escrita de teste passou)");
            return getDoc(doc(db, "users", user.uid));
        })
        .then(function (snap) {
            if (snap.exists()) {
                const data = snap.data();
                log("Campos no doc: " + Object.keys(data).join(", "));
                if (data.photoUrl && data.photoUrl !== currentPhotoUrl) {
                    currentPhotoUrl = data.photoUrl;
                    cachePhoto(user.uid, data.photoUrl);
                    renderAvatar(data.photoUrl, user.displayName || "Usuário", user.email || "");
                }
            }
        })
        .catch(function (err) {
            log("FIRESTORE ERRO: " + (err.code || "") + " " + (err.message || err), true);
        });

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
                await setDoc(doc(db, "users", user.uid), { displayName: newName }, { merge: true });
                log("Nome atualizado na nuvem");
                renderProfileFields(user, currentPhotoUrl);
            } catch (err) {
                log("ERRO nome: " + (err.message || err), true);
            }
        });
    }

    if (photoInput) {
        photoInput.addEventListener("change", async function () {
            const file = photoInput.files && photoInput.files[0];
            if (!file) return;
            log("Arquivo: " + file.name + " (" + file.size + " bytes)");
            if (ALLOWED.indexOf(file.type) === -1) {
                log("Formato não suportado", true);
                return;
            }
            if (file.size > MAX_BYTES) {
                log("Arquivo muito grande", true);
                return;
            }
            try {
                const base64 = await compressImage(file);
                log("Comprimido: " + base64.length + " bytes");
                currentPhotoUrl = base64;
                renderAvatar(base64, user.displayName || "Usuário", user.email || "");
                cachePhoto(user.uid, base64);
                log("Enviando para Firestore...");
                await setDoc(doc(db, "users", user.uid), { photoUrl: base64 }, { merge: true });
                log("FOTO SALVA NA NUVEM!");
                const verify = await getDoc(doc(db, "users", user.uid));
                log("Verificação: photoUrl tem " + (verify.data().photoUrl || "").length + " bytes");
            } catch (err) {
                log("ERRO FOTO: " + (err.code || "") + " " + (err.message || err), true);
            } finally {
                photoInput.value = "";
            }
        });
    }
}
