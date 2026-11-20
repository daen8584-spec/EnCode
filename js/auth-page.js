import { signIn, signUp } from "./auth.js";
import { auth, onAuthStateChanged } from "./firebase.js";
import { toast } from "./dom.js";

const PASSWORD_RULES = {
    length: /.{8,}/,
    case: /(?=.*[a-z])(?=.*[A-Z])/,
    number: /\d/,
    symbol: /[^A-Za-z0-9]/
};

const EYE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_OFF = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>';

const form = document.querySelector(".auth-form");
const submit = form.querySelector("[type=submit]");
const fields = [...form.querySelectorAll("[data-error]")];
const rules = document.querySelector(".password-rules");
let submitting = false;

const isInvalid = (field) => field.getAttribute("aria-invalid") === "true";

function validate(field) {
    const original = field.dataset.match && form.elements[field.dataset.match];
    if (original) field.setCustomValidity(field.value === original.value ? "" : field.dataset.error);

    const valid = field.validity.valid;
    field.setAttribute("aria-invalid", !valid);
    field.closest(".field").querySelector(".field-error").textContent = valid ? "" : field.dataset.error;
    return valid;
}

for (const field of fields) {
    field.addEventListener("blur", () => validate(field));
    field.addEventListener("input", () => fields.filter(isInvalid).forEach(validate));
}

form.elements.password.addEventListener("input", ({ target }) => {
    for (const item of rules?.children ?? []) {
        item.classList.toggle("is-met", PASSWORD_RULES[item.dataset.rule].test(target.value));
    }
});

for (const input of form.querySelectorAll("input[type=password]")) {
    const toggle = Object.assign(document.createElement("button"), {
        type: "button",
        className: "password-toggle",
        innerHTML: EYE,
        ariaLabel: "Mostrar senha"
    });
    toggle.addEventListener("click", () => {
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        toggle.innerHTML = show ? EYE_OFF : EYE;
        toggle.ariaLabel = show ? "Ocultar senha" : "Mostrar senha";
    });
    input.after(toggle);
}

const shake = () => form.animate(
    [0, -8, 8, -5, 5, 0].map((x) => ({ transform: `translateX(${x}px)` })),
    { duration: 400, easing: "ease-out" }
);

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!fields.map(validate).every(Boolean)) {
        shake();
        fields.find(isInvalid).focus();
        return;
    }

    const { name, email, password } = form.elements;
    submitting = true;
    submit.disabled = true;
    submit.ariaBusy = "true";
    try {
        if (form.dataset.mode === "signup") await signUp(name.value.trim(), email.value.trim(), password.value);
        else await signIn(email.value.trim(), password.value);
        location.replace("dashboard.html");
    } catch (error) {
        submitting = false;
        submit.disabled = false;
        submit.ariaBusy = "false";
        toast(error.message, "error");
        shake();
    }
});

onAuthStateChanged(auth, (user) => {
    if (user && !submitting) location.replace("dashboard.html");
});
