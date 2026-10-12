import fs from "fs";
import path from "path";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const pdfPath = path.resolve("../pdf/songbook.pdf");
const outputPath = path.resolve("../js/songs.js");

async function generateSongbook() {

    console.log("Reading PDF...");

    const loadingTask = pdfjsLib.getDocument(pdfPath);

    const pdf = await loadingTask.promise;

    const outline = await pdf.getOutline();

    if (!outline) {
        console.log("No bookmarks found.");
        return;
    }

    const songs = [];

    async function walk(items, currentCategory = "") {

        for (const item of items) {

            if (item.items && item.items.length > 0) {

                await walk(item.items, item.title);

                continue;

            }

            let page = 1;

            if (item.dest) {

                let destination = item.dest;

                if (typeof destination === "string") {

                    destination = await pdf.getDestination(destination);

                }

                if (destination) {

                    const pageIndex = await pdf.getPageIndex(destination[0]);

                    page = pageIndex + 1;

                }

            }

            songs.push({

                category: currentCategory,
                title: item.title.trim(),
                page

            });

        }

    }

    await walk(outline);

    songs.sort((a, b) => a.page - b.page);

    const output =
`const songs = ${JSON.stringify(songs, null, 4)};

export default songs;
`;

    fs.writeFileSync(outputPath, output, "utf8");

    console.log("--------------------------------");

    console.log(`Generated ${songs.length} songs.`);

    console.log(`Saved to ${outputPath}`);

    console.log("--------------------------------");

}

generateSongbook().catch(console.error);