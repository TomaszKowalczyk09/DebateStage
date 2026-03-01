function updateClock() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('clock').textContent = `${h}:${m}`;
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
    speakersList.innerHTML = data.speakers.map((speaker) => `<li>${speaker.name}</li>`).join('');
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
    updateClock();
    refreshData();
    setInterval(updateClock, 10000);
    setInterval(refreshData, 2000);
});
