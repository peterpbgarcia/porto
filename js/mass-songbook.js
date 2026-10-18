/* ==========================================================
   MASS GUIDE → NEW SONGBOOK
   Existing overlay + generated folder-based catalogue

   The Mass guide has 9 FIXED categories.
   Each category can display songs from MULTIPLE folders.

   To customize the folders, edit MASS_SONG_FOLDERS below.
========================================================== */


/* ==========================================================
   EDITABLE CONFIGURATION — SONG FOLDER ASSIGNMENTS
==========================================================

HOW TO ADD ANOTHER FOLDER TO A MASS CATEGORY:

1. Create a folder inside songbook/.
2. Put your song files inside that folder.
3. Run AggiornaCanti.bat to regenerate the catalogue.
4. Add the folder name to the appropriate list below.

EXAMPLE — adding two folders to Comunione:

"Comunione": [
    "Comunione",
    "Songbook Collection",
    "My New Songs"
],

IMPORTANT:
- Keep the 9 Mass category names on the LEFT unchanged.
- Add folder names inside the corresponding array on the RIGHT.
- You can add as many folders as you need.
- Separate entries with commas.
- Folder names may include their numeric prefix or omit it.
  For example, "08 Comunione" and "Comunione" both match.
- Use the category name displayed in the generated catalogue.
- Do not create new Mass guide categories here.
- A folder must exist in the generated catalogue to appear.

========================================================== */

const MASS_SONG_FOLDERS = {

    "Ingresso": [
        "Ingresso"
        // Add more folders here if needed.
    ],

    "Kyrie": [
        "Kyrie"
        // Add more folders here if needed.
    ],

    "Gloria": [
        "Gloria"
        // Add more folders here if needed.
    ],

    "Alleluia": [
        "Alleluia"
        // Add more folders here if needed.
    ],

    "Offertorio": [
        "Offertorio"
        // Add more folders here if needed.
    ],

    "Santo": [
        "Santo"
        // Add more folders here if needed.
    ],

    "Agnello di Dio": [
        "Agnus Dei"
        // Add more folders here if needed.
    ],

    "Comunione": [
        "Comunione"
        // Example:
        // ,"Songbook Collection"
        // ,"My New Songs"
        // ,"Adorazione"
    ],

    "Finale": [
        "Finale"
        // Add more folders here if needed.
    ]

};


