"use strict";

/* ==========================================================
   GUITAR TUNER — ADVANCED PITCH ENGINE
   Compendio di Preghiere 9.0

   Standard tuning: A4 = 440 Hz
   Optimized for Android WebView / Cordova APKs
========================================================== */


/* ==========================================================
   STANDARD GUITAR TUNING
========================================================== */

const GUITAR_STRINGS = [
    { note: "E2", frequency: 82.41, index: 0 },
    { note: "A2", frequency: 110.00, index: 1 },
    { note: "D3", frequency: 146.83, index: 2 },
    { note: "G3", frequency: 196.00, index: 3 },
    { note: "B3", frequency: 246.94, index: 4 },
    { note: "E4", frequency: 329.63, index: 5 }
];

const FFT_SIZE = 4096;
const MIN_FREQUENCY = 65;
const MAX_FREQUENCY = 400;
const MIN_CONFIDENCE = 0.60;
const MAX_CENTS = 50;
const HISTORY_SIZE = 5;
const IN_TUNE_ENTER = 5;
const IN_TUNE_EXIT = 10;


/* ==========================================================
   DOM ELEMENTS
========================================================== */

const startButton = document.getElementById("start-button");
const detectedNote = document.getElementById("detected-note");
const detectedOctave = document.getElementById("detected-octave");
const detectedFrequency = document.getElementById("detected-frequency");
const tuningStatus = document.getElementById("tuning-status");
const centsDisplay = document.getElementById("cents-display");
const meterIndicator = document.getElementById("meter-indicator");
const microphoneStatus = document.getElementById("microphone-status");

const stringsSection = document.querySelector(".strings-section");
const stringButtons = Array.from(
    document.querySelectorAll(".string-button")
);


/* ==========================================================
   ENGINE STATE
========================================================== */

let audioContext = null;
let analyser = null;
let microphoneSource = null;
let microphoneStream = null;
let animationFrame = null;

let isRunning = false;
let isStarting = false;
let isClosing = false;

let tuningMode = "auto";
let selectedString = null;
let lockedString = null;

let frequencyHistory = [];
let lastFrequency = null;
let smoothedFrequency = null;
let lastDetectedString = null;
let inTune = false;
let stableFrames = 0;

let autoLockedString = null;
let silenceFrames = 0;

let timeDomainBuffer = null;
let spectrumBuffer = null;
let lastUiUpdate = 0;
let lastValidDetection = 0;

let startRequestId = 0;


/* ==========================================================
   GENERAL HELPERS
========================================================== */

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function median(values) {
    if (!values.length) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    return sorted.length % 2
        ? sorted[middle]
        : (sorted[middle - 1] + sorted[middle]) / 2;
}

function frequencyToCents(frequency, targetFrequency) {
    if (
        !Number.isFinite(frequency) ||
        !Number.isFinite(targetFrequency) ||
        frequency <= 0 ||
        targetFrequency <= 0
    ) {
        return null;
    }

    return 1200 * Math.log2(frequency / targetFrequency);
}

function getNoteParts(note) {
    const match = /^([A-G])(\d)$/.exec(note);

    if (!match) return { note: "—", octave: "—" };

    return {
        note: match[1],
        octave: match[2]
    };
}

function getFrequencyFromBuffer() {
    if (!analyser || !timeDomainBuffer || !audioContext) return null;

    analyser.getFloatTimeDomainData(timeDomainBuffer);

    return detectPitchYIN(
        timeDomainBuffer,
        audioContext.sampleRate
    );
}


/* ==========================================================
   YIN FUNDAMENTAL FREQUENCY DETECTION
========================================================== */

