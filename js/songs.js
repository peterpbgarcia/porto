
/*
==========================================================
SONG CATALOGUE DATA
Compendio di Preghiere
==========================================================

Each song contains:
- title: title displayed in the catalogue
- file: path to the original .htm file

IMPORTANT:
Keep the filenames and folder paths exactly as they exist.
Do not rename or modify the original song files.
*/

const songCategories = [
    {
        id: "ingresso",
        name: "Ingresso",
        songs: []
    },
    {
        id: "kyrie",
        name: "Kyrie",
        songs: [
            {
                title: "I. Signore Pietà (F. Buttazzo)",
                file: "songbook/ordinario/I. Signore Pietà (F. Buttazzo).htm"
            },
            {
                title: "II. Signore Pietà (GEN)",
                file: "songbook/ordinario/II. Signore Pietà (GEN).htm"
            },
            {
                title: "III. Kyrie Eleison",
                file: "songbook/ordinario/III. Kyrie Eleison.htm"
            },
            {
                title: "IV. LORD HAVE MERCY (ACTS AND POTENCIES)",
                file: "songbook/ordinario/IV. LORD HAVE MERCY (ACTS AND POTENCIES).htm"
            }
        ]
    },
    {
        id: "gloria",
        name: "Gloria",
        songs: [
            {
                title: "V. GLORIA",
                file: "songbook/ordinario/V. GLORIA.htm"
            },
            {
                title: "VI. GLORIA (GIOMBINI)",
                file: "songbook/ordinario/VI. GLORIA (GIOMBINI).htm"
            },
            {
                title: "VII. GLORIA (RITIRO CANTORI 2012) (CAPO II)",
                file: "songbook/ordinario/VII. GLORIA (RITIRO CANTORI 2012) (CAPO II).htm"
            },
            {
                title: "VIII. Gloria (Buttazzo)",
                file: "songbook/ordinario/VIII. Gloria (Buttazzo).htm"
            },
            {
                title: "IX. GLORIA A DIO (G. SERAPIGLIA)",
                file: "songbook/ordinario/IX. GLORIA A DIO (G. SERAPIGLIA).htm"
            }
        ]
    },
    {
        id: "alleluia",
        name: "Alleluia",
        songs: [
            {
                title: "X. Alleluia",
                file: "songbook/ordinario/X. Alleluia.htm"
            },
            {
                title: "XI. Alleluia (WYD’95)",
                file: "songbook/ordinario/XI. Alleluia (WYD’95).htm"
            },
            {
                title: "XII. Alleluia, Da chi andremo",
                file: "songbook/ordinario/XII. Alleluia, Da chi andremo.htm"
            },
            {
                title: "XIII. Alleluia, Passerano i cieli (NCDP)",
                file: "songbook/ordinario/XIII. Alleluia, Passerano i cieli (NCDP).htm"
            },
            {
                title: "XIV. Alleluia, Cantate al Signore",
                file: "songbook/ordinario/XIV. Alleluia, Cantate al Signore.htm"
            },
            {
                title: "XV. ALLELUIA, LA NOSTRA FESTA",
                file: "songbook/ordinario/XV. ALLELUIA, LA NOSTRA FESTA.htm"
            },
            {
                title: "XVI. ALLELUIA (J. NEZ MARCELO)",
                file: "songbook/ordinario/XVI. ALLELUIA (J. NEZ MARCELO).htm"
            },
            {
                title: "XVIII. Canta Alleluia",
                file: "songbook/ordinario/XVIII. Canta Alleluia.htm"
            }
        ]
    },
    {
        id: "offertorio",
        name: "Offertorio",
        songs: []
    },
    {
        id: "santo",
        name: "Santo",
        songs: [
            {
                title: "XVIII. Santo (Frisina)",
                file: "songbook/ordinario/XVIII. Santo (Frisina).htm"
            },
            {
                title: "XXI. Santo",
                file: "songbook/ordinario/XXI. Santo.htm"
            },
            {
                title: "XXII. Santo (GEN)",
                file: "songbook/ordinario/XXII. Santo (GEN).htm"
            },
            {
                title: "XXIII. SANTO",
                file: "songbook/ordinario/XXIII. SANTO.htm"
            },
            {
                title: "XXIV. SANTO (COME FUOCO VIVO)",
                file: "songbook/ordinario/XXIV. SANTO (COME FUOCO VIVO).htm"
            },
            {
                title: "XXV. SANTO (G. SERAPIGLIA)",
                file: "songbook/ordinario/XXV. SANTO (G. SERAPIGLIA).htm"
            },
            {
                title: "XXVI. SANTO (GEN VERDE)",
                file: "songbook/ordinario/XXVI. SANTO (GEN VERDE).htm"
            },
            {
                title: "XXVII. SANTO (LADISPOLI)",
                file: "songbook/ordinario/XXVII. SANTO (LADISPOLI).htm"
            },
            {
                title: "XXIX. SANTO (F. BUTAZZO)",
                file: "songbook/ordinario/XXIX. SANTO (F. BUTAZZO).htm"
            }
        ]
    },
    {
        id: "agnus-dei",
        name: "Agnus Dei",
        songs: [
            {
                title: "XXXI. AGNUS DEI",
                file: "songbook/ordinario/XXXI. AGNUS DEI.htm"
            },
            {
                title: "XXXII. AGNELLO DI DIO",
                file: "songbook/ordinario/XXXII. AGNELLO DI DIO.htm"
            },
            {
                title: "XXXIII. AGNELLO DI DIO (FRISINA)",
                file: "songbook/ordinario/XXXIII. AGNELLO DI DIO (FRISINA).htm"
            },
            {
                title: "XXXIV. Agnello di Dio",
                file: "songbook/ordinario/XXXIV. Agnello di Dio .htm"
            },
            {
                title: "XXXV. AGNELLO DI DIO (RNS)",
                file: "songbook/ordinario/XXXV. AGNELLO DI DIO (RNS).htm"
            }
        ]
    },
    {
        id: "comunione",
        name: "Comunione",
        songs: []
    },
    {
        id: "finale",
        name: "Finale",
        songs: []
    },
    {
        id: "adorazione",
        name: "Adorazione",
        songs: []
    },
    {
        id: "spirito-santo",
        name: "Spirito Santo",
        songs: []
    },
    {
        id: "canto-mariano",
        name: "Canto Mariano",
        songs: []
    },
    {
        id: "avvento",
        name: "Avvento",
        songs: []
    },
    {
        id: "natale",
        name: "Natale",
        songs: [
            {
                title: "XVII. ALLELUIA, OGGI È NATO IL SALVATORE (NATALE)",
                file: "songbook/ordinario/XVII. ALLELUIA, OGGI È NATO IL SALVATORE (NATALE).htm"
            }
        ]
    },
    {
        id: "quaresima",
        name: "Quaresima",
        songs: [
            {
                title: "XIX. LODE A TE O CRISTO (QUARESIMA)",
                file: "songbook/ordinario/XIX. LODE A TE O CRISTO (QUARESIMA).htm"
            },
            {
                title: "XX. Lode a Te o Cristo (Quaresima)",
                file: "songbook/ordinario/XX. Lode a Te o Cristo (Quaresima).htm"
            }
        ]
    },
    {
        id: "pasqua",
        name: "Pasqua",
        songs: []
    },
    {
        id: "altre-lingue",
        name: "Altre Lingue",
        songs: []
    },
    {
        id: "altri",
        name: "Altri",
        songs: [
            {
                title: "XXX. Acclamazione",
                file: "songbook/ordinario/XXX. Acclamazione.htm"
            }
        ],
        songbooks: [
            {
                name: "Bayan Umawit Songbook",
                file: "pdf/bayanumawit.pdf"
            },
            {
                name: "Italian Music Sheets",
                file: "pdf/musichub2026.pdf"
            }
        ]
    }
];
