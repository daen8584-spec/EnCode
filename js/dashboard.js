import { observeAuthState, signOutUser } from "./auth-service.js";
import { initAppShell, initEditor } from "./app.js";

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
    return "Usuario";
}

function populateUser(user) {
    const displayName = getUserDisplayName(user);
    userName.textContent = displayName;
    userAvatar.textContent = displayName.charAt(0).toUpperCase();
    greeting.textContent = "Ola, " + displayName.split(" ")[0];
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
});

signOutButton.addEventListener("click", async function () {
    try {
        await signOutUser();
    } catch (error) {
        console.error("Sign-out failed", error);
    }
    window.location.href = "login.html";
});
