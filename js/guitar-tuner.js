/* ==========================================================
   GUITAR TUNER — ADVANCED PITCH ENGINE
   Standard Tuning — A4 = 440 Hz

   E2 = 82.41 Hz
   A2 = 110.00 Hz
   D3 = 146.83 Hz
   G3 = 196.00 Hz
   B3 = 246.94 Hz
   E4 = 329.63 Hz

   ENGINE

   • YIN-style fundamental detection
   • Harmonic verification
   • Confidence scoring
   • Auto E-A-D-G-B-E detection
   • Manual string selection
   • String locking
   • Attack rejection
   • Frequency continuity
   • Median filtering
   • Outlier rejection
   • Light temporal smoothing
   • IN TUNE hysteresis
   • Continuous re-plucking
   • A440 standard tuning
========================================================== */


/* ==========================================================
   ELEMENTS
========================================================== */

const startButton =
    document.getElementById("start-button");

const detectedNote =
    document.getElementById("detected-note");

const detectedOctave =
    document.getElementById("detected-octave");

const detectedFrequency =
    document.getElementById("detected-frequency");

const tuningStatus =
    document.getElementById("tuning-status");

const centsDisplay =
    document.getElementById("cents-display");

const meterIndicator =
    document.getElementById("meter-indicator");

const microphoneStatus =
    document.getElementById("microphone-status");

const stringButtons =
    document.querySelectorAll(".string-button");


/* ==========================================================
   STANDARD GUITAR STRINGS
========================================================== */

const guitarStrings = [

    {
        note: "E",
        octave: 2,
        frequency: 82.41,
        string: 6
    },

    {
        note: "A",
        octave: 2,
        frequency: 110.00,
        string: 5
    },

    {
        note: "D",
        octave: 3,
        frequency: 146.83,
        string: 4
    },

    {
        note: "G",
        octave: 3,
        frequency: 196.00,
        string: 3
    },

    {
        note: "B",
        octave: 3,
        frequency: 246.94,
        string: 2
    },

    {
        note: "E",
        octave: 4,
        frequency: 329.63,
        string: 1
    }

];


/* ==========================================================
   ENGINE SETTINGS
========================================================== */


/*
 * Minimum microphone signal.
 */

const MIN_RMS =
    0.004;


/*
 * YIN threshold.
 *
 * Lower = stricter.
 */

const YIN_THRESHOLD =
    0.12;


/*
 * Minimum confidence.
 */

const MIN_CONFIDENCE =
    0.45;


/*
 * IN TUNE zone.
 */

const IN_TUNE_CENTS =
    5;


/*
 * Once IN TUNE, remain there
 * until we move beyond this.
 */

const LEAVE_TUNE_CENTS =
    8;


/*
 * Number of stable readings
 * required for IN TUNE.
 */

const TUNE_CONFIRMATIONS =
    4;


/*
 * Direction confirmation.
 */

const DIRECTION_CONFIRMATIONS =
    3;


/*
 * Auto string confirmation.
 */

const STRING_CONFIRMATIONS =
    3;


/*
 * String switching requires
 * stronger evidence.
 */

const STRING_SWITCH_CONFIRMATIONS =
    5;


/*
 * Pitch history.
 */

const HISTORY_SIZE =
    9;


/*
 * Frequency smoothing.
 */

const FREQUENCY_SMOOTHING =
    0.18;


/*
 * Meter smoothing.
 */

const METER_SMOOTHING =
    0.18;


/*
 * Maximum sudden pitch jump.
 */

const MAX_PITCH_JUMP_CENTS =
    180;


/*
 * Maximum allowed distance
 * from a guitar string.
 */

const MAX_STRING_DISTANCE =
    100;


/*
 * Harmonic search depth.
 */

const MAX_HARMONIC =
    6;


/*
 * Guitar frequency range.
 */

const LOWEST_GUITAR_FREQUENCY =
    65;

const HIGHEST_GUITAR_FREQUENCY =
    380;


/*
 * Attack period.
 *
 * The first part of the pluck is
 * often rich in harmonics.
 */

const ATTACK_IGNORE_MS =
    90;


/*
 * Result hold time.
 *
 * Keeps the result visible while
 * the string decays.
 */

const HOLD_RESULT_MS =
    900;


/*
 * How long a pitch may disappear
 * before the display changes.
 */

const BAD_READING_LIMIT =
    6;


/*
 * Meter range.
 */

const METER_RANGE =
    50;


/* ==========================================================
   STATE
========================================================== */

let tuningMode =
    "auto";

let selectedString =
    null;

let lockedString =
    null;

let candidateString =
    null;

let candidateStringCount =
    0;


/* ==========================================================
   AUDIO
========================================================== */

let audioContext =
    null;

let analyser =
    null;

let microphoneStream =
    null;

let microphoneSource =
    null;


/* ==========================================================
   RUNNING STATE
========================================================== */

let isRunning =
    false;

let animationFrame =
    null;


/* ==========================================================
   PITCH STATE
========================================================== */

let frequencyHistory =
    [];

let smoothedFrequency =
    null;

let lastValidFrequency =
    null;

let lastValidTime =
    0;


/*
 * FIX:
 * This variable was previously missing.
 */

let lastGoodResultTime =
    0;

