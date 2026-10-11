import { signUpWithEmail } from "./auth-service.js";
import { setFieldError, clearFieldError, clearAllErrors, focusFirstInvalid, showToast } from "./form-errors.js";
import { initPasswordToggles } from "./password-toggle.js";

const form = document.getElementById("signup-form");
const submit = document.getElementById("signup-submit");
const name = document.getElementById("signup-name");
const email = document.getElementById("signup-email");
const password = document.getElementById("signup-password");
const confirm = document.getElementById("signup-password-confirm");
const terms = document.getElementById("signup-terms");
const strengthMeter = document.getElementById("signup-strength-meter");
const strengthLabel = document.getElementById("signup-strength-label");
const requirements = document.getElementById("signup-password-requirements");

let redirecting = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STRENGTH_LABELS = { weak: "Fraca", medium: "Média", strong: "Forte" };
const PASSWORD_CHECKS = {
    length: (v) => v.length >= 8,
    "upper-lower": (v) => /[A-Z]/.test(v) && /[a-z]/.test(v),
    number: (v) => /\d/.test(v),
    special: (v) => /[^A-Za-z0-9]/.test(v)
};

const setLoading = (state) => {
    submit.disabled = state;
    submit.classList.toggle("is-loading", state);
};

const shake = () => {
    form.classList.remove("is-shaking");
    void form.offsetWidth;
    form.classList.add("is-shaking");
};

const passwordStrength = (value) => {
    const score = Object.values(PASSWORD_CHECKS).filter((fn) => fn(value)).length;
    if (score <= 1) return "weak";
    if (score <= 3) return "medium";
    return "strong";
};

const updateRequirements = (value) => {
    if (!requirements) return;
    requirements.querySelectorAll("li").forEach((item) => {
        const check = PASSWORD_CHECKS[item.dataset.requirement];
        if (check) item.classList.toggle("is-met", check(value));
    });
};

const updateStrengthMeter = (value) => {
    if (!strengthMeter || !strengthLabel) return;
    if (!value.length) {
        strengthMeter.hidden = true;
        strengthLabel.hidden = true;
        updateRequirements("");
        return;
    }
    const level = passwordStrength(value);
    strengthMeter.hidden = false;
    strengthLabel.hidden = false;
    strengthMeter.dataset.strength = level;
    strengthLabel.dataset.strength = level;
    strengthLabel.textContent = `Senha ${STRENGTH_LABELS[level]}`;
    updateRequirements(value);
};

const validators = {
    name: () => name.value.trim().length >= 2 || (setFieldError(name, "O nome deve ter pelo menos 2 caracteres."), false),
    email: () => EMAIL_RE.test(email.value.trim()) || (setFieldError(email, "Digite um email válido."), false),
    password: () => password.value.length >= 8 || (setFieldError(password, "A senha deve ter pelo menos 8 caracteres."), false),
    confirm: () => (confirm.value.length > 0 && confirm.value === password.value) || (setFieldError(confirm, "As senhas não coincidem."), false),
    terms: () => terms.checked || (setFieldError(terms, "Você precisa aceitar os Termos e Condições."), false)
};

const runValidator = (key) => {
    const ok = validators[key]();
    if (ok) clearFieldError({ name, email, password, confirm, terms }[key]);
    return ok;
};

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (redirecting) return;
    clearAllErrors(form);
    const results = Object.keys(validators).map(runValidator);
    if (!results.every(Boolean)) { shake(); focusFirstInvalid(form); return; }

    setLoading(true);
    try {
        await signUpWithEmail(name.value.trim(), email.value.trim(), password.value);
        submit.classList.remove("is-loading");
        submit.classList.add("is-success");
        submit.disabled = true;
        showToast("Conta criada com sucesso!", "success");
        redirecting = true;
        setTimeout(() => { window.location.href = "dashboard.html"; }, 1400);
    } catch (error) {
        setLoading(false);
        showToast(error.message, "error");
        shake();
    }
});

name.addEventListener("blur", () => runValidator("name"));
email.addEventListener("blur", () => runValidator("email"));
password.addEventListener("blur", () => runValidator("password"));
confirm.addEventListener("blur", () => runValidator("confirm"));
terms.addEventListener("change", () => runValidator("terms"));

name.addEventListener("input", () => name.classList.contains("is-invalid") && runValidator("name"));
email.addEventListener("input", () => email.classList.contains("is-invalid") && runValidator("email"));
password.addEventListener("input", () => {
    updateStrengthMeter(password.value);
    if (password.classList.contains("is-invalid")) runValidator("password");
    if (confirm.classList.contains("is-invalid") && confirm.value) runValidator("confirm");
});
confirm.addEventListener("input", () => confirm.classList.contains("is-invalid") && runValidator("confirm"));

initPasswordToggles();
