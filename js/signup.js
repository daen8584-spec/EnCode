import { signUpWithEmail } from "./auth-service.js";

const signupForm = document.getElementById("signup-form");
const submitButton = document.getElementById("signup-submit");
const feedbackElement = document.getElementById("signup-feedback");
const passwordInput = document.getElementById("signup-password");
const confirmInput = document.getElementById("signup-password-confirm");
const strengthMeter = document.getElementById("signup-strength-meter");
const strengthLabel = document.getElementById("signup-strength-label");

let isRedirecting = false;

const STRENGTH_LABELS = {
    weak: "Fraca",
    medium: "Média",
    strong: "Forte"
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

function bindPasswordToggle(toggleButton, inputElement) {
    if (!toggleButton || !inputElement) {
        return;
    }
    toggleButton.addEventListener("click", function () {
        const isHidden = inputElement.type === "password";
        inputElement.type = isHidden ? "text" : "password";
        toggleButton.setAttribute("aria-pressed", String(isHidden));
        toggleButton.classList.toggle("is-active", isHidden);
    });
}

function passwordStrength(value) {
    let score = 0;
    if (value.length >= 8) score += 1;
    if (value.length >= 12) score += 1;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    if (score <= 1) return "weak";
    if (score <= 3) return "medium";
    return "strong";
}

function updateStrengthMeter(value) {
    if (!strengthMeter || !strengthLabel) {
        return;
    }
    if (value.length === 0) {
        strengthMeter.hidden = true;
        strengthLabel.hidden = true;
        return;
    }
    const level = passwordStrength(value);
    strengthMeter.hidden = false;
    strengthLabel.hidden = false;
    strengthMeter.setAttribute("data-strength", level);
    strengthLabel.setAttribute("data-strength", level);
    strengthLabel.textContent = "Senha " + STRENGTH_LABELS[level];
}

function passwordsMatch(first, second) {
    return first.length > 0 && first === second;
}

async function handleSignupSubmit(event) {
    event.preventDefault();

    if (isRedirecting) {
        return;
    }

    hideFeedback();

    const formData = new FormData(signupForm);
    const name = String(formData.get("name"));
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const confirm = String(formData.get("password-confirm"));

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
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1400);
    } catch (error) {
        setFormLoading(false);
        showFeedback(error.message, "error");
        triggerShake();
    }
}

bindPasswordToggle(document.getElementById("signup-password-toggle"), passwordInput);
bindPasswordToggle(document.getElementById("signup-confirm-toggle"), confirmInput);
passwordInput.addEventListener("input", function () {
    updateStrengthMeter(passwordInput.value);
});

signupForm.addEventListener("submit", handleSignupSubmit);
