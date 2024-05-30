const bpmInput = document.getElementById('bpm');
const beat1Volume = document.getElementById('beat1-volume');
const beat2Volume = document.getElementById('beat2-volume');
const beat3Volume = document.getElementById('beat3-volume');
const beat4Volume = document.getElementById('beat4-volume');
const beat1FadeVolume = document.getElementById('beat1-fade-volume');
const beat2FadeVolume = document.getElementById('beat2-fade-volume');
const beat3FadeVolume = document.getElementById('beat3-fade-volume');
const beat4FadeVolume = document.getElementById('beat4-fade-volume');
const beat1FadeDuration = document.getElementById('beat1-fade-duration');
const beat2FadeDuration = document.getElementById('beat2-fade-duration');
const beat3FadeDuration = document.getElementById('beat3-fade-duration');
const beat4FadeDuration = document.getElementById('beat4-fade-duration');
const startStopButton = document.getElementById('start-stop');
const metronomeVisual = document.getElementById('metronome-visual');

let isRunning = false;
let currentBeat = 0;
let nextNoteTime = 0.0;
let scheduleAheadTime = 0.1; // seconds
let intervalId = null;
let audioContext = null;
let sequence = [3, 0, 1, 2];

const beats = [
    { volume: beat1Volume, fadeVolume: beat1FadeVolume, fadeDuration: beat1FadeDuration, element: null },
    { volume: beat2Volume, fadeVolume: beat2FadeVolume, fadeDuration: beat2FadeDuration, element: null },
    { volume: beat3Volume, fadeVolume: beat3FadeVolume, fadeDuration: beat3FadeDuration, element: null },
    { volume: beat4Volume, fadeVolume: beat4FadeVolume, fadeDuration: beat4FadeDuration, element: null }
];

function createVisualBeats() {
    metronomeVisual.innerHTML = '';
    beats.forEach((beat, index) => {
        const beatElement = document.createElement('div');
        beatElement.classList.add('beat');
        if (index === 0) beatElement.classList.add('active');
        metronomeVisual.appendChild(beatElement);
        beats[index].element = beatElement;
    });
}

function playBeat(beatIndex, time) {
    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = beats[beatIndex].volume.value;
    osc.frequency.value = 1000; // Frequency of the click sound
    osc.start(time);
    osc.stop(time + 0.05);
}

function updateVisualBeat(beatIndex) {
    beats.forEach((beat, index) => {
        if (index === sequence[beatIndex]) {
            beat.element.classList.add('active');
        } else {
            beat.element.classList.remove('active');
        }
    });
}

function nextNote() {
    const secondsPerBeat = 60.0 / bpmInput.value;
    nextNoteTime += secondsPerBeat;

    currentBeat = (currentBeat + 1) % 4;
    updateVisualBeat(currentBeat);
}

function scheduler() {
    while (nextNoteTime < audioContext.currentTime + scheduleAheadTime) {
        playBeat(currentBeat, nextNoteTime);
        nextNote();
    }
}

function startMetronome() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    nextNoteTime = audioContext.currentTime;
    currentBeat = 0;

    // Apply fade to all beats
    beats.forEach((_, index) => applyFade(index));

    intervalId = setInterval(scheduler, 25);
}

function stopMetronome() {
    clearInterval(intervalId);
    audioContext.close();
}

function fadeVolume(element, startVolume, endVolume, duration) {
    const stepTime = 50; // in milliseconds
    const steps = duration * 1000 / stepTime;
    const volumeChange = (endVolume - startVolume) / steps;
    let currentVolume = startVolume;
    let step = 0;

    const fadeInterval = setInterval(() => {
        if (step >= steps) {
            clearInterval(fadeInterval);
            element.value = endVolume;
            return;
        }
        currentVolume += volumeChange;
        element.value = currentVolume;
        step++;
    }, stepTime);
}

function applyFade(beatIndex) {
    const beat = beats[beatIndex];
    const startVolume = parseFloat(beat.volume.value);
    const endVolume = parseFloat(beat.fadeVolume.value);
    const duration = parseInt(beat.fadeDuration.value);
    fadeVolume(beat.volume, startVolume, endVolume, duration);
}

startStopButton.addEventListener('click', () => {
    if (isRunning) {
        stopMetronome();
        startStopButton.textContent = 'Start';
    } else {
        startMetronome();
        startStopButton.textContent = 'Stop';
    }
    isRunning = !isRunning;
});

bpmInput.addEventListener('input', () => {
    if (isRunning) {
        stopMetronome();
        startMetronome();
    }
});

createVisualBeats();