let badReadingCount =
    0;


/* ==========================================================
   PLUCK STATE
========================================================== */

let previousRMS =
    0;

let smoothedRMS =
    0;

let lastPluckTime =
    0;

let attackStartTime =
    0;

let pluckActive =
    false;


/* ==========================================================
   TUNING STATE
========================================================== */

let tuningState =
    "waiting";

let tuneCount =
    0;

let unstableCount =
    0;

let directionCandidate =
    null;

let directionCount =
    0;


/* ==========================================================
   METER
========================================================== */

let displayedCents =
    0;


/* ==========================================================
   INITIAL DISPLAY
========================================================== */

resetDisplay();


/* ==========================================================
   START BUTTON
========================================================== */

if (startButton) {

    startButton.addEventListener(
        "click",
        async () => {

            if (isRunning) {

                stopTuner();

            } else {

                await startTuner();

            }

        }
    );

}


/* ==========================================================
   STRING BUTTONS
========================================================== */

stringButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const note =
                    button.dataset.note;

                const frequency =
                    Number(
                        button.dataset.frequency
                    );

                const found =
                    guitarStrings.find(
                        string =>
                            `${string.note}${string.octave}` ===
                            note
                    );


                if (found) {

                    selectedString =
                        found;

                } else {

                    selectedString = {

                        note:
                            note.charAt(0),

                        octave:
                            Number(
                                note.slice(1)
                            ),

                        frequency:
                            frequency,

                        string:
                            null

                    };

                }


                tuningMode =
                    "manual";

                lockedString =
                    selectedString;

                candidateString =
                    null;

                candidateStringCount =
                    0;


                resetPitchTracking();

                resetTuningState();


                clearStringSelection();


                button.classList.add(
                    "selected"
                );


                updateModeButtons();


                if (microphoneStatus) {

                    microphoneStatus.textContent =
                        `Listening for ${selectedString.note}${selectedString.octave}…`;

                }

            }
        );

    }
);


/* ==========================================================
   MODE CONTROLS
========================================================== */

createModeControls();


function createModeControls() {

    const stringsSection =
        document.querySelector(
            ".strings-section"
        );


    if (!stringsSection) {

        return;

    }


    if (
        document.getElementById(
            "tuning-mode-controls"
        )
    ) {

        return;

    }


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.id =
        "tuning-mode-controls";


    wrapper.innerHTML = `

        <div class="tuning-mode-buttons">

            <button
                id="auto-mode-button"
                type="button"
                class="mode-button active"
            >
                ● Auto Detect
            </button>

            <button
                id="manual-mode-button"
                type="button"
                class="mode-button"
            >
                ○ Manual
            </button>

        </div>

    `;


    const grid =
        stringsSection.querySelector(
            ".strings-grid"
        );


    stringsSection.insertBefore(
        wrapper,
        grid
    );


    const autoButton =
        document.getElementById(
            "auto-mode-button"
        );

    const manualButton =
        document.getElementById(
            "manual-mode-button"
        );


    if (!autoButton || !manualButton) {

        return;

    }


    autoButton.addEventListener(
        "click",
        () => {

            tuningMode =
                "auto";

            lockedString =
                null;

            selectedString =
                null;

            candidateString =
                null;

            candidateStringCount =
                0;


            resetPitchTracking();

            resetTuningState();

            clearStringSelection();

            updateModeButtons();


            if (microphoneStatus) {

                microphoneStatus.textContent =
                    isRunning
                        ? "Listening… Pluck one string"
                        : "Ready";

            }

        }
    );


    manualButton.addEventListener(
        "click",
        () => {

            tuningMode =
                "manual";


            selectedString =
                selectedString ||
                guitarStrings[0];


            lockedString =
                selectedString;


            resetPitchTracking();

            resetTuningState();


            clearStringSelection();


            const selectedButton =
                [...stringButtons].find(
                    button =>
                        button.dataset.note ===
                        `${selectedString.note}${selectedString.octave}`
                );


            if (selectedButton) {

                selectedButton.classList.add(
                    "selected"
                );

            }


            updateModeButtons();


            if (microphoneStatus) {

                microphoneStatus.textContent =
                    isRunning
                        ? `Listening for ${selectedString.note}${selectedString.octave}…`
                        : "Ready";

            }

        }
    );

}


/* ==========================================================
   MODE BUTTON UPDATE
========================================================== */

function updateModeButtons() {

    const autoButton =
        document.getElementById(
            "auto-mode-button"
        );

    const manualButton =
        document.getElementById(
            "manual-mode-button"
        );


    if (
        !autoButton ||
        !manualButton
    ) {

        return;

    }


    autoButton.classList.toggle(
        "active",
        tuningMode === "auto"
    );


    manualButton.classList.toggle(
        "active",
        tuningMode === "manual"
    );


    autoButton.textContent =
        tuningMode === "auto"
            ? "● Auto Detect"
            : "○ Auto Detect";


    manualButton.textContent =
        tuningMode === "manual"
            ? "● Manual"
            : "○ Manual";

}


/* ==========================================================
   CLEAR STRING SELECTION
========================================================== */

function clearStringSelection() {

    stringButtons.forEach(
        button => {

            button.classList.remove(
                "selected"
            );

        }
    );

}


