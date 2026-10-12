
/* =========================================================
   SONGBOOK VIEWER
   Supports Word-generated .htm song files
   Italian chord notation: DO, RE, MI, FA, SOL, LA, SI
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

/* =========================================================
   TRANSPOSITION DISPLAY
========================================================= */

function updateTransposeDisplay() {
    if (!resetButton) return;

    if (semitones > 0) {
        resetButton.textContent = `+${semitones}`;
    } else {
        resetButton.textContent = `${semitones}`;
    }

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
    "DO",
    "DO#",
    "RE",
    "RE#",
    "MI",
    "FA",
    "FA#",
    "SOL",
    "SOL#",
    "LA",
    "LA#",
    "SI"
];

/* =========================================================
   CONVERT NOTE TO SEMITONE VALUE
========================================================= */

function getNoteValue(note, accidental = "") {
    const base = ITALIAN_NOTES[note.toUpperCase()];

    if (base === undefined) {
        return null;
    }

    let value = base;

    if (accidental === "#") {
        value += 1;
    } else if (accidental.toLowerCase() === "b") {
        value -= 1;
    }

    return ((value % 12) + 12) % 12;
}

/* =========================================================
   TRANSPOSE ONE CHORD COMPONENT

   Examples:
   FA   -> FA#
   SOL- -> SOL#-
   LA-  -> LA#-
   SIb  -> SI
========================================================= */

function transposeChordPart(part, steps) {
    if (!part || steps === 0) {
        return part;
    }

    const match = part.match(
        /^(DO|RE|MI|FA|SOL|LA|SI)(#|b)?(.*)$/i
    );

    if (!match) {
        return part;
    }

    const note = match[1].toUpperCase();
    const accidental = match[2] || "";
    const suffix = match[3] || "";

    const originalValue = getNoteValue(
        note,
        accidental
    );

    if (originalValue === null) {
        return part;
    }

    const newValue =
        ((originalValue + steps) % 12 + 12) % 12;

    return NOTE_NAMES[newValue] + suffix;
}

/* =========================================================
   TRANSPOSE CHORDS INCLUDING SLASH CHORDS

   Examples:
   DO/MI -> DO#/FA
   SOL-/SIb -> SOL#-/SI
========================================================= */

function transposeChordToken(token, steps) {
    if (steps === 0) {
        return token;
    }

    return token
        .split("/")
        .map(part => transposeChordPart(part, steps))
        .join("/");
}

/* =========================================================
   LOAD SONG
========================================================= */

if (songFrame && songFile) {
    songFrame.src = new URL(
        songFile,
        window.location.href
    ).href;
} else {
    console.error(
        "Song viewer: missing song file parameter or iframe."
    );
}

/* =========================================================
   SONG LOADED
========================================================= */

songFrame?.addEventListener("load", () => {
    try {
        const doc = songFrame.contentDocument;

        if (!doc || !doc.body) {
            console.error(
                "Cannot access the song document. Make sure the project is served through localhost."
            );
            return;
        }

        // Save the original HTML only once.
        if (originalBodyHTML === null) {
            originalBodyHTML = doc.body.innerHTML;
        }

        doc.body.style.backgroundColor = "#FFFFFF";

        applyTransposition();

        console.log("Song loaded successfully:", doc.URL);

        console.log(
            "Chord paragraphs found:",
            doc.querySelectorAll("p.TestoAccorde").length
        );

    } catch (error) {
        console.error(
            "Error accessing the song iframe:",
            error.name,
            error.message
        );
    }
});

/* =========================================================
   APPLY TRANSPOSITION
========================================================= */

function applyTransposition() {
    const doc = songFrame?.contentDocument;

    if (!doc || !doc.body || originalBodyHTML === null) {
        return;
    }

    // Restore the original HTML before every transposition.
    doc.body.innerHTML = originalBodyHTML;

    doc.body.style.backgroundColor = "#FFFFFF";

    if (semitones === 0) {
        return;
    }

    const chordParagraphs = doc.querySelectorAll(
        "p.TestoAccorde, li.TestoAccorde, div.TestoAccorde"
    );

    chordParagraphs.forEach(paragraph => {
        /*
           Process text nodes instead of replacing paragraph
           HTML. This preserves Word formatting and spans.
        */
        const walker = doc.createTreeWalker(
            paragraph,
            4 // NodeFilter.SHOW_TEXT
        );

        const textNodes = [];
        let node;

        while ((node = walker.nextNode())) {
            textNodes.push(node);
        }

        textNodes.forEach(textNode => {
            textNode.nodeValue = textNode.nodeValue.replace(
                /\S+/g,
                token => transposeChordToken(
                    token,
                    semitones
                )
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
