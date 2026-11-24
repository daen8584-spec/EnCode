import { displayName, verifyEmail } from "./auth.js";
import { updateProfile } from "./firebase.js";
import { saveUserData } from "./progress.js";
import { $, toast } from "./dom.js";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const AVATAR_SIZE = 256;

function initials(name) {
    const words = name.trim().split(/\s+/);
    return (words[0][0] + (words.length > 1 ? words.at(-1)[0] : "")).toUpperCase();
}

async function toAvatar(file) {
    const image = await createImageBitmap(file);
    const side = Math.min(image.width, image.height);
    const canvas = Object.assign(document.createElement("canvas"), { width: AVATAR_SIZE, height: AVATAR_SIZE });
    canvas.getContext("2d").drawImage(
        image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE
    );
    image.close();
    return canvas.toDataURL("image/jpeg", 0.85);
}

export function initProfile(user, data) {
    let photoUrl = data.photoUrl || user.photoURL || "";

    const render = () => {
        const name = displayName(user);
        for (const avatar of [$("user-avatar"), $("profile-avatar")]) {
            avatar.style.backgroundImage = photoUrl ? `url("${photoUrl}")` : "";
            avatar.textContent = photoUrl ? "" : initials(name);
        }
        $("user-name").textContent = name;
        $("greeting").textContent = `Olá, ${name.split(" ")[0]}!`;
        $("profile-name").textContent = name;
        $("profile-email").textContent = user.email;
        $("name-input").value = user.displayName ?? "";
    };

    render();
    const showVerified = () => {
        $("verified").hidden = !user.emailVerified;
        $("verify").hidden = user.emailVerified;
    };
    showVerified();
    user.reload().then(showVerified, () => {}); // picks up a confirmation made since the last sign-in

    $("verify-send").addEventListener("click", async ({ currentTarget: button }) => {
        button.disabled = true;
        try {
            await verifyEmail(user);
            button.textContent = "Link enviado";
            toast(`Enviamos um link de confirmação para ${user.email}.`, "success");
        } catch (error) {
            button.disabled = false;
            toast(error.message, "error");
        }
    });
    $("member-since").textContent = new Date(user.metadata.creationTime).toLocaleDateString("pt-BR", { dateStyle: "long" });

    $("name-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        const name = $("name-input").value.trim();
        if (name.length < 2) {
            toast("O nome deve ter pelo menos 2 caracteres.", "error");
            return;
        }
        try {
            await updateProfile(user, { displayName: name });
            await saveUserData({ displayName: name });
            render();
            toast("Nome atualizado.", "success");
        } catch {
            toast("Não foi possível salvar o nome.", "error");
        }
    });

    $("photo-input").addEventListener("change", async ({ target }) => {
        const [file] = target.files;
        target.value = "";
        if (!file) return;
        if (file.size > MAX_PHOTO_BYTES) {
            toast("A imagem deve ter no máximo 5 MB.", "error");
            return;
        }
        try {
            photoUrl = await toAvatar(file);
            render();
            await saveUserData({ photoUrl });
        } catch {
            toast("Não foi possível salvar a foto.", "error");
        }
    });
}