/* ==========================================================
   RESET PITCH TRACKING
========================================================== */

function resetPitchTracking() {

    frequencyHistory =
        [];

    smoothedFrequency =
        null;

    lastValidFrequency =
        null;

    lastValidTime =
        0;

    lastGoodResultTime =
        0;

    badReadingCount =
        0;

}


/* ==========================================================
   RESET TUNING STATE
========================================================== */

function resetTuningState() {

    tuningState =
        "waiting";

    tuneCount =
        0;

    unstableCount =
        0;

    directionCandidate =
        null;

    directionCount =
        0;

    displayedCents =
        0;

}


/* ==========================================================
   RESET MEASUREMENT
========================================================== */

function resetMeasurement() {

    if (
        tuningMode === "manual"
    ) {

        lockedString =
            selectedString;

    } else {

        lockedString =
            null;

    }


    candidateString =
        null;

    candidateStringCount =
        0;


    resetPitchTracking();

    resetTuningState();


    previousRMS =
        0;

    smoothedRMS =
        0;

    lastPluckTime =
        0;

    attackStartTime =
        0;

    pluckActive =
        false;

}


/* ==========================================================
   RESET DISPLAY
========================================================== */

function resetDisplay() {

    if (detectedNote) {

        detectedNote.textContent =
            "—";

    }


    if (detectedOctave) {

        detectedOctave.textContent =
            "—";

    }


    if (detectedFrequency) {

        detectedFrequency.textContent =
            "0.0 Hz";

    }


    if (tuningStatus) {

        tuningStatus.textContent =
            "Ready";

        tuningStatus.className =
            "tuning-status";

    }


    if (centsDisplay) {

        centsDisplay.textContent =
            "—";

    }


    if (meterIndicator) {

        meterIndicator.style.left =
            "50%";

        meterIndicator.style.background =
            "";

    }


    if (microphoneStatus) {

        microphoneStatus.textContent =
            "Ready";

    }

}


/* ==========================================================
   START TUNER
========================================================== */

async function startTuner() {

    try {

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            throw new Error(
                "Microphone access is not supported by this browser or page."
            );

        }


        /*
         * HTTPS check.
         *
         * localhost is also allowed by browsers.
         */

        if (
            location.protocol !== "https:" &&
            location.hostname !== "localhost" &&
            location.hostname !== "127.0.0.1"
        ) {

            throw new Error(
                "Microphone access requires HTTPS."
            );

        }


        if (microphoneStatus) {

            microphoneStatus.textContent =
                "Requesting microphone access…";

        }


microphoneStream =
    await navigator.mediaDevices.getUserMedia({
        audio: true
    });

        const AudioContextClass =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioContextClass) {

            throw new Error(
                "Web Audio API is not supported by this browser."
            );

        }


        audioContext =
            new AudioContextClass();


        await audioContext.resume();


        microphoneSource =
            audioContext.createMediaStreamSource(
                microphoneStream
            );


        analyser =
            audioContext.createAnalyser();


        /*
         * 8192 gives us good low-frequency
         * resolution for guitar.
         */

        analyser.fftSize =
            8192;


        /*
         * We perform our own filtering.
         */

        analyser.smoothingTimeConstant =
            0.02;


        microphoneSource.connect(
            analyser
        );


        isRunning =
            true;


        startButton.textContent =
            "⏹ Stop Tuner";


        startButton.classList.add(
            "running"
        );


        resetMeasurement();


        if (microphoneStatus) {

            microphoneStatus.textContent =
                "Listening… Pluck one string";

        }


        detectPitch();


    } catch (error) {

        console.error(
            "Tuner error:",
            error
        );


        /*
         * Make sure partially-created
         * audio resources are cleaned up.
         */

        if (microphoneStream) {

            microphoneStream
                .getTracks()
                .forEach(
                    track =>
                        track.stop()
                );

            microphoneStream =
                null;

        }


        if (microphoneSource) {

            try {

                microphoneSource.disconnect();

            } catch (disconnectError) {}

            microphoneSource =
                null;

        }


        if (audioContext) {

            try {

                await audioContext.close();

            } catch (closeError) {}

            audioContext =
                null;

        }


        analyser =
            null;

        isRunning =
            false;


        if (startButton) {

            startButton.textContent =
                "🎤 Start Tuner";

            startButton.classList.remove(
                "running"
            );

        }


        /*
         * IMPORTANT:
         *
         * Do not falsely report every
         * JavaScript error as microphone
         * failure.
         */

        if (microphoneStatus) {

            microphoneStatus.textContent =
                error && error.message
                    ? error.message
                    : "Unable to start tuner.";

        }

    }

}


/* ==========================================================
   STOP TUNER
========================================================== */

function stopTuner() {

    isRunning =
        false;


    if (animationFrame) {

        cancelAnimationFrame(
            animationFrame
        );

        animationFrame =
            null;

    }


    if (microphoneStream) {

        microphoneStream
            .getTracks()
            .forEach(
                track =>
                    track.stop()
            );


        microphoneStream =
            null;

    }


    if (microphoneSource) {

        try {

            microphoneSource.disconnect();

        } catch (error) {}

        microphoneSource =
            null;

    }


    if (audioContext) {

        try {

            audioContext.close();

        } catch (error) {}

        audioContext =
            null;

    }


    analyser =
        null;


    resetMeasurement();


    if (startButton) {

        startButton.textContent =
            "🎤 Start Tuner";

        startButton.classList.remove(
            "running"
        );

    }


    resetDisplay();

}


