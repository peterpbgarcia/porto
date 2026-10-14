/* =========================================================
   SONGBOOK VIEWER
   Supports Word-generated .htm files encoded in Windows-1252
   Preserves original HTML formatting and chord spacing
========================================================= */

const params = new URLSearchParams(window.location.search);
const songFile = params.get("file");

const songFrame = document.getElementById("songFrame");
const minusButton = document.getElementById("transposeDown");
const plusButton = document.getElementById("transposeUp");
const resetButton = document.getElementById("transposeReset");
const tunerButton = document.getElementById("openTuner");
const closeButton = document.getElementById("closeViewer");

let semitones = 0;
let originalBodyHTML = null;
let songDocument = null;

/* =========================================================
   TRANSPOSITION DISPLAY
========================================================= */

function updateTransposeDisplay() {
    if (!resetButton) return;

    resetButton.textContent =
        semitones > 0 ? `+${semitones}` : `${semitones}`;

    resetButton.setAttribute(
        "aria-label",
        semitones === 0
            ? "Ripristina tonalità originale"
            : `Trasposizione: ${semitones > 0 ? "+" : ""}${semitones} semitoni. Premi per ripristinare`
    );
}

updateTransposeDisplay();

/* =========================================================
   ITALIAN NOTE NAMES
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

/* =========================================================
   TRANSPOSE CHORDS
========================================================= */

function transposeChordPart(part, steps) {
    if (!part || steps === 0) return part;

    const match = part.match(
        /^(DO|RE|MI|FA|SOL|LA|SI)(#|b)?(.*)$/i
    );

    if (!match) return part;

    const note = match[1].toUpperCase();
    const accidental = match[2] || "";
    const suffix = match[3] || "";

    const originalValue = getNoteValue(note, accidental);

    if (originalValue === null) return part;

    const newValue =
        ((originalValue + steps) % 12 + 12) % 12;

    return NOTE_NAMES[newValue] + suffix;
}

function transposeChordToken(token, steps) {
    if (steps === 0) return token;

    return token
        .split("/")
        .map(part => transposeChordPart(part, steps))
        .join("/");
}

/* =========================================================
   LOAD SONG AS WINDOWS-1252
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
            throw new Error(
                `Impossibile caricare il canto: HTTP ${response.status}`
            );
        }

        // Read raw bytes instead of allowing the browser to guess
        // the file's character encoding.
        const buffer = await response.arrayBuffer();

        // Decode the original Word-exported file as Windows-1252.
        const html = new TextDecoder("windows-1252").decode(buffer);

        // Load the decoded HTML into the existing iframe.
        songFrame.srcdoc = html;

    } catch (error) {
        console.error("Song viewer:", error);

        document.title = "Errore caricamento canto";

        songFrame.srcdoc = `
            <!DOCTYPE html>
            <html lang="it">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body {
                        padding: 20px;
                        font-family: Arial, sans-serif;
                        color: #222;
                    }
                </style>
            </head>
            <body>
                <p>Impossibile caricare il canto.</p>
                <p>Controlla il percorso del file e la connessione.</p>
            </body>
            </html>
        `;
    }
}

/* =========================================================
   SONG LOADED
========================================================= */

songFrame?.addEventListener("load", () => {
    try {
        const doc = songFrame.contentDocument;

        if (!doc || !doc.body) {
            console.error("Impossibile accedere al contenuto del canto.");
            return;
        }

        songDocument = doc;

        if (originalBodyHTML === null) {
            originalBodyHTML = doc.body.innerHTML;
        }

        doc.body.style.backgroundColor = "#FFFFFF";

        applyTransposition();

        console.log("Song loaded successfully.");
        console.log(
            "Chord paragraphs found:",
            doc.querySelectorAll("p.TestoAccorde").length
        );

    } catch (error) {
        console.error("Error accessing the song:", error);
    }
});

/* =========================================================
   APPLY TRANSPOSITION
========================================================= */

function applyTransposition() {
    const doc = songDocument;

    if (!doc || !doc.body || originalBodyHTML === null) return;

    // Restore the untouched original content first.
    doc.body.innerHTML = originalBodyHTML;
    doc.body.style.backgroundColor = "#FFFFFF";

    if (semitones === 0) return;

    const chordParagraphs = doc.querySelectorAll(
        "p.TestoAccorde, li.TestoAccorde, div.TestoAccorde"
    );

    chordParagraphs.forEach(paragraph => {
        const walker = doc.createTreeWalker(
            paragraph,
            NodeFilter.SHOW_TEXT
        );

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

/* =========================================================
   TRANSPOSITION BUTTONS
========================================================= */

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
   GUITAR TUNER
========================================================= */

tunerButton?.addEventListener("click", () => {
    window.location.href = "guitar-tuner.html";
});

/* =========================================================
   CLOSE VIEWER
========================================================= */

closeButton?.addEventListener("click", () => {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = "songbook.html";
    }
});

/* Start loading the song */
loadSong();