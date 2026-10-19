/* ==========================================
   COMPENDIO DI PREGHIERE
   SERVICE WORKER
========================================== */

const CACHE_NAME = "compendio-v9.0.7";

const UPDATE_CACHE_NAME =
    CACHE_NAME + "-update";


/* ==========================================
   FILES TO CACHE
========================================== */

const APP_FILES = [
    "adoration.html",
    "angelus.html",
    "assets/icon.png",
    "basic-prayers.html",
    "css/guitar-tuner.css",
    "css/overlay.css",
    "css/songbook.css",
    "css/songbook-viewer.css",
    "css/style.css",
    "devotions.html",
    "evening-prayer.html",
    "favicon.ico",
    "guitar-tuner.html",
    "icons/icon-128.webp",
    "icons/icon-192.webp",
    "icons/icon-256.webp",
    "icons/icon-48.webp",
    "icons/icon-512.webp",
    "icons/icon-72.webp",
    "icons/icon-96.webp",
    "icons/logo.png",
    "images/logo.png",
    "index.html",
    "js/app.js",
    "js/guitar-tuner.js",
    "js/mass-songbook.js",
    "js/overlay.js",
    "js/pdf-songbook-viewer.js",
    "js/songbook.js",
    "js/songbook-viewer.js",
    "js/songs-generated.js",
    "manifest.webmanifest",
    "mass-guide.html",
    "morning-prayer.html",
    "night-prayer.html",
    "pdfjs/build/pdf.js",
    "pdfjs/build/pdf.sandbox.js",
    "pdfjs/build/pdf.worker.js",
    "pdfjs/LICENSE",
    "pdfjs/web/cmaps/78-EUC-H.bcmap",
    "pdfjs/web/cmaps/78-EUC-V.bcmap",
    "pdfjs/web/cmaps/78-H.bcmap",
    "pdfjs/web/cmaps/78ms-RKSJ-H.bcmap",
    "pdfjs/web/cmaps/78ms-RKSJ-V.bcmap",
    "pdfjs/web/cmaps/78-RKSJ-H.bcmap",
    "pdfjs/web/cmaps/78-RKSJ-V.bcmap",
    "pdfjs/web/cmaps/78-V.bcmap",
    "pdfjs/web/cmaps/83pv-RKSJ-H.bcmap",
    "pdfjs/web/cmaps/90msp-RKSJ-H.bcmap",
    "pdfjs/web/cmaps/90msp-RKSJ-V.bcmap",
    "pdfjs/web/cmaps/90ms-RKSJ-H.bcmap",
    "pdfjs/web/cmaps/90ms-RKSJ-V.bcmap",
    "pdfjs/web/cmaps/90pv-RKSJ-H.bcmap",
    "pdfjs/web/cmaps/90pv-RKSJ-V.bcmap",
    "pdfjs/web/cmaps/Add-H.bcmap",
    "pdfjs/web/cmaps/Add-RKSJ-H.bcmap",
    "pdfjs/web/cmaps/Add-RKSJ-V.bcmap",
    "pdfjs/web/cmaps/Add-V.bcmap",
    "pdfjs/web/cmaps/Adobe-CNS1-0.bcmap",
    "pdfjs/web/cmaps/Adobe-CNS1-1.bcmap",
    "pdfjs/web/cmaps/Adobe-CNS1-2.bcmap",
    "pdfjs/web/cmaps/Adobe-CNS1-3.bcmap",
    "pdfjs/web/cmaps/Adobe-CNS1-4.bcmap",
    "pdfjs/web/cmaps/Adobe-CNS1-5.bcmap",
    "pdfjs/web/cmaps/Adobe-CNS1-6.bcmap",
    "pdfjs/web/cmaps/Adobe-CNS1-UCS2.bcmap",
    "pdfjs/web/cmaps/Adobe-GB1-0.bcmap",
    "pdfjs/web/cmaps/Adobe-GB1-1.bcmap",
    "pdfjs/web/cmaps/Adobe-GB1-2.bcmap",
    "pdfjs/web/cmaps/Adobe-GB1-3.bcmap",
    "pdfjs/web/cmaps/Adobe-GB1-4.bcmap",
    "pdfjs/web/cmaps/Adobe-GB1-5.bcmap",
    "pdfjs/web/cmaps/Adobe-GB1-UCS2.bcmap",
    "pdfjs/web/cmaps/Adobe-Japan1-0.bcmap",
    "pdfjs/web/cmaps/Adobe-Japan1-1.bcmap",
    "pdfjs/web/cmaps/Adobe-Japan1-2.bcmap",
    "pdfjs/web/cmaps/Adobe-Japan1-3.bcmap",
    "pdfjs/web/cmaps/Adobe-Japan1-4.bcmap",
    "pdfjs/web/cmaps/Adobe-Japan1-5.bcmap",
    "pdfjs/web/cmaps/Adobe-Japan1-6.bcmap",
    "pdfjs/web/cmaps/Adobe-Japan1-UCS2.bcmap",
    "pdfjs/web/cmaps/Adobe-Korea1-0.bcmap",
    "pdfjs/web/cmaps/Adobe-Korea1-1.bcmap",
    "pdfjs/web/cmaps/Adobe-Korea1-2.bcmap",
    "pdfjs/web/cmaps/Adobe-Korea1-UCS2.bcmap",
    "pdfjs/web/cmaps/B5-H.bcmap",
    "pdfjs/web/cmaps/B5pc-H.bcmap",
    "pdfjs/web/cmaps/B5pc-V.bcmap",
    "pdfjs/web/cmaps/B5-V.bcmap",
    "pdfjs/web/cmaps/CNS1-H.bcmap",
    "pdfjs/web/cmaps/CNS1-V.bcmap",
    "pdfjs/web/cmaps/CNS2-H.bcmap",
    "pdfjs/web/cmaps/CNS2-V.bcmap",
    "pdfjs/web/cmaps/CNS-EUC-H.bcmap",
    "pdfjs/web/cmaps/CNS-EUC-V.bcmap",
    "pdfjs/web/cmaps/ETen-B5-H.bcmap",
    "pdfjs/web/cmaps/ETen-B5-V.bcmap",
    "pdfjs/web/cmaps/ETenms-B5-H.bcmap",
    "pdfjs/web/cmaps/ETenms-B5-V.bcmap",
    "pdfjs/web/cmaps/ETHK-B5-H.bcmap",
    "pdfjs/web/cmaps/ETHK-B5-V.bcmap",
    "pdfjs/web/cmaps/EUC-H.bcmap",
    "pdfjs/web/cmaps/EUC-V.bcmap",
    "pdfjs/web/cmaps/Ext-H.bcmap",
    "pdfjs/web/cmaps/Ext-RKSJ-H.bcmap",
    "pdfjs/web/cmaps/Ext-RKSJ-V.bcmap",
    "pdfjs/web/cmaps/Ext-V.bcmap",
    "pdfjs/web/cmaps/GB-EUC-H.bcmap",
    "pdfjs/web/cmaps/GB-EUC-V.bcmap",
    "pdfjs/web/cmaps/GB-H.bcmap",
    "pdfjs/web/cmaps/GBK2K-H.bcmap",
    "pdfjs/web/cmaps/GBK2K-V.bcmap",
    "pdfjs/web/cmaps/GBK-EUC-H.bcmap",
    "pdfjs/web/cmaps/GBK-EUC-V.bcmap",
    "pdfjs/web/cmaps/GBKp-EUC-H.bcmap",
    "pdfjs/web/cmaps/GBKp-EUC-V.bcmap",
    "pdfjs/web/cmaps/GBpc-EUC-H.bcmap",
    "pdfjs/web/cmaps/GBpc-EUC-V.bcmap",
    "pdfjs/web/cmaps/GBT-EUC-H.bcmap",
    "pdfjs/web/cmaps/GBT-EUC-V.bcmap",
    "pdfjs/web/cmaps/GBT-H.bcmap",
    "pdfjs/web/cmaps/GBTpc-EUC-H.bcmap",
    "pdfjs/web/cmaps/GBTpc-EUC-V.bcmap",
    "pdfjs/web/cmaps/GBT-V.bcmap",
    "pdfjs/web/cmaps/GB-V.bcmap",
    "pdfjs/web/cmaps/H.bcmap",
    "pdfjs/web/cmaps/Hankaku.bcmap",
    "pdfjs/web/cmaps/Hiragana.bcmap",
    "pdfjs/web/cmaps/HKdla-B5-H.bcmap",
    "pdfjs/web/cmaps/HKdla-B5-V.bcmap",
    "pdfjs/web/cmaps/HKdlb-B5-H.bcmap",
    "pdfjs/web/cmaps/HKdlb-B5-V.bcmap",
    "pdfjs/web/cmaps/HKgccs-B5-H.bcmap",
    "pdfjs/web/cmaps/HKgccs-B5-V.bcmap",
    "pdfjs/web/cmaps/HKm314-B5-H.bcmap",
    "pdfjs/web/cmaps/HKm314-B5-V.bcmap",
    "pdfjs/web/cmaps/HKm471-B5-H.bcmap",
    "pdfjs/web/cmaps/HKm471-B5-V.bcmap",
    "pdfjs/web/cmaps/HKscs-B5-H.bcmap",
    "pdfjs/web/cmaps/HKscs-B5-V.bcmap",
    "pdfjs/web/cmaps/Katakana.bcmap",
    "pdfjs/web/cmaps/KSC-EUC-H.bcmap",
    "pdfjs/web/cmaps/KSC-EUC-V.bcmap",
    "pdfjs/web/cmaps/KSC-H.bcmap",
    "pdfjs/web/cmaps/KSC-Johab-H.bcmap",
    "pdfjs/web/cmaps/KSC-Johab-V.bcmap",
    "pdfjs/web/cmaps/KSCms-UHC-H.bcmap",
    "pdfjs/web/cmaps/KSCms-UHC-HW-H.bcmap",
    "pdfjs/web/cmaps/KSCms-UHC-HW-V.bcmap",
    "pdfjs/web/cmaps/KSCms-UHC-V.bcmap",
    "pdfjs/web/cmaps/KSCpc-EUC-H.bcmap",
    "pdfjs/web/cmaps/KSCpc-EUC-V.bcmap",
    "pdfjs/web/cmaps/KSC-V.bcmap",
    "pdfjs/web/cmaps/LICENSE",
    "pdfjs/web/cmaps/NWP-H.bcmap",
    "pdfjs/web/cmaps/NWP-V.bcmap",
    "pdfjs/web/cmaps/RKSJ-H.bcmap",
    "pdfjs/web/cmaps/RKSJ-V.bcmap",
    "pdfjs/web/cmaps/Roman.bcmap",
    "pdfjs/web/cmaps/UniCNS-UCS2-H.bcmap",
    "pdfjs/web/cmaps/UniCNS-UCS2-V.bcmap",
    "pdfjs/web/cmaps/UniCNS-UTF16-H.bcmap",
    "pdfjs/web/cmaps/UniCNS-UTF16-V.bcmap",
    "pdfjs/web/cmaps/UniCNS-UTF32-H.bcmap",
    "pdfjs/web/cmaps/UniCNS-UTF32-V.bcmap",
    "pdfjs/web/cmaps/UniCNS-UTF8-H.bcmap",
    "pdfjs/web/cmaps/UniCNS-UTF8-V.bcmap",
    "pdfjs/web/cmaps/UniGB-UCS2-H.bcmap",
    "pdfjs/web/cmaps/UniGB-UCS2-V.bcmap",
    "pdfjs/web/cmaps/UniGB-UTF16-H.bcmap",
    "pdfjs/web/cmaps/UniGB-UTF16-V.bcmap",
    "pdfjs/web/cmaps/UniGB-UTF32-H.bcmap",
    "pdfjs/web/cmaps/UniGB-UTF32-V.bcmap",
    "pdfjs/web/cmaps/UniGB-UTF8-H.bcmap",
    "pdfjs/web/cmaps/UniGB-UTF8-V.bcmap",
    "pdfjs/web/cmaps/UniJIS2004-UTF16-H.bcmap",
    "pdfjs/web/cmaps/UniJIS2004-UTF16-V.bcmap",
    "pdfjs/web/cmaps/UniJIS2004-UTF32-H.bcmap",
    "pdfjs/web/cmaps/UniJIS2004-UTF32-V.bcmap",
    "pdfjs/web/cmaps/UniJIS2004-UTF8-H.bcmap",
    "pdfjs/web/cmaps/UniJIS2004-UTF8-V.bcmap",
    "pdfjs/web/cmaps/UniJISPro-UCS2-HW-V.bcmap",
    "pdfjs/web/cmaps/UniJISPro-UCS2-V.bcmap",
    "pdfjs/web/cmaps/UniJISPro-UTF8-V.bcmap",
    "pdfjs/web/cmaps/UniJIS-UCS2-H.bcmap",
    "pdfjs/web/cmaps/UniJIS-UCS2-HW-H.bcmap",
    "pdfjs/web/cmaps/UniJIS-UCS2-HW-V.bcmap",
    "pdfjs/web/cmaps/UniJIS-UCS2-V.bcmap",
    "pdfjs/web/cmaps/UniJIS-UTF16-H.bcmap",
    "pdfjs/web/cmaps/UniJIS-UTF16-V.bcmap",
    "pdfjs/web/cmaps/UniJIS-UTF32-H.bcmap",
    "pdfjs/web/cmaps/UniJIS-UTF32-V.bcmap",
    "pdfjs/web/cmaps/UniJIS-UTF8-H.bcmap",
    "pdfjs/web/cmaps/UniJIS-UTF8-V.bcmap",
    "pdfjs/web/cmaps/UniJISX02132004-UTF32-H.bcmap",
    "pdfjs/web/cmaps/UniJISX02132004-UTF32-V.bcmap",
    "pdfjs/web/cmaps/UniJISX0213-UTF32-H.bcmap",
    "pdfjs/web/cmaps/UniJISX0213-UTF32-V.bcmap",
    "pdfjs/web/cmaps/UniKS-UCS2-H.bcmap",
    "pdfjs/web/cmaps/UniKS-UCS2-V.bcmap",
    "pdfjs/web/cmaps/UniKS-UTF16-H.bcmap",
    "pdfjs/web/cmaps/UniKS-UTF16-V.bcmap",
    "pdfjs/web/cmaps/UniKS-UTF32-H.bcmap",
    "pdfjs/web/cmaps/UniKS-UTF32-V.bcmap",
    "pdfjs/web/cmaps/UniKS-UTF8-H.bcmap",
    "pdfjs/web/cmaps/UniKS-UTF8-V.bcmap",
    "pdfjs/web/cmaps/V.bcmap",
    "pdfjs/web/cmaps/WP-Symbol.bcmap",
    "pdfjs/web/standard_fonts/FoxitDingbats.pfb",
    "pdfjs/web/standard_fonts/FoxitFixed.pfb",
    "pdfjs/web/standard_fonts/FoxitFixedBold.pfb",
    "pdfjs/web/standard_fonts/FoxitFixedBoldItalic.pfb",
    "pdfjs/web/standard_fonts/FoxitFixedItalic.pfb",
    "pdfjs/web/standard_fonts/FoxitSerif.pfb",
    "pdfjs/web/standard_fonts/FoxitSerifBold.pfb",
    "pdfjs/web/standard_fonts/FoxitSerifBoldItalic.pfb",
    "pdfjs/web/standard_fonts/FoxitSerifItalic.pfb",
    "pdfjs/web/standard_fonts/FoxitSymbol.pfb",
    "pdfjs/web/standard_fonts/LiberationSans-Bold.ttf",
    "pdfjs/web/standard_fonts/LiberationSans-BoldItalic.ttf",
    "pdfjs/web/standard_fonts/LiberationSans-Italic.ttf",
    "pdfjs/web/standard_fonts/LiberationSans-Regular.ttf",
    "pdfjs/web/standard_fonts/LICENSE_FOXIT",
    "pdfjs/web/standard_fonts/LICENSE_LIBERATION",
    "pdfjs/web/viewer.css",
    "pdfjs/web/viewer.html",
    "pdfjs/web/viewer.js",
    "pdf-songbook-viewer.html",
    "rosary.html",
    "sesta-nona.html",
    "songbook.html",
    "songbook/01 Ingresso/1. Acclamate al Signore.htm",
    "songbook/01 Ingresso/10. Noi veniamo a Te.htm",
    "songbook/01 Ingresso/11. Ora siamo arrivati (G. Serapiglia).htm",
    "songbook/01 Ingresso/12. Santa Chiesa di Dio  (Capo II).htm",
    "songbook/01 Ingresso/13. Veniamo da Te o Signore.htm",
    "songbook/01 Ingresso/2. ALZATI E RISPLENDI (DDML-EDC).htm",
    "songbook/01 Ingresso/3. Ascolta Signore.htm",
    "songbook/01 Ingresso/4. Canto dei tre giovani.htm",
    "songbook/01 Ingresso/5. Il tuo popolo in cammino (Capo II).htm",
    "songbook/01 Ingresso/6. Jesus Christ you are my life.htm",
    "songbook/01 Ingresso/7. Laudato Sii, Signore mio (Cantico della creazione).htm",
    "songbook/01 Ingresso/8. Lodate il Signore dai cieli.htm",
    "songbook/01 Ingresso/9. Mia forza e mio canto (P. Comi EDC).htm",
    "songbook/02 Kyrie/I. Signore Pietà (F. Buttazzo).htm",
    "songbook/02 Kyrie/II. Signore Pietà (GEN).htm",
    "songbook/02 Kyrie/III. Kyrie Eleison.htm",
    "songbook/02 Kyrie/IV. LORD HAVE MERCY (ACTS AND POTENCIES).htm",
    "songbook/03 Gloria/IX. GLORIA A DIO (G. SERAPIGLIA).htm",
    "songbook/03 Gloria/V. GLORIA.htm",
    "songbook/03 Gloria/VI. GLORIA (GIOMBINI).htm",
    "songbook/03 Gloria/VII. GLORIA (RITIRO CANTORI 2012) (CAPO II).htm",
    "songbook/03 Gloria/VIII. Gloria (Buttazzo).htm",
    "songbook/04 Alleluia/X. Alleluia.htm",
    "songbook/04 Alleluia/XI. Alleluia (WYD’95).htm",
    "songbook/04 Alleluia/XII. Alleluia, Da chi andremo.htm",
    "songbook/04 Alleluia/XIII. Alleluia, Passerano i cieli (NCDP).htm",
    "songbook/04 Alleluia/XIV. Alleluia, Cantate al Signore.htm",
    "songbook/04 Alleluia/XIX. LODE A TE O CRISTO (QUARESIMA).htm",
    "songbook/04 Alleluia/XV. ALLELUIA, LA NOSTRA FESTA.htm",
    "songbook/04 Alleluia/XVI. ALLELUIA (J. NEZ MARCELO).htm",
    "songbook/04 Alleluia/XVII. ALLELUIA, OGGI È NATO IL SALVATORE (NATALE).htm",
    "songbook/04 Alleluia/XVIII. Canta Alleluia.htm",
    "songbook/04 Alleluia/XX. Lode a Te o Cristo (Quaresima).htm",
    "songbook/05 Offertorio/14. Accogli i nostr doni.htm",
    "songbook/05 Offertorio/15. BENEDETTO TU SIGNORE.htm",
    "songbook/05 Offertorio/16. COSA OFFRIRTI.htm",
    "songbook/05 Offertorio/17. Davanti a Te.htm",
    "songbook/05 Offertorio/18. DONACCI TE STESSO.htm",
    "songbook/05 Offertorio/19. Ecco quel che abbiamo.htm",
    "songbook/05 Offertorio/20. FRUTTO DELLA NOSTRA TERRA.htm",
    "songbook/05 Offertorio/21. IL SACRIFICIO DELLA LODE.htm",
    "songbook/05 Offertorio/22. IO TI OFFRO.htm",
    "songbook/05 Offertorio/23. NOI CON TE.htm",
    "songbook/05 Offertorio/24. PANE DI VITA SEI.htm",
    "songbook/05 Offertorio/25. PANE E VINO DI OFFRIAMO.htm",
    "songbook/05 Offertorio/26. PER QUESTI DONI.htm",
    "songbook/05 Offertorio/27. SE M’ACCOGLI.htm",
    "songbook/05 Offertorio/28. Segni del Tuo amore (GEN VERDE, GEN ROSSO).htm",
    "songbook/05 Offertorio/29. Su quest’altare.htm",
    "songbook/06 Santo/XVIII. Santo (Frisina).htm",
    "songbook/06 Santo/XXI. Santo.htm",
    "songbook/06 Santo/XXII. Santo (GEN).htm",
    "songbook/06 Santo/XXIII. SANTO.htm",
    "songbook/06 Santo/XXIV. SANTO (COME FUOCO VIVO).htm",
    "songbook/06 Santo/XXIX. SANTO (F. BUTAZZO).htm",
    "songbook/06 Santo/XXV. SANTO (G. SERAPIGLIA).htm",
    "songbook/06 Santo/XXVI. SANTO (GEN VERDE).htm",
    "songbook/06 Santo/XXVII. SANTO (LADISPOLI).htm",
    "songbook/06 Santo/XXX. Acclamazione.htm",
    "songbook/07 Agnus Dei/XXXI. AGNUS DEI.htm",
    "songbook/07 Agnus Dei/XXXII. AGNELLO DI DIO.htm",
    "songbook/07 Agnus Dei/XXXIII. AGNELLO DI DIO (FRISINA).htm",
    "songbook/07 Agnus Dei/XXXIV. Agnello di Dio .htm",
    "songbook/07 Agnus Dei/XXXV. AGNELLO DI DIO (RNS).htm",
    "songbook/08 Comunione/30. ACCOGLIMI (EDC).htm",
    "songbook/08 Comunione/31. AL SIGNORE CANTERÒ.htm",
    "songbook/08 Comunione/32. CERCO LA TUA VOCE.htm",
    "songbook/08 Comunione/33. CHI CI SEPARERÀ (RNS).htm",
    "songbook/08 Comunione/34. COME FUOCO VIVO (GEN VERDE, GEN ROSSO).htm",
    "songbook/08 Comunione/35. CON AMORE INFINITO.htm",
    "songbook/08 Comunione/36. DACCI IL TUO PANE.htm",
    "songbook/08 Comunione/37. DALL’AURORA AL TRAMONTO.htm",
    "songbook/08 Comunione/38. DOV’È CARITÀ E AMORE.htm",
    "songbook/08 Comunione/39. DOVE DUE O TRE.htm",
    "songbook/08 Comunione/40. E SONO SOLO UN UOMO (EDC).htm",
    "songbook/08 Comunione/41. ECCOMI, SIGNORE.htm",
    "songbook/08 Comunione/42. FRATELLO SOLE, SORELLA LUNA.htm",
    "songbook/08 Comunione/43. L’UNICO MAESTRO..htm",
    "songbook/08 Comunione/44. LA VERA VITE.htm",
    "songbook/08 Comunione/45. MI BASTA IL TUO AMORE GESÙ.htm",
    "songbook/08 Comunione/46. NELLE TUE MANI.htm",
    "songbook/08 Comunione/47. OGNI MIA PAROLA.htm",
    "songbook/08 Comunione/48. ORA CHE SEI IN MEZZO A NOI (G. SERAPIGLIA).htm",
    "songbook/08 Comunione/49. PANE DEL CIELO.htm",
    "songbook/08 Comunione/50. PANE DI VITA NUOVA.htm",
    "songbook/08 Comunione/51. POPOLI TUTTI.htm",
    "songbook/08 Comunione/52. QUANDO GUARDO ALLA TUA SANTITÀ.htm",
    "songbook/08 Comunione/53. RESTA ANCORA MIO SIGNORE.htm",
    "songbook/08 Comunione/54. RESTA QUI CON NOI.htm",
    "songbook/08 Comunione/55. SEI PER NOI CIBO DI ETERNITÀ.htm",
    "songbook/08 Comunione/56. SOLO TU O SIGNORE.htm",
    "songbook/08 Comunione/57. TE AL CENTRO DEL MIO CUORE.htm",
    "songbook/08 Comunione/58. TU SEI.htm",
    "songbook/08 Comunione/59. U SEI LA MIA VITA (SYMBOLUM 77).htm",
    "songbook/08 Comunione/60. TU SEI LA PERLA PREZIOSA.htm",
    "songbook/08 Comunione/61. VERBUM PANIS.htm",
    "songbook/08 Comunione/62. VIENI E SEGUIMI.htm",
    "songbook/08 Comunione/63. VIVERE CON TE.htm",
    "songbook/08 Comunione/64. VOI SIETE DI DIO.htm",
    "songbook/09 Finale/65. ALLEANZA DI PACE.htm",
    "songbook/09 Finale/66. ALLEANZA DI PACE.htm",
    "songbook/09 Finale/67. ALLEANZA DI PACE.htm",
    "songbook/09 Finale/68. ANDATE PER LE STRADE (EDC).htm",
    "songbook/09 Finale/69. CANZONE DELL’AMICIZIA (G. FONTANA).htm",
    "songbook/09 Finale/70. E’ BELLO LODARTI.htm",
    "songbook/09 Finale/71. EMMANUEL.htm",
    "songbook/09 Finale/72. GETTA LE TUE RETI.htm",
    "songbook/09 Finale/73. IN ETERNO CANTERÒ.htm",
    "songbook/09 Finale/74. LA TUA DIMORA.htm",
    "songbook/09 Finale/75. LE TUE MERAVIGLIE.htm",
    "songbook/09 Finale/76. LODE AL NOME TUO.htm",
    "songbook/09 Finale/77. MI DICHIARO PER CRISTO.htm",
    "songbook/09 Finale/78. PACE SIA, PACE A VOI (GEN VERDE-ROSSO).htm",
    "songbook/09 Finale/79. RE DEI RE.htm",
    "songbook/09 Finale/80. SERVO PER AMORE.htm",
    "songbook/09 Finale/81. SPLENDI GESÙ.htm",
    "songbook/09 Finale/82. VI AMO COSÌ.htm",
    "songbook/10 Adorazione/83. ANIMA CHRISTI.htm",
    "songbook/10 Adorazione/84. CANONE DI TAIZÈ.htm",
    "songbook/10 Adorazione/85. DIO GRANDEI DIO.htm",
    "songbook/10 Adorazione/86. DIO HA TANTO AMATO IL MONDO.htm",
    "songbook/10 Adorazione/87. DONAMI IL TUO AMORE.htm",
    "songbook/10 Adorazione/88. GRANDE È IL SIGNORE (DDML).htm",
    "songbook/10 Adorazione/89. MAESTÀ (DDML).htm",
    "songbook/10 Adorazione/90. MI BASTA LA TUA GRAZIA.htm",
    "songbook/10 Adorazione/91. SONO QUI A LODARTI (HILLSONG).htm",
    "songbook/10 Adorazione/92. STAI CON ME.htm",
    "songbook/10 Adorazione/93. TU SEI SANTO, TU SEI RE (CAPO II).htm",
    "songbook/10 Adorazione/94. TUTTO CIÒ CHE SONO.htm",
    "songbook/11 Spirito Santo/100. VIENI, VIENI SPIRITO D’AMORE.htm",
    "songbook/11 Spirito Santo/95. DEL TUO SPIRITO SIGNORE .htm",
    "songbook/11 Spirito Santo/96. ECCO L’ACQUA.htm",
    "songbook/11 Spirito Santo/97. INVOCHIAMO LA TUA PRESENZA.htm",
    "songbook/11 Spirito Santo/98. VIENI SANTO SPIRITO (NEL MIO CUORE).htm",
    "songbook/11 Spirito Santo/99. VIENI SANTO SPIRITO DI DIO.htm",
    "songbook/12 Mariano/101. AVE MARIA (VERBUM PANIS).htm",
    "songbook/12 Mariano/102. CANTO A TE MARIA.htm",
    "songbook/12 Mariano/103. GIOISCI FIGLIA DI SION.htm",
    "songbook/12 Mariano/104. GIOISCI FIGLIA DI SION.htm",
    "songbook/12 Mariano/105. GRANDI COSE.htm",
    "songbook/12 Mariano/106. LA MIA ANIMA CANTA.htm",
    "songbook/12 Mariano/107. MADRE, IO VORREI.htm",
    "songbook/12 Mariano/108. MAGNIFICAT.htm",
    "songbook/12 Mariano/109. MARIA TU SEI.htm",
    "songbook/12 Mariano/110. MARIA VOGLIAMO AMARTI.htm",
    "songbook/12 Mariano/111. MERAVIGLIE IN TE.htm",
    "songbook/12 Mariano/112. O DONNA GLORIOSA.htm",
    "songbook/12 Mariano/113. SALVE REGINA.htm",
    "songbook/12 Mariano/114. SANTA MARIA DEL CAMMINO.htm",
    "songbook/12 Mariano/115. VIENI MARIA.htm",
    "songbook/13 Avvento/116. ALZATI E RISPLENDI (F. PALMA) .htm",
    "songbook/13 Avvento/119. CON L’OFFERTA DI GESÙ.htm",
    "songbook/13 Avvento/120. DAL TRONCO DI IESSE.htm",
    "songbook/13 Avvento/121. EMMAUEL TU SEI (F. BUTTAZZO).htm",
    "songbook/13 Avvento/122. INNALZIAMO LO SGUARDO.htm",
    "songbook/13 Avvento/123. LUCE CHE SORGI NELLA LOTTE.htm",
    "songbook/13 Avvento/124. O CIELO PIOVETE DALL’ALTO.htm",
    "songbook/13 Avvento/125. PREPARIAMO LA VIA AL SIGNORE.htm",
    "songbook/13 Avvento/126. RALLEGRIAMOCI (P. AURICCHIO).htm",
    "songbook/13 Avvento/127. SI RIACCENDA LA SPERANZA (F. PALMA).htm",
    "songbook/13 Avvento/128. SOFFIA (N. ESCAMIS).htm",
    "songbook/13 Avvento/129. TI OFFRIAMO IL PANE (F. PALMA).htm",
    "songbook/13 Avvento/131. VENITE FEDELI.htm",
    "songbook/13 Avvento/132. VIENI GESÙ, MARANATHÀ.htm",
    "songbook/14 Natale/116. ALZATI E RISPLENDI (F. PALMA) .htm",
    "songbook/14 Natale/117. ASTRO DEL CIEL (3 LINGUE).htm",
    "songbook/14 Natale/118. CANTEREMO GLORIA A TE.htm",
    "songbook/14 Natale/119. CON L’OFFERTA DI GESÙ.htm",
    "songbook/14 Natale/120. DAL TRONCO DI IESSE.htm",
    "songbook/14 Natale/121. EMMAUEL TU SEI (F. BUTTAZZO).htm",
    "songbook/14 Natale/122. INNALZIAMO LO SGUARDO.htm",
    "songbook/14 Natale/123. LUCE CHE SORGI NELLA LOTTE.htm",
    "songbook/14 Natale/124. O CIELO PIOVETE DALL’ALTO.htm",
    "songbook/14 Natale/125. PREPARIAMO LA VIA AL SIGNORE.htm",
    "songbook/14 Natale/126. RALLEGRIAMOCI (P. AURICCHIO).htm",
    "songbook/14 Natale/127. SI RIACCENDA LA SPERANZA (F. PALMA).htm",
    "songbook/14 Natale/128. SOFFIA (N. ESCAMIS).htm",
    "songbook/14 Natale/129. TI OFFRIAMO IL PANE (F. PALMA).htm",
    "songbook/14 Natale/130. TU SCENDI DALLE STELLE.htm",
    "songbook/14 Natale/131. VENITE FEDELI.htm",
    "songbook/14 Natale/132. VIENI GESÙ, MARANATHÀ.htm",
    "songbook/14 Natale/Angels We Have Heard On High-F-Major.pdf",
    "songbook/14 Natale/For the Fruits of this Creation.pdf",
    "songbook/14 Natale/Let All things - O come Divine.pdf",
    "songbook/14 Natale/O Come Emmanuel.pdf",
    "songbook/14 Natale/Silent Night Bb Major.pdf",
    "songbook/14 Natale/The First Noel.pdf",
    "songbook/15 Quaresma/133. E’ TEMPO DI GRAZIA.htm",
    "songbook/15 Quaresma/134. MIO DIO MI ABBANDONO A TE (DDML).htm",
    "songbook/15 Quaresma/135. NELLE TUE MANI.htm",
    "songbook/15 Quaresma/136. VIENI POPOLO MIO.htm",
    "songbook/15 Quaresma/137. SCUSA SIGNORE (EP-GIF).htm",
    "songbook/16 Pasqua/138. ALLELUIA, È RISORTO IL SIGNOR .htm",
    "songbook/16 Pasqua/139. CRISTO È RISORTO VERAMENTE.htm",
    "songbook/16 Pasqua/140. CRUCEM TUAM.htm",
    "songbook/16 Pasqua/141. DIO HA TANTO AMATO IL MONDO.htm",
    "songbook/16 Pasqua/142. NON CERCATE TRA I MORTI.htm",
    "songbook/16 Pasqua/143. CELEBRIAMO IL SIGNORE.htm",
    "songbook/16 Pasqua/144. VOLGI IL TUO SGUARDO (N. ESCAMIS).htm",
    "songbook/16 Pasqua/145. DACCI IL TUO PANE.htm",
    "songbook/16 Pasqua/146. ORA SIAMO ARRIVATI (G. SERAPIGLIA).htm",
    "songbook/16 Pasqua/147. RESURREZIONE.htm",
    "songbook/16 Pasqua/148. CANTIAMO CON GIOIA.htm",
    "songbook/16 Pasqua/149. ESULTA IL CIELO (BUTTAZZO).htm",
    "songbook/17 Altre Lingue/150. ALMA MISIONERA .htm",
    "songbook/17 Altre Lingue/151. NADIE TE AMA COMO YO (CAPO III).htm",
    "songbook/17 Altre Lingue/152. DESDE EL CIELO.htm",
    "songbook/17 Altre Lingue/153. SEÑOR TEN PIEDAD (ALEJANDRO MEJÍA).htm",
    "songbook/17 Altre Lingue/154. ESTO QUE SOY ESTO TE DOY.htm",
    "songbook/17 Altre Lingue/155. MI ALMA CANTA (CAPO II).htm",
    "songbook/17 Altre Lingue/156. AT HOME IN OUR HEARTS  (CAPO II).htm",
    "songbook/17 Altre Lingue/157. UNANG ALAY.htm",
    "songbook/17 Altre Lingue/158. PANALANGIN SA PAGIGING BUKAS PALAD.htm",
    "songbook/17 Altre Lingue/159. THE FACE OF GOD.htm",
    "songbook/17 Altre Lingue/160. AWIT NG PAGHAHANGAD.htm",
    "songbook/17 Altre Lingue/161. NARITO AKO.htm",
    "songbook/17 Altre Lingue/162. ANIMA CHRIST.htm",
    "songbook/18 Songbook Collection/Filipino Music Sheet.pdf",
    "songbook/18 Songbook Collection/Filipino Songbook.pdf",
    "songbook/18 Songbook Collection/Italian Guitar Songbook.pdf",
    "songbook/18 Songbook Collection/Music Sheet Chants.pdf",
    "songbook/18 Songbook Collection/Music Sheets 2026.pdf",
    "songbook/18 Songbook Collection/Novena di Natale.pdf",
    "songbook-viewer.html"
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
                        url.pathname.replace(/^\/+/, "")
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

                            url.pathname.replace(/^\/+/, ""),

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
                        "index.html"
                    );

                }

            })

        );

    }
);