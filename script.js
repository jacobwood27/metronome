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
let intervalId = null;

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

function playBeat(beatIndex) {
    const audio = new Audio('click.wav');
    audio.volume = parseFloat(beats[beatIndex].volume.value);
    audio.play();
}

function updateVisualBeat(beatIndex) {
    beats.forEach((beat, index) => {
        if (index === beatIndex) {
            beat.element.classList.add('active');
        } else {
            beat.element.classList.remove('active');
        }
    });
}

function startMetronome() {
    const interval = (60 / bpmInput.value) * 1000;
    intervalId = setInterval(() => {
        playBeat(currentBeat);
        updateVisualBeat(currentBeat);
        currentBeat = (currentBeat + 1) % 4;
    }, interval);
}

function stopMetronome() {
    clearInterval(intervalId);
}

function fadeVolume(audioElement, inputElement, startVolume, endVolume, duration) {
    const stepTime = 50; // in milliseconds
    const steps = duration / stepTime;
    const volumeChange = (endVolume - startVolume) / steps;
    let currentVolume = startVolume;
    let step = 0;

    const fadeInterval = setInterval(() => {
        if (step >= steps) {
            clearInterval(fadeInterval);
            audioElement.volume = endVolume;
            inputElement.value = endVolume;
            return;
        }
        currentVolume += volumeChange;
        audioElement.volume = currentVolume;
        inputElement.value = currentVolume;
        step++;
    }, stepTime);
}

function applyFade(beatIndex) {
    const beat = beats[beatIndex];
    const startVolume = parseFloat(beat.volume.value);
    const endVolume = parseFloat(beat.fadeVolume.value);
    const duration = parseFloat(beat.fadeDuration.value) * 1000; // Convert seconds to milliseconds

    // Create an audio element for the fade effect
    const audioElement = new Audio('click.wav');
    audioElement.volume = startVolume;

    fadeVolume(audioElement, beat.volume, startVolume, endVolume, duration);
}

startStopButton.addEventListener('click', () => {
    if (isRunning) {
        stopMetronome();
        startStopButton.textContent = 'Start';
    } else {
        startMetronome();
        startStopButton.textContent = 'Stop';
        // Apply fade to all beats
        for (let i = 0; i < beats.length; i++) {
            applyFade(i);
        }
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
