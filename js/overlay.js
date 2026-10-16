
/* ==========================================================
   FULL-SCREEN OVERLAY
   COMPENDIUM 9.0
========================================================== */


/* ==========================================================
   STATE
========================================================== */

let overlayOpen = false;


/* ==========================================================
   OVERLAY ELEMENT
========================================================== */

const pageOverlay =
    document.getElementById("pageOverlay");

const pageOverlayClose =
    document.getElementById("pageOverlayClose");


/* ==========================================================
   CHECK WHETHER A SONGBOOK VIEWER IS OPEN
========================================================== */

function isSongbookViewer(url) {

    return /(?:^|\/)(?:songbook-viewer|pdf-songbook-viewer)\.html(?:[?#]|$)/i
        .test(String(url || ""));
}


/* ==========================================================
   OPEN OVERLAY
========================================================== */

function openPageOverlay(url) {

    if (!pageOverlay) {
        return;
    }

    /* ------------------------------------------
       Remove old iframe completely
    ------------------------------------------ */

    const oldFrame =
        document.getElementById("pageOverlayFrame");

    if (oldFrame) {
        oldFrame.remove();
    }


    /* ------------------------------------------
       Show or hide the outer X

       Songbook viewers have their own X.
       Other overlay pages keep the outer X.
    ------------------------------------------ */

    if (pageOverlayClose) {

        pageOverlayClose.style.display =
            isSongbookViewer(url) ? "none" : "";

    }


    /* ------------------------------------------
       Create NEW iframe
    ------------------------------------------ */

    const frame =
        document.createElement("iframe");

    frame.id = "pageOverlayFrame";
    frame.className = "page-overlay-frame";
    frame.title = "Contenuto";

    frame.setAttribute("allow", "microphone");
    frame.setAttribute("allowfullscreen", "");

    frame.src = url;

    pageOverlay.appendChild(frame);


    /* ------------------------------------------
       Add browser history state
    ------------------------------------------ */

    history.pushState(
        { pageOverlay: true },
        "",
        window.location.href
    );


    /* ------------------------------------------
       Show overlay
    ------------------------------------------ */

    pageOverlay.classList.add("active");

    pageOverlay.setAttribute("aria-hidden", "false");

    overlayOpen = true;


    /* ------------------------------------------
       Lock background
    ------------------------------------------ */

    document.body.classList.add("overlay-open");


    /* ------------------------------------------
       Focus outer X only when visible
    ------------------------------------------ */

    if (
        pageOverlayClose &&
        pageOverlayClose.style.display !== "none"
    ) {
        pageOverlayClose.focus();
    }

}


/* ==========================================================
   CLOSE OVERLAY
========================================================== */

function closePageOverlay() {

    if (!overlayOpen) {
        return;
    }


    /* ------------------------------------------
       Hide overlay
    ------------------------------------------ */

    pageOverlay.classList.remove("active");

    pageOverlay.setAttribute("aria-hidden", "true");


    /* ------------------------------------------
       DESTROY iframe
    ------------------------------------------ */

    const frame =
        document.getElementById("pageOverlayFrame");

    if (frame) {
        frame.remove();
    }


    /* ------------------------------------------
       Restore outer X for future overlays
    ------------------------------------------ */

    if (pageOverlayClose) {
        pageOverlayClose.style.display = "";
    }


    /* ------------------------------------------
       Update state
    ------------------------------------------ */

    overlayOpen = false;


    /* ------------------------------------------
       Restore background
    ------------------------------------------ */

    document.body.classList.remove("overlay-open");

}


/* ==========================================================
   BROWSER / GESTURE BACK
========================================================== */

window.addEventListener("popstate", () => {

    if (overlayOpen) {
        closePageOverlay();
    }

});


/* ==========================================================
   X BUTTON
========================================================== */

if (pageOverlayClose) {

    pageOverlayClose.addEventListener("click", () => {

        if (overlayOpen) {
            history.back();
        }

    });

}


/* ==========================================================
   GUITAR TUNER
========================================================== */

const guitarLink =
    document.querySelector(".guitar-link");

if (guitarLink) {

    guitarLink.addEventListener("click", event => {

        event.preventDefault();

        openPageOverlay(guitarLink.href);

    });

}


/* ==========================================================
   FOOTER PDF LINKS
========================================================== */

const footerLinks =
    document.querySelectorAll(".songbook-footer a");

footerLinks.forEach(link => {

    link.addEventListener("click", event => {

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

    const App =
        window.Capacitor.Plugins?.App;

    if (App) {

        App.addListener("backButton", () => {

            /* Overlay open: close it. */

            if (overlayOpen) {
                history.back();
                return;
            }

            /* Otherwise, return to index. */

            window.location.replace("index.html");

        });

    }

}
