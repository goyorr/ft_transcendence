import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
django_asgi_app = get_asgi_application()

from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async
from users.routing import websocket_urlpatterns


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auth_service.settings')
django.setup()

User = get_user_model()
django_asgi_app = get_asgi_application()

class CustomAuthMiddleware(JWTAuthentication):
    user_model = User
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        raw_token = scope.get('cookies', {}).get('access')

        if not raw_token:
            await send({
                'type': 'http.response.start',
                'status': 403,
            })
            await send({
                'type': 'http.response.body',
                'body': b'Forbidden',
            })
            return

        # Validate token
        try:
            validated_token = self.get_validated_token(raw_token)
            user = await self.get_user_from_token(validated_token)
        except InvalidToken:
            await send({
                'type': 'http.response.start',
                'status': 403,
            })
            await send({
                'type': 'http.response.body',
                'body': b'Forbidden',
            })
            return

        # Add the user to the scope for further handling
        scope['user'] = user

        # Call inner application
        return await self.inner(scope, receive, send)

    async def get_user_from_token(self, validated_token):
        # Use sync_to_async to fetch user asynchronously
        return await sync_to_async(self.get_user)(validated_token)

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            CustomAuthMiddleware(
                URLRouter(websocket_urlpatterns)
            )
        )
    ),
})