/* ==========================================================
   MAIN AUDIO LOOP
========================================================== */

function detectPitch() {

    if (
        !isRunning ||
        !analyser
    ) {

        return;

    }


    const buffer =
        new Float32Array(
            analyser.fftSize
        );


    analyser.getFloatTimeDomainData(
        buffer
    );


    const rms =
        calculateRMS(
            buffer
        );


    smoothedRMS =
        smoothedRMS *
        0.80
        +
        rms *
        0.20;


    detectPluck(
        rms
    );


    /*
     * During the first part of
     * the attack, don't trust pitch.
     */

    const now =
        performance.now();


    if (
        pluckActive &&
        now -
        attackStartTime <
        ATTACK_IGNORE_MS
    ) {

        previousRMS =
            rms;


        animationFrame =
            requestAnimationFrame(
                detectPitch
            );


        return;

    }


    const result =
        detectPitchYIN(
            buffer,
            audioContext.sampleRate
        );


    if (result) {

        processPitch(
            result
        );

    } else {

        handleBadReading();

    }


    previousRMS =
        rms;


    animationFrame =
        requestAnimationFrame(
            detectPitch
        );

}


/* ==========================================================
   RMS
========================================================== */

function calculateRMS(
    buffer
) {

    let sum =
        0;


    for (
        let i = 0;
        i < buffer.length;
        i++
    ) {

        sum +=
            buffer[i] *
            buffer[i];

    }


    return Math.sqrt(
        sum /
        buffer.length
    );

}


/* ==========================================================
   PLUCK DETECTION
========================================================== */

function detectPluck(
    rms
) {

    const now =
        performance.now();


    if (
        now -
        lastPluckTime <
        250
    ) {

        return;

    }


    const baseline =
        Math.max(
            smoothedRMS,
            0.0001
        );


    const rise =
        rms /
        baseline;


    if (
        rms >
        MIN_RMS
        &&
        rise >
        1.25
        &&
        rms >
        previousRMS *
        1.08
    ) {

        pluckActive =
            true;


        attackStartTime =
            now;


        lastPluckTime =
            now;


        /*
         * A new pluck starts a fresh
         * measurement window.
         *
         * The string lock remains.
         */

        frequencyHistory =
            [];

        badReadingCount =
            0;

    }


    if (
        pluckActive &&
        now -
        attackStartTime >
        ATTACK_IGNORE_MS
    ) {

        pluckActive =
            false;

    }

}


/* ==========================================================
   YIN-STYLE PITCH DETECTOR
========================================================== */

