const EYE_OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_CLOSED = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

export function initPasswordToggles() {
    document.querySelectorAll('input[type="password"]').forEach((input) => {
        if (input.dataset.toggleAttached === "1") return;
        input.dataset.toggleAttached = "1";

        const wrapper = document.createElement("div");
        wrapper.className = "password-wrapper";
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        const button = document.createElement("button");
        button.type = "button";
        button.className = "password-toggle";
        button.setAttribute("aria-label", "Mostrar senha");
        button.setAttribute("aria-pressed", "false");
        button.innerHTML = EYE_OPEN;
        wrapper.appendChild(button);

        button.addEventListener("click", () => {
            const visible = input.type === "password";
            input.type = visible ? "text" : "password";
            button.setAttribute("aria-pressed", String(visible));
            button.setAttribute("aria-label", visible ? "Ocultar senha" : "Mostrar senha");
            button.innerHTML = visible ? EYE_CLOSED : EYE_OPEN;
        });
    });
}
