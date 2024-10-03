import json
import uuid

from django.core.exceptions import ObjectDoesNotExist

from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync,sync_to_async
from channels.db import database_sync_to_async 
from ..models import CustomUser, Notification
from ..serializers import SerlizerNotification
import secrets


class NotificationConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_name = "public"
        self.room_group_name = f"notify_{self.room_name}"

        await self.channel_layer.group_add(self.room_group_name,self.channel_name)
        await self.accept()
    
    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        if 'type' in text_data_json:
            if text_data_json['type'] == 'send_event':
                await self.channel_layer.group_send(
                    self.room_group_name, {'type':"notify_event",'event':text_data_json}
                )
            
            elif text_data_json['type'] == 'invite_game' or text_data_json['type'] == 'accept_game':
                await self.channel_layer.group_send(
                    self.room_group_name, {'type':"HandleGame",'event':text_data_json}
                )

            elif text_data_json['type'] == 'match_ready':
                await self.channel_layer.group_send(
                    self.room_group_name, {'type':"handleMatchReady",'event':text_data_json}
                )
            
        else:             
            from_user = await database_sync_to_async(CustomUser.objects.get)(id=text_data_json['from_user'])
            
            data = {
                'from_user': text_data_json['from_user'],
                'to_user': text_data_json['to_user'],
                'type_notification': text_data_json['type_notification'],
                'is_read': text_data_json['is_read'],
            }

            notification = await create_notification(data)

            await self.channel_layer.group_send(
                self.room_group_name, {"type": "notify.notification", "notification": notification}
            )

    async def notify_notification(self, event):
                await self.send(text_data=json.dumps({"notification": event['notification']}))
                
    async def notify_user_status(self, event):
            data_user = await getDataUser(event['user']['id'])
            await self.send(text_data=json.dumps({"type": "notify_user_status",'action':event['action'], 'user':data_user}))
            
    async def notify_event(self,event):
            data = {
                'type':event['event']['type'],
                'action':event['event']['action'],
                'to_user':event['event']['to_user'],
                'from_user':event['event']['from_user']
            }
            await self.send(text_data=json.dumps(data))

    async def HandleGame(self,event):
            user_data = await getDataUser(event['event']['from'])
            data = {
                'id':secrets.token_hex(16),
                'type':event['event']['type'],
                'to_user':event['event']['to'],
                'from_user':user_data,
                'gameId':event['event']['gameId']
            }
            await self.send(text_data=json.dumps(data))

    async def handleMatchReady(self,event):
            user_data = await getDataUser(event['event']['from'])
            data = {
                'id':secrets.token_hex(16),
                'type':event['event']['type'],
                'to_user':event['event']['to'],
                'from_user':user_data,
            }
            await self.send(text_data=json.dumps(data))


@database_sync_to_async
def getDataUser(id):
    try:
        user = CustomUser.objects.get(pk=id)
        data = {
            'id':id,
            'image': user.image.url if user.image else None,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
        }
    except ObjectDoesNotExist:
        data = {
            'image': None,
            'username': None
        }
    except Exception as e:
        data = {
            'image': None,
            'username': None
        }
        print(f"Error retrieving user data: {e}")

    return data

@database_sync_to_async
def create_notification(data):
    serializer = SerlizerNotification(data=data)
    if serializer.is_valid():
        notification = serializer.save()
        return {
            "success": True,
            "message": "Notification created successfully",
            "notification": serializer.data
        }
    else:
        return {
            "success": False,
            "message": "Failed to create notification",
            "errors": serializer.errors
        }
