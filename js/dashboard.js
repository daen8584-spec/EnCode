import { observeAuthState, signOutUser } from "./auth-service.js";

const topbar = document.querySelector(".topbar");
const topbar = document.querySelector(".topbar");
const topbar = document.querySelector(".topbar");
const dashboardContent = document.getElementById("dashboard-content");
const userName = document.getElementById("user-name");
const userAvatar = document.getElementById("user-avatar");
const greeting = document.getElementById("dashboard-greeting");
const signOutButton = document.getElementById("signout-button");

function populateUser(user) {
    const displayName = user.displayName || "Usuário";
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
    topbar.hidden = false;
    topbar.hidden = false;
    dashboardContent.hidden = false;
});

signOutButton.addEventListener("click", async function () {
    try {
        await signOutUser();
    } catch (error) {
        console.error("Sign-out failed", error);
    }
    window.location.href = "login.html";
});
