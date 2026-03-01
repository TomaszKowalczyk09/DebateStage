function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i += 1) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === `${name}=`) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

let appState = null;

function formatSecondsToClock(totalSeconds) {
    const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
    const minutes = Math.floor(safeSeconds / 60).toString().padStart(2, '0');
    const seconds = (safeSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
}

function getInputValue(elementId, fallback = '') {
    const element = document.getElementById(elementId);
    if (!element) {
        return fallback;
    }
    return element.value;
}

function setInputValueUnlessFocused(elementId, value) {
    const element = document.getElementById(elementId);
    if (!element) {
        return;
    }
    if (document.activeElement !== element) {
        element.value = value;
    }
}

function setCheckboxValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (!element) {
        return;
    }
    element.checked = Boolean(value);
}

function getCheckboxValue(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
        return false;
    }
    return Boolean(element.checked);
}

function renderCurrentSpeaker() {
    const topicEl = document.getElementById('operator-topic');
    const currentNameEl = document.getElementById('operator-current-name');
    const starBtn = document.getElementById('toggle-star');
    const warnBtn = document.getElementById('toggle-warn');
    const timerDisplay = document.getElementById('operator-timer-display');
    const timerToggleButton = document.getElementById('timer-toggle');

    topicEl.textContent = appState.topic;
    timerDisplay.textContent = formatSecondsToClock(appState.timerSeconds);
    timerToggleButton.textContent = appState.timerRunning ? 'Pauza' : 'Start';

    if (!appState.currentSpeaker) {
        currentNameEl.textContent = 'Brak mówcy';
        starBtn.disabled = true;
        warnBtn.disabled = true;
        return;
    }

    currentNameEl.textContent = appState.currentSpeaker.name;
    starBtn.disabled = false;
    warnBtn.disabled = false;
    starBtn.style.opacity = appState.currentSpeaker.star ? '1' : '0.5';
    warnBtn.style.opacity = appState.currentSpeaker.warn ? '1' : '0.5';
}

function renderConfigInputs() {
    setInputValueUnlessFocused('event-title-input', appState.eventTitle);
    setInputValueUnlessFocused('topic-input', appState.topic);
    setInputValueUnlessFocused('question-input', appState.question);
    setInputValueUnlessFocused('default-seconds-input', String(appState.defaultSpeechSeconds));
    setCheckboxValue('sound-warning-input', appState.soundWarningEnabled);
    setCheckboxValue('sound-end-input', appState.soundEndEnabled);
    setCheckboxValue('sound-muted-input', appState.soundMuted);
}

function renderSpeakers() {
    const list = document.getElementById('operator-speakers-list');

    list.innerHTML = appState.speakers
        .map((speaker, index) => {
            const isCurrent = appState.currentSpeaker && appState.currentSpeaker.id === speaker.id;
            return `
                <li>
                    <span class="drag">⋮⋮</span>
                    <span style="flex:1; font-weight:${isCurrent ? '700' : '400'}">${speaker.name}</span>
                    <button type="button" class="move-btn" data-action="up" data-id="${speaker.id}" title="W górę" ${index === 0 ? 'disabled' : ''}>↑</button>
                    <button type="button" class="move-btn" data-action="down" data-id="${speaker.id}" title="W dół" ${index === appState.speakers.length - 1 ? 'disabled' : ''}>↓</button>
                    <button type="button" class="move-btn" data-action="select" data-id="${speaker.id}" title="Ustaw jako aktywnego">🎤</button>
                    <button type="button" class="remove-btn" data-action="remove" data-id="${speaker.id}" title="Usuń">✕</button>
                </li>
            `;
        })
        .join('');
}

function render() {
    renderConfigInputs();
    renderCurrentSpeaker();
    renderSpeakers();
}

async function requestJson(url, options = {}) {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
            ...options.headers,
        },
        ...options,
    });

    if (!response.ok) {
        throw new Error('Błąd API');
    }

    return response.json();
}

async function loadState() {
    appState = await requestJson('/api/state/');
    render();
}

