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
        data[i] *= 3.0; // Ganancia compensatoria
    }

    noiseNode = audioContext.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.15; // Volumen suave

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