function detectPitchYIN(buffer, sampleRate) {
    const size = buffer.length;

    if (size < 2) return null;

    let energy = 0;

    for (let i = 0; i < size; i++) {
        energy += buffer[i] * buffer[i];
    }

    if (energy / size < 0.000008) return null;

    const minTau = Math.max(
        2,
        Math.floor(sampleRate / MAX_FREQUENCY)
    );

    const maxTau = Math.min(
        Math.floor(sampleRate / MIN_FREQUENCY),
        Math.floor(size / 2)
    );

    if (maxTau <= minTau) return null;

    const difference = new Float64Array(maxTau + 1);
    const cumulativeMean = new Float64Array(maxTau + 1);

    difference[0] = 1;
    cumulativeMean[0] = 1;

    for (let tau = 1; tau <= maxTau; tau++) {
        let sum = 0;

        for (let i = 0; i < size - tau; i++) {
            const delta = buffer[i] - buffer[i + tau];
            sum += delta * delta;
        }

        difference[tau] = sum;
    }

    let runningSum = 0;

    for (let tau = 1; tau <= maxTau; tau++) {
        runningSum += difference[tau];

        cumulativeMean[tau] = runningSum > 0
            ? difference[tau] * tau / runningSum
            : 1;
    }

    const threshold = 0.10;
    let candidateTau = -1;

    for (let tau = minTau; tau <= maxTau; tau++) {
        if (cumulativeMean[tau] < threshold) {
            while (
                tau + 1 <= maxTau &&
                cumulativeMean[tau + 1] < cumulativeMean[tau]
            ) {
                tau++;
            }

            candidateTau = tau;
            break;
        }
    }

    if (candidateTau === -1) {
        let lowest = Infinity;

        for (let tau = minTau; tau <= maxTau; tau++) {
            if (cumulativeMean[tau] < lowest) {
                lowest = cumulativeMean[tau];
                candidateTau = tau;
            }
        }

        if (lowest > 0.30) return null;
    }

    const left = Math.max(minTau, candidateTau - 1);
    const right = Math.min(maxTau, candidateTau + 1);

    const y1 = cumulativeMean[left];
    const y2 = cumulativeMean[candidateTau];
    const y3 = cumulativeMean[right];

    const denominator = 2 * (2 * y2 - y1 - y3);

    let refinedTau = candidateTau;

    if (denominator !== 0 && left !== right) {
        refinedTau += (y1 - y3) / denominator;
    }

    const frequency = sampleRate / refinedTau;

    if (
        !Number.isFinite(frequency) ||
        frequency < MIN_FREQUENCY ||
        frequency > MAX_FREQUENCY
    ) {
        return null;
    }

    const confidence = 1 - cumulativeMean[candidateTau];

    if (confidence < MIN_CONFIDENCE) return null;

    return {
        frequency,
        confidence
    };
}


/* ==========================================================
   HARMONIC AND CONTINUITY VERIFICATION
========================================================== */

function verifyPitch(candidate) {
    if (!candidate) return null;

    let frequency = candidate.frequency;

    if (lastFrequency !== null && candidate.confidence > 0.75) {
        const ratio = frequency / lastFrequency;

        if (ratio > 1.85 && ratio < 2.15) {
            const halfFrequency = frequency / 2;
            if (halfFrequency >= MIN_FREQUENCY && halfFrequency <= MAX_FREQUENCY) {
                frequency = halfFrequency;
            }
        } 
        else if (ratio > 0.46 && ratio < 0.54) {
            const doubleFrequency = frequency * 2;
            if (doubleFrequency >= MIN_FREQUENCY && doubleFrequency <= MAX_FREQUENCY) {
                frequency = doubleFrequency;
            }
        }
    }

    return {
        frequency,
        confidence: candidate.confidence
    };
}


/* ==========================================================
   STRING DETECTION WITH AUTO-LOCK
========================================================== */

function findNearestString(frequency) {
    if (!Number.isFinite(frequency) || frequency <= 0) {
        return null;
    }

    let nearest = null;
    let smallestDistance = Infinity;

    for (const guitarString of GUITAR_STRINGS) {
        const cents = Math.abs(
            frequencyToCents(frequency, guitarString.frequency)
        );

        if (cents < smallestDistance) {
            smallestDistance = cents;
            nearest = guitarString;
        }
    }

    return nearest;
}

