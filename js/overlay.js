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
        document.getElementById(
            "pageOverlayFrame"
        );


    if (oldFrame) {

        oldFrame.remove();

    }


    /* ------------------------------------------
       Create NEW iframe
    ------------------------------------------ */

    const frame =
        document.createElement("iframe");


    frame.id =
        "pageOverlayFrame";


    frame.className =
        "page-overlay-frame";


    frame.title =
        "Contenuto";


    frame.setAttribute(
        "allow",
        "microphone"
    );


    frame.setAttribute(
        "allowfullscreen",
        ""
    );


    frame.src =
        url;


    pageOverlay.appendChild(
        frame
    );


/* ------------------------------------------
   Add browser history state
------------------------------------------ */

history.pushState(
    {
        pageOverlay: true
    },
    "",
    window.location.href
);
	
    /* ------------------------------------------
       Show overlay
    ------------------------------------------ */

    pageOverlay.classList.add(
        "active"
    );


    pageOverlay.setAttribute(
        "aria-hidden",
        "false"
    );


    overlayOpen = true;


    /* ------------------------------------------
       Lock background
    ------------------------------------------ */

    document.body.classList.add(
        "overlay-open"
    );


    /* ------------------------------------------
       Focus X
    ------------------------------------------ */

    if (pageOverlayClose) {

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

    pageOverlay.classList.remove(
        "active"
    );


    pageOverlay.setAttribute(
        "aria-hidden",
        "true"
    );


    /* ------------------------------------------
       DESTROY iframe
    ------------------------------------------ */

    const frame =
        document.getElementById(
            "pageOverlayFrame"
        );


    if (frame) {

        frame.remove();

    }


    /* ------------------------------------------
       Update state
    ------------------------------------------ */

    overlayOpen = false;


    /* ------------------------------------------
       Restore background
    ------------------------------------------ */

    document.body.classList.remove(
        "overlay-open"
    );

}


/* ==========================================================
   BROWSER / GESTURE BACK
========================================================== */

window.addEventListener(
    "popstate",
    () => {

        if (overlayOpen) {

            closePageOverlay();

        }

    }
);



/* ==========================================================
   X BUTTON
========================================================== */

if (pageOverlayClose) {

    pageOverlayClose.addEventListener(
        "click",
        () => {

            if (overlayOpen) {

                history.back();

            }

        }
    );

}


/* ==========================================================
   GUITAR TUNER
========================================================== */

const guitarLink =
    document.querySelector(
        ".guitar-link"
    );


if (guitarLink) {

    guitarLink.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            openPageOverlay(
                guitarLink.href
            );

        }
    );

}


/* ==========================================================
   FOOTER PDF LINKS
========================================================== */

const footerLinks =
    document.querySelectorAll(
        ".songbook-footer a"
    );


footerLinks.forEach(link => {

    link.addEventListener(
        "click",
        (event) => {

            event.preventDefault();


            openPageOverlay(
                link.href
            );

        }
    );

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

        App.addListener(
            "backButton",
            () => {


                /* ----------------------------------
                   OVERLAY OPEN
                   
                   Just close it.
                ---------------------------------- */

                if (overlayOpen) {

    history.back();

    return;

}


                /* ----------------------------------
                   SONGBOOK
                   
                   DIRECTLY GO TO INDEX.
                   
                   NO HISTORY.
                   NO history.back().
                   NO history.go().
                ---------------------------------- */

                window.location.replace(
                    "index.html"
                );

            }
        );

    }

}