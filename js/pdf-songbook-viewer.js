
"use strict";

/* =========================================================
   PDF SONGBOOK VIEWER
   PDF.js + tuner overlay
   Preserves the current PDF position while tuning.
========================================================= */

const pdfFrame = document.getElementById("pdfFrame");
const closeViewer = document.getElementById("closeViewer");
const openTuner = document.getElementById("openTuner");

const params = new URLSearchParams(window.location.search);
const pdfFile = params.get("file");

let tunerOverlay = null;

/* =========================================================
   LOAD PDF
========================================================= */

if (pdfFile && pdfFrame) {
    const pdfPath = new URL(pdfFile, window.location.href).pathname;

    pdfFrame.src =
        "pdfjs/web/viewer.html?file=" +
        encodeURIComponent(pdfPath);

    /*
     * Hide PDF.js controls while keeping
     * the document scrollable.
     */
    pdfFrame.addEventListener("load", () => {
        try {
            const pdfDocument = pdfFrame.contentDocument;

            if (!pdfDocument) return;

            const style = pdfDocument.createElement("style");

            style.textContent = `
                #toolbarContainer,
                #sidebarContainer,
                #secondaryToolbar,
                #findbar,
                #loadingBar {
                    display: none !important;
                }

                #outerContainer,
                #mainContainer {
                    position: absolute !important;
                    inset: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                }

                #mainContainer {
                    left: 0 !important;
                    top: 0 !important;
                }

                #viewerContainer {
                    position: absolute !important;
                    inset: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: auto !important;
                }

                #viewer {
                    margin: 0 auto !important;
                }
            `;

            pdfDocument.head.appendChild(style);
        } catch (error) {
            console.error(
                "Impossibile personalizzare PDF.js:",
                error
            );
        }
    });
} else if (!pdfFile) {
    const viewport = document.querySelector(".pdf-song-viewport");

    if (viewport) {
        viewport.textContent = "Nessun PDF selezionato.";
    }
}

/* =========================================================
   OPEN TUNER OVERLAY
   Do not navigate away from the PDF.
========================================================= */

function openTunerOverlay() {
    if (tunerOverlay) return;

    tunerOverlay = document.createElement("div");

    Object.assign(tunerOverlay.style, {
        position: "fixed",
        inset: "0",
        zIndex: "99999",
        background: "#eaf6ff"
    });

    const tunerFrame = document.createElement("iframe");

    tunerFrame.src = "guitar-tuner.html?returnToSong=1";
    tunerFrame.title = "Accordatore per chitarra";
    tunerFrame.setAttribute("allow", "microphone");

    Object.assign(tunerFrame.style, {
        width: "100%",
        height: "100%",
        border: "0",
        display: "block"
    });

    tunerOverlay.appendChild(tunerFrame);
    document.body.appendChild(tunerOverlay);
}

function closeTunerOverlay() {
    if (!tunerOverlay) return;

    const tunerFrame = tunerOverlay.querySelector("iframe");

    if (tunerFrame) {
        // Unload the tuner and release its microphone.
        tunerFrame.src = "about:blank";
    }

    tunerOverlay.remove();
    tunerOverlay = null;
}

openTuner?.addEventListener("click", openTunerOverlay);

/* The tuner sends this message when its X is pressed. */
window.addEventListener("message", event => {
    if (event.data?.type === "closeTuner") {
        closeTunerOverlay();
    }
});

/* =========================================================
   CLOSE PDF VIEWER
========================================================= */

closeViewer?.addEventListener("click", () => {
    if (window.parent !== window) {
        // Close the containing overlay.
        window.parent.history.back();
    } else {
        // Standalone viewer: return to the catalogue.
        window.location.href = "songbook.html";
    }
});
