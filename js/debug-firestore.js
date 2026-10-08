import { auth } from "./firebase-config.js";

function show(msg, isError) {
    const box = document.createElement("div");
    box.style.cssText = "position:fixed;top:50%;left:10px;right:10px;transform:translateY(-50%);padding:20px;background:" + (isError ? "#c0392b" : "#27ae60") + ";color:#fff;font-size:14px;font-family:monospace;z-index:999999;border-radius:12px;white-space:pre-wrap;word-break:break-all;box-shadow:0 10px 40px rgba(0,0,0,0.5);max-height:80vh;overflow:auto;";
    box.textContent = msg;
    document.body.appendChild(box);
    const close = document.createElement("button");
    close.textContent = "Fechar";
    close.style.cssText = "margin-top:12px;padding:8px 16px;background:#fff;color:#000;border:none;border-radius:8px;font-size:14px;font-weight:bold;cursor:pointer;width:100%;";
    close.onclick = function () { box.remove(); };
    box.appendChild(document.createElement("br"));
    box.appendChild(close);
}

export async function runFirestoreDebug() {
    try {
        const user = auth.currentUser;
        if (!user) { show("SEM USUARIO LOGADO", true); return; }
        
        let log = "";
        log += "UID: " + user.uid + "\n\n";
        
        const token = await user.getIdToken();
        log += "TOKEN: " + token.length + " chars\n";
        log += "Primeiros 20: " + token.substring(0, 20) + "...\n\n";
        
        const uid = user.uid;
        const projectId = "proyect-af2be";
        const url = "https://firestore.googleapis.com/v1/projects/" + projectId + "/databases/(default)/documents/users/" + uid + "?updateMask.fieldPaths=debugTest";
        log += "URL: " + url + "\n\n";
        log += "Enviando PATCH...\n";
        
        const res = await fetch(url, {
            method: "PATCH",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fields: { debugTest: { stringValue: "test-" + Date.now() } }
            })
        });
        
        log += "STATUS: " + res.status + "\n";
        const text = await res.text();
        log += "RESPOSTA: " + text.substring(0, 300);
        
        show(log, res.status !== 200);
    } catch (e) {
        show("ERRO GERAL:\n" + (e.message || e), true);
    }
}
