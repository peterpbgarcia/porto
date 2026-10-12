/* ==========================================
   STATUS BAR COLOR
========================================== */

if (window.Capacitor && window.Capacitor.isNativePlatform()) {

    const StatusBar =
        window.Capacitor.Plugins?.StatusBar;


    if (StatusBar) {

        (async () => {

            try {

                await StatusBar.setOverlaysWebView({
                    overlay: false
                });


                await StatusBar.setBackgroundColor({
                    color: "#4AAEE8"
                });


                await StatusBar.setStyle({
                    style: "LIGHT"
                });


            } catch (error) {

                console.log("StatusBar error:", error);

            }

        })();

    }

}


/* ==========================================
   ZOOM
========================================== */

document.addEventListener("DOMContentLoaded", () => {


    /* ==========================================
       CHECK IF ZOOM IS ENABLED
    ========================================== */

    if (document.body.dataset.zoom !== "true") return;


    /* ==========================================
       CREATE FLOATING ZOOM
    ========================================== */

    const zoom = document.createElement("div");

    zoom.className = "zoom-container";

    zoom.innerHTML = `

        <button id="zoomToggle" class="zoom-btn">🔍</button>

        <div id="zoomControls" class="zoom-controls">

            <button id="zoomIn">+</button>

            <button id="zoomOut">−</button>

        </div>

    `;

    document.body.appendChild(zoom);


    /* ==========================================
       ZOOM ELEMENTS
    ========================================== */

    const toggle =
        document.getElementById("zoomToggle");

    const controls =
        document.getElementById("zoomControls");

    const zoomIn =
        document.getElementById("zoomIn");

    const zoomOut =
        document.getElementById("zoomOut");


    /* ==========================================
       ZOOM LEVEL
    ========================================== */

    let level =
        parseInt(
            localStorage.getItem("zoomLevel")
        ) || 0;


    let hideTimer;


    /* ==========================================
       UPDATE FONT SIZE
    ========================================== */

    function updateFontSize() {

        document.documentElement.style.setProperty(
            "--prayer-font-size",
            (17 + level * 2) + "px"
        );

        localStorage.setItem(
            "zoomLevel",
            level
        );

    }


    updateFontSize();


    /* ==========================================
       SHOW ZOOM CONTROLS
    ========================================== */

    function showControls() {

        controls.classList.add("show");

        toggle.style.display = "none";

        resetTimer();

    }


    /* ==========================================
       HIDE ZOOM CONTROLS
    ========================================== */

    function hideControls() {

        controls.classList.remove("show");

        toggle.style.display = "block";

    }


    /* ==========================================
       RESET HIDE TIMER
    ========================================== */

    function resetTimer() {

        clearTimeout(hideTimer);

        hideTimer =
            setTimeout(
                hideControls,
                5000
            );

    }


    /* ==========================================
       ZOOM TOGGLE
    ========================================== */

    toggle.addEventListener(
        "click",
        showControls
    );


    /* ==========================================
       ZOOM IN
    ========================================== */

    zoomIn.addEventListener("click", () => {

        if (level < 5) {

            level++;

            updateFontSize();

        }

        resetTimer();

    });


    /* ==========================================
       ZOOM OUT
    ========================================== */

    zoomOut.addEventListener("click", () => {

        if (level > -5) {

            level--;

            updateFontSize();

        }

        resetTimer();

    });


});


/* ==========================================================
   PRAYER LANGUAGE / MYSTERY SWITCHER
========================================================== */

function showPrayer(language, button) {

    /*
        Only affect the prayer-card
        containing the clicked button.
    */

    const card =
        button.closest(".prayer-card");

    if (!card) return;


    /*
        Hide only the sections
        belonging to this card.
    */

    card.querySelectorAll(".prayer-language")
        .forEach(section => {

            section.style.display = "none";

        });


    /*
        Show the selected section.
    */

    const selected =
        document.getElementById(language);

    if (selected) {

        selected.style.display = "block";

    }


    /*
        Update only the buttons
        belonging to this menu.
    */

    const menu =
        button.closest(".language-menu");

    if (menu) {

        menu.querySelectorAll("button")
            .forEach(btn => {

                btn.classList.remove("active");

            });

    }


    button.classList.add("active");

}













