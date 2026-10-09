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

function createPanel() {
    let panel = document.getElementById("debug-panel");
    if (!panel) {
        panel = document.createElement("div");
        panel.id = "debug-panel";
        panel.style.cssText = "position:fixed;top:60px;left:10px;right:10px;max-height:60vh;overflow:auto;padding:12px;background:rgba(0,0,0,0.95);color:#0f0;font-size:11px;font-family:monospace;z-index:99999;border-radius:8px;white-space:pre-wrap;line-height:1.5;border:1px solid #0f0;";
        document.body.appendChild(panel);
    }
    return panel;
}

function log(msg) {
    const panel = createPanel();
    panel.textContent += msg + "\n";
}

log("=== DIAGNÓSTICO lessons.html ===");
log("URL: " + window.location.href);
log("Timestamp: " + Date.now());

try {
    log("UNITS carregadas: " + UNITS.length);
    log("LESSONS carregadas: " + LESSONS.length);
    UNITS.forEach(function (u) {
        log("  - " + u.id + " lang=" + (u.lang || "?") + " lessons=" + u.lessons.length);
    });
} catch (e) {
    log("ERRO ao ler dados: " + (e.message || e));
}

const container = document.getElementById("lessons-path-container");
log("Container existe: " + (container ? "SIM" : "NAO"));

const tabs = document.querySelectorAll(".language-tab");
log("Tabs encontradas: " + tabs.length);

window.addEventListener("error", function (e) {
    log("ERRO: " + e.message + " em " + e.filename + ":" + e.lineno);
});

window.addEventListener("unhandledrejection", function (e) {
    log("PROMISE ERRO: " + (e.reason && e.reason.message ? e.reason.message : e.reason));
});

onAuthStateChanged(auth, async function (user) {
    if (!user) {
        log("Sem usuário. Redirecionando...");
        window.location.href = "login.html";
        return;
    }
    log("Usuário: " + user.uid.substring(0, 8));
    try {
        const prog = await loadProgress();
        log("Progresso: XP=" + prog.xp + " streak=" + prog.streak);
        log("Lições completas: " + (prog.completedLessons || []).join(", "));
    } catch (e) {
        log("ERRO progresso: " + (e.message || e));
    }
    log("Chamando initLessonPath()...");
    try {
        await initLessonPath();
        log("initLessonPath OK");
        log("Nodos renderizados: " + document.querySelectorAll(".roadmap-node").length);
        setTimeout(function () {
            log("Nodos após 1s: " + document.querySelectorAll(".roadmap-node").length);
        }, 1000);
    } catch (e) {
        log("ERRO initLessonPath: " + (e.message || e));
        log("STACK: " + (e.stack || "sem stack"));
    }
});
// 1791514242
