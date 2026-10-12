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

    if (typeof songCategories === "undefined" ||
    !Array.isArray(songCategories)) {
    console.error(
        "Canti: songCategories non è stato trovato in js/songs.js."
    );
    categoriesContainer.textContent =
        "Impossibile caricare l'elenco dei canti.";
    return;
    }

    let expandedCategory = null;

    const PDF_SONGBOOKS = {
        "Bayan Umawit Songbook": "pdf/bayanumawit.pdf",
        "Italian Music Sheets": "pdf/musichub2026.pdf"
    };

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

    function normalize(value) {
        return String(value ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLocaleLowerCase("it")
            .trim();
    }

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

    function getSongNumber(title) {
        const match = String(title ?? "").match(
            /^\s*([IVXLCDM]+|\d+)\s*[.)-]?/i
        );

        return match ? match[1] : "";
    }

    function matchesSong(song, query) {
        if (!query) {
            return true;
        }

        const title = normalize(song.title);
        const number = normalize(getSongNumber(song.title));

        return title.includes(query) || number.includes(query);
    }

    
function createSongLink(song) {
    const item = createElement("li", "song-item");
    const link = createElement("a", "song-link", song.title);

    link.href =
        "songbook-viewer.html?file=" +
        encodeURIComponent(song.file);

    item.appendChild(link);

    return item;
}


    function createSongbookLink(songbook) {
        const item = createElement("li", "song-item");
        const link = createElement(
            "a",
            "songbook-pdf-link",
            songbook.name
        );

        /*
         * Preserve the existing PDF.js viewer.
         * Use the configured PDF path when available.
         */
        const pdfPath =
            songbook.file ||
            PDF_SONGBOOKS[songbook.name];

        if (pdfPath) {
            link.href =
                "pdfjs/web/viewer.html?file=" +
                encodeURIComponent("../../" + pdfPath);

            link.target = "_self";
        }

        item.appendChild(link);

        return item;
    }

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

        const section = createElement("section", "song-category");

        const categoryId = String(
            category.id || category.name
        );

        const button = createElement(
            "button",
            "song-category-toggle"
        );

        button.type = "button";
        button.setAttribute(
            "aria-expanded",
            String(!query && expandedCategory === categoryId)
        );

        const heading = createElement(
            "span",
            "song-category-name",
            category.name
        );

        const count = createElement(
            "span",
            "song-category-count",
            String(matchingSongs.length + matchingSongbooks.length)
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
    query.length > 0 || expandedCategory === categoryId;

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

    searchInput.addEventListener("input", () => {
        render();
    });

    clearButton.addEventListener("click", () => {
        searchInput.value = "";
        expandedCategory = null;
        render();
        searchInput.focus();
    });

    render();
})();