function detectString(frequency) {
    if (tuningMode === "manual" && selectedString) {
        return selectedString;
    }

    if (lockedString) {
        const cents = Math.abs(
            frequencyToCents(
                frequency,
                lockedString.frequency
            )
        );

        if (cents <= 100) return lockedString;
    }

    if (autoLockedString) {
        const centsFromLock = Math.abs(
            frequencyToCents(frequency, autoLockedString.frequency)
        );
        if (centsFromLock < 300) {
            return autoLockedString;
        } else {
            autoLockedString = null;
        }
    }

    const nearest = findNearestString(frequency);
    if (nearest) {
        autoLockedString = nearest;
    }
    return nearest;
}


/* ==========================================================
   FILTERING AND SMOOTHING
========================================================== */

function filterFrequency(frequency) {
    if (!Number.isFinite(frequency) || frequency <= MIN_FREQUENCY || frequency > MAX_FREQUENCY) {
        return null;
    }

    frequencyHistory.push(frequency);

    if (frequencyHistory.length > HISTORY_SIZE) {
        frequencyHistory.shift();
    }

    const medianFrequency = median(frequencyHistory);

    if (!Number.isFinite(medianFrequency) || medianFrequency <= 0) return null;

    if (smoothedFrequency === null || !Number.isFinite(smoothedFrequency) || smoothedFrequency <= 0) {
        smoothedFrequency = medianFrequency;
    } else {
        const alpha = 0.35;
        const logSmoothed = Math.log(smoothedFrequency);
        const logMedian = Math.log(medianFrequency);

        if (Number.isFinite(logSmoothed) && Number.isFinite(logMedian)) {
            smoothedFrequency = Math.exp(logSmoothed * (1 - alpha) + logMedian * alpha);
        } else {
            smoothedFrequency = medianFrequency;
        }
    }

    lastFrequency = smoothedFrequency;
    return smoothedFrequency;
}

function resetFrequencyHistory() {
    frequencyHistory.length = 0;
    lastFrequency = null;
    smoothedFrequency = null;
    lastDetectedString = null;
    autoLockedString = null;
    silenceFrames = 0;
    stableFrames = 0;
    inTune = false;
    lastValidDetection = 0;
}


/* ==========================================================
   DISPLAY
========================================================== */

function setStatus(message, className) {
    if (!tuningStatus) return;

    tuningStatus.textContent = message;
    tuningStatus.className = "tuning-status";

    if (className) {
        tuningStatus.classList.add(className);
    }
}

function resetDisplay() {
    if (detectedNote) detectedNote.textContent = "—";
    if (detectedOctave) detectedOctave.textContent = "—";
    if (detectedFrequency) detectedFrequency.textContent = "0.0 Hz";
    if (centsDisplay) centsDisplay.textContent = "—";

    if (meterIndicator) {
        meterIndicator.style.left = "50%";
    }

    setStatus("Ready", "");

    stringButtons.forEach(button => {
        button.classList.remove("selected", "in-tune");
    });
}

function updateMeter(cents) {
    if (!meterIndicator) return;

    const normalized = clamp(cents / MAX_CENTS, -1, 1);
    const position = 50 + normalized * 45;

    meterIndicator.style.left = `${position}%`;
}

function updateStringButtons(activeString) {
    stringButtons.forEach(button => {
        const isSelected =
            button.dataset.note === activeString?.note;

        button.classList.toggle("selected", isSelected);
        button.classList.toggle(
            "in-tune",
            isSelected && inTune
        );
    });
}

