import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { initLessonPath } from "./lesson-path.js";
import { UNITS, LESSONS } from "./lessons-data.js";
import { loadProgress } from "./progress-service.js";

const closeBtn = document.getElementById("lessons-close");
if (closeBtn) {
    closeBtn.addEventListener("click", function () {
        window.location.href = "dashboard.html";
    });
}

function getPanel() {
    let panel = document.getElementById("debug-panel");
    if (!panel) {
        panel = document.createElement("div");
        panel.id = "debug-panel";
        panel.style.cssText = "position:fixed;top:60px;left:10px;right:10px;max-height:50vh;overflow:auto;padding:12px;background:rgba(0,0,0,0.95);color:#0f0;font-size:11px;font-family:monospace;z-index:99999;border-radius:8px;white-space:pre-wrap;border:1px solid #0f0;";
        document.body.appendChild(panel);
    }
    return panel;
}

function log(msg) {
    getPanel().textContent += msg + "\n";
}

log("=== DIAGNÓSTICO ===");
log("UNITS: " + UNITS.length + " | LESSONS: " + LESSONS.length);
UNITS.forEach(function (u) {
    log("  " + u.id + " lang=" + (u.lang || "?") + " (" + u.lessons.join(",") + ")");
});
LESSONS.forEach(function (l) {
    log("  " + l.id + " -> " + l.title);
});

const container = document.getElementById("lessons-path-container");

const tabs = document.querySelectorAll(".language-tab");
log("Tabs no HTML: " + tabs.length);
tabs.forEach(function (tab) {
    tab.removeAttribute("disabled");
    tab.addEventListener("click", function () {
        const lang = tab.getAttribute("data-lang");
        log("");
        log(">>> CLICOU: " + lang);
        const nodes = document.querySelectorAll(".roadmap-node-label");
        const titles = [];
        nodes.forEach(function (n) { titles.push(n.textContent); });
        log("Títulos antes: " + titles.join(" | "));
        setTimeout(function () {
            const nodes2 = document.querySelectorAll(".roadmap-node-label");
            const titles2 = [];
            nodes2.forEach(function (n) { titles2.push(n.textContent); });
            log("Títulos depois: " + titles2.join(" | "));
        }, 300);
    });
});

onAuthStateChanged(auth, async function (user) {
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    await initLessonPath();
    setTimeout(function () {
        const nodes = document.querySelectorAll(".roadmap-node-label");
        const titles = [];
        nodes.forEach(function (n) { titles.push(n.textContent); });
        log("");
        log("INICIAL títulos: " + titles.join(" | "));
    }, 500);
});
// 1791514867
