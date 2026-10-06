import { signInWithEmail, observeAuthState } from "./auth-service.js";

const loginForm = document.getElementById("login-form");
const submitButton = document.getElementById("login-submit");
const feedbackElement = document.getElementById("login-feedback");

let isRedirecting = false;

function setFormLoading(isLoading) {
    submitButton.disabled = isLoading;
    submitButton.classList.toggle("is-loading", isLoading);
}

function showFeedback(message, type) {
    feedbackElement.textContent = message;
    feedbackElement.classList.remove("is-error", "is-success");
    feedbackElement.classList.add("is-" + type);
    feedbackElement.hidden = false;
}

function hideFeedback() {
    feedbackElement.hidden = true;
    feedbackElement.classList.remove("is-error", "is-success");
}

function triggerShake() {
    loginForm.classList.remove("is-shaking");
    void loginForm.offsetWidth;
    loginForm.classList.add("is-shaking");
}

async function handleLoginSubmit(event) {
    event.preventDefault();

    if (isRedirecting) {
        return;
    }

    hideFeedback();

    const formData = new FormData(loginForm);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    setFormLoading(true);

    try {
        await signInWithEmail(email, password);
        submitButton.classList.remove("is-loading");
        submitButton.classList.add("is-success");
        submitButton.disabled = true;
        showFeedback("Successo", "success");
        isRedirecting = true;
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1400);
    } catch (error) {
        setFormLoading(false);
        showFeedback(error.message, "error");
        triggerShake();
    }
}

observeAuthState(function (user) {
    if (user && !isRedirecting) {
        window.location.href = "dashboard.html";
    }
});

loginForm.addEventListener("submit", handleLoginSubmit);