function updateDisplay(frequency, guitarString) {
    if (!guitarString) return;

    const parts = getNoteParts(guitarString.note);
    const cents = frequencyToCents(
        frequency,
        guitarString.frequency
    );

    if (cents === null) return;

    if (detectedNote) detectedNote.textContent = parts.note;
    if (detectedOctave) detectedOctave.textContent = parts.octave;

    if (detectedFrequency) {
        detectedFrequency.textContent = `${frequency.toFixed(1)} Hz`;
    }

    if (centsDisplay) {
        const roundedCents = Math.round(cents);
        const sign = roundedCents > 0 ? "+" : "";

        centsDisplay.textContent = `${sign}${roundedCents} cents`;
    }

    updateMeter(cents);

    if (inTune) {
        if (Math.abs(cents) > IN_TUNE_EXIT) {
            inTune = false;
        }
    } else if (Math.abs(cents) <= IN_TUNE_ENTER) {
        inTune = true;
    }

    if (inTune) {
        setStatus("In Tune", "in-tune");
    } else if (cents < 0) {
        setStatus("Tune Up", "too-low");
    } else {
        setStatus("Tune Down", "too-high");
    }

    updateStringButtons(guitarString);
}


/* ==========================================================
   AUTOMATIC / MANUAL CONTROLS
========================================================== */

function createModeControls() {
    if (!stringsSection) return;

    if (document.getElementById("tuning-mode-controls")) {
        return;
    }

    const container = document.createElement("div");
    container.id = "tuning-mode-controls";
    container.className = "tuning-mode-controls";

    const heading = document.createElement("div");
    heading.className = "tuning-mode-buttons";

    const autoButton = document.createElement("button");
    autoButton.type = "button";
    autoButton.className = "mode-button active";
    autoButton.dataset.mode = "auto";
    autoButton.textContent = "Auto Detect";

    const manualButton = document.createElement("button");
    manualButton.type = "button";
    manualButton.className = "mode-button";
    manualButton.dataset.mode = "manual";
    manualButton.textContent = "Manual";

    heading.append(autoButton, manualButton);
    container.appendChild(heading);

    stringsSection.insertBefore(
        container,
        stringsSection.firstChild
    );

    autoButton.addEventListener("click", () => {
        setTuningMode("auto");
    });

    manualButton.addEventListener("click", () => {
        setTuningMode("manual");
    });
}

function setTuningMode(mode) {
    tuningMode = mode === "manual" ? "manual" : "auto";

    if (tuningMode === "auto") {
        selectedString = null;
        lockedString = null;
    } else if (!selectedString) {
        selectedString = GUITAR_STRINGS[0];
    }

    const controls = document.querySelectorAll(
        "#tuning-mode-controls .mode-button"
    );

    controls.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.mode === tuningMode
        );
    });

    resetFrequencyHistory();
    updateStringButtons(selectedString);
}

function selectString(note, frequency) {
    const guitarString = GUITAR_STRINGS.find(item =>
        item.note === note &&
        Math.abs(item.frequency - frequency) < 0.1
    );

    if (!guitarString) return;

    selectedString = guitarString;
    lockedString = guitarString;
    tuningMode = "manual";

    document.querySelectorAll(
        "#tuning-mode-controls .mode-button"
    ).forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.mode === "manual"
        );
    });

    resetFrequencyHistory();
    updateStringButtons(guitarString);

    if (microphoneStatus && isRunning) {
        microphoneStatus.textContent =
            `Tuning ${guitarString.note} — pluck the string`;
    }
}


/* ==========================================================
   DETECTION LOOP
========================================================== */

