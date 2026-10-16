
/* ==================================================
   CANTI — CATALOGUE SCRIPT
================================================== */

(() => {
    "use strict";

    const searchInput = document.getElementById("searchSong");
    const clearButton = document.getElementById("clearSearch");
    const categoriesContainer = document.getElementById("songCategories");
    const noSongsFound = document.getElementById("noSongsFound");

    if (
        !searchInput ||
        !clearButton ||
        !categoriesContainer ||
        !noSongsFound
    ) {
        console.error("Canti: elementi HTML mancanti.");
        return;
    }

    if (
        typeof songCategories === "undefined" ||
        !Array.isArray(songCategories)
    ) {
        console.error(
            "Canti: songCategories non è stato trovato in js/songs-generated.js."
        );

        categoriesContainer.textContent =
            "Impossibile caricare l'elenco dei canti.";

        return;
    }

    let expandedCategory = null;

    // Existing manually configured PDF songbooks.
    const PDF_SONGBOOKS = {
        "Bayan Umawit Songbook": "pdf/bayanumawit.pdf",
        "Italian Music Sheets": "pdf/musichub2026.pdf"
    };

    /* ==================================================
       CREATE ELEMENT
    ================================================== */

    function createElement(tag, className, text) {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (text !== undefined) {
            element.textContent = text;
        }

        return element;
    }

    /* ==================================================
       NORMALIZE SEARCH TEXT
    ================================================== */

    function normalize(value) {
        return String(value ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLocaleLowerCase("it")
            .trim();
    }

    /* ==================================================
       CATEGORY DATA
    ================================================== */

    function getSongs(category) {
        return Array.isArray(category.songs)
            ? category.songs
            : [];
    }

    function getSongbooks(category) {
        return Array.isArray(category.songbooks)
            ? category.songbooks
            : [];
    }

    /* ==================================================
       SONG NUMBER
    ================================================== */

    function getSongNumber(title) {
        const match = String(title ?? "").match(
            /^\s*([IVXLCDM]+|\d+)\s*[.)-]?/i
        );

        return match ? match[1] : "";
    }

    /* ==================================================
       DETECT PDF FILES
    ================================================== */

    function isPdf(song) {
        if (String(song.type ?? "").toLowerCase() === "pdf") {
            return true;
        }

        return /\.pdf$/i.test(String(song.file ?? ""));
    }

    /* ==================================================
       BUILD PDF VIEWER LINK
    ================================================== */

    function getPdfViewerUrl(pdfPath) {
        return (
            "pdf-songbook-viewer.html?file=" +
            encodeURIComponent(pdfPath)
        );
    }

    /* ==================================================
       SEARCH SONGS
    ================================================== */

    function matchesSong(song, query) {
        if (!query) {
            return true;
        }

        const title = normalize(song.title);
        const number = normalize(getSongNumber(song.title));

        return title.includes(query) || number.includes(query);
    }

    /* ==================================================
       CREATE SONG LINK
    ================================================== */

    function createSongLink(song) {
        const item = createElement("li", "song-item");
        const link = createElement("a", "song-link", song.title);

        if (isPdf(song)) {
            // PDFs use the new custom PDF viewer.
            link.href = getPdfViewerUrl(song.file);
        } else {
            // HTML songs keep using the existing song viewer.
            link.href =
                "songbook-viewer.html?file=" +
                encodeURIComponent(song.file);
        }

        item.appendChild(link);

        return item;
    }

    /* ==================================================
       CREATE MANUALLY CONFIGURED PDF SONGBOOK LINK
    ================================================== */

    function createSongbookLink(songbook) {
        const item = createElement("li", "song-item");

        const link = createElement(
            "a",
            "songbook-pdf-link",
            songbook.name
        );

        const pdfPath =
            songbook.file ||
            PDF_SONGBOOKS[songbook.name];

        if (pdfPath) {
            link.href = getPdfViewerUrl(pdfPath);
        } else {
            link.href = "#";

            console.warn(
                "Canti: percorso PDF non trovato per:",
                songbook.name
            );

            link.addEventListener("click", event => {
                event.preventDefault();
            });
        }

        item.appendChild(link);

        return item;
    }

    /* ==================================================
       CREATE CATEGORY
    ================================================== */

    function createCategory(category, query) {
        const songs = getSongs(category);
        const songbooks = getSongbooks(category);

        const matchingSongs = songs.filter(song =>
            matchesSong(song, query)
        );

        const matchingSongbooks = query
            ? songbooks.filter(songbook =>
                normalize(songbook.name).includes(query)
            )
            : songbooks;

        const hasMatches =
            matchingSongs.length > 0 ||
            matchingSongbooks.length > 0;

        if (query && !hasMatches) {
            return null;
        }

        const section = createElement(
            "section",
            "song-category"
        );

        const categoryId = String(
            category.id || category.name
        );

        const button = createElement(
            "button",
            "song-category-toggle"
        );

        button.type = "button";

        const heading = createElement(
            "span",
            "song-category-name",
            category.name
        );

        const count = createElement(
            "span",
            "song-category-count",
            String(
                matchingSongs.length +
                matchingSongbooks.length
            )
        );

        const chevron = createElement(
            "span",
            "song-category-chevron",
            "›"
        );

        chevron.setAttribute("aria-hidden", "true");

        button.append(heading, count, chevron);

        const content = createElement(
            "div",
            "song-category-content"
        );

        const list = createElement("ul", "song-list");

        matchingSongs.forEach(song => {
            list.appendChild(createSongLink(song));
        });

        matchingSongbooks.forEach(songbook => {
            list.appendChild(createSongbookLink(songbook));
        });

        content.appendChild(list);

        const isExpanded =
            query.length > 0 ||
            expandedCategory === categoryId;

        content.hidden = !isExpanded;

        button.setAttribute(
            "aria-expanded",
            String(isExpanded)
        );

        button.addEventListener("click", () => {
            if (searchInput.value.trim()) {
                return;
            }

            expandedCategory =
                expandedCategory === categoryId
                    ? null
                    : categoryId;

            render();
        });

        section.append(button, content);

        return section;
    }

    /* ==================================================
       RENDER CATALOGUE
    ================================================== */

    function render() {
        const query = normalize(searchInput.value);

        categoriesContainer.replaceChildren();

        let visibleCategoryCount = 0;

        songCategories.forEach(category => {
            const section = createCategory(category, query);

            if (section) {
                categoriesContainer.appendChild(section);
                visibleCategoryCount++;
            }
        });

        noSongsFound.hidden = visibleCategoryCount !== 0;

        clearButton.hidden = searchInput.value.length === 0;
    }

    /* ==================================================
       SEARCH EVENTS
    ================================================== */

    searchInput.addEventListener("input", () => {
        render();
    });

    clearButton.addEventListener("click", () => {
        searchInput.value = "";
        expandedCategory = null;

        render();

        searchInput.focus();
    });

    /* ==================================================
       INITIALIZE
    ================================================== */

    render();
})();
