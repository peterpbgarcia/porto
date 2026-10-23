"use strict";

/* =========================================================
   SONGBOOK VIEWER
   HTML songs, chord transposition, and floating tools
========================================================= */

const params = new URLSearchParams(window.location.search);
const songFile = params.get("file");

const songFrame = document.getElementById("songFrame");
const minusButton = document.getElementById("transposeDown");
const plusButton = document.getElementById("transposeUp");
const resetButton = document.getElementById("transposeReset");

// Floating Menu Elements
const menuWrapper = document.getElementById("floatingMusicMenu");
const subActions = document.getElementById("floatingSubActions");

let semitones = 0;
let originalBodyHTML = null;
let songDocument = null;
let fadeTimeout = null;

/* =========================================================
   FLOATING MENU FADE LOGIC
========================================================= */

function resetFadeTimer() {
    if (!menuWrapper) return;

    clearTimeout(fadeTimeout);
    menuWrapper.classList.remove("is-faded");

    // Fade out bar after 4 seconds of inactivity
    fadeTimeout = setTimeout(() => {
        menuWrapper.classList.add("is-faded");
    }, 4000);
}

if (subActions) {
    subActions.addEventListener("click", (e) => {
        e.stopPropagation();
        resetFadeTimer();
    });

    window.addEventListener("mousemove", resetFadeTimer);
    window.addEventListener("touchstart", resetFadeTimer, { passive: true });
    window.addEventListener("scroll", resetFadeTimer, { passive: true });
    
    // Start initial timer
    resetFadeTimer();
}

/* =========================================================
   TRANSPOSITION DISPLAY
========================================================= */

function updateTransposeDisplay() {
    if (!resetButton) return;

    resetButton.textContent =
        semitones > 0 ? `+${semitones}` : String(semitones);

    resetButton.setAttribute(
        "aria-label",
        semitones === 0
            ? "Ripristina tonalità originale"
            : `Trasposizione: ${semitones > 0 ? "+" : ""}${semitones} semitoni. Premi per ripristinare`
    );
}

updateTransposeDisplay();

/* =========================================================
   ITALIAN NOTE NAMES & TRANSPOSITION CORE
========================================================= */

const ITALIAN_NOTES = {
    DO: 0,
    RE: 2,
    MI: 4,
    FA: 5,
    SOL: 7,
    LA: 9,
    SI: 11
};

const NOTE_NAMES = [
    "DO", "DO#", "RE", "RE#", "MI", "FA",
    "FA#", "SOL", "SOL#", "LA", "LA#", "SI"
];

function getNoteValue(note, accidental = "") {
    const base = ITALIAN_NOTES[note.toUpperCase()];
    if (base === undefined) return null;
    let value = base;
    if (accidental === "#") value += 1;
    else if (accidental.toLowerCase() === "b") value -= 1;
    return ((value % 12) + 12) % 12;
}

function transposeChordPart(part, steps) {
    if (!part || steps === 0) return part;
    const match = part.match(/^(DO|RE|MI|FA|SOL|LA|SI)(#|b)?(.*)$/i);
    if (!match) return part;
    const note = match[1].toUpperCase();
    const accidental = match[2] || "";
    const suffix = match[3] || "";
    const originalValue = getNoteValue(note, accidental);
    if (originalValue === null) return part;
    const newValue = ((originalValue + steps) % 12 + 12) % 12;
    return NOTE_NAMES[newValue] + suffix;
}

function transposeChordToken(token, steps) {
    if (steps === 0) return token;
    return token.split("/").map(part => transposeChordPart(part, steps)).join("/");
}

/* =========================================================
   LOAD SONG
========================================================= */

async function loadSong() {
    if (!songFrame || !songFile) {
        console.error("Song viewer: missing song file parameter or iframe.");
        return;
    }

    try {
        const response = await fetch(
            new URL(songFile, window.location.href).href,
            { cache: "no-cache" }
        );

        if (!response.ok) {
            throw new Error(`Impossibile caricare il canto: HTTP ${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        const html = new TextDecoder("windows-1252").decode(buffer);
        songFrame.srcdoc = html;

    } catch (error) {
        console.error("Song viewer:", error);
        document.title = "Errore caricamento canto";
        songFrame.srcdoc = `
            <!DOCTYPE html>
            <html lang="it">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
            <body><p>Impossibile caricare il canto.</p></body>
            </html>
        `;
    }
}

songFrame?.addEventListener("load", () => {
    try {
        const doc = songFrame.contentDocument;
        if (!doc || !doc.body) return;

        songDocument = doc;
        if (originalBodyHTML === null) {
            originalBodyHTML = doc.body.innerHTML;
        }

        doc.body.style.backgroundColor = "#FFFFFF";

        doc.addEventListener("touchstart", resetFadeTimer, { passive: true });
        doc.addEventListener("mousemove", resetFadeTimer);
        doc.addEventListener("scroll", resetFadeTimer, { passive: true });

        applyTransposition();
    } catch (error) {
        console.error("Error accessing song:", error);
    }
});

function applyTransposition() {
    const doc = songDocument;
    if (!doc || !doc.body || originalBodyHTML === null) return;

    doc.body.innerHTML = originalBodyHTML;
    doc.body.style.backgroundColor = "#FFFFFF";

    if (semitones === 0) return;

    const chordParagraphs = doc.querySelectorAll(
        "p.TestoAccorde, li.TestoAccorde, div.TestoAccorde"
    );

    chordParagraphs.forEach(paragraph => {
        const walker = doc.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
        const textNodes = [];
        let node;
        while ((node = walker.nextNode())) {
            textNodes.push(node);
        }

        textNodes.forEach(textNode => {
            textNode.nodeValue = textNode.nodeValue.replace(
                /\S+/g,
                token => transposeChordToken(token, semitones)
            );
        });
    });
}

minusButton?.addEventListener("click", () => {
    semitones--;
    updateTransposeDisplay();
    applyTransposition();
});

plusButton?.addEventListener("click", () => {
    semitones++;
    updateTransposeDisplay();
    applyTransposition();
});

resetButton?.addEventListener("click", () => {
    semitones = 0;
    updateTransposeDisplay();
    applyTransposition();
});

/* =========================================================
   START & BACK-FORWARD CACHE FIX
========================================================= */

loadSong();

// Force reload song content when navigating back from the guitar tuner
window.addEventListener("pageshow", () => {
    originalBodyHTML = null;
    songDocument = null;
    loadSong();
});