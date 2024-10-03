import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from ..serializers import FriendsSerializer, SerializerBlock, UserSerializer

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    connected_users = []

    async def connect(self):
        self.user = self.scope['user']
        self.connected_users.append(self)
        await self.accept()
        friends = await self.getFriends()
        connectedUsers = [user for user in self.connected_users if user.user.id in friends]
        for user in connectedUsers:
            await user.sendConnectedUsers()
        await self.sendConnectedUsers()

    async def disconnect(self, close_code):
        self.connected_users.remove(self)
        friends = await self.getFriends()
        connectedUsers = [user for user in self.connected_users if user.user.id in friends and user.user != self.user]
        for user in connectedUsers:
            await user.sendConnectedUsers()

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            type = text_data_json.get('type')
            if type == "connected_users":
                await self.sendConnectedUsers()
            if type == "direct_message" :
                message = text_data_json.get('message')
                recipient = text_data_json.get('recipient')
                conversation = text_data_json.get('conversation')
                id = text_data_json.get('id')
                reply_to = text_data_json.get('reply_to')
                sender = self.user.id
                if message and recipient and sender != recipient and conversation:
                    await self.send_direct_message(recipient, message, conversation, id,reply_to)
            else:
                await self.send(text_data=json.dumps({
                    'error': 'Recipient or message not specified or invalid type.'
                }))
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON'
            }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'error': str(e)
            }))

    async def send_direct_message(self, recipient_id, message, conversation, id, reply_to):
        try:
            recipients = [user for user in self.connected_users if user.user.id == recipient_id or (user.user.id == self.user.id and user.user != self.user)]
            if not recipients:
                return
            for recipient in recipients:
                await recipient.send(text_data=json.dumps({
                    'type': "direct_message",
                    'message': message,
                    'sender': self.user.id,
                    'conversation': conversation,
                    'id': id,
                    'reply_to': reply_to
                }))
        except StopIteration:
            await self.send(text_data=json.dumps({
                'error': 'Recipient not connected.'
            }))

    async def sendConnectedUsers(self):
        
        connectedUsersSet = {
            user.user.id 
            for user in self.connected_users 
        } 
        friends = await self.getFriends()
        connectedUsersSet = connectedUsersSet.intersection(friends)
        connectedUsers = list(connectedUsersSet)
        await self.send(text_data=json.dumps({
            'type': "connected_users",
            'connected_users': connectedUsers
        }))
        
    @database_sync_to_async
    def getFriends(self):
        friends =  UserSerializer(User.objects.get(id=self.user.id), many=False).data['friends']
        return [friend['id'] for friend in friends]
    