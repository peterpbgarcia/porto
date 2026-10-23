"use strict";

/* ==========================================================
   FULL-SCREEN OVERLAY STACK
   COMPENDIUM 9.0 (Modal & Special Viewer Manager)

   - Used specifically for popups like Songbook Viewer, Guitar Tuner, and Footer PDFs.
   - Closing removes only the topmost overlay layer.
   - Browser back button / swipe gestures close the topmost overlay layer.
========================================================== */


/* ==========================================================
   ELEMENTS AND STATE
========================================================== */

const pageOverlay = document.getElementById("pageOverlay");
const pageOverlayClose = document.getElementById("pageOverlayClose");

const overlayStack = [];

let backButtonListenerRegistered = false;


/* ==========================================================
   VIEWER DETECTION
========================================================== */

function isSongbookViewer(url) {
    return /(?:^|\/)(?:songbook-viewer|pdf-songbook-viewer)\.html(?:[?#]|$)/i
        .test(String(url || ""));
}


/* ==========================================================
   UPDATE STACK
========================================================== */

function updateOverlayStack() {
    if (!pageOverlay) return;

    const hasOverlays = overlayStack.length > 0;
    const topIndex = overlayStack.length - 1;

    pageOverlay.classList.toggle("active", hasOverlays);
    pageOverlay.setAttribute("aria-hidden", String(!hasOverlays));

    document.body.classList.toggle("overlay-open", hasOverlays);

    overlayStack.forEach((item, index) => {
        const isTop = index === topIndex;

        item.frame.classList.toggle("overlay-top", isTop);
        item.frame.style.zIndex = String(index + 1);
        item.frame.style.visibility = isTop ? "visible" : "hidden";
        item.frame.style.pointerEvents = isTop ? "auto" : "none";
        item.frame.setAttribute("aria-hidden", String(!isTop));

        // Notify iframe layer of its visibility state (fixes the tuner bug)
        try {
            if (item.frame.contentWindow && typeof item.frame.contentWindow.handleLayerVisibility === "function") {
                item.frame.contentWindow.handleLayerVisibility(isTop);
            }
        } catch (e) {}
    });

    if (pageOverlayClose) {
        pageOverlayClose.style.display = hasOverlays ? "flex" : "none";
    }
}


/* ==========================================================
   OPEN A NEW OVERLAY (WITH ANDROID PERMISSION BRIDGE)
========================================================== */

function openPageOverlay(url) {
    if (!pageOverlay || !url) return;

    const targetUrl = String(url);
    const isTuner = targetUrl.toLowerCase().includes("tuner");

    // If opening the guitar tuner on Android, request permission natively first
    if (isTuner && window.cordova && window.plugins && window.plugins.permissions) {
        const permissions = window.plugins.permissions;
        permissions.requestPermission(
            permissions.RECORD_AUDIO,
            function(status) {
                proceedToOpenOverlay(targetUrl);
            },
            function(err) {
                console.warn("Android permission request failed:", err);
                proceedToOpenOverlay(targetUrl);
            }
        );
        return;
    }

    proceedToOpenOverlay(targetUrl);
}

function proceedToOpenOverlay(url) {
    const frame = document.createElement("iframe");

    frame.className = "page-overlay-frame";
    frame.title = "Contenuto";
    frame.setAttribute("allow", "microphone; camera; midi; encrypted-media");
    frame.setAttribute("allowfullscreen", "");
    frame.setAttribute("loading", "eager");

    const item = {
        frame: frame,
        url: url
    };

    /*
     * Keep all existing frames alive.
     * The new frame becomes the topmost layer.
     */
    overlayStack.push(item);
    pageOverlay.appendChild(frame);

    // Push history state so browser back button / swipe gesture closes the overlay
    if (typeof history.pushState === "function") {
        history.pushState({ overlayOpen: true }, "", window.location.href);
    }

    updateOverlayStack();

    frame.src = item.url;
}


/* ==========================================================
   CLOSE ONLY THE TOPMOST OVERLAY
========================================================== */

function closePageOverlay() {
    if (!pageOverlay || overlayStack.length === 0) return;

    const item = overlayStack.pop();

    item.frame.src = "about:blank";
    item.frame.remove();

    updateOverlayStack();
}


/* ==========================================================
   FUNCTIONS AVAILABLE TO INNER PAGES
========================================================== */

window.openPageOverlay = openPageOverlay;
window.closePageOverlay = closePageOverlay;

window.requestOpenPageOverlay = function (url) {
    openPageOverlay(url);
};

window.requestClosePageOverlay = function () {
    closePageOverlay();
};


/* ==========================================================
   OUTER CLOSE BUTTON
========================================================== */

if (pageOverlayClose) {
    pageOverlayClose.addEventListener("click", function () {
        closePageOverlay();
    });
}


/* ==========================================================
   BROWSER BACK BUTTON / SWIPE GESTURE SUPPORT
========================================================== */

window.addEventListener("popstate", function (event) {
    if (overlayStack.length > 0) {
        // Close only the topmost overlay layer (matches the '×' button action)
        closePageOverlay();
    }
});


/* ==========================================================
   HELPER FUNCTIONS FOR IFRAMES (e.g., Mass Song Panel)
========================================================== */

window.hideMainOverlayClose = function() {
    if (pageOverlayClose) {
        pageOverlayClose.style.display = "none";
    }
};

window.showMainOverlayClose = function() {
    if (pageOverlayClose && overlayStack.length > 0) {
        pageOverlayClose.style.display = "flex";
    }
};


/* ==========================================================
   GUITAR TUNER LINK
========================================================== */

const guitarLink = document.querySelector(".guitar-link");

if (guitarLink) {
    guitarLink.addEventListener("click", function (event) {
        event.preventDefault();
        openPageOverlay(guitarLink.href);
    });
}


/* ==========================================================
   FOOTER PDF LINKS
========================================================== */

document.querySelectorAll(".songbook-footer a").forEach(function (link) {
    link.addEventListener("click", function (event) {
        event.preventDefault();
        openPageOverlay(link.href);
    });
});


/* ==========================================================
   ANDROID / CAPACITOR BACK BUTTON (FOR OVERLAYS ONLY)
========================================================== */

if (
    window.Capacitor &&
    window.Capacitor.isNativePlatform()
) {
    const App = window.Capacitor.Plugins?.App;

    if (App && !backButtonListenerRegistered) {
        backButtonListenerRegistered = true;

        App.addListener("backButton", function () {
            if (overlayStack.length > 0) {
                closePageOverlay();
                return;
            }
            // If no overlay is open, let app.js handle standard page back/exit behavior
        });
    }
}