function detectionLoop() {
    if (!isRunning || isClosing || !analyser) return;

    if (audioContext && audioContext.state === "suspended") {
        audioContext.resume().catch(() => {});
    }

    const now = performance.now();

    if (now - lastUiUpdate >= 35) {
        lastUiUpdate = now;

        const candidate = getFrequencyFromBuffer();
        const verified = verifyPitch(candidate);

        if (verified) {
            silenceFrames = 0;
            const frequency = filterFrequency(verified.frequency);

            if (frequency !== null) {
                const guitarString = detectString(frequency);

                if (guitarString) {
                    if (lastDetectedString !== guitarString.note) {
                        lastDetectedString = guitarString.note;
                        inTune = false;
                        frequencyHistory.length = 0;
                    }

                    lastValidDetection = now;
                    updateDisplay(frequency, guitarString);

                    if (microphoneStatus) {
                        microphoneStatus.textContent =
                            tuningMode === "manual"
                                ? `Manual mode — ${guitarString.note}`
                                : `Tuning ${guitarString.note}`;
                    }
                }
            }
        } else {
            silenceFrames++;
            if (silenceFrames > 15) {
                autoLockedString = null;
            }

            if (
                lastValidDetection &&
                now - lastValidDetection > 1200
            ) {
                if (microphoneStatus) {
                    microphoneStatus.textContent = "Listening — pluck a string";
                }
            }
        }
    }

    animationFrame = requestAnimationFrame(detectionLoop);
}


/* ==========================================================
   START TUNER
========================================================== */

async function startTuner() {
    if (isRunning || isStarting || isClosing) return;

    if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
        if (microphoneStatus) {
            microphoneStatus.textContent =
                "Microphone access is not supported by this browser.";
        }

        setStatus("Microphone unavailable", "error");
        return;
    }

    isStarting = true;
    const requestId = ++startRequestId;

    if (startButton) {
        startButton.disabled = true;
        startButton.textContent = "Requesting Microphone…";
    }

    if (microphoneStatus) {
        microphoneStatus.textContent = "Please allow microphone access.";
    }

    let requestedStream = null;
    let requestedContext = null;

    try {
        requestedStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
                channelCount: 1,
                googEchoCancellation: false,
                googNoiseSuppression: false,
                googAutoGainControl: false,
                googHighpassFilter: false
            }
        });

        requestedStream.getAudioTracks().forEach(track => {
            track.addEventListener('ended', () => {
                if (isRunning) stopTuner();
            });
            track.addEventListener('mute', () => {
                console.warn("Microphone stream muted by system audio focus.");
            });
        });

        if (isClosing || requestId !== startRequestId) {
            requestedStream.getTracks().forEach(track => track.stop());
            return;
        }

        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) {
            throw new Error("AudioContext is not supported.");
        }

        requestedContext = new AudioContextClass();

        if (requestedContext.state === "suspended") {
            await requestedContext.resume();
        }

        if (isClosing || requestId !== startRequestId) {
            requestedStream.getTracks().forEach(track => track.stop());
            await requestedContext.close().catch(() => {});
            return;
        }

        const requestedAnalyser = requestedContext.createAnalyser();

        requestedAnalyser.fftSize = FFT_SIZE;
        requestedAnalyser.smoothingTimeConstant = 0.02;

        const requestedSource =
            requestedContext.createMediaStreamSource(requestedStream);

        requestedSource.connect(requestedAnalyser);

        microphoneStream = requestedStream;
        audioContext = requestedContext;
        analyser = requestedAnalyser;
        microphoneSource = requestedSource;

        timeDomainBuffer = new Float32Array(analyser.fftSize);
        spectrumBuffer = new Float32Array(analyser.frequencyBinCount);

        resetFrequencyHistory();

        isRunning = true;
        lastValidDetection = 0;
        lastUiUpdate = 0;

        if (startButton) {
            startButton.disabled = false;
            startButton.textContent = "■ Stop Tuner";
            startButton.classList.add("running");
        }

        if (microphoneStatus) {
            microphoneStatus.textContent = "Listening — pluck a string";
        }

        setStatus("Listening", "");
        animationFrame = requestAnimationFrame(detectionLoop);

    } catch (error) {
        if (requestedStream) {
            requestedStream.getTracks().forEach(track => track.stop());
        }

        if (requestedContext && requestedContext.state !== "closed") {
            await requestedContext.close().catch(() => {});
        }

        if (!isClosing && requestId === startRequestId) {
            console.error("Guitar tuner:", error);

            if (microphoneStatus) {
                microphoneStatus.textContent =
                    error.name === "NotAllowedError"
                        ? "Microphone permission was denied."
                        : "Unable to start the tuner. Please try again.";
            }

            setStatus("Unable to start", "error");
        }

    } finally {
        if (requestId === startRequestId) {
            isStarting = false;

            if (startButton && !isClosing) {
                startButton.disabled = false;

                if (!isRunning) {
                    startButton.textContent = "🎤 Start Tuner";
                    startButton.classList.remove("running");
                }
            }
        }
    }
}


