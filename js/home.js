// Home page: Bit says hello, and visitors try one tiny lesson without an account.
import { checkBlank } from "./grading.js";
import { createMascot } from "./mascot.js";
import { runPython } from "./python.js";
import { play } from "./sound.js";

const $ = (id) => document.getElementById(id);

const host = createMascot();
$("hero-bit").append(host.root);
host.say("Oi! Eu sou o Bit. Quer aprender a programar comigo?");

const coach = createMascot();
$("try-bit").append(coach.root);

// Bit only starts talking in the lesson when it scrolls into view, so the line is not missed.
new IntersectionObserver((entries, observer) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    coach.say("Complete o código. Dica: em inglês, imprimir.");
    observer.disconnect();
}, { threshold: 0.4 }).observe($("experimente"));

const blank = { answer: "print", code: '___("Olá!")', language: "python" };

$("try-blank-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const result = checkBlank($("try-blank").value, blank);
    const feedback = $("try-feedback");
    if (result.ok) {
        play("correct");
        feedback.textContent = "Isso! print mostra na tela o que está entre parênteses.";
        feedback.className = "try-feedback is-right";
        coach.mood("happy");
        coach.say("Mandou bem! Agora vamos rodar um programa de verdade.");
        $("try-1").querySelector("button").disabled = true;
        $("try-blank").readOnly = true;
        $("try-2").hidden = false;
        $("try-code").focus();
        return;
    }
    play(result.near ? "near" : "wrong");
    feedback.textContent = result.near ? result.message : "Ainda não. É uma palavra em inglês que quer dizer imprimir.";
    feedback.className = `try-feedback ${result.near ? "is-near" : "is-wrong"}`;
    coach.mood(result.near ? "watch" : "think");
    coach.say(result.near ? "Quase! Só um detalhe." : "Tente de novo, você consegue!");
});

$("try-run-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const output = $("try-output");
    output.textContent = "Executando...";
    coach.mood("think");
    const { output: text, error } = await runPython($("try-code").value);
    if (error) {
        play("wrong");
        output.textContent = error;
        output.classList.add("is-error");
        coach.mood("sad");
        coach.say("Ops! Confira as aspas e os parênteses.");
        return;
    }
    output.classList.remove("is-error");
    output.textContent = text.trim() || "(nada apareceu: o print sumiu?)";
    if (!text.trim()) return;
    play("done");
    coach.mood("cheer");
    coach.say("Viu só? O computador fez o que você mandou!");
    $("try-3").hidden = false;
});
