import { initPasswordToggles } from "./password-toggle.js";
import { signUpWithEmail } from "./auth-service.js";
import { setFieldError, clearFieldError, clearAllErrors, focusFirstInvalid, showToast } from "./form-errors.js";

const signupForm = document.getElementById("signup-form");
const submitButton = document.getElementById("signup-submit");
const nameInput = document.getElementById("signup-name");
const emailInput = document.getElementById("signup-email");
const passwordInput = document.getElementById("signup-password");
const confirmInput = document.getElementById("signup-password-confirm");
const termsInput = document.getElementById("signup-terms");
const strengthMeter = document.getElementById("signup-strength-meter");
const strengthLabel = document.getElementById("signup-strength-label");
const requirementsList = document.getElementById("signup-password-requirements");

let isRedirecting = false;

const STRENGTH_LABELS = {
    weak: "Fraca",
    medium: "Média",
    strong: "Forte"
};

const PASSWORD_CHECKS = {
    length: function (value) { return value.length >= 8; },
    "upper-lower": function (value) { return /[A-Z]/.test(value) && /[a-z]/.test(value); },
    number: function (value) { return /\d/.test(value); },
    special: function (value) { return /[^A-Za-z0-9]/.test(value); }
};

function setFormLoading(isLoading) {
    submitButton.disabled = isLoading;
    submitButton.classList.toggle("is-loading", isLoading);
}

function triggerShake() {
    signupForm.classList.remove("is-shaking");
    void signupForm.offsetWidth;
    signupForm.classList.add("is-shaking");
}

function passwordStrength(value) {
    let score = 0;
    Object.values(PASSWORD_CHECKS).forEach(function (check) {
        if (check(value)) score += 1;
    });
    if (score <= 1) return "weak";
    if (score <= 3) return "medium";
    return "strong";
}

function updateRequirements(value) {
    if (!requirementsList) return;
    requirementsList.querySelectorAll("li").forEach(function (item) {
        const key = item.getAttribute("data-requirement");
        const check = PASSWORD_CHECKS[key];
        if (!check) return;
        item.classList.toggle("is-met", check(value));
    });
}

function updateStrengthMeter(value) {
    if (!strengthMeter || !strengthLabel) return;
    if (value.length === 0) {
        strengthMeter.hidden = true;
        strengthLabel.hidden = true;
        updateRequirements("");
        return;
    }
    const level = passwordStrength(value);
    strengthMeter.hidden = false;
    strengthLabel.hidden = false;
    strengthMeter.setAttribute("data-strength", level);
    strengthLabel.setAttribute("data-strength", level);
    strengthLabel.textContent = "Senha " + STRENGTH_LABELS[level];
    updateRequirements(value);
}

function validateName() {
    if (nameInput.value.trim().length < 2) {
        setFieldError(nameInput, "O nome deve ter pelo menos 2 caracteres.");
        return false;
    }
    clearFieldError(nameInput);
    return true;
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

function validateConfirm() {
    if (confirmInput.value.length === 0 || confirmInput.value !== passwordInput.value) {
        setFieldError(confirmInput, "As senhas não coincidem.");
        return false;
    }
    clearFieldError(confirmInput);
    return true;
}

function validateTerms() {
    if (!termsInput.checked) {
        setFieldError(termsInput, "Você precisa aceitar os Termos e Condições.");
        return false;
    }
    clearFieldError(termsInput);
    return true;
}

async function handleSignupSubmit(event) {
    event.preventDefault();
    if (isRedirecting) return;
    clearAllErrors(signupForm);
    const results = [validateName(), validateEmail(), validatePassword(), validateConfirm(), validateTerms()];
    if (results.includes(false)) {
        triggerShake();
        focusFirstInvalid(signupForm);
        return;
    }
    setFormLoading(true);
    try {
        await signUpWithEmail(nameInput.value.trim(), emailInput.value.trim(), passwordInput.value);
        submitButton.classList.remove("is-loading");
        submitButton.classList.add("is-success");
        submitButton.disabled = true;
        showToast("Conta criada com sucesso!", "success");
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

nameInput.addEventListener("blur", validateName);
emailInput.addEventListener("blur", validateEmail);
passwordInput.addEventListener("blur", validatePassword);
confirmInput.addEventListener("blur", validateConfirm);
termsInput.addEventListener("change", validateTerms);

nameInput.addEventListener("input", function () {
    if (nameInput.classList.contains("is-invalid")) validateName();
});
emailInput.addEventListener("input", function () {
    if (emailInput.classList.contains("is-invalid")) validateEmail();
});
passwordInput.addEventListener("input", function () {
    updateStrengthMeter(passwordInput.value);
    if (passwordInput.classList.contains("is-invalid")) validatePassword();
    if (confirmInput.classList.contains("is-invalid") && confirmInput.value) validateConfirm();
});
confirmInput.addEventListener("input", function () {
    if (confirmInput.classList.contains("is-invalid")) validateConfirm();
});

signupForm.addEventListener("submit", handleSignupSubmit);
initPasswordToggles();
