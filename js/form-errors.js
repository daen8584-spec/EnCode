const ERROR_SELECTOR = (id) => `.field-error-message[data-for="${id}"]`;

export function setFieldError(input, message) {
    input.classList.add("is-invalid");
    input.setAttribute("aria-invalid", "true");

    let node = document.querySelector(ERROR_SELECTOR(input.id));
    if (!node) {
        node = document.createElement("span");
        node.className = "field-error-message";
        node.dataset.for = input.id;
        node.setAttribute("role", "alert");
        const anchor = input.closest(".form-group") ?? input.closest("label")?.parentElement ?? input;
        anchor.insertAdjacentElement("afterend", node);
    }
    node.textContent = message;
    node.classList.add("is-visible");
}

export function clearFieldError(input) {
    input.classList.remove("is-invalid");
    input.removeAttribute("aria-invalid");
    const node = document.querySelector(ERROR_SELECTOR(input.id));
    if (!node) return;
    node.classList.remove("is-visible");
    node.textContent = "";
}

export const clearAllErrors = (form) => form.querySelectorAll(".is-invalid").forEach(clearFieldError);

export const focusFirstInvalid = (form) => form.querySelector(".is-invalid")?.focus();

export function showToast(message, type) {
    const container = document.querySelector(".toast-container") ?? document.body.appendChild(Object.assign(document.createElement("div"), { className: "toast-container" }));
    const toast = document.createElement("div");
    toast.className = `toast is-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transition = "opacity 0.3s";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