function detectPitchYIN(
    buffer,
    sampleRate
) {

    const rms =
        calculateRMS(
            buffer
        );


    if (
        rms <
        MIN_RMS
    ) {

        return null;

    }


    /*
     * Remove DC offset.
     */

    let mean =
        0;


    for (
        let i = 0;
        i < buffer.length;
        i++
    ) {

        mean +=
            buffer[i];

    }


    mean /=
        buffer.length;


    const clean =
        new Float32Array(
            buffer.length
        );


    for (
        let i = 0;
        i < buffer.length;
        i++
    ) {

        clean[i] =
            buffer[i] -
            mean;

    }


    /*
     * Determine search range.
     */

    let minFrequency =
        LOWEST_GUITAR_FREQUENCY;

    let maxFrequency =
        HIGHEST_GUITAR_FREQUENCY;


    if (
        tuningMode === "manual" &&
        selectedString
    ) {

        minFrequency =
            selectedString.frequency *
            0.70;


        maxFrequency =
            selectedString.frequency *
            1.35;

    }


    const minTau =
        Math.floor(
            sampleRate /
            maxFrequency
        );


    const maxTau =
        Math.min(
            Math.floor(
                sampleRate /
                minFrequency
            ),
            Math.floor(
                clean.length /
                2
            )
        );


    if (
        maxTau <=
        minTau
    ) {

        return null;

    }


    /*
     * ======================================================
     * STEP 1
     * Difference function
     * ======================================================
     */

    const difference =
        new Float32Array(
            maxTau + 1
        );


    for (
        let tau = 1;
        tau <= maxTau;
        tau++
    ) {

        let sum =
            0;


        const limit =
            clean.length -
            tau;


        for (
            let i = 0;
            i < limit;
            i++
        ) {

            const delta =
                clean[i] -
                clean[i + tau];


            sum +=
                delta *
                delta;

        }


        difference[tau] =
            sum;

    }


    /*
     * ======================================================
     * STEP 2
     * Cumulative mean normalized difference
     * ======================================================
     */

    const cmndf =
        new Float32Array(
            maxTau + 1
        );


    cmndf[0] =
        1;


    let runningSum =
        0;


    for (
        let tau = 1;
        tau <= maxTau;
        tau++
    ) {

        runningSum +=
            difference[tau];


        if (
            runningSum ===
            0
        ) {

            cmndf[tau] =
                1;

        } else {

            cmndf[tau] =
                difference[tau] *
                tau /
                runningSum;

        }

    }


    /*
     * ======================================================
     * STEP 3
     * Find first reliable minimum
     * ======================================================
     */

    let tauEstimate =
        -1;


    for (
        let tau = minTau;
        tau <= maxTau;
        tau++
    ) {

        if (
            cmndf[tau] <
            YIN_THRESHOLD
        ) {

            while (
                tau + 1 <= maxTau &&
                cmndf[tau + 1] <
                cmndf[tau]
            ) {

                tau++;

            }


            tauEstimate =
                tau;


            break;

        }

    }


    /*
     * If no threshold crossing,
     * find the strongest minimum.
     */

    if (
        tauEstimate ===
        -1
    ) {

        let bestTau =
            minTau;

        let bestValue =
            cmndf[minTau];


        for (
            let tau = minTau + 1;
            tau <= maxTau;
            tau++
        ) {

            if (
                cmndf[tau] <
                bestValue
            ) {

                bestValue =
                    cmndf[tau];

                bestTau =
                    tau;

            }

        }


        if (
            bestValue >
            0.35
        ) {

            return null;

        }


        tauEstimate =
            bestTau;

    }


    /*
     * ======================================================
     * STEP 4
     * Parabolic interpolation
     * ======================================================
     */

    const refinedTau =
        parabolicInterpolation(
            cmndf,
            tauEstimate
        );


    if (
        !Number.isFinite(
            refinedTau
        ) ||
        refinedTau <= 0
    ) {

        return null;

    }


    const frequency =
        sampleRate /
        refinedTau;


    if (
        frequency <
        LOWEST_GUITAR_FREQUENCY
        ||
        frequency >
        HIGHEST_GUITAR_FREQUENCY
    ) {

        return null;

    }


    /*
     * ======================================================
     * CONFIDENCE
     * ======================================================
     */

    const minimum =
        cmndf[tauEstimate];


    const confidence =
        Math.max(
            0,
            Math.min(
                1,
                1 -
                minimum
            )
        );


    if (
        confidence <
        MIN_CONFIDENCE
    ) {

        return null;

    }


    /*
     * ======================================================
     * HARMONIC VERIFICATION
     * ======================================================
     */

    const corrected =
        correctHarmonicYIN(
            frequency,
            confidence
        );


    if (!corrected) {

        return null;

    }


    return {

        frequency:
            corrected.frequency,

        confidence:
            corrected.confidence,

        harmonic:
            corrected.harmonic

    };

}


/* ==========================================================
   PARABOLIC INTERPOLATION
========================================================== */

function parabolicInterpolation(
    values,
    index
) {

    if (
        index <= 0 ||
        index >=
        values.length - 1
    ) {

        return index;

    }


    const left =
        values[index - 1];

    const center =
        values[index];

    const right =
        values[index + 1];


    const denominator =
        left -
        2 * center +
        right;


    if (
        Math.abs(
            denominator
        ) <
        0.000001
    ) {

        return index;

    }


    const adjustment =
        0.5 *
        (
            left -
            right
        ) /
        denominator;


    return index +
        adjustment;

}


/* ==========================================================
   HARMONIC CORRECTION
========================================================== */

function correctHarmonicYIN(
    frequency,
    confidence
) {

    /*
     * First see whether the raw
     * frequency itself corresponds
     * to a guitar string.
     */

    const direct =
        findBestStringForFrequency(
            frequency
        );


    let best =
        null;


    if (direct) {

        best = {

            frequency:
                frequency,

            confidence:
                confidence,

            harmonic:
                1,

            distance:
                Math.abs(
                    direct.cents
                )

        };

    }


    /*
     * Check whether YIN selected
     * a harmonic instead.
     */

    for (
        let harmonic = 2;
        harmonic <=
        MAX_HARMONIC;
        harmonic++
    ) {

        const fundamental =
            frequency /
            harmonic;


        if (
            fundamental <
            LOWEST_GUITAR_FREQUENCY
            ||
            fundamental >
            HIGHEST_GUITAR_FREQUENCY
        ) {

            continue;

        }


        const match =
            findBestStringForFrequency(
                fundamental
            );


        if (!match) {

            continue;

        }


        const distance =
            Math.abs(
                match.cents
            );


        if (
            distance >
            35
        ) {

            continue;

        }


        const harmonicConfidence =
            confidence /
            (
                1 +
                (
                    harmonic -
                    1
                ) *
                0.15
            );


        if (
            !best ||
            distance <
            best.distance
        ) {

            best = {

                frequency:
                    fundamental,

                confidence:
                    harmonicConfidence,

                harmonic:
                    harmonic,

                distance:
                    distance

            };

        }

    }


    if (!best) {

        return null;

    }


    return best;

}


/* ==========================================================
   FIND BEST STRING
========================================================== */

function findBestStringForFrequency(
    frequency
) {

    let best =
        null;


    guitarStrings.forEach(
        string => {

            const cents =
                1200 *
                Math.log2(
                    frequency /
                    string.frequency
                );


            const distance =
                Math.abs(
                    cents
                );


            if (
                distance >
                MAX_STRING_DISTANCE
            ) {

                return;

            }


            if (
                !best ||
                distance <
                best.distance
            ) {

                best = {

                    string:
                        string,

                    cents:
                        cents,

                    distance:
                        distance

                };

            }

        }
    );


    return best;

}


