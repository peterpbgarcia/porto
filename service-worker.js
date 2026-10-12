/* ==========================================
   COMPENDIO DI PREGHIERE
   SERVICE WORKER
========================================== */


const CACHE_NAME = "compendio-v9.0.3";

const UPDATE_CACHE_NAME =
    CACHE_NAME + "-update";




/* ==========================================
   FILES TO CACHE
========================================== */


const APP_FILES = [


    "/",
    "/index.html",



    /* =========================
       Prayer pages
    ========================= */

    "/angelus.html",
    "/morning-prayer.html",
    "/evening-prayer.html",
    "/night-prayer.html",
    "/adoration.html",
    "/mass-guide.html",
    "/rosary.html",
    "/sesta-nona.html",
    "/devotions.html",
    "/basic-prayers.html",




    /* =========================
       Songbook
    ========================= */

    "/songbook.html",
    "/songbook-viewer.html",
    "/guitar-tuner.html",




    /* =========================
       CSS
    ========================= */

    "/css/style.css",
    "/css/overlay.css",
    "/css/songbook-viewer.css",
    "/css/guitar-tuner.css",




    /* =========================
       JavaScript
    ========================= */

    "/js/app.js",
    "/js/overlay.js",
    "/js/songbook.js",
    "/js/songbook-viewer.js",
    "/js/songs.js",
    "/js/guitar-tuner.js",




    /* =========================
       Images
    ========================= */

    "/images/logo.png",




    /* =========================
       Icons
    ========================= */

    "/icons/icon-48.webp",
    "/icons/icon-72.webp",
    "/icons/icon-96.webp",
    "/icons/icon-128.webp",
    "/icons/icon-192.webp",
    "/icons/icon-256.webp",
    "/icons/icon-512.webp",




    /* =========================
       Manifest
    ========================= */

    "/manifest.webmanifest",




    /* =========================
       PDFs
    ========================= */

    "/pdf/songbook.pdf",
    "/pdf/bayanumawit.pdf",
    "/pdf/musichub2026.pdf",




    /* =========================
       PDF.js
    ========================= */

    "/pdfjs/build/pdf.js",
    "/pdfjs/build/pdf.worker.js"


];




/* ==========================================
   INSTALL
========================================== */


self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches.open(CACHE_NAME)

            .then(async cache => {

                for(
                    const file of APP_FILES
                ){

                    try{

                        await cache.add(file);

                        console.log(
                            "Cached:",
                            file
                        );

                    }

                    catch(error){

                        console.error(
                            "Cache failed:",
                            file,
                            error
                        );

                    }

                }

            })

        );


        /*
           Activate the new Service Worker
           immediately.
        */

        self.skipWaiting();

    }
);




/* ==========================================
   ACTIVATE
========================================== */


self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches.keys()

            .then(keys => {

                return Promise.all(

                    keys.map(key => {

                        /*
                           Keep only the current
                           main cache.

                           This also removes old
                           cache versions and
                           temporary update caches.
                        */

                        if(
                            key !== CACHE_NAME
                        ){

                            return caches.delete(
                                key
                            );

                        }

                    })

                );

            })

            .then(() => {

                /*
                   Take control of all open
                   pages immediately.
                */

                return self.clients.claim();

            })

        );

    }
);




/* ==========================================
   MANUAL UPDATE
========================================== */


self.addEventListener(
    "message",
    event => {


        /*
           Ignore messages that are not
           intended for the update system.
        */

        if(
            !event.data ||
            event.data.type !== "UPDATE_APP"
        ){

            return;

        }



        /*
           Perform the complete update.
        */

        event.waitUntil(

            updateApp()

            .then(() => {


                /*
                   Tell the page that the
                   update succeeded.
                */

                if(
                    event.ports &&
                    event.ports[0]
                ){

                    event.ports[0].postMessage({
                        success: true
                    });

                }

            })

            .catch(error => {


                console.error(
                    "App update failed:",
                    error
                );


                /*
                   Tell the page that the
                   update failed.
                */

                if(
                    event.ports &&
                    event.ports[0]
                ){

                    event.ports[0].postMessage({

                        success: false,

                        error:
                            error.message

                    });

                }

            })

        );

    }
);




/* ==========================================
   UPDATE APP
========================================== */


