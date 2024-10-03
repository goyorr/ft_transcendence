#!/bin/sh

echo "Collecting static files"
python manage.py collectstatic --noinput

echo "Applying database migrations"

sleep 10

python manage.py makemigrations users

python manage.py makemigrations game

python manage.py migrate

sleep 5

# Start Gunicorn and Daphne

# python  manage.py runserver 0.0.0.0:8000

# python  manage.py runserver 0.0.0.0:8000 &
# daphne -b 0.0.0.0 -p 8001 auth_service.asgi:application

gunicorn auth_service.wsgi:application --bind 0.0.0.0:8000  &
daphne -b 0.0.0.0 -p 8001 auth_service.asgi:application
