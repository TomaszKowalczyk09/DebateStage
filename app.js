// Podstawowy szkielet aplikacji debatowej

// Dane konfiguracyjne (przykład)
const config = {
    temat: '',
    mówcy: [],
    czasMowy: 300, // sekundy (5 min)
};

// Inicjalizacja aplikacji
function init() {
    const app = document.getElementById('app');
    app.innerHTML = `<h1>System debatowy</h1><p>Wkrótce konfiguracja i ekran projektora...</p>`;
}

window.onload = init;
