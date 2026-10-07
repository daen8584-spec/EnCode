import { signInWithEmail, observeAuthState } from "./auth-service.js";
import { setFieldError, clearFieldError, clearAllErrors, focusFirstInvalid, showToast } from "./form-errors.js";

const loginForm = document.getElementById("login-form");
const submitButton = document.getElementById("login-submit");
const emailInput = document.getElementById("login-email");
const passwordInput = document.getElementById("login-password");

let isRedirecting = false;

function setFormLoading(isLoading) {
    submitButton.disabled = isLoading;
    submitButton.classList.toggle("is-loading", isLoading);
}

function triggerShake() {
    loginForm.classList.remove("is-shaking");
    void loginForm.offsetWidth;
    loginForm.classList.add("is-shaking");
}

function validateEmail() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
        setFieldError(emailInput, "Digite um email válido.");
        return false;
    }
    clearFieldError(emailInput);
    return true;
}

function validatePassword() {
    if (passwordInput.value.length < 8) {
        setFieldError(passwordInput, "A senha deve ter pelo menos 8 caracteres.");
        return false;
    }
    clearFieldError(passwordInput);
    return true;
}

async function handleLoginSubmit(event) {
    event.preventDefault();
    if (isRedirecting) return;
    clearAllErrors(loginForm);
    const results = [validateEmail(), validatePassword()];
    if (results.includes(false)) {
        triggerShake();
        focusFirstInvalid(loginForm);
        return;
    }
    setFormLoading(true);
    try {
        await signInWithEmail(emailInput.value.trim(), passwordInput.value);
        submitButton.classList.remove("is-loading");
        submitButton.classList.add("is-success");
        submitButton.disabled = true;
        showToast("Login realizado com sucesso!", "success");
        isRedirecting = true;
        setTimeout(function () {
            window.location.href = "dashboard.html";
        }, 1400);
    } catch (error) {
        setFormLoading(false);
        showToast(error.message, "error");
        triggerShake();
    }
}

emailInput.addEventListener("blur", validateEmail);
passwordInput.addEventListener("blur", validatePassword);

emailInput.addEventListener("input", function () {
    if (emailInput.classList.contains("is-invalid")) validateEmail();
});
passwordInput.addEventListener("input", function () {
    if (passwordInput.classList.contains("is-invalid")) validatePassword();
});

observeAuthState(function (user) {
    if (user && !isRedirecting) {
        window.location.href = "dashboard.html";
    }
});

loginForm.addEventListener("submit", handleLoginSubmit);