/* ==========================================================
   STOP TUNER AND RELEASE AUDIO RESOURCES
========================================================== */

async function stopTuner() {
    startRequestId++;

    isRunning = false;
    isStarting = false;

    if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }

    if (microphoneSource) {
        try {
            microphoneSource.disconnect();
        } catch (_) {}

        microphoneSource = null;
    }

    if (microphoneStream) {
        microphoneStream.getTracks().forEach(track => {
            try {
                track.stop();
            } catch (_) {}
        });

        microphoneStream = null;
    }

    if (audioContext) {
        const contextToClose = audioContext;
        audioContext = null;

        if (contextToClose.state !== "closed") {
            try {
                await contextToClose.close();
            } catch (_) {}
        }
    }

    analyser = null;
    timeDomainBuffer = null;
    spectrumBuffer = null;

    resetFrequencyHistory();
    resetDisplay();

    if (startButton && !isClosing) {
        startButton.disabled = false;
        startButton.textContent = "🎤 Start Tuner";
        startButton.classList.remove("running");
    }

    if (microphoneStatus && !isClosing) {
        microphoneStatus.textContent = "Press Start Tuner to begin";
    }
}


/* ==========================================================
   PAGE / OVERLAY LIFECYCLE
========================================================== */

function cleanupForPageExit() {
    if (isClosing) return;

    isClosing = true;

    startRequestId++;

    isRunning = false;
    isStarting = false;

    if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }

    if (microphoneSource) {
        try {
            microphoneSource.disconnect();
        } catch (_) {}

        microphoneSource = null;
    }

    if (microphoneStream) {
        microphoneStream.getTracks().forEach(track => {
            try {
                track.stop();
            } catch (_) {}
        });

        microphoneStream = null;
    }

    if (audioContext) {
        const contextToClose = audioContext;
        audioContext = null;

        if (contextToClose.state !== "closed") {
            contextToClose.close().catch(() => {});
        }
    }

    analyser = null;
    timeDomainBuffer = null;
    spectrumBuffer = null;
}

window.addEventListener("pagehide", cleanupForPageExit);
window.addEventListener("beforeunload", cleanupForPageExit);


/* ==========================================================
   EVENT LISTENERS
========================================================== */

if (startButton) {
    startButton.addEventListener("click", () => {
        if (isRunning || isStarting) {
            stopTuner();
        } else {
            startTuner();
        }
    });
}

stringButtons.forEach(button => {
    button.addEventListener("click", () => {
        selectString(
            button.dataset.note,
            Number(button.dataset.frequency)
        );
    });
});


/* ==========================================================
   INITIALIZATION
========================================================== */

createModeControls();
resetDisplay();

if (microphoneStatus) {
    microphoneStatus.textContent = "Press Start Tuner to begin";
}

window.handleLayerVisibility = async function (isTop) {
    if (!isTop) {
        if (isRunning) {
            await stopTuner();
        }
    } else {
        resetFrequencyHistory();
        resetDisplay();
        if (microphoneStatus) {
            microphoneStatus.textContent = "Press Start Tuner to begin";
        }
    }
};