async function updateApp(){


    console.log(
        "================================"
    );


    console.log(
        "Starting complete app update..."
    );


    console.log(
        "================================"
    );



    /*
       1.
       Delete any previous temporary
       update cache.
    */

    await caches.delete(
        UPDATE_CACHE_NAME
    );



    /*
       2.
       Create a temporary cache.

       The existing main cache remains
       untouched while the new files
       are being downloaded.
    */

    const updateCache =
        await caches.open(
            UPDATE_CACHE_NAME
        );



    /*
       3.
       Download EVERYTHING again
       directly from the server.
    */

    for(
        const file of APP_FILES
    ){

        try{


            console.log(
                "Downloading:",
                file
            );



            /*
               Force a fresh network request.

               This prevents the browser from
               simply returning an old HTTP-cached
               version.
            */

            const response =
                await fetch(
                    file,
                    {
                        cache: "reload"
                    }
                );



            /*
               Make sure the server returned
               a successful response.
            */

            if(
                !response.ok
            ){

                throw new Error(
                    "HTTP " +
                    response.status +
                    " - " +
                    file
                );

            }



            /*
               Save the fresh response into
               the temporary cache.
            */

            await updateCache.put(
                file,
                response.clone()
            );



            console.log(
                "Updated:",
                file
            );

        }


        catch(error){


            console.error(
                "UPDATE FAILED:",
                file,
                error
            );



            /*
               Delete the temporary cache.

               The old working cache remains
               completely untouched.
            */

            await caches.delete(
                UPDATE_CACHE_NAME
            );



            /*
               Report exactly which file
               caused the update to fail.
            */

            throw new Error(
                "Impossibile aggiornare:\n" +
                file +
                "\n\n" +
                error.message
            );

        }

    }



    /*
       4.
       Open the existing main cache.
    */

    const mainCache =
        await caches.open(
            CACHE_NAME
        );



    /*
       5.
       Remove everything from the
       old main cache.
    */

    const oldRequests =
        await mainCache.keys();



    for(
        const request of oldRequests
    ){

        await mainCache.delete(
            request
        );

    }



    /*
       6.
       Copy all newly downloaded files
       from the temporary cache into
       the main cache.
    */

    const newRequests =
        await updateCache.keys();



    for(
        const request of newRequests
    ){

        const response =
            await updateCache.match(
                request
            );



        if(response){

            await mainCache.put(
                request,
                response
            );

        }

    }



    /*
       7.
       Delete the temporary cache.
    */

    await caches.delete(
        UPDATE_CACHE_NAME
    );



    /*
       Update completed.
    */

    console.log(
        "================================"
    );


    console.log(
        "COMPENDIO DI PREGHIERE UPDATED SUCCESSFULLY."
    );


    console.log(
        "================================"
    );

}




/* ==========================================
   FETCH
========================================== */


self.addEventListener(
    "fetch",
    event => {


        const request =
            event.request;



        /*
           Only handle GET requests.
        */

        if(
            request.method !== "GET"
        ){

            return;

        }



        const url =
            new URL(
                request.url
            );



        /*
           Only handle requests belonging
           to this website.
        */

        if(
            url.origin !== location.origin
        ){

            return;

        }



        event.respondWith(

            caches.open(
                CACHE_NAME
            )

            .then(async cache => {


                /*
                    1.
                    Try exact request.

                    Example:

                    songbook-viewer.html?page=134
                */

                let cached =
                    await cache.match(
                        request
                    );



                if(cached){

                    return cached;

                }



                /*
                    2.
                    Remove query parameters.

                    Example:

                    songbook-viewer.html?page=134

                    becomes:

                    songbook-viewer.html
                */

                cached =
                    await cache.match(
                        url.pathname
                    );



                if(cached){

                    return cached;

                }



                /*
                    3.
                    Try network.
                */

                try{


                    const response =
                        await fetch(
                            request
                        );



                    /*
                       Save successful network
                       responses into the cache.
                    */

                    if(
                        response &&
                        response.status === 200
                    ){

                        cache.put(

                            url.pathname,

                            response.clone()

                        );

                    }



                    return response;

                }



                catch(error){


                    console.warn(
                        "Offline request failed:",
                        url.href
                    );



                    /*
                        Final offline fallback.
                    */

                    return cache.match(
                        "/index.html"
                    );

                }



            })

        );

    }
);