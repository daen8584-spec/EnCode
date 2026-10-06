const VALIDATION_RULES = {
    passwordMinLength: 8,
    nameMinLength: 2
};

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPassword(value) {
    return value.length >= VALIDATION_RULES.passwordMinLength;
}

function isValidName(value) {
    return value.trim().length >= VALIDATION_RULES.nameMinLength;
}

function passwordsMatch(first, second) {
    return first.length > 0 && first === second;
}

function passwordStrength(value) {
    let score = 0;
    if (value.length >= VALIDATION_RULES.passwordMinLength) score += 1;
    if (value.length >= 12) score += 1;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    if (score <= 1) return "weak";
    if (score <= 3) return "medium";
    return "strong";
}

export const VALIDATION_RULES = {
    passwordMinLength: 8,
    nameMinLength: 2
};

export function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidPassword(value) {
    return value.length >= VALIDATION_RULES.passwordMinLength;
}

export function isValidName(value) {
    return value.trim().length >= VALIDATION_RULES.nameMinLength;
}

export function passwordsMatch(first, second) {
    return first.length > 0 && first === second;
}

export function passwordStrength(value) {
    let score = 0;
    if (value.length >= VALIDATION_RULES.passwordMinLength) score += 1;
    if (value.length >= 12) score += 1;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    if (score <= 1) return "weak";
    if (score <= 3) return "medium";
    return "strong";
}

export function setButtonLoading(button, isLoading) {
    button.disabled = isLoading;
    button.classList.toggle("is-loading", isLoading);
}

export function showFeedback(element, message, type) {
    element.textContent = message;
    element.classList.remove("is-error", "is-success");
    element.classList.add("is-" + type);
    element.hidden = false;
}

export function hideFeedback(element) {
    element.hidden = true;
    element.classList.remove("is-error", "is-success");
}

export function triggerShake(element) {
    element.classList.remove("is-shaking");
    void element.offsetWidth;
    element.classList.add("is-shaking");
}

export function bindPasswordToggle(toggleButton, inputElement) {
    toggleButton.addEventListener("click", function () {
        const isHidden = inputElement.type === "password";
        inputElement.type = isHidden ? "text" : "password";
        toggleButton.setAttribute("aria-pressed", String(isHidden));
        toggleButton.classList.toggle("is-active", isHidden);
    });
}