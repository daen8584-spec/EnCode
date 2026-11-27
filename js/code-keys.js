// Typing help for code boxes, shared by the lesson exercises and the free editor:
// Enter keeps the indentation of the line (and adds a level after ":" or "{"),
// Tab inserts four spaces (Escape then Tab leaves the box, for keyboard users),
// Backspace right after an indentation removes the whole level,
// Ctrl/Cmd + Enter runs the code.

const STEP = "    ";

export function insertText(field, text) {
    field.setRangeText(text, field.selectionStart, field.selectionEnd, "end");
    field.dispatchEvent(new Event("input", { bubbles: true }));
}

export function codeKeys(field, { language = "python", onRun } = {}) {
    let escaped = false;
    field.addEventListener("keydown", (event) => {
        if (event.key === "Escape") escaped = true;
        const start = field.selectionStart;
        const collapsed = start === field.selectionEnd;
        const before = field.value.slice(0, start);
        const line = before.slice(before.lastIndexOf("\n") + 1);

        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
            event.preventDefault();
            onRun?.();
        } else if (event.key === "Tab" && !event.shiftKey && !escaped) {
            event.preventDefault();
            insertText(field, STEP);
        } else if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
            let indent = line.match(/^[ \t]*/)[0];
            if (/[:{]\s*$/.test(line) && language !== "html") indent += STEP;
            event.preventDefault();
            insertText(field, `\n${indent}`);
        } else if (event.key === "Backspace" && collapsed && line.length > 0 && /^ +$/.test(line)) {
            const remove = line.length % STEP.length || STEP.length;
            event.preventDefault();
            field.setSelectionRange(start - remove, start);
            insertText(field, "");
        }
        if (event.key !== "Escape") escaped = false;
    });
}
