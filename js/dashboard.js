import { observeAuthState, signOutUser } from "./auth-service.js";
import { initAppShell, initEditor, initLessonButtons } from "./app.js";
import { initProfile } from "./profile.js";

const topbar = document.querySelector(".topbar");
const appShell = document.getElementById("app-shell");
const userName = document.getElementById("user-name");
const userAvatar = document.getElementById("user-avatar");
const greeting = document.getElementById("dashboard-greeting");
const signOutButton = document.getElementById("signout-button");

function getUserDisplayName(user) {
    if (user.displayName && user.displayName.trim().length > 0) return user.displayName.trim();
    if (user.email && user.email.includes("@")) return user.email.split("@")[0];
    return "Usuário";
}

function populateUser(user) {
    const displayName = getUserDisplayName(user);
    userName.textContent = displayName;
    userAvatar.textContent = displayName.charAt(0).toUpperCase();
    greeting.textContent = "Olá, " + displayName.split(" ")[0];
}

function showPanel(text) {
    let box = document.getElementById("debug-panel");
    if (!box) {
        box = document.createElement("div");
        box.id = "debug-panel";
        box.style.cssText = "position:fixed;top:80px;left:10px;right:10px;max-height:250px;overflow:auto;padding:12px;background:rgba(0,0,0,0.95);color:#0f0;font-size:11px;font-family:monospace;z-index:99999;border-radius:8px;white-space:pre-wrap;line-height:1.5;";
        document.body.appendChild(box);
    }
    box.textContent = text;
    return box;
}

window.addEventListener("error", function (e) {
    showPanel("ERRO CAPTURADO:\n" + e.message + "\n" + e.filename + ":" + e.lineno);
});

observeAuthState(function (user) {
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    populateUser(user);
    topbar.hidden = false;
    appShell.hidden = false;
    initAppShell();
    initEditor();
    initProfile(user);

    try {
        initLessonButtons();
    } catch (e) {
        showPanel("ERRO em initLessonButtons:\n" + (e.message || e));
    }

    setTimeout(function () {
        const buttons = document.querySelectorAll(".track-start");
        let report = "DIAGNÓSTICO DOS BOTÕES:\n";
        report += "Total de .track-start: " + buttons.length + "\n\n";
        buttons.forEach(function (b, i) {
            report += "Botão " + (i + 1) + ":\n";
            report += "  texto: " + b.textContent + "\n";
            report += "  data-track: " + b.getAttribute("data-track") + "\n";
            report += "  disabled: " + b.disabled + "\n";
            report += "  onclick: " + (b.onclick ? "sim" : "não") + "\n\n";
        });
        showPanel(report);
    }, 800);
});

signOutButton.addEventListener("click", async function () {
    try {
        await signOutUser();
    } catch (error) {
        console.error("Sign-out failed", error);
    }
    window.location.href = "login.html";
});

