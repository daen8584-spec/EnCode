import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { initLessonPath } from "./lesson-path.js";

const closeBtn = document.getElementById("lessons-close");
if (closeBtn) {
    closeBtn.addEventListener("click", function () {
        window.location.href = "dashboard.html";
    });
}

function showError(msg) {
    const container = document.getElementById("lessons-path-container");
    if (!container) return;
    container.innerHTML = "";
    const box = document.createElement("div");
    box.style.cssText = "padding:16px;background:rgba(255,107,107,0.15);border:1px solid #ff6b6b;border-radius:12px;color:#ff6b6b;font-size:13px;font-family:monospace;white-space:pre-wrap;word-break:break-all;";
    box.textContent = msg;
    container.appendChild(box);
}

window.addEventListener("error", function (e) {
    showError("Erro: " + e.message);
});

window.addEventListener("unhandledrejection", function (e) {
    showError("Erro assíncrono: " + (e.reason && e.reason.message ? e.reason.message : e.reason));
});

onAuthStateChanged(auth, async function (user) {
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    try {
        await initLessonPath();
    } catch (e) {
        showError("Falha ao carregar lições:\n" + (e.message || e));
    }
});

// 1791514044
