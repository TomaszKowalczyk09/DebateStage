# DebateStage

Backend został przeniesiony na Django.

## Uruchomienie

1. Zainstaluj zależności:

   pip install django

2. Wykonaj migracje:

   python manage.py migrate

3. Uruchom serwer:

   python manage.py runserver

## Ekrany

- Widok projektora: `/`
- Panel operatora: `/operator/`
- Admin Django: `/admin/`

## API (MVP)

- `GET/PATCH /api/state/`
- `POST /api/speakers/`
- `DELETE /api/speakers/<id>/`
- `POST /api/speakers/<id>/move/`
- `PATCH /api/speakers/<id>/flags/`
