// js/modules/emergency.js

let audioContext = null;
let noiseNode = null;
let isNoisePlaying = false;

const TEXTO_PLAY = '🎧 Escuchar Ruido Marrón Calmante';
const TEXTO_STOP = '⏸️ Detener Ruido Marrón';

function actualizarBotonRuido() {
    const btn = document.getElementById('btnAudioEmergency');
    const txt = document.getElementById('btnAudioText');
    if (btn) btn.classList.toggle('audio-playing', isNoisePlaying);
    if (txt) txt.textContent = isNoisePlaying ? TEXTO_STOP : TEXTO_PLAY;
}

// Generador de Ruido Marrón mediante Web Audio API
export function toggleBrownNoise() {
    if (isNoisePlaying) {
        stopBrownNoise();
    } else {
        startBrownNoise();
    }
    actualizarBotonRuido();
    return isNoisePlaying;
}

function startBrownNoise() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;

    audioContext = new Ctx();
    // En iPhone el audio nace "dormido" hasta que el usuario toca algo
    if (audioContext.state === 'suspended') audioContext.resume();

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
        try { noiseNode.stop(); } catch (e) { /* ya estaba detenido */ }
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

function detenerRespiracion() {
    const circle = document.getElementById('breathingCircle');
    const status = document.getElementById('btnBreathingToggle');
    clearTimeout(breathingTimer);
    isBreathingActive = false;
    if (circle) circle.className = 'breathing-circle';
    if (status) status.textContent = '▶️ Iniciar Respiración Guiada';
}

export function toggleBreathingGuide() {
    const circle = document.getElementById('breathingCircle');
    const status = document.getElementById('btnBreathingToggle');
    if (!circle) return;

    if (isBreathingActive) {
        detenerRespiracion();
        return;
    }

    isBreathingActive = true;
    let step = 0;

    const cycle = () => {
        if (!isBreathingActive) return;
        if (step === 0) {
            circle.className = 'breathing-circle inhale';
            if (status) status.textContent = '🫁 Inhala (4s)...';
            step = 1;
            breathingTimer = setTimeout(cycle, 4000);
        } else if (step === 1) {
            circle.className = 'breathing-circle hold';
            if (status) status.textContent = '⏸️ Sostén (4s)...';
            step = 2;
            breathingTimer = setTimeout(cycle, 4000);
        } else {
            circle.className = 'breathing-circle exhale';
            if (status) status.textContent = '😮‍💨 Exhala (6s)...';
            step = 0;
            breathingTimer = setTimeout(cycle, 6000);
        }
    };
    cycle();
}

// Se llama al cerrar la pantalla de emergencia: apaga sonido y respiración
export function stopAllEmergency() {
    if (isNoisePlaying) {
        stopBrownNoise();
        actualizarBotonRuido();
    }
    if (isBreathingActive) detenerRespiracion();
}
