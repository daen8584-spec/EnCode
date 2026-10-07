export function setFieldError(input, message) {
    input.classList.add("is-invalid");
    input.setAttribute("aria-invalid", "true");

    let errorEl = document.querySelector('.field-error-message[data-for="' + input.id + '"]');
    if (!errorEl) {
        errorEl = document.createElement("span");
        errorEl.className = "field-error-message";
        errorEl.setAttribute("data-for", input.id);
        errorEl.setAttribute("role", "alert");

        const formGroup = input.closest(".form-group");
        if (formGroup) {
            formGroup.appendChild(errorEl);
        } else {
            const label = input.closest("label");
            if (label && label.parentElement) {
                label.insertAdjacentElement("afterend", errorEl);
            } else {
                input.insertAdjacentElement("afterend", errorEl);
            }
        }
    }
    errorEl.textContent = message;
    errorEl.classList.add("is-visible");
}

export function clearFieldError(input) {
    input.classList.remove("is-invalid");
    input.removeAttribute("aria-invalid");
    const errorEl = document.querySelector('.field-error-message[data-for="' + input.id + '"]');
    if (errorEl) {
        errorEl.classList.remove("is-visible");
        errorEl.textContent = "";
    }
}

export function clearAllErrors(form) {
    form.querySelectorAll(".is-invalid").forEach(clearFieldError);
}

export function focusFirstInvalid(form) {
    const invalid = form.querySelector(".is-invalid");
    if (invalid) invalid.focus();
}

export function showToast(message, type) {
    let container = document.querySelector(".toast-container");
    if (!container) {
        container = document.createElement("div");
        container.className = "toast-container";
        document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = "toast is-" + type;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(function () {
        toast.style.opacity = "0";
        toast.style.transition = "opacity 0.3s";
        setTimeout(function () { toast.remove(); }, 300);
    }, 3000);
}
