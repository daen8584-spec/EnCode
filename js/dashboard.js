import { observeAuthState, signOutUser } from "./auth-service.js";
import { initAppShell, initEditor } from "./app.js";
import { initProfile } from "./profile.js";

const topbar = document.querySelector(".topbar");
const appShell = document.getElementById("app-shell");
const userName = document.getElementById("user-name");
const userAvatar = document.getElementById("user-avatar");
const greeting = document.getElementById("dashboard-greeting");
const signOutButton = document.getElementById("signout-button");

const displayName = (user) =>
    user.displayName?.trim() ||
    (user.email?.includes("@") ? user.email.split("@")[0] : "Usuário");

const populateUser = (user) => {
    const name = displayName(user);
    userName.textContent = name;
    userAvatar.textContent = name.charAt(0).toUpperCase();
    greeting.textContent = `Olá, ${name.split(" ")[0]}`;
};

observeAuthState((user) => {
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
});

signOutButton.addEventListener("click", async () => {
    try { await signOutUser(); } catch (error) { console.error("Sign-out failed", error); }
    window.location.href = "login.html";
});
