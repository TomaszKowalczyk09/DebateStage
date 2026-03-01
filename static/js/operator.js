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

function renderCurrentSpeaker() {
    const topicEl = document.getElementById('operator-topic');
    const currentNameEl = document.getElementById('operator-current-name');
    const starBtn = document.getElementById('toggle-star');
    const warnBtn = document.getElementById('toggle-warn');

    topicEl.textContent = appState.topic;

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

    appState = await requestJson('/api/state/', {
        method: 'PATCH',
        body: JSON.stringify({ currentSpeakerIndex: index }),
    });
    render();
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

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('add-speaker-form');
    const input = document.getElementById('add-speaker-input');
    const list = document.getElementById('operator-speakers-list');

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

    await loadState();
});