/* ==========================================================
   SLIDER PROGRESS
   ALL INTENTIONS SLIDERS
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /*
        Find every intentions slider on the page.
    */

    const sliders =
        document.querySelectorAll(".intentions-slider");


    sliders.forEach(slider => {

        /*
            Find the prayer card containing
            this particular slider.
        */

        const card =
            slider.closest(".prayer-card");

        if (!card) return;


        /*
            Find the progress dots belonging
            to this particular slider.

            We support both existing class names:
            .angelus-progress
            .litany-progress
        */

        const progress =
            card.querySelector(
                ".angelus-progress, .litany-progress"
            );

        if (!progress) return;


        const dots =
            progress.querySelectorAll("span");

        if (!dots.length) return;


        /* ==========================================
           UPDATE DOTS
        ========================================== */

        function updateDots() {

            const index =
                Math.round(
                    slider.scrollLeft /
                    slider.clientWidth
                );


            dots.forEach((dot, i) => {

                dot.classList.toggle(
                    "active",
                    i === index
                );

            });

        }


        /* ==========================================
           SLIDER SCROLL
        ========================================== */

        slider.addEventListener("scroll", () => {

            requestAnimationFrame(
                updateDots
            );

        });


        /* ==========================================
           DOT NAVIGATION
        ========================================== */

        dots.forEach((dot, i) => {

            dot.addEventListener("click", () => {

                slider.scrollTo({

                    left:
                        i * slider.clientWidth,

                    behavior: "smooth"

                });

            });

        });


        /*
            Set the correct initial dot.
        */

        updateDots();

    });

});
















/* ==========================================================
   PWA
   SERVICE WORKER
========================================================== */

if ("serviceWorker" in navigator) {

    window.addEventListener("load", async () => {

        try {

            const registration =
                await navigator.serviceWorker.register(
                    "/service-worker.js"
                );


            console.log(
                " Service Worker registered:",
                registration.scope
            );


        } catch (err) {

            console.error(
                " Service Worker registration failed:",
                err
            );

        }

    });

}





/* ==========================================================
   UPDATE APP
   CLEAR AND REDOWNLOAD SERVICE WORKER CACHE
========================================================== */

document.addEventListener("DOMContentLoaded", () => {


    const updateButton =
        document.getElementById("updateApp");


    if (!updateButton) return;



    updateButton.addEventListener(
        "click",
        async (event) => {


            event.preventDefault();



            /*
                Prevent multiple clicks
                while updating.
            */

            if (
                updateButton.dataset.updating === "true"
            ) {

                return;

            }



            updateButton.dataset.updating =
                "true";



            /*
                Show updating message.
            */

            updateButton.textContent =
                "? Aggiornamento...";



            try {


                /*
                    Check Service Worker support.
                */

                if (
                    !("serviceWorker" in navigator)
                ) {

                    throw new Error(
                        "Service Worker non supportato."
                    );

                }



                /*
                    Wait for the Service Worker
                    to be ready.
                */

                const registration =
                    await navigator.serviceWorker.ready;



                /*
                    Get the active Service Worker.
                */

                const worker =
    registration.active;



                if (!worker) {

                    throw new Error(
                        "Service Worker non disponibile."
                    );

                }



                /*
                    Create a communication channel
                    between this page and the
                    Service Worker.
                */

                const messageChannel =
                    new MessageChannel();



                /*
                    Wait for the Service Worker
                    to finish downloading all files.
                */

                const updateResult =
                    new Promise(
                        (resolve, reject) => {


                            messageChannel
                                .port1
                                .onmessage =
                                (event) => {


                                    /*
                                        Update successful
                                    */

                                    if (
                                        event.data &&
                                        event.data.success
                                    ) {

                                        resolve();

                                    }


                                    /*
                                        Update failed
                                    */

                                    else {

                                        reject(
                                            new Error(
                                                event.data?.error ||
                                                "Aggiornamento non riuscito."
                                            )
                                        );

                                    }

                                };


                        }
                    );



                /*
                    Tell the Service Worker
                    to completely update the app.
                */

                worker.postMessage(
                    {
                        type: "UPDATE_APP"
                    },
                    [
                        messageChannel.port2
                    ]
                );



                /*
                    Wait until the Service Worker
                    has downloaded ALL files.
                */

                await updateResult;



                /*
                    Small delay to make sure
                    the cache has finished writing.
                */

                await new Promise(
                    resolve =>
                        setTimeout(
                            resolve,
                            300
                        )
                );



                /*
                    Reload the application
                    using the newly updated cache.
                */

                window.location.reload();


            }


            catch (error) {


                console.error(
                    "Aggiornamento app fallito:",
                    error
                );



                /*
                    Restore the update button.
                */

                updateButton.textContent =
                    "?? Aggiorna l'App";


                updateButton.dataset.updating =
                    "false";



                /*
                    Show the exact error,
                    including the file that failed.
                */

                alert(
                    "Impossibile aggiornare l'App.\n\n" +
                    error.message +
                    "\n\n" +
                    "Controlla la connessione Internet e riprova."
                );


            }


        }
    );


});