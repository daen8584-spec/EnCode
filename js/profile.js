import { storage } from "./firebase-config.js";
import { updateProfile } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js";
import { setFieldError, clearFieldError, showToast } from "./form-errors.js";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp"];

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

function renderAvatar(user) {
    const img = document.getElementById("profile-avatar-img");
    const initials = document.getElementById("profile-avatar-initials");
    if (!img || !initials) return;
    if (user.photoURL) {
        img.src = user.photoURL;
        img.hidden = false;
        initials.hidden = true;
    } else {
        img.hidden = true;
        initials.hidden = false;
        initials.textContent = getInitials(user.displayName, user.email);
    }
}

function renderProfile(user) {
    const name = user.displayName || "Usuário";
    const email = user.email || "email@exemplo.com";
    const setText = function (id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };
    setText("profile-name", name);
    setText("profile-email", email);
    setText("profile-info-name", name);
    setText("profile-info-email", email);
    setText("profile-info-created", formatDate(user.metadata && user.metadata.creationTime));
    setText("profile-info-uid", user.uid);
    const editInput = document.getElementById("profile-edit-name");
    if (editInput) editInput.value = user.displayName || "";
    renderAvatar(user);
}

export function initProfile(user) {
    renderProfile(user);

    const form = document.getElementById("profile-edit-form");
    const input = document.getElementById("profile-edit-name");
    const photoInput = document.getElementById("profile-photo-input");

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
                renderProfile(user);
                showToast("Perfil atualizado com sucesso!", "success");
            } catch (error) {
                showToast("Não foi possível salvar o nome.", "error");
            }
        });
    }

    if (photoInput) {
        photoInput.addEventListener("change", async function () {
            const file = photoInput.files && photoInput.files[0];
            if (!file) return;
            if (ALLOWED.indexOf(file.type) === -1) {
                showToast("Formato não suportado. Use PNG, JPG ou WebP.", "error");
                photoInput.value = "";
                return;
            }
            if (file.size > MAX_BYTES) {
                showToast("A imagem deve ter no máximo 2 MB.", "error");
                photoInput.value = "";
                return;
            }
            try {
                const storageRef = ref(storage, "avatars/" + user.uid + "/profile");
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                await updateProfile(user, { photoURL: url });
                renderAvatar(user);
                showToast("Foto atualizada!", "success");
            } catch (error) {
                showToast("Não foi possível enviar a foto.", "error");
            } finally {
                photoInput.value = "";
            }
        });
    }
}
