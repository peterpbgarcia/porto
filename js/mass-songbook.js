/* ==========================================================
   MASS GUIDE → SONGBOOK
   Floating song selector
========================================================== */


document.addEventListener(
"DOMContentLoaded",
() => {



/* ======================================================
   RESTORE MASS GUIDE SCROLL POSITION
====================================================== */


const savedScrollPosition =
    sessionStorage.getItem(
        "massGuideScrollPosition"
    );


if (savedScrollPosition !== null) {


    const position =
        parseInt(
            savedScrollPosition,
            10
        );


    requestAnimationFrame(
        () => {

            window.scrollTo({

                top: position,

                behavior: "instant"

            });

        }
    );


    sessionStorage.removeItem(
        "massGuideScrollPosition"
    );


}





/* ======================================================
   FIND SONG BUTTONS
====================================================== */


const songButtons =
    document.querySelectorAll(
        ".song-button"
    );


if (!songButtons.length) return;






/* ======================================================
   CREATE FLOATING SONG PANEL
====================================================== */


const overlay =
    document.createElement(
        "div"
    );


overlay.className =
    "mass-song-overlay";



overlay.innerHTML = `

<div class="mass-song-panel">


    <div class="mass-song-header">


        <h2 id="massSongTitle">
            Canti
        </h2>



        <button
            class="mass-song-close"
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



document.body.appendChild(
    overlay
);







/* ======================================================
   PANEL ELEMENTS
====================================================== */


const title =
    overlay.querySelector(
        "#massSongTitle"
    );


const songList =
    overlay.querySelector(
        "#massSongList"
    );


const closeButton =
    overlay.querySelector(
        ".mass-song-close"
    );






/* ======================================================
   STATE
====================================================== */


let massSongOpen =
    false;







/* ======================================================
   SPECIFIC SECTION FILTERS
====================================================== */


const sectionKeywords = {


    "Kyrie": [

        "Signore Pietà",

        "Kyrie",

        "Lord Have Mercy"

    ],



    "Gloria": [

        "Gloria"

    ],



    "Alleluia": [

        "Alleluia",

        "Lode a te o Cristo"

    ],



    "Santo": [

        "Santo"

    ],



    "Agnello di Dio": [

        "Agnello di Dio",

        "Agnus Dei"

    ]


};








/* ======================================================
   OPEN SONG PANEL
====================================================== */


function openSongPanel(
    category,
    section
) {


if (massSongOpen) {
    return;
}



/* ----------------------------------------------
   Open song selector state
   Temporary UI only.
   PDF navigation is handled by overlay.js.
---------------------------------------------- */

history.pushState(
{
    massSongPanel: true
},
"",
window.location.href
);





massSongOpen = true;





const categories =
    category

    .split(",")

    .map(
        item =>
        item.trim()
    )

    .filter(
        item =>
        item !== ""
    );





let matchingSongs = [];






/* ==================================================
   FIND SONGS
================================================== */


categories.forEach(
currentCategory => {


    const categorySongs =
        songs.filter(
            song =>
            song.category === currentCategory
        );


    matchingSongs.push(
        ...categorySongs
    );


});







/* ==================================================
   REMOVE DUPLICATES
================================================== */


matchingSongs =

matchingSongs.filter(

(song,index,array) =>


index ===

array.findIndex(

otherSong =>

otherSong.title === song.title &&

otherSong.page === song.page

)


);







/* ==================================================
   FILTER SECTION
================================================== */


if (

section &&

sectionKeywords[section]

) {


const keywords =
    sectionKeywords[section];



matchingSongs =

matchingSongs.filter(

song => {


const songTitle =
    song.title.toLowerCase();



return keywords.some(

keyword =>

songTitle.includes(

keyword.toLowerCase()

)

);



}

);



}







/* ==================================================
   TITLE
================================================== */


if (section) {


title.textContent =
    `Canti dell'${section}`;


}

else {


title.textContent =
    "Canti";


}







/* ==================================================
   CLEAR LIST
================================================== */


songList.innerHTML =
"";





/* ==================================================
   EMPTY
================================================== */


if (!matchingSongs.length) {

    songList.innerHTML = `
    <p class="mass-song-empty">
    Nessun canto trovato.
    </p>
    `;

}







/* ==================================================
   CREATE SONG ITEMS
================================================== */


matchingSongs.forEach(
song => {


const item =
    document.createElement(
        "button"
    );


item.className =
    "mass-song-item";



item.innerHTML = `

<span class="mass-song-name">

${song.title}

</span>


<span class="mass-song-page">

${song.page}

</span>

`;





/* ==================================================
   OPEN SELECTED SONG
================================================== */


item.addEventListener(

"click",

() => {



/*
    Save Mass Guide position
*/

sessionStorage.setItem(

    "massGuideScrollPosition",

    window.scrollY

);





/*
    Remove the Mass Songbook history layer.
    PDF overlay will create its own history layer.
*/


overlay.classList.remove(

    "show"

);


document.body.classList.remove(

    "mass-song-open"

);


history.back();







/*
    Open PDF overlay

    overlay.js will create
    its own history state.
*/


setTimeout(() => {


    openPageOverlay(
    `songbook-viewer.html?page=${song.page}`
);


}, 50);


}

);






songList.appendChild(

    item

);



});







/* ==================================================
   SHOW SONG PANEL
================================================== */


overlay.classList.add(

    "show"

);


document.body.classList.add(

    "mass-song-open"

);



}









/* ======================================================
   CLOSE SONG PANEL
====================================================== */


function closeSongPanel() {


overlay.classList.remove(

    "show"

);



document.body.classList.remove(

    "mass-song-open"

);



massSongOpen = false;



}









/* ======================================================
   BROWSER BACK / ANDROID GESTURE BACK
====================================================== */


window.addEventListener(

"popstate",

() => {



if (
    massSongOpen
) {

    closeSongPanel();

    return;

}



}

);









/* ======================================================
   CLOSE BUTTON
====================================================== */


closeButton.addEventListener(
"click",
() => {

if (massSongOpen) {

    history.back();

}

}
);








/* ======================================================
   TAP OUTSIDE PANEL
====================================================== */


overlay.addEventListener(

"click",

event => {



if (
event.target === overlay
) {

    history.back();

}



}

);









/* ======================================================
   ESC KEY
====================================================== */


document.addEventListener(

"keydown",

event => {



if (
event.key === "Escape"
&&
massSongOpen
) {

    history.back();

}



}

);









/* ======================================================
   SONG BUTTONS
====================================================== */


songButtons.forEach(

button => {



button.addEventListener(

"click",

event => {



event.preventDefault();





const category =

button.dataset.songCategory;





const section =

button.dataset.songSection || "";





if (!category) return;





openSongPanel(

category,

section

);



}

);



});



});


