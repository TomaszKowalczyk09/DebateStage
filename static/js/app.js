function updateClock() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('clock').textContent = `${h}:${m}`;
}

let audioContext = null;
const soundState = {
    speechKey: null,
    warningPlayed: false,
    endPlayed: false,
    lastTimerSeconds: null,
};

function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

function playTone(frequencyHz, durationSeconds, volume = 0.1, delaySeconds = 0) {
    const context = getAudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequencyHz;
    gainNode.gain.value = volume;

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    const startTime = context.currentTime + delaySeconds;
    oscillator.start(startTime);
    oscillator.stop(startTime + durationSeconds);
}

function playWarningSound() {
    playTone(900, 0.12, 0.12, 0);
}

function playEndSound() {
    playTone(600, 0.1, 0.12, 0);
    playTone(600, 0.1, 0.12, 0.15);
    playTone(600, 0.16, 0.14, 0.3);
}

function getSpeechKey(data) {
    if (!data.currentSpeaker) {
        return 'none';
    }
    return `${data.currentSpeaker.id}`;
}

function handleAudioSignals(data) {
    const speechKey = getSpeechKey(data);
    if (soundState.speechKey !== speechKey) {
        soundState.speechKey = speechKey;
        soundState.warningPlayed = false;
        soundState.endPlayed = false;
        soundState.lastTimerSeconds = null;
    }

    if (data.timerSeconds > 15) {
        soundState.warningPlayed = false;
    }

    if (!data.timerRunning && data.timerSeconds > 0) {
        soundState.endPlayed = false;
    }

    if (!data.timerRunning || data.soundMuted) {
        soundState.lastTimerSeconds = data.timerSeconds;
        return;
    }

    const previousSeconds = soundState.lastTimerSeconds;

    if (
        data.soundWarningEnabled
        && !soundState.warningPlayed
        && data.timerSeconds === 15
        && (previousSeconds === null || previousSeconds > 15)
    ) {
        playWarningSound();
        soundState.warningPlayed = true;
    }

    if (
        data.soundEndEnabled
        && !soundState.endPlayed
        && data.timerSeconds === 0
        && (previousSeconds === null || previousSeconds > 0)
    ) {
        playEndSound();
        soundState.endPlayed = true;
    }

    soundState.lastTimerSeconds = data.timerSeconds;
}

function formatSecondsToClock(totalSeconds) {
    const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
    const minutes = Math.floor(safeSeconds / 60).toString().padStart(2, '0');
    const seconds = (safeSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
}

function renderDebateScreen(data) {
    document.getElementById('event-title').textContent = data.eventTitle;
    document.getElementById('debate-topic').textContent = data.topic;
    document.getElementById('debate-question').textContent = data.question;

    const current = data.currentSpeaker;
    const currentSpeakerNode = document.getElementById('current-speaker');

    if (!current) {
        currentSpeakerNode.innerHTML = '<span class="mic">🎤</span><span class="name">Brak mówcy</span>';
    } else {
        let currentHtml = `<span class="mic">🎤</span> <span class="name">${current.name}</span>`;
        if (current.star) currentHtml += ' <span class="warn">★</span>';
        if (current.warn) currentHtml += ' <span class="warn" style="color:#e67c1f;">⚠</span>';
        currentSpeakerNode.innerHTML = currentHtml;
    }

    const speakersList = document.getElementById('speakers-list');
    const visibleSpeakers = data.currentSpeaker
        ? data.speakers.filter((speaker) => speaker.id !== data.currentSpeaker.id)
        : data.speakers;
    speakersList.innerHTML = visibleSpeakers
        .map((speaker, index) => {
            if (index === 0) {
                return `<li class="next-speaker"><span class="next-badge">Następny:</span> ${speaker.name}</li>`;
            }
            return `<li>${speaker.name}</li>`;
        })
        .join('');

    const timerDisplay = document.getElementById('timer-display');
    timerDisplay.textContent = formatSecondsToClock(data.timerSeconds);
    timerDisplay.classList.toggle('running', Boolean(data.timerRunning));
    timerDisplay.classList.toggle('paused', !data.timerRunning);

    handleAudioSignals(data);
}

async function refreshData() {
    try {
        const response = await fetch('/api/state/');
        if (!response.ok) {
            return;
        }
        const data = await response.json();
        renderDebateScreen(data);
    } catch {
    }
}

window.addEventListener('load', () => {
    const unlockAudio = async () => {
        try {
            const context = getAudioContext();
            if (context.state === 'suspended') {
                await context.resume();
            }
        } catch {
        }
    };

    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });

    updateClock();
    refreshData();
    setInterval(updateClock, 10000);
    setInterval(refreshData, 1000);
});
