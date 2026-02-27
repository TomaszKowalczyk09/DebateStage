1. Cel produktu
Stworzyć prosty system do obsługi debat, który:

wyświetla na projektorze temat debaty, aktualnego mówcę i czytelny timer,

umożliwia prowadzącemu łatwe sterowanie czasem (start/stop, następny mówca),

automatycznie odtwarza sygnały dźwiękowe na 15 sekund przed końcem i w momencie zakończenia czasu.

System ma być:

maksymalnie prosty w obsłudze podczas wydarzenia,

możliwy do uruchomienia z jednego zwykłego laptopa, w przeglądarce (bez skomplikowanej instalacji).

2. Grupy użytkowników
Operator (prowadzący debatę)

Konfiguruje debatę (temat, lista mówców, czas mów).

Podczas wydarzenia przełącza mówców, startuje i zatrzymuje timer.

Reaguje na sytuacje niestandardowe (przedłużenie/skrót czasu).

Widzowie (publiczność, komisja, uczestnicy)

Patrzą na ekran projektora.

Na ekranie widzą jasną informację: o czym jest debata, kto mówi i ile zostało czasu.

3. Zakres funkcjonalny (MVP)
3.1. Konfiguracja debaty
Parametry pojedynczej debaty:

Temat debaty – tekst, np. „Budowanie własnej tożsamości w erze filtrów” (wymagane pole).

Lista mówców:

imię i nazwisko (wymagane),

opcjonalnie opis (np. funkcja, klasa).

Struktura mów:

domyślny czas mowy (w sekundach lub minutach, np. 5:00),

opcjonalnie czas niestandardowy dla wybranych mów (np. wystąpienie wprowadzające / podsumowanie).

Minimalne MVP może przyjąć:

stały czas dla wszystkich mówców (np. 5 min),

lista mówców w kolejności wystąpień (po jednym wystąpieniu na osobę).

3.2. Ekran projektora (Public Display)
To jest główny widok, który idzie na rzutnik (tryb fullscreen).

Elementy:

Pasek górny:

temat debaty (duża, czytelna czcionka, maks. 2 linijki).

Sekcja „aktualny mówca”:

imię i nazwisko aktualnego mówcy,

opcjonalnie mały sub-tekst (np. „klasa 3B”, „kandydat nr 2”).

Sekcja „timer”:

duże cyfry w formacie MM:SS,

kolor tła / tekstu zmienia się w zależności od czasu:

normalny czas – np. zielony,

końcówka (od 15 do 0 s) – żółty/pomarańczowy,

po przekroczeniu czasu – czerwony.

Zachowanie:

Ekran odświeża się płynnie (co 1 s).

Nie ma żadnych elementów interfejsu (przycisków, menu) – wyłącznie informacje dla widzów.

Włączenie fullscreen (np. F11 w przeglądarce) powinno dawać „czystą” planszę.

3.3. Sterowanie (panel operatora / klawiatura)
MVP może działać nawet bez osobnego panelu – sterowanie z klawiatury na tym samym ekranie.

Wymagane działania:

Start/pauza timera:

Klawisz: spacja (lub przycisk „Start/Stop” w prostym panelu).

Timer startuje od wartości ustawionej dla danej mowy (np. 5:00) i odlicza w dół.

Ponowne wciśnięcie – pauza.

Zmiana mówcy:

Klawisz: strzałka w prawo – przejście do następnego mówcy w kolejce.

Efekt:

zmiana wyświetlanego nazwiska,

timer resetuje się do pełnego czasu mowy (np. znów 5:00),

sygnały dźwiękowe liczone są od nowa.

(Opcjonalnie) strzałka w lewo – powrót do poprzedniego mówcy (z resetem czasu).

Ręczne dostosowanie czasu (opcjonalne, ale wskazane):

Klawisze, np.:

+ – dodaj 15 sekund,

- – odejmij 15 sekund.

Po zmianie czasu system na nowo wylicza moment 15 s przed końcem (dla ostrzegawczego dźwięku).

Zmiana tematu / mówcy „na szybko” (nice-to-have):

Możliwość edycji w lekkim panelu konfiguracyjnym poza fullscreenem.

4. Sygnały dźwiękowe
4.1. Scenariusze
Sygnał ostrzegawczy (–15 s)

