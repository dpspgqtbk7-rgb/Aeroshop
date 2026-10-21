// js/modules/emergency.js

let audioContext = null;
let noiseNode = null;
let isNoisePlaying = false;

// Generador de Ruido Marrón mediante Web Audio API
export function toggleBrownNoise() {
    if (isNoisePlaying) {
        stopBrownNoise();
    } else {
        startBrownNoise();
    }
    return isNoisePlaying;
}

function startBrownNoise() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.0;
    }

    noiseNode = audioContext.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.15;

    noiseNode.connect(gainNode);
    gainNode.connect(audioContext.destination);
    noiseNode.start();
    isNoisePlaying = true;
}

function stopBrownNoise() {
    if (noiseNode) {
        noiseNode.stop();
        noiseNode.disconnect();
        noiseNode = null;
    }
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
    isNoisePlaying = false;
}

// Respiración Guiada (Ritmo 4-4-6)
let breathingTimer = null;
let isBreathingActive = false;

export function toggleBreathingGuide() {
    const circle = document.getElementById('breathingCircle');
    const status = document.getElementById('btnBreathingToggle');
    if (!circle) return;

    if (isBreathingActive) {
        clearTimeout(breathingTimer);
        isBreathingActive = false;
        circle.className = 'breathing-circle';
        if (status) status.innerText = '▶️ Iniciar Respiración Guiada';
        return;
    }

    isBreathingActive = true;
    let step = 0;

    const cycle = () => {
        if (!isBreathingActive) return;
        if (step === 0) {
            circle.className = 'breathing-circle inhale';
            if (status) status.innerText = '🫁 Inhala (4s)...';
            step = 1;
            breathingTimer = setTimeout(cycle, 4000);
        } else if (step === 1) {
            circle.className = 'breathing-circle hold';
            if (status) status.innerText = '⏸️ Sostén (4s)...';
            step = 2;
            breathingTimer = setTimeout(cycle, 4000);
        } else {
            circle.className = 'breathing-circle exhale';
            if (status) status.innerText = '😮‍💨 Exhala (6s)...';
            step = 0;
            breathingTimer = setTimeout(cycle, 6000);
        }
    };
    cycle();
}