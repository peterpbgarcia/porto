"use strict";

/* =========================================================
   PDF SONGBOOK VIEWER
   PDF.js loader & custom styling
========================================================= */

const pdfFrame = document.getElementById("pdfFrame");

const params = new URLSearchParams(window.location.search);
const pdfFile = params.get("file");

/* =========================================================
   LOAD PDF
========================================================= */

if (pdfFile && pdfFrame) {
    const pdfPath = "../../" + pdfFile;

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