/* ==========================================================
   PROCESS PITCH
========================================================== */

function processPitch(
    result
) {

    badReadingCount =
        0;


    lastGoodResultTime =
        performance.now();


    /*
     * Determine which string the
     * pitch belongs to.
     */

    const match =
        findBestStringForFrequency(
            result.frequency
        );


    if (!match) {

        return;

    }


    /*
     * ======================================================
     * AUTO STRING LOCK
     * ======================================================
     */

    if (
        tuningMode ===
        "auto"
    ) {

        /*
         * No string locked yet.
         */

        if (!lockedString) {

            if (
                !candidateString ||
                candidateString.string !==
                match.string.string
            ) {

                candidateString =
                    match.string;

                candidateStringCount =
                    1;

            } else {

                candidateStringCount++;

            }


            if (
                candidateStringCount >=
                STRING_CONFIRMATIONS
            ) {

                lockedString =
                    candidateString;


                candidateString =
                    null;


                candidateStringCount =
                    0;


                resetTuningState();

            } else {

                return;

            }

        }


        /*
         * Existing string lock.
         */

        else if (
            match.string.string !==
            lockedString.string
        ) {

            /*
             * Possible new string.
             *
             * Require more evidence
             * before switching.
             */

            if (
                !candidateString ||
                candidateString.string !==
                match.string.string
            ) {

                candidateString =
                    match.string;

                candidateStringCount =
                    1;

            } else {

                candidateStringCount++;

            }


            if (
                candidateStringCount >=
                STRING_SWITCH_CONFIRMATIONS
            ) {

                lockedString =
                    candidateString;


                candidateString =
                    null;


                candidateStringCount =
                    0;


                resetPitchTracking();

                resetTuningState();

            } else {

                return;

            }

        }

    }


    /*
     * ======================================================
     * MANUAL MODE
     * ======================================================
     */

    if (
        tuningMode ===
        "manual"
    ) {

        lockedString =
            selectedString;

    }


    const targetString =
        lockedString ||
        selectedString;


    if (!targetString) {

        return;

    }


    /*
     * ======================================================
     * CALCULATE CENTS
     * ======================================================
     */

    let cents =
        1200 *
        Math.log2(
            result.frequency /
            targetString.frequency
        );


    /*
     * Don't accept a reading that
     * is wildly away from the locked
     * string.
     */

    if (
        Math.abs(cents) >
        MAX_STRING_DISTANCE
    ) {

        return;

    }


    /*
     * ======================================================
     * CONTINUITY PROTECTION
     * ======================================================
     */

    if (
        lastValidFrequency
    ) {

        const jump =
            Math.abs(
                1200 *
                Math.log2(
                    result.frequency /
                    lastValidFrequency
                )
            );


        if (
            jump >
            MAX_PITCH_JUMP_CENTS
        ) {

            const recovered =
                recoverPitchRelativeToPrevious(
                    result.frequency,
                    lastValidFrequency
                );


            if (recovered) {

                result =
                    recovered;


                cents =
                    1200 *
                    Math.log2(
                        result.frequency /
                        targetString.frequency
                    );

            } else {

                return;

            }

        }

    }


    /*
     * ======================================================
     * FREQUENCY HISTORY
     * ======================================================
     */

    frequencyHistory.push(
        result.frequency
    );


    if (
        frequencyHistory.length >
        HISTORY_SIZE
    ) {

        frequencyHistory.shift();

    }


    /*
     * Remove obvious outliers.
     */

    const filtered =
        removeFrequencyOutliers(
            frequencyHistory
        );


    if (
        filtered.length ===
        0
    ) {

        return;

    }


    /*
     * Median gives us a robust
     * central estimate.
     */

    const median =
        calculateMedian(
            filtered
        );


    /*
     * ======================================================
     * LIGHT SMOOTHING
     * ======================================================
     */

    if (
        smoothedFrequency ===
        null
    ) {

        smoothedFrequency =
            median;

    } else {

        smoothedFrequency =
            smoothedFrequency *
            (
                1 -
                FREQUENCY_SMOOTHING
            )
            +
            median *
            FREQUENCY_SMOOTHING;

    }


    /*
     * ======================================================
     * FINAL CENTS
     * ======================================================
     */

    const finalCents =
        1200 *
        Math.log2(
            smoothedFrequency /
            targetString.frequency
        );


    /*
     * Don't allow a filtered value
     * to become a giant jump.
     */

    if (
        lastValidFrequency
    ) {

        const filteredJump =
            Math.abs(
                1200 *
                Math.log2(
                    smoothedFrequency /
                    lastValidFrequency
                )
            );


        if (
            filteredJump >
            MAX_PITCH_JUMP_CENTS
        ) {

            return;

        }

    }


    lastValidFrequency =
        smoothedFrequency;


    lastValidTime =
        performance.now();


    /*
     * ======================================================
     * DISPLAY
     * ======================================================
     */

    updateDisplay(
        targetString,
        smoothedFrequency,
        finalCents
    );


    /*
     * ======================================================
     * TUNING STATE
     * ======================================================
     */

    updateStableState(
        finalCents,
        result.confidence
    );


    updateTuningStatus(
        finalCents
    );

}


