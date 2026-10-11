import { signInWithEmail, observeAuthState } from "./auth-service.js";
import { setFieldError, clearFieldError, clearAllErrors, focusFirstInvalid, showToast } from "./form-errors.js";
import { initPasswordToggles } from "./password-toggle.js";

const form = document.getElementById("login-form");
const submit = document.getElementById("login-submit");
const email = document.getElementById("login-email");
const password = document.getElementById("login-password");

let redirecting = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const setLoading = (state) => {
    submit.disabled = state;
    submit.classList.toggle("is-loading", state);
};

const shake = () => {
    form.classList.remove("is-shaking");
    void form.offsetWidth;
    form.classList.add("is-shaking");
};

const validateEmail = () => {
    if (EMAIL_RE.test(email.value.trim())) { clearFieldError(email); return true; }
    setFieldError(email, "Digite um email válido.");
    return false;
};

const validatePassword = () => {
    if (password.value.length >= 8) { clearFieldError(password); return true; }
    setFieldError(password, "A senha deve ter pelo menos 8 caracteres.");
    return false;
};

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (redirecting) return;
    clearAllErrors(form);
    if (![validateEmail(), validatePassword()].every(Boolean)) { shake(); focusFirstInvalid(form); return; }

    setLoading(true);
    try {
        await signInWithEmail(email.value.trim(), password.value);
        submit.classList.remove("is-loading");
        submit.classList.add("is-success");
        submit.disabled = true;
        showToast("Login realizado com sucesso!", "success");
        redirecting = true;
        setTimeout(() => { window.location.href = "dashboard.html"; }, 1400);
    } catch (error) {
        setLoading(false);
        showToast(error.message, "error");
        shake();
    }
});

email.addEventListener("blur", validateEmail);
password.addEventListener("blur", validatePassword);
email.addEventListener("input", () => email.classList.contains("is-invalid") && validateEmail());
password.addEventListener("input", () => password.classList.contains("is-invalid") && validatePassword());

observeAuthState((user) => { if (user && !redirecting) window.location.href = "dashboard.html"; });

initPasswordToggles();
