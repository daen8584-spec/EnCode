import { signUpWithEmail } from "./auth-service.js";

const signupForm = document.getElementById("signup-form");
const submitButton = document.getElementById("signup-submit");
const feedbackElement = document.getElementById("signup-feedback");
const passwordInput = document.getElementById("signup-password");
const confirmInput = document.getElementById("signup-password-confirm");
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

function passwordsMatch(first, second) {
    return first.length > 0 && first === second;
}

async function handleSignupSubmit(event) {
    event.preventDefault();
    if (isRedirecting) return;

    hideFeedback();

    const formData = new FormData(signupForm);
    const name = String(formData.get("name")).trim();
    const email = String(formData.get("email")).trim();
    const password = String(formData.get("password"));
    const confirm = String(formData.get("password-confirm"));

    if (name.length < 2) {
        showFeedback("Name must be at least 2 characters.", "error");
        triggerShake();
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFeedback("Please enter a valid email address.", "error");
        triggerShake();
        return;
    }

    if (password.length < 8) {
        showFeedback("Password must be at least 8 characters.", "error");
        triggerShake();
        return;
    }

    if (!passwordsMatch(password, confirm)) {
        showFeedback("As senhas não coincidem.", "error");
        triggerShake();
        return;
    }

    setFormLoading(true);

    try {
        await signUpWithEmail(name, email, password);
        submitButton.classList.remove("is-loading");
        submitButton.classList.add("is-success");
        submitButton.disabled = true;
        showFeedback("Sucesso", "success");
        isRedirecting = true;
        setTimeout(function () {
            window.location.href = "dashboard.html";
        }, 1400);
    } catch (error) {
        setFormLoading(false);
        showFeedback(error.message, "error");
        triggerShake();
    }
}

passwordInput.addEventListener("input", function () {
    updateStrengthMeter(passwordInput.value);
});

signupForm.addEventListener("submit", handleSignupSubmit);
