from django.urls import re_path
from .consumers import notifications,remote,tournament,chat,multi

websocket_urlpatterns = [
    re_path(r"ws/notifications/",notifications.NotificationConsumer.as_asgi()),
    re_path(r'ws/remote/', remote.gameConsumer.as_asgi()),
    re_path(r'ws/tournament/', tournament.tournamentConsumer.as_asgi()),
    re_path(r'ws/chat/', chat.ChatConsumer.as_asgi()),
    re_path(r'ws/multi/', multi.multiConsumer.as_asgi()),
    # re_path(r'ws/friends/(?P<user_id>\w+)/$',Onlines.FriendConsumer.as_asgi()),
]