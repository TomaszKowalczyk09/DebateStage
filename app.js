// Podstawowy szkielet aplikacji debatowej

// Przykładowe dane (do podmiany przez panel operatora)
const data = {
    eventTitle: 'Debata Szkolna 2026',
    topic: 'TOP 4 · Debata szkolna',
    question: 'Czy szkoła powinna wprowadzić mundurki?',
    currentSpeaker: {
        name: 'Maxi Muster',
        warn: true,
        star: true
    },
    speakers: [
        'Anna Nowak (3A)',
        'Jan Kowalski (2B)',
        'Maria Zielińska (1C)',
        'Piotr Nowakowski (3B)',
        'Katarzyna Lewandowska (2A)',
        'Tomasz Wiśniewski (1A)',
        'Julia Kaczmarek (3C)',
        'Michał Mazur (2C)',
        'Aleksandra Wójcik (1B)',
        'Paweł Dąbrowski (3A)'
    ]
};

function updateClock() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('clock').textContent = `${h}:${m}`;
}

function renderDebateScreen() {
    document.getElementById('event-title').textContent = data.eventTitle;
    document.getElementById('debate-topic').textContent = data.topic;
    document.getElementById('debate-question').textContent = data.question;

    // Aktualny mówca
    const curr = data.currentSpeaker;
    let currHtml = `<span class="mic">🎤</span> <span class="name">${curr.name}</span>`;
    if (curr.star) currHtml += ' <span class="warn">★</span>';
    if (curr.warn) currHtml += ' <span class="warn" style="color:#e67c1f;">⚠</span>';
    document.getElementById('current-speaker').innerHTML = currHtml;

    // Lista mówców
    const speakersList = document.getElementById('speakers-list');
    speakersList.innerHTML = data.speakers.map(s => `<li>${s}</li>`).join('');
}

window.onload = function() {
    renderDebateScreen();
    updateClock();
    setInterval(updateClock, 10000);
};