Odtwarzany raz na mowę, w momencie, gdy do końca czasu pozostaje dokładnie 15 sekund.

Krótki, pojedynczy dźwięk („ding”), wyraźny, ale nie agresywny.

Sygnał końca czasu (0 s)

Odtwarzany raz na mowę, w momencie, gdy timer dojdzie do 0:00.

Wyraźniejszy dźwięk niż ostrzegawczy (np. 2–3 szybkie sygnały lub jeden dłuższy gong).

4.2. Zasady działania
Sygnały odtwarzają się wyłącznie, gdy timer jest w trybie odliczania (nie podczas pauzy).

Dźwięk ostrzegawczy:

może się nie odtworzyć, jeśli operator wystartuje timer dopiero po czasie (np. timer od razu wchodzi pod 15 s).

Dźwięk końca czasu:

odtwarzany w chwili pierwszego przejścia przez 0,

nie powtarza się przy ewentualnym „odbiciu” timera po ręcznych zmianach.

Po przekroczeniu 0:

timer może zatrzymać się na 0:00 albo iść dalej w górę, pokazując opóźnienie (np. +0:20) – do ustalenia w konfiguracji.

4.3. Opcje konfiguracyjne dźwięków
Przełączniki:

„Włącz sygnał ostrzegawczy (–15 s)” – domyślnie ON.

„Włącz sygnał końca czasu (0 s)” – domyślnie ON.

„Wycisz wszystkie dźwięki” (mute) – można szybko wyciszyć w razie potrzeby (np. klawisz M).

Głośność:

Zarządzana globalnie systemowo (przez system operacyjny / mixera dźwięku laptopa),

aplikacja nie musi mieć suwaka głośności w MVP.

5. Wymagania niefunkcjonalne
Środowisko uruchomieniowe

Działa w nowoczesnej przeglądarce (Chrome, Edge, Firefox) na desktopie.

Może działać lokalnie z pliku (np. index.html) albo z prostego serwera HTTP.

Czytelność

Timer i nazwisko mówcy muszą być widoczne z końca dużej sali – duża czcionka, wysoki kontrast.

Kolory akcentów tak dobrane, by były czytelne dla osób z zaburzeniami widzenia barw (np. oprócz koloru także mocne różnice jasności).

Niezawodność

Timer nie powinien się „zacinać” – użycie prostego mechanizmu odliczania (setInterval / requestAnimationFrame) i odporność na chwilowe „lagi”.

Sygnały dźwiękowe muszą być załadowane przed startem debaty (preload), aby nie było opóźnienia przy pierwszym odtworzeniu.

Prostota obsługi

Operator powinien nauczyć się podstaw (start, stop, następny mówca, fullscreen) w kilka minut.

Na jednym ekranie (w trybie nie-fullscreen) widzi:

listę mówców,

aktualnego mówcę,

ustawienia czasu i dźwięków.

6. Flow użytkownika (MVP)
Operator otwiera aplikację na laptopie.

Wprowadza temat debaty, listę mówców i czas mowy (np. 5:00).

Włącza ekran projektora, przeciąga na niego okno z aplikacją i przełącza w fullscreen.

Przed pierwszą mową:

wybiera pierwszego mówcę (domyślnie pierwszy na liście),

sprawdza, czy sygnały dźwiękowe są włączone.

Dla każdego mówcy:

klika start (spacja),

15 s przed końcem słychać krótki sygnał,

przy 0:00 – wyraźny sygnał końca czasu,

ewentualnie zatrzymuje/pauzuje timer (np. przy zakłóceniach).

Po zakończeniu ostatniej mowy operator zatrzymuje system albo zamyka aplikację.

7. Backlog / kolejne wersje (poza MVP)
Różny czas mowy per mówca / runda.

Możliwość zapisania kilku „presetów” czasów (np. 3 min, 5 min, 7 min) i szybkiego przełączania.

Zapis przebiegu debaty (log: kto mówił, jak długo, przekroczenia czasu).

Dwa tryby wyświetlania:

standard (jak wyżej),

tryb „mównica” (bardziej stonowane kolory, większy nacisk na czas).

Integracja z zewnętrznym pilotem (np. strzałki z clickera prezentacyjnego).

