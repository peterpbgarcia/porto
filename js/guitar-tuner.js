"use strict";

/* =========================================================
   GUITAR TUNER
   Supports standalone and embedded use.
========================================================= */

const startButton = document.getElementById("start-tuner");
const stopButton = document.getElementById("stop-tuner");
const frequencyDisplay = document.getElementById("frequency");
const noteDisplay = document.getElementById("note");
const centsDisplay = document.getElementById("cents");
const statusDisplay = document.getElementById("status");

let audioContext = null;
let analyser = null;
let microphoneStream = null;
let animationFrame = null;
let isRunning = false;

const returnButton = document.getElementById("return-to-song");
const params = new URLSearchParams(window.location.search);
const isEmbedded = params.get("returnToSong") === "1";

/* Show the return button only when requested. */
if (returnButton) {
    returnButton.hidden = !isEmbedded;

    returnButton.addEventListener("click", () => {
        stopTuner();

        if (window.parent !== window) {
            window.parent.postMessage(
                { type: "closeTuner" },
                "*"
            );
        } else {
            window.history.back();
        }
    });
}

/* Guitar standard tuning reference notes. */
const NOTES = [
    "C", "C♯", "D", "D♯", "E", "F",
    "F♯", "G", "G♯", "A", "A♯", "B"
];

function setStatus(message) {
    if (statusDisplay) {
        statusDisplay.textContent = message;
    }
}

function frequencyToNote(frequency) {
    if (!Number.isFinite(frequency) || frequency <= 0) {
        return null;
    }

    const midi = Math.round(
        69 + 12 * Math.log2(frequency / 440)
    );

    const noteIndex = ((midi % 12) + 12) % 12;
    const octave = Math.floor(midi / 12) - 1;

    const referenceFrequency =
        440 * Math.pow(2, (midi - 69) / 12);

    const cents = 1200 * Math.log2(
        frequency / referenceFrequency
    );

    return {
        name: NOTES[noteIndex],
        octave,
        frequency: referenceFrequency,
        cents
    };
}

/* Detect the dominant pitch using autocorrelation. */
function detectPitch(buffer, sampleRate) {
    let rms = 0;

    for (let i = 0; i < buffer.length; i++) {
        const value = buffer[i];
        rms += value * value;
    }

    rms = Math.sqrt(rms / buffer.length);

    if (rms < 0.01) {
        return null;
    }

    let bestCorrelation = 0;
    let bestOffset = -1;

    const minFrequency = 50;
    const maxFrequency = 1200;

    const minOffset = Math.floor(sampleRate / maxFrequency);
    const maxOffset = Math.min(
        Math.floor(sampleRate / minFrequency),
        buffer.length - 1
    );

    for (
        let offset = minOffset;
        offset <= maxOffset;
        offset++
    ) {
        let correlation = 0;

        for (let i = 0; i < buffer.length - offset; i++) {
            correlation += buffer[i] * buffer[i + offset];
        }

        correlation /= buffer.length - offset;

        if (correlation > bestCorrelation) {
            bestCorrelation = correlation;
            bestOffset = offset;
        }
    }

    if (bestOffset < 1 || bestCorrelation < 0.01) {
        return null;
    }

    return sampleRate / bestOffset;
}

/* Update the note and tuning displays. */
function updateDisplay(frequency) {
    const result = frequencyToNote(frequency);

    if (!result) {
        if (frequencyDisplay) frequencyDisplay.textContent = "—";
        if (noteDisplay) noteDisplay.textContent = "—";
        if (centsDisplay) centsDisplay.textContent = "—";
        return;
    }

    if (frequencyDisplay) {
        frequencyDisplay.textContent =
            `${frequency.toFixed(1)} Hz`;
    }

    if (noteDisplay) {
        noteDisplay.textContent =
            `${result.name}${result.octave}`;
    }

    if (centsDisplay) {
        const cents = Math.round(result.cents);
        const sign = cents > 0 ? "+" : "";

        centsDisplay.textContent = `${sign}${cents} cents`;

        if (cents < -5) {
            centsDisplay.dataset.tuning = "flat";
        } else if (cents > 5) {
            centsDisplay.dataset.tuning = "sharp";
        } else {
            centsDisplay.dataset.tuning = "in-tune";
        }
    }
}

/* Main pitch-detection loop. */
function analyseAudio() {
    if (!isRunning || !analyser || !audioContext) {
        return;
    }

    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);

    const frequency = detectPitch(
        buffer,
        audioContext.sampleRate
    );

    if (frequency) {
        updateDisplay(frequency);
    } else {
        if (frequencyDisplay) frequencyDisplay.textContent = "—";
        if (noteDisplay) noteDisplay.textContent = "Ascolto…";
        if (centsDisplay) centsDisplay.textContent = "—";
    }

    animationFrame = requestAnimationFrame(analyseAudio);
}

/* Start microphone input. */
async function startTuner() {
    if (isRunning) return;

    if (!navigator.mediaDevices?.getUserMedia) {
        setStatus(
            "Il microfono non è disponibile in questo browser o contesto."
        );
        return;
    }

    try {
        setStatus("Richiesta accesso al microfono…");

        microphoneStream =
            await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                }
            });

        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) {
            throw new Error(
                "Questo browser non supporta l'analisi audio."
            );
        }

        audioContext = new AudioContextClass();

        if (audioContext.state === "suspended") {
            await audioContext.resume();
        }

        const source =
            audioContext.createMediaStreamSource(microphoneStream);

        analyser = audioContext.createAnalyser();
        analyser.fftSize = 4096;
        analyser.smoothingTimeConstant = 0;

        source.connect(analyser);

        isRunning = true;

        if (startButton) startButton.disabled = true;
        if (stopButton) stopButton.disabled = false;

        setStatus("Accordatore attivo. Suona una corda alla volta.");
        analyseAudio();
    } catch (error) {
        console.error("Errore accordatore:", error);

        stopTuner();

        if (error.name === "NotAllowedError") {
            setStatus(
                "Accesso al microfono negato. Consenti l'uso del microfono."
            );
        } else {
            setStatus(
                "Impossibile avviare l'accordatore: " +
                (error.message || "errore sconosciuto")
            );
        }
    }
}

/* Stop microphone and release audio resources. */
function stopTuner() {
    isRunning = false;

    if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }

    if (microphoneStream) {
        microphoneStream.getTracks().forEach(track => track.stop());
        microphoneStream = null;
    }

    if (audioContext) {
        const context = audioContext;
        audioContext = null;

        context.close().catch(error => {
            console.warn("Chiusura AudioContext:", error);
        });
    }

    analyser = null;

    if (startButton) startButton.disabled = false;
    if (stopButton) stopButton.disabled = true;

    if (frequencyDisplay) frequencyDisplay.textContent = "—";
    if (noteDisplay) noteDisplay.textContent = "—";
    if (centsDisplay) {
        centsDisplay.textContent = "—";
        delete centsDisplay.dataset.tuning;
    }

    setStatus("Accordatore fermo.");
}

/* Buttons. */
startButton?.addEventListener("click", startTuner);
stopButton?.addEventListener("click", stopTuner);

/* Release microphone if the tuner page is unloaded. */
window.addEventListener("pagehide", stopTuner);