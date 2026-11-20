import { TRACKS } from "./content.js";
import { h } from "./dom.js";

// Words that appear in code before they get their own lesson.
const EXTRA = {
    python: { in: "em, dentro de", str: "converte para texto (de string)", True: "verdadeiro", False: "falso", input: "entrada" },
    html: { li: "item de lista (de list item)", src: "origem do arquivo (de source)", h2: "título nível 2 (de heading 2)" },
    css: { solid: "contínuo", dashed: "tracejado", flex: "flexível", red: "vermelho", blue: "azul", green: "verde", yellow: "amarelo", black: "preto", white: "branco", orange: "laranja", gray: "cinza", purple: "roxo" }
};

const MEANINGS = Object.fromEntries(TRACKS.map((track) => [track.id, {
    ...EXTRA[track.id],
    ...Object.fromEntries(track.lessons.flatMap((lesson) => lesson.teach)
        .filter((card) => card.meaning && !card.term.startsWith("."))
        .map((card) => [card.term, card.meaning]))
}]));

// Which parts of the code may hold a keyword: Python skips strings and comments,
// HTML looks at tag and attribute names, CSS at every word.
const PATTERNS = {
    python: /"(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?|#[^\n]*|\b([A-Za-z_]\w*)\b/g,
    html: /<\/?([a-zA-Z][\w-]*)|([a-zA-Z-]+)(?==)/g,
    css: /([a-zA-Z][\w-]*)/g
};

export const meaningOf = (word, language) => MEANINGS[language]?.[word];

export function annotate(code, language) {
    const pattern = PATTERNS[language];
    const parts = [];
    let last = 0;
    for (const match of code.matchAll(pattern)) {
        const word = match[1] ?? match[2];
        const meaning = word && MEANINGS[language][word];
        if (!meaning) continue;
        const start = match.index + match[0].lastIndexOf(word);
        parts.push(code.slice(last, start), h("span", { className: "kw", tabIndex: 0, textContent: word }));
        parts.at(-1).dataset.meaning = meaning;
        last = start + word.length;
    }
    parts.push(code.slice(last));
    return parts;
}
