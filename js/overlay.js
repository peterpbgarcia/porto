"use strict";

/* ==========================================================
   FULL-SCREEN OVERLAY STACK
   COMPENDIUM 9.0

   - Index remains the base page.
   - New pages open above existing pages.
   - Closing removes only the topmost page.
   - Browser back button / swipe gestures close the topmost page.
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
   OPEN A NEW OVERLAY
========================================================== */

function openPageOverlay(url) {
    if (!pageOverlay || !url) return;

    const frame = document.createElement("iframe");

    frame.className = "page-overlay-frame";
    frame.title = "Contenuto";
    frame.setAttribute("allow", "microphone");
    frame.setAttribute("allowfullscreen", "");
    frame.setAttribute("loading", "eager");

    const item = {
        frame: frame,
        url: String(url)
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
   ANDROID / CAPACITOR BACK BUTTON
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

            window.location.replace("index.html");
        });
    }
}


/* ==========================================================
   HOMEPAGE NAVIGATION
========================================================== */

document.addEventListener("click", function (event) {
    const target = event.target;

    if (!(target instanceof Element)) return;

    const link = target.closest(".app-grid a");

    if (!link) return;
    if (!document.querySelector("main.home")) return;

    if (
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
    ) {
        return;
    }

    event.preventDefault();
    openPageOverlay(link.href);
});