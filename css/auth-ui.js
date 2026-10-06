function setButtonLoading(button, isLoading) {
    button.disabled = isLoading;
    button.classList.toggle("is-loading", isLoading);
}

function showFeedback(element, message, type) {
    element.textContent = message;
    element.classList.remove("is-error", "is-success");
    element.classList.add("is-" + type);
    element.hidden = false;
}

function hideFeedback(element) {
    element.hidden = true;
    element.classList.remove("is-error", "is-success");
}

function triggerShake(element) {
    element.classList.remove("is-shaking");
    void element.offsetWidth;
    element.classList.add("is-shaking");
}

function bindPasswordToggle(toggleButton, inputElement) {
    toggleButton.addEventListener("click", function () {
        const isHidden = inputElement.type === "password";
        inputElement.type = isHidden ? "text" : "password";
        toggleButton.setAttribute("aria-pressed", String(isHidden));
        toggleButton.classList.toggle("is-active", isHidden);
    });
}