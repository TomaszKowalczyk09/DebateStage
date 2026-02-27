// operator.js - logika panelu operatora (prosty szkielet)

// Przykładowe dane (do dynamicznej obsługi w przyszłości)
const operatorData = {
    currentSpeaker: {
        name: 'Maxi Muster',
        star: true,
        warn: true
    },
    speakers: [
        'Ann-Katrin Christmann (3A)',
        'Antje Löw (2B)',
        'Benno Weinmann (1C)'
    ]
};

// Tu można dodać obsługę przycisków, drag&drop, itp.
// Np. podświetlanie aktywnego mówcy, zmiana kolejności, ostrzeżenia, itp.

document.addEventListener('DOMContentLoaded', () => {
    // Przykład: obsługa kliknięcia przycisku ostrzeżenia
    document.querySelectorAll('.operator-actions button[title="Ostrzeżenie"]').forEach(btn => {
        btn.addEventListener('click', () => {
            alert('Ostrzeżenie dla mówcy!');
        });
    });
});
