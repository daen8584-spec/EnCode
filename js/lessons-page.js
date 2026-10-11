import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { initLessonPath } from "./lesson-path.js";

document.getElementById("lessons-close")?.addEventListener("click", () => {
    window.location.href = "dashboard.html";
});

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    initLessonPath();
});