async function patchState(payload) {
    appState = await requestJson('/api/state/', {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
    render();
}

async function addSpeaker(name) {
    appState = await requestJson('/api/speakers/', {
        method: 'POST',
        body: JSON.stringify({ name }),
    });
    render();
}

async function moveSpeaker(id, direction) {
    appState = await requestJson(`/api/speakers/${id}/move/`, {
        method: 'POST',
        body: JSON.stringify({ direction }),
    });
    render();
}

async function removeSpeaker(id) {
    appState = await requestJson(`/api/speakers/${id}/`, {
        method: 'DELETE',
    });
    render();
}

async function selectSpeaker(id) {
    const index = appState.speakers.findIndex((speaker) => speaker.id === id);
    if (index < 0) {
        return;
    }

    await patchState({ currentSpeakerIndex: index });
}

async function toggleFlag(flagName) {
    if (!appState.currentSpeaker) {
        return;
    }

    const nextValue = !appState.currentSpeaker[flagName];
    appState = await requestJson(`/api/speakers/${appState.currentSpeaker.id}/flags/`, {
        method: 'PATCH',
        body: JSON.stringify({ [flagName]: nextValue }),
    });
    render();
}

async function saveDebateConfig() {
    const eventTitle = getInputValue('event-title-input', '').trim();
    const topic = getInputValue('topic-input', '').trim();
    const question = getInputValue('question-input', '').trim();
    const defaultSpeechSeconds = Number(getInputValue('default-seconds-input', '0'));
    const soundWarningEnabled = getCheckboxValue('sound-warning-input');
    const soundEndEnabled = getCheckboxValue('sound-end-input');
    const soundMuted = getCheckboxValue('sound-muted-input');

    if (!eventTitle || !topic || !question || defaultSpeechSeconds < 1) {
        return;
    }

    await patchState({
        eventTitle,
        topic,
        question,
        defaultSpeechSeconds,
        soundWarningEnabled,
        soundEndEnabled,
        soundMuted,
    });
}

async function toggleTimer() {
    await patchState({ timerCommand: appState.timerRunning ? 'pause' : 'start' });
}

async function resetTimer() {
    await patchState({ timerCommand: 'reset' });
}

async function adjustTimerBy(deltaSeconds) {
    const nextTimerSeconds = Math.max(0, (Number(appState.timerSeconds) || 0) + deltaSeconds);
    await patchState({ timerSeconds: nextTimerSeconds });
}

document.addEventListener('DOMContentLoaded', async () => {
    const configForm = document.getElementById('debate-config-form');
    const form = document.getElementById('add-speaker-form');
    const input = document.getElementById('add-speaker-input');
    const list = document.getElementById('operator-speakers-list');

    configForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        await saveDebateConfig();
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = input.value.trim();
        if (!name) {
            return;
        }

        await addSpeaker(name);
        input.value = '';
    });

    list.addEventListener('click', async (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) {
            return;
        }

        const action = button.dataset.action;
        const id = Number(button.dataset.id);

        if (action === 'up') {
            await moveSpeaker(id, 'up');
            return;
        }
        if (action === 'down') {
            await moveSpeaker(id, 'down');
            return;
        }
        if (action === 'remove') {
            await removeSpeaker(id);
            return;
        }
        if (action === 'select') {
            await selectSpeaker(id);
        }
    });

    document.getElementById('toggle-star').addEventListener('click', async () => {
        await toggleFlag('star');
    });

    document.getElementById('toggle-warn').addEventListener('click', async () => {
        await toggleFlag('warn');
    });

    document.getElementById('timer-toggle').addEventListener('click', async () => {
        await toggleTimer();
    });

    document.getElementById('timer-reset').addEventListener('click', async () => {
        await resetTimer();
    });

    document.getElementById('timer-minus').addEventListener('click', async () => {
        await adjustTimerBy(-15);
    });

    document.getElementById('timer-plus').addEventListener('click', async () => {
        await adjustTimerBy(15);
    });

    await loadState();
    setInterval(loadState, 1000);
});
