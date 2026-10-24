"use strict";

/* ==========================================================
   SINGLE OVERLAY MANAGER (NO STACKING)
========================================================== */

const pageOverlay = document.getElementById("pageOverlay");
const pageOverlayFrame = document.getElementById("pageOverlayFrame");
const pageOverlayClose = document.getElementById("pageOverlayClose");

let backButtonRegistered = false;

/* ==========================================================
   OPEN & CLOSE OVERLAY
========================================================== */

function openPageOverlay(url) {
    if (!pageOverlay || !pageOverlayFrame || !url) return;

    // Direct the SINGLE existing iframe to the target URL
    pageOverlayFrame.src = String(url);

    pageOverlay.classList.add("active");
    pageOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("overlay-open");

    if (typeof history.pushState === "function") {
        history.pushState({ overlayOpen: true }, "", window.location.href);
    }
}

function closePageOverlay() {
    if (!pageOverlay || !pageOverlayFrame) return;

    pageOverlay.classList.remove("active");
    pageOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("overlay-open");

    // Clear iframe source
    pageOverlayFrame.src = "about:blank";
}

// Bind top-level close "X" button
if (pageOverlayClose) {
    pageOverlayClose.addEventListener("click", closePageOverlay);
}

/* ==========================================================
   EXPORTS
========================================================== */

window.openPageOverlay = openPageOverlay;
window.closePageOverlay = closePageOverlay;
window.requestOpenPageOverlay = openPageOverlay;
window.requestClosePageOverlay = closePageOverlay;

/* ==========================================================
   BACK BUTTON / SWIPE GESTURE
========================================================== */

window.addEventListener("popstate", function () {
    if (pageOverlay && pageOverlay.classList.contains("active")) {
        closePageOverlay();
    }
});

/* ==========================================================
   FOOTER / GUITAR LINKS
========================================================== */

const guitarLink = document.querySelector(".guitar-link");
if (guitarLink) {
    guitarLink.addEventListener("click", function (event) {
        event.preventDefault();
        openPageOverlay(guitarLink.href);
    });
}

document.querySelectorAll(".songbook-footer a").forEach(function (link) {
    link.addEventListener("click", function (event) {
        event.preventDefault();
        openPageOverlay(link.href);
    });
});

if (window.Capacitor && window.Capacitor.isNativePlatform()) {
    const App = window.Capacitor.Plugins?.App;
    if (App && !backButtonRegistered) {
        backButtonRegistered = true;
        App.addListener("backButton", function () {
            if (pageOverlay && pageOverlay.classList.contains("active")) {
                closePageOverlay();
            }
        });
    }
}