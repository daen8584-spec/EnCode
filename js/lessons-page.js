import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { initLessonPath } from "./lesson-path.js";

const closeBtn = document.getElementById("lessons-close");
if (closeBtn) {
    closeBtn.addEventListener("click", function () {
        window.location.href = "dashboard.html";
    });
}

onAuthStateChanged(auth, function (user) {
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    initLessonPath();
});