/* ==========================================================
   RECOVER PITCH RELATIVE TO PREVIOUS
========================================================== */

function recoverPitchRelativeToPrevious(
    newFrequency,
    previousFrequency
) {

    /*
     * Check whether the new reading
     * is actually a harmonic of the
     * previous pitch.
     */

    for (
        let harmonic = 2;
        harmonic <=
        MAX_HARMONIC;
        harmonic++
    ) {

        const recovered =
            newFrequency /
            harmonic;


        const distance =
            Math.abs(
                1200 *
                Math.log2(
                    recovered /
                    previousFrequency
                )
            );


        if (
            distance <
            80
        ) {

            const match =
                findBestStringForFrequency(
                    recovered
                );


            if (match) {

                return {

                    frequency:
                        recovered,

                    confidence:
                        0.60,

                    harmonic:
                        harmonic

                };

            }

        }

    }


    /*
     * Check the reverse possibility:
     * previous pitch was a harmonic
     * of the new frequency.
     */

    for (
        let harmonic = 2;
        harmonic <=
        MAX_HARMONIC;
        harmonic++
    ) {

        const alternative =
            previousFrequency /
            harmonic;


        const distance =
            Math.abs(
                1200 *
                Math.log2(
                    newFrequency /
                    alternative
                )
            );


        if (
            distance <
            80
        ) {

            const match =
                findBestStringForFrequency(
                    alternative
                );


            if (match) {

                return {

                    frequency:
                        alternative,

                    confidence:
                        0.55,

                    harmonic:
                        harmonic

                };

            }

        }

    }


    return null;

}


/* ==========================================================
   REMOVE OUTLIERS
========================================================== */

function removeFrequencyOutliers(
    values
) {

    if (
        values.length <
        4
    ) {

        return [
            ...values
        ];

    }


    const median =
        calculateMedian(
            values
        );


    return values.filter(
        frequency => {

            const distance =
                Math.abs(
                    1200 *
                    Math.log2(
                        frequency /
                        median
                    )
                );


            return distance <=
                35;

        }
    );

}


/* ==========================================================
   MEDIAN
========================================================== */

function calculateMedian(
    values
) {

    const sorted =
        [
            ...values
        ].sort(
            (a, b) =>
                a - b
        );


    const middle =
        Math.floor(
            sorted.length /
            2
        );


    if (
        sorted.length %
        2 ===
        0
    ) {

        return (
            sorted[middle - 1] +
            sorted[middle]
        ) / 2;

    }


    return sorted[middle];

}


/* ==========================================================
   UPDATE DISPLAY
========================================================== */

function updateDisplay(
    string,
    frequency,
    cents
) {

    if (detectedNote) {

        detectedNote.textContent =
            string.note;

    }


    if (detectedOctave) {

        detectedOctave.textContent =
            `${string.note}${string.octave}`;

    }


    if (detectedFrequency) {

        detectedFrequency.textContent =
            `${frequency.toFixed(1)} Hz`;

    }


    highlightString(
        string
    );


    const rounded =
        Math.round(
            cents
        );


    if (centsDisplay) {

        if (
            rounded ===
            0
        ) {

            centsDisplay.textContent =
                "0 cents";

        } else if (
            rounded < 0
        ) {

            centsDisplay.textContent =
                `${Math.abs(rounded)} cents flat`;

        } else {

            centsDisplay.textContent =
                `${rounded} cents sharp`;

        }

    }


    /*
     * Smooth visual needle.
     */

    displayedCents =
        displayedCents *
        (
            1 -
            METER_SMOOTHING
        )
        +
        cents *
        METER_SMOOTHING;


    updateMeter(
        displayedCents
    );

}


/* ==========================================================
   STABLE TUNING LOGIC
========================================================== */

function updateStableState(
    cents,
    confidence
) {

    if (
        confidence <
        MIN_CONFIDENCE
    ) {

        return;

    }


    const absolute =
        Math.abs(
            cents
        );


    /*
     * ======================================================
     * ALREADY IN TUNE
     * ======================================================
     */

    if (
        tuningState ===
        "tune"
    ) {

        if (
            absolute <=
            LEAVE_TUNE_CENTS
        ) {

            unstableCount =
                0;


            return;

        }


        unstableCount++;


        if (
            unstableCount >=
            DIRECTION_CONFIRMATIONS
        ) {

            tuningState =
                cents < 0
                    ? "flat"
                    : "sharp";


            unstableCount =
                0;


            directionCandidate =
                null;


            directionCount =
                0;

        }


        return;

    }


    /*
     * ======================================================
     * BUILD IN-TUNE CONFIDENCE
     * ======================================================
     */

    if (
        absolute <=
        IN_TUNE_CENTS
    ) {

        tuneCount++;

    } else {

        tuneCount =
            0;

    }


    if (
        tuneCount >=
        TUNE_CONFIRMATIONS
    ) {

        tuningState =
            "tune";


        unstableCount =
            0;


        directionCandidate =
            null;


        directionCount =
            0;


        return;

    }


    /*
     * ======================================================
     * DIRECTION
     * ======================================================
     */

    let direction =
        null;


    if (
        cents <
        -IN_TUNE_CENTS
    ) {

        direction =
            "flat";

    } else if (
        cents >
        IN_TUNE_CENTS
    ) {

        direction =
            "sharp";

    }


    if (!direction) {

        return;

    }


    if (
        directionCandidate ===
        direction
    ) {

        directionCount++;

    } else {

        directionCandidate =
            direction;

        directionCount =
            1;

    }


    if (
        directionCount >=
        DIRECTION_CONFIRMATIONS
    ) {

        tuningState =
            direction;


        directionCount =
            0;


        unstableCount =
            0;

    }

}