/* ==========================================================
   MASS GUIDE INTEGRATION
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ======================================================
       RESTORE MASS GUIDE SCROLL POSITION
    ====================================================== */

    const savedScrollPosition =
        sessionStorage.getItem("massGuideScrollPosition");

    if (savedScrollPosition !== null) {
        const position = parseInt(savedScrollPosition, 10);

        requestAnimationFrame(() => {
            window.scrollTo({
                top: position,
                behavior: "instant"
            });
        });

        sessionStorage.removeItem("massGuideScrollPosition");
    }


    /* ======================================================
       FIND SONG BUTTONS
    ====================================================== */

    const songButtons =
        document.querySelectorAll(".song-button");

    if (!songButtons.length) return;


    /* ======================================================
       READ GENERATED CATALOGUE
       songs-generated.js must load before this script.
    ====================================================== */

    const categories =
        typeof songCategories !== "undefined"
            ? songCategories
            : [];

    if (!Array.isArray(categories) || !categories.length) {
        console.error(
            "Songbook catalogue not found. Check songs-generated.js."
        );
        return;
    }


    /* ======================================================
       CREATE THE EXISTING FLOATING SONG PANEL
    ====================================================== */

    const overlay = document.createElement("div");
    overlay.className = "mass-song-overlay";

    overlay.innerHTML = `
        <div class="mass-song-panel">

            <div class="mass-song-header">
                <h2 id="massSongTitle">Canti</h2>

                <button
                    class="mass-song-close"
                    type="button"
                    aria-label="Chiudi">
                    ×
                </button>
            </div>

            <div
                id="massSongList"
                class="mass-song-list">
            </div>

        </div>
    `;

    document.body.appendChild(overlay);

    const title = overlay.querySelector("#massSongTitle");
    const songList = overlay.querySelector("#massSongList");
    const closeButton = overlay.querySelector(".mass-song-close");


    /* ======================================================
       STATE
    ====================================================== */

    let massSongOpen = false;


    /* ======================================================
       NORMALIZE CATEGORY NAMES

       Supports:
       01 Ingresso
       08 Comunione
       category-08 Comunione

       Accent differences and numeric prefixes are ignored.
    ====================================================== */

    function normalize(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/^\s*\d+\s*/, "")
            .trim()
            .toLowerCase();
    }


    function getCategoryName(category) {
        return category.name || category.id || "";
    }


    /* ======================================================
       FIND A GENERATED CATALOGUE CATEGORY
    ====================================================== */

    function findCategory(name) {
        const wanted = normalize(name);

        return categories.find(category => {
            return normalize(getCategoryName(category)) === wanted;
        });
    }


    /* ======================================================
       DETERMINE WHICH OF THE 9 MASS CATEGORIES WAS CLICKED

       Sections such as Kyrie, Gloria, Santo and Agnello di Dio
       are identified using data-song-section.

       Ingresso, Offertorio, Comunione and Finale are identified
       from the first category in data-song-category.

       This keeps the Mass guide categories fixed.
    ====================================================== */

    function getMassCategory(categoryValue, section) {

        const massCategoryNames =
            Object.keys(MASS_SONG_FOLDERS);

        function findMassCategory(name) {
            const wanted = normalize(name);

            return massCategoryNames.find(massName => {
                return normalize(massName) === wanted;
            }) || null;
        }

        /*
         * Prefer the specific Mass section.
         * Example: "Agnello di Dio" maps to the fixed
         * Mass category, whose folder is "Agnus Dei".
         */
        if (section) {
            const matchedSection = findMassCategory(section);

            if (matchedSection) {
                return matchedSection;
            }
        }

        /*
         * Otherwise use the first category requested by
         * the Mass guide button.
         */
        const requested = String(categoryValue || "")
            .split(",")
            .map(value => value.trim())
            .filter(Boolean);

        for (const name of requested) {
            const matched = findMassCategory(name);

            if (matched) {
                return matched;
            }
        }

        return null;
    }


    /* ======================================================
       GET ALL FOLDERS ASSIGNED TO A MASS CATEGORY

       The configuration can contain multiple folders.
       Each folder is matched to the generated catalogue.
    ====================================================== */

    function getAssignedCategories(massCategoryName) {

        const folderNames =
            MASS_SONG_FOLDERS[massCategoryName] || [];

        const resolved = [];

        folderNames.forEach(folderName => {
            const category = findCategory(folderName);

            if (!category) {
                console.warn(
                    `Mass song folder not found: "${folderName}". ` +
                    `Check the name in MASS_SONG_FOLDERS and ` +
                    `regenerate songs-generated.js if necessary.`
                );

                return;
            }

            const alreadyAdded = resolved.some(item => {
                return item === category;
            });

            if (!alreadyAdded) {
                resolved.push(category);
            }
        });

        return resolved;
    }


    /* ======================================================
       OPEN SONG PANEL
    ====================================================== */

    function openSongPanel(categoryValue, section) {

        if (massSongOpen) return;

        const massCategoryName =
            getMassCategory(categoryValue, section);

        const selectedCategories = massCategoryName
            ? getAssignedCategories(massCategoryName)
            : [];

        let matchingSongs = [];

        selectedCategories.forEach(category => {

            const songs = Array.isArray(category.songs)
                ? category.songs
                : [];

            songs.forEach(song => {
                matchingSongs.push({
                    ...song,
                    categoryName: getCategoryName(category)
                });
            });

        });


        /* ==================================================
           REMOVE DUPLICATE SONG FILES
        ================================================== */

        const seenFiles = new Set();

        matchingSongs = matchingSongs.filter(song => {

            if (!song.file) return false;

            if (seenFiles.has(song.file)) {
                return false;
            }

            seenFiles.add(song.file);

            return true;
        });


        /* ==================================================
           SET PANEL TITLE
        ================================================== */

        title.textContent = massCategoryName
            ? `Canti: ${massCategoryName}`
            : "Canti";


        /* ==================================================
           CLEAR PREVIOUS RESULTS
        ================================================== */

        songList.innerHTML = "";


        /* ==================================================
           SHOW EMPTY STATE
        ================================================== */

        if (!matchingSongs.length) {

            const empty = document.createElement("p");

            empty.className = "mass-song-empty";

            empty.textContent =
                "Nessun canto trovato in questa categoria.";

            songList.appendChild(empty);
        }


        /* ==================================================
           CREATE SONG ITEMS
        ================================================== */

        matchingSongs.forEach(song => {

            const item = document.createElement("button");

            item.type = "button";
            item.className = "mass-song-item";

            const name = document.createElement("span");

            name.className = "mass-song-name";
            name.textContent = song.title || "Canto senza titolo";

            item.appendChild(name);


            /* ==============================================
               OPEN THE SELECTED SONG
            ============================================== */

            item.addEventListener("click", () => {

                if (!song.file) return;

                sessionStorage.setItem(
                    "massGuideScrollPosition",
                    String(window.scrollY)
                );

                const isPDF =
                    song.type === "pdf" ||
                    /\.pdf(?:$|[?#])/i.test(song.file);

                const viewer = isPDF
                    ? "pdf-songbook-viewer.html"
                    : "songbook-viewer.html";

                const viewerURL =
                    viewer + "?file=" +
                    encodeURIComponent(song.file);


                /*
                 * Close the song list, then open the selected
                 * viewer using the existing full-screen overlay.
                 */

                overlay.classList.remove("show");

                document.body.classList.remove("mass-song-open");

                massSongOpen = false;

                history.back();

                setTimeout(() => {

                    if (typeof openPageOverlay === "function") {

                        openPageOverlay(viewerURL);

                    } else {

                        console.error(
                            "openPageOverlay() was not found. " +
                            "Check overlay.js."
                        );

                    }

                }, 100);

            });

            songList.appendChild(item);

        });


        /* ==================================================
           SHOW PANEL
        ================================================== */

        history.pushState(
            { massSongPanel: true },
            "",
            window.location.href
        );

        massSongOpen = true;

        overlay.classList.add("show");

        document.body.classList.add("mass-song-open");
    }


    /* ======================================================
       CLOSE PANEL
    ====================================================== */

    function closeSongPanel() {

        overlay.classList.remove("show");

        document.body.classList.remove("mass-song-open");

        massSongOpen = false;
    }


    /* ======================================================
       BROWSER BACK / ANDROID BACK
    ====================================================== */

    window.addEventListener("popstate", () => {

        if (massSongOpen) {
            closeSongPanel();
        }

    });


    /* ======================================================
       CLOSE BUTTON
    ====================================================== */

    closeButton.addEventListener("click", () => {

        if (massSongOpen) {
            history.back();
        }

    });


    /* ======================================================
       TAP OUTSIDE PANEL
    ====================================================== */

    overlay.addEventListener("click", event => {

        if (event.target === overlay && massSongOpen) {
            history.back();
        }

    });


    /* ======================================================
       ESC KEY
    ====================================================== */

    document.addEventListener("keydown", event => {

        if (event.key === "Escape" && massSongOpen) {
            history.back();
        }

    });


    /* ======================================================
       MASS GUIDE MUSIC BUTTONS
    ====================================================== */

    songButtons.forEach(button => {

        button.addEventListener("click", event => {

            event.preventDefault();

            const category = button.dataset.songCategory || "";
            const section = button.dataset.songSection || "";

            if (!category && !section) return;

            openSongPanel(category, section);
        });

    });

});