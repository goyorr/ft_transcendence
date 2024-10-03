import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auth_service.settings') 
django.setup()

from users.models import CustomUser  # Import after django.setup()
from django.contrib.auth import get_user_model

username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

if username and email and password:
    if not CustomUser.objects.filter(username=username).exists():
        CustomUser.objects.create_superuser(username=username, email=email, password=password)
        print('Superuser created successfully')
    else:
        print('Superuser already exists')
else:
    print('Missing environment variables for superuser creation')