/* ==========================================================
   STATUS DISPLAY
========================================================== */

function updateTuningStatus(
    cents
) {

    if (!tuningStatus) {

        return;

    }


    /*
     * ======================================================
     * IN TUNE
     * ======================================================
     */

    if (
        tuningState ===
        "tune"
    ) {

        tuningStatus.textContent =
            "IN TUNE";


        tuningStatus.className =
            "tuning-status in-tune";


        if (microphoneStatus) {

            microphoneStatus.textContent =
                "✓ In tune — pluck again when ready";

        }


        return;

    }


    /*
     * ======================================================
     * FLAT
     * ======================================================
     */

    if (
        tuningState ===
        "flat"
    ) {

        tuningStatus.textContent =
            "FLAT";


        tuningStatus.className =
            "tuning-status flat";


        if (microphoneStatus) {

            microphoneStatus.textContent =
                "Tune higher";

        }


        return;

    }


    /*
     * ======================================================
     * SHARP
     * ======================================================
     */

    if (
        tuningState ===
        "sharp"
    ) {

        tuningStatus.textContent =
            "SHARP";


        tuningStatus.className =
            "tuning-status sharp";


        if (microphoneStatus) {

            microphoneStatus.textContent =
                "Tune lower";

        }


        return;

    }


    /*
     * ======================================================
     * WAITING / APPROACHING
     * ======================================================
     */

    if (
        cents <
        -IN_TUNE_CENTS
    ) {

        tuningStatus.textContent =
            "FLAT";


        tuningStatus.className =
            "tuning-status flat";


        if (microphoneStatus) {

            microphoneStatus.textContent =
                "Tune higher";

        }

    } else if (
        cents >
        IN_TUNE_CENTS
    ) {

        tuningStatus.textContent =
            "SHARP";


        tuningStatus.className =
            "tuning-status sharp";


        if (microphoneStatus) {

            microphoneStatus.textContent =
                "Tune lower";

        }

    } else {

        tuningStatus.textContent =
            "Almost in tune";


        tuningStatus.className =
            "tuning-status";


        if (microphoneStatus) {

            microphoneStatus.textContent =
                "Hold the string…";

        }

    }

}


/* ==========================================================
   BAD READING
========================================================== */

function handleBadReading() {

    badReadingCount++;


    const now =
        performance.now();


    /*
     * Keep the last good result
     * briefly while the string rings.
     */

    if (
        now -
        lastGoodResultTime <
        HOLD_RESULT_MS
    ) {

        return;

    }


    if (
        badReadingCount >
        BAD_READING_LIMIT
    ) {

        if (
            tuningState ===
            "tune"
        ) {

            if (microphoneStatus) {

                microphoneStatus.textContent =
                    "✓ In tune — pluck again when ready";

            }

        } else {

            if (microphoneStatus) {

                microphoneStatus.textContent =
                    "Listening… Pluck the string again";

            }

        }

    }

}


/* ==========================================================
   METER
========================================================== */

function updateMeter(
    cents
) {

    const limited =
        Math.max(
            -METER_RANGE,
            Math.min(
                METER_RANGE,
                cents
            )
        );


    const position =
        50 +
        (
            limited /
            METER_RANGE
        ) *
        50;


    if (meterIndicator) {

        meterIndicator.style.left =
            `${position}%`;

    }


    /*
     * IN TUNE
     */

    if (
        meterIndicator &&
        Math.abs(cents) <=
        IN_TUNE_CENTS
    ) {

        meterIndicator.style.background =
            "var(--tuner-green, #35b96f)";

    }


    /*
     * FLAT
     */

    else if (
        meterIndicator &&
        cents < 0
    ) {

        meterIndicator.style.background =
            "var(--tuner-blue, #4aaee8)";

    }


    /*
     * SHARP
     */

    else if (
        meterIndicator
    ) {

        meterIndicator.style.background =
            "var(--tuner-red, #e05a5a)";

    }

}


/* ==========================================================
   HIGHLIGHT CURRENT STRING
========================================================== */

function highlightString(
    target
) {

    if (!target) {

        return;

    }


    stringButtons.forEach(
        button => {

            const note =
                button.dataset.note;


            const targetNote =
                `${target.note}${target.octave}`;


            if (
                note ===
                targetNote
            ) {

                button.classList.add(
                    "selected"
                );

            } else if (
                tuningMode ===
                "auto"
            ) {

                button.classList.remove(
                    "selected"
                );

            }

        }
    );

}


/* ==========================================================
   CLEANUP
========================================================== */

window.addEventListener(
    "beforeunload",
    () => {

        if (isRunning) {

            stopTuner();

        }

    }
);