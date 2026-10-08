import { observeAuthState, signOutUser } from "./auth-service.js";
import { initAppShell, initEditor } from "./app.js";
import { initProfile } from "./profile.js";
import { runFirestoreDebug } from "./debug-firestore.js";

const topbar = document.querySelector(".topbar");
const appShell = document.getElementById("app-shell");
const userName = document.getElementById("user-name");
const userAvatar = document.getElementById("user-avatar");
const greeting = document.getElementById("dashboard-greeting");
const signOutButton = document.getElementById("signout-button");

function getUserDisplayName(user) {
    if (user.displayName && user.displayName.trim().length > 0) {
        return user.displayName.trim();
    }
    if (user.email && user.email.includes("@")) {
        return user.email.split("@")[0];
    }
    return "Usuário";
}

function populateUser(user) {
    const displayName = getUserDisplayName(user);
    userName.textContent = displayName;
    userAvatar.textContent = displayName.charAt(0).toUpperCase();
    greeting.textContent = "Olá, " + displayName.split(" ")[0];
}

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
    const debugBtn = document.createElement("button");
    debugBtn.textContent = "DEBUG";
    debugBtn.style.cssText = "position:fixed;bottom:20px;right:20px;padding:10px 16px;background:#ff6b6b;color:#fff;border:none;border-radius:50px;font-weight:bold;z-index:9999;cursor:pointer;font-size:12px;";
    debugBtn.onclick = runFirestoreDebug;
    document.body.appendChild(debugBtn);
});

signOutButton.addEventListener("click", async function () {
    try {
        await signOutUser();
    } catch (error) {
        console.error("Sign-out failed", error);
    }
    window.location.href = "login.html";
});
