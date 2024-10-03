# import logging
from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
import asyncio
import math
import random

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

class gameConsumer(AsyncWebsocketConsumer):
    game_type = ''
    waiting = ''
    barsPosiotionsContainer = {}
    playerId = ''
    group_sizes = {}
    instanceID = 0
    gameId = ''
    chatGameId = ''
    connected_users = []
    connected_chat_users = []
    chatPlayerId = ''
    ballPositionX = 50
    ballPositionY = 50
    velocityX = 1
    velocityY = 0.5
    leftScore = 0
    rightScore = 0
    my_scheduler = None
    connected = True
    speed = 1

    async def connect(self):
        await self.accept()
        self.connected = True
        await self.send('connected')

    async def receive(self, text_data):
        id_data = text_data.split(",")
        if 'chat' in text_data:
            self.game_type = 'chat'
            self.chatPlayerId = id_data[4]
            if self.chatPlayerId in self.__class__.connected_chat_users:
                await self.send('reject')
                return
            self.__class__.connected_chat_users.append(self.chatPlayerId)
            self.chatGameId = id_data[1]
            await self.channel_layer.group_add (
                self.chatGameId,
                self.channel_name
            )
            self.group_sizes[self.chatGameId] = self.group_sizes.get(self.chatGameId, 0) + 1
            self.__class__.barsPosiotionsContainer[self.chatGameId] = {'right':40, 'left':40, 'rightScore':0, "leftScore":0}
            if self.group_sizes[self.chatGameId] == 2:
                await self.channel_layer.group_send(
                    self.chatGameId,
                    {
                        'type': 'relay',
                        'message': 'start'
                    }
                )
                self.gameId = self.chatGameId
                asyncio.create_task(self.start_scheduler())

        if 'join' in text_data:
            data = text_data.split(",")
            self.game_type = 'remote'
            if data[1] == 'null':
                await self.send('connected')
                return
            if data[1] in self.__class__.connected_users:
                await self.send('reject')
                self.close()
                return
            self.__class__.connected_users.append(data[1])
            if self.waiting == '':
                self.__class__.waiting = data[1]
                self.gameId = data[1]
                self.playerId = data[1]
                print(f"first {self.gameId}")
                to_send = 'joined,' + self.gameId
                await self.send(to_send)
                await self.channel_layer.group_add (
                    self.gameId,
                    self.channel_name
                )
            else:
                if self.waiting == data[1]:
                    self.close()
                self.gameId = self.waiting
                self.playerId = data[1]
                to_send = 'joined,' + self.gameId
                print(f"second {self.gameId}")
                await self.send(to_send)
                self.__class__.waiting = ''
                self.__class__.barsPosiotionsContainer[self.gameId] = {'right':40, 'left':40, 'rightScore':0, "leftScore":0}
                await self.channel_layer.group_add (
                    self.gameId,
                    self.channel_name
                )
                await self.channel_layer.group_send(
                    self.gameId,
                    {
                        'type': 'relay',
                        'message': 'start'
                    }
                )
                # logger.info(f"Game started {self.gameId} VS ${self.playerId} (GAMEID === {self.gameId})")
                asyncio.create_task(self.start_scheduler())


        elif ('right' in text_data or 'left' in text_data) and 'Score' not in text_data:

            if 'rightUp' in text_data:
                self.__class__.barsPosiotionsContainer[id_data[0]]['right'] -= 8
            elif 'rightDown' in text_data:
                self.__class__.barsPosiotionsContainer[id_data[0]]['right'] += 8
            elif 'leftUp' in text_data:
                self.__class__.barsPosiotionsContainer[id_data[0]]['left'] -= 8
            elif 'leftDown' in text_data:
                self.__class__.barsPosiotionsContainer[id_data[0]]['left'] += 8

            if self.__class__.barsPosiotionsContainer[id_data[0]]['right'] < 0: self.__class__.barsPosiotionsContainer[id_data[0]]['right'] = 0
            if self.__class__.barsPosiotionsContainer[id_data[0]]['left'] < 0: self.__class__.barsPosiotionsContainer[id_data[0]]['left'] = 0

            if self.__class__.barsPosiotionsContainer[id_data[0]]['right'] > 80: self.__class__.barsPosiotionsContainer[id_data[0]]['right'] = 80
            if self.__class__.barsPosiotionsContainer[id_data[0]]['left'] > 80: self.__class__.barsPosiotionsContainer[id_data[0]]['left'] = 80

            pos = 'bars,' + str(self.__class__.barsPosiotionsContainer[str(id_data[0])]['left']) + ',' + str(self.__class__.barsPosiotionsContainer[str(id_data[0])]['right'])

            if self.chatGameId != '':
                await self.channel_layer.group_send(
                    self.chatGameId,
                    {
                        'type': 'relay',
                        'message': pos
                    }
                )
            else:
                await self.channel_layer.group_send(
                str(self.gameId),
                    {
                        'type': 'relay',
                        'message': pos
                    }
                )
        elif 'forf' in text_data:
            # await self.disconnect()
            if self.chatGameId != '':
                await self.channel_layer.group_send(
                    self.chatGameId,
                    {
                        'type': 'relay',
                        'message': 'forf'
                    }
                )

        elif 'leave' in text_data:
            #fix fix fix fix
            if self.chatGameId != '':
                await self.channel_layer.group_send(
                    self.chatGameId,
                    {
                        'type': 'relay',
                        'message': 'won'
                    }
                )
            else:    
                await self.channel_layer.group_send(
                    str(self.gameId),
                    {
                        'type': 'relay',
                        'message': 'won'
                    }
                )

    async def disconnect(self, closecode):
        if self.game_type == 'chat':
            if self.chatGameId != '' and self.chatPlayerId in self.__class__.connected_chat_users:
                self.__class__.connected_chat_users.remove(self.chatPlayerId)

            if self.chatGameId != '':
                if self.chatGameId in self.__class__.group_sizes:
                    del self.__class__.group_sizes[self.chatGameId]
                # if self.chatGameId in self.__class__.barsPosiotionsContainer:
                #     del self.__class__.barsPosiotionsContainer[self.chatGameId]
                try:
                    await self.channel_layer.group_send (
                        self.chatGameId,
                        {
                            'type': 'relay',
                            'message': 'forf',
                        }
                    )
                except Exception as e:
                    print(f"Error sending message to group: {e}")
                await self.channel_layer.group_discard(
                    self.chatGameId,
                    self.channel_name
                )
                self.chatGameId = ''

        if self.game_type == 'remote':
            if str(self.playerId) == self.waiting:
                self.__class__.waiting = ''
            self.connected = False

            if self.my_scheduler is not None:
                self.my_scheduler.empty()
            if self.playerId in self.__class__.connected_users:
                self.__class__.connected_users.remove(self.playerId)        

            if self.gameId != '':
                if self.gameId in self.__class__.group_sizes:
                    del self.__class__.group_sizes[self.gameId]
                # if self.gameId in self.__class__.barsPosiotionsContainer:
                #     del self.__class__.barsPosiotionsContainer[self.gameId]
                await self.channel_layer.group_discard(
                    self.gameId,
                    self.channel_name
                )

            if self.waiting != '' and str(self.playerId) == self.waiting:
                self.__class__.waiting = ''
            try:
                await self.channel_layer.group_send (
                    str(self.gameId),
                    {
                        'type': 'relay',
                        'message': 'forf',
                    }
                )
            except Exception as e:
                print(f"Error sending message to group: {e}")

            if self.gameId != '':
                self.gameId = ''

    async def relay(self, event):
        text = event['message']
        await self.send(text)

    async def start_scheduler(self):
        self.loop = True
        await asyncio.sleep(1.2)
        while self.loop:
            await asyncio.sleep(0.02)
            if not self.connected:
                break

            barHeight = 25

            self.ballPositionX += self.velocityX
            self.ballPositionY += self.velocityY

            leftBarPosition = self.__class__.barsPosiotionsContainer[self.gameId]['left']
            rightBarPosition = self.__class__.barsPosiotionsContainer[self.gameId]['right']
            if (self.ballPositionX <= 3 and self.ballPositionY + 5 >= leftBarPosition
                and self.ballPositionY + 5 <= leftBarPosition + barHeight):

                relativeIntersectY = (leftBarPosition + barHeight / 2) - self.ballPositionY
                IntersectionY = (relativeIntersectY / (barHeight / 2))
                bounceAngle = IntersectionY * math.pi / 4
  
                self.velocityX = self.speed * math.cos(bounceAngle)
                self.velocityY = self.speed * -math.sin(bounceAngle)

                self.speed += 0.2
            elif (self.ballPositionX >= 94 and self.ballPositionY + 5 >= rightBarPosition
                  and self.ballPositionY + 5 <= rightBarPosition + barHeight):

                relativeIntersectY = (rightBarPosition + barHeight / 2) - self.ballPositionY
                IntersectionY = (relativeIntersectY / (barHeight / 2))
                bounceAngle = IntersectionY * math.pi / 4

                self.velocityX =  self.speed *-math.cos(bounceAngle)
                self.velocityY =  self.speed *-math.sin(bounceAngle)

                self.speed += 0.2

            elif (self.ballPositionX <= 0 or self.ballPositionX >= 96):
                if (self.ballPositionX <= 0):
                    self.velocityX = 1
                    self.velocityY = random.uniform(-0.1, -1)
                    self.leftScore += 1
                else:
                    self.velocityX = -1
                    self.velocityY = random.uniform(0.1, 1)
                    self.rightScore += 1
                self.ballPositionX = 50
                self.ballPositionY = 50
                self.speed = 1
            elif (self.ballPositionY <= 0 or self.ballPositionY >= 96):
                self.velocityY *= -1
            if self.leftScore >= 6 or self.rightScore >= 6:
                self.loop = False
                pos = 'won,' + str(self.leftScore) + ',' + str(self.rightScore)
            else:
                pos = 'ball,' + str(self.ballPositionX) + ',' + str(self.ballPositionY) + ',' + str(self.leftScore) + ',' + str(self.rightScore)

            await self.channel_layer.group_send(
                self.gameId,
                {
                    'type': 'relay',
                    'message': pos
                }
            )
