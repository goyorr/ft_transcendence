from asyncio.base_events import logger
from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
import asyncio
import math
import random
from channels.layers import get_channel_layer

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class tournamentConsumer(AsyncWebsocketConsumer):
    gameID = ''
    barsPosiotionsContainer = {}
    group_sizes = {}
    p1 = ''
    p2 = ''
    ballPositionX = 50
    ballPositionY = 50
    velocityX = 1
    velocityY = 0.5
    leftScore = 0
    rightScore = 0
    my_scheduler = None
    connected = True
    speed = 1
    connected_users = []
    rejected = False
    playerId = ''

    async def connect(self):
        await self.accept()
        await self.send('connect')

    async def disconnect(self, code):
        if self.rejected is True:
            return
        self.connected = False
        if self.playerId in self.__class__.connected_users:
            self.__class__.connected_users.remove(self.playerId)
        try:
            await self.channel_layer.group_send (
                self.gameID,
                {
                    'type': 'relay',
                    'message': 'forf',
                }
            )
        except Exception as e:
            print(f"Error sending message to group: {e}")
        # if self.gameID in self.__class__.barsPosiotionsContainer:
        #     del self.__class__.barsPosiotionsContainer[self.gameID]
        if self.gameID in self.__class__.group_sizes:
            del self.__class__.group_sizes[self.gameID]
        # if self.gameID in get_channel_layer().groups:
        #     del get_channel_layer().groups[self.gameID]

    async def receive(self, text_data):
        if 'join' in text_data:
            print(text_data)
            if text_data.split(',')[4] == 'null':
                await self.send('connect')
                return
            if text_data.split(',')[4] in self.__class__.connected_users:
                self.rejected = True
                await self.send('reject')
                self.close()
                return
            self.p1 = text_data.split(',')[2]
            self.p2 = text_data.split(',')[3]
            self.gameID = text_data.split(',')[1]
            self.playerId = text_data.split(',')[4]
            self.__class__.connected_users.append(self.playerId)
            self.group_sizes[self.gameID] = self.group_sizes.get(self.gameID, 0) + 1
            await self.channel_layer.group_add (
                self.gameID,
                self.channel_name
            )

            if self.group_sizes.get(self.gameID, 0) == 1:
                await self.send('joined,' + text_data.split(',')[2])
            else:
                await self.send('joined,' + text_data.split(',')[3])
                
            if(self.group_sizes.get(self.gameID, 0) == 2):
                self.__class__.barsPosiotionsContainer[self.gameID] = {'right':40, 'left':40, 'rightScore':0, "leftScore":0}
                await self.channel_layer.group_send (
                    self.gameID,
                    {
                        'type': 'relay',
                        'message': 'start'
                    }
                )
                logger.info(f"Game started {self.p1} VS {self.p2} (GAMEID === {self.gameID})")
                asyncio.create_task(self.start_scheduler())


        elif ('right' in text_data or 'left' in text_data) and 'Score' not in text_data:

            if 'rightUp' in text_data:
                self.__class__.barsPosiotionsContainer[self.gameID]['right'] -= 8
            elif 'rightDown' in text_data:
                self.__class__.barsPosiotionsContainer[self.gameID]['right'] += 8
            elif 'leftUp' in text_data:
                self.__class__.barsPosiotionsContainer[self.gameID]['left'] -= 8
            elif 'leftDown' in text_data:
                self.__class__.barsPosiotionsContainer[self.gameID]['left'] += 8

            if self.__class__.barsPosiotionsContainer[self.gameID]['right'] < 0: self.__class__.barsPosiotionsContainer[self.gameID]['right'] = 0
            if self.__class__.barsPosiotionsContainer[self.gameID]['left'] < 0: self.__class__.barsPosiotionsContainer[self.gameID]['left'] = 0

            if self.__class__.barsPosiotionsContainer[self.gameID]['right'] > 80: self.__class__.barsPosiotionsContainer[self.gameID]['right'] = 80
            if self.__class__.barsPosiotionsContainer[self.gameID]['left'] > 80: self.__class__.barsPosiotionsContainer[self.gameID]['left'] = 80

            pos = 'bars,' + str(self.__class__.barsPosiotionsContainer[self.gameID]['left']) + ',' + str(self.__class__.barsPosiotionsContainer[self.gameID]['right'])

            await self.channel_layer.group_send (
                self.gameID,
                {
                    'type': 'relay',
                    'message': pos
                }
            )

        elif 'done' in text_data:
            # if self.gameID in self.__class__.barsPosiotionsContainer:
            #     del self.__class__.barsPosiotionsContainer[self.gameID]
            # if self.gameID in self.__class__.group_sizes:
            #     del self.__class__.group_sizes[self.gameID]
            # if self.gameID in get_channel_layer().groups:
            #     del get_channel_layer().groups[self.gameID]
            self.gameID = ''
            self.p1 = ''
            self.p2 = ''

    async def relay(self, event):
        text = event['message']
        await self.send(text)

    async def start_scheduler(self):
        self.loop = True
        await asyncio.sleep(1)
        while self.loop:
            await asyncio.sleep(0.02)
            if not self.connected:
                break

            barHeight = 25

            self.ballPositionX += self.velocityX
            self.ballPositionY += self.velocityY

            leftBarPosition = self.__class__.barsPosiotionsContainer[self.gameID]['left']
            rightBarPosition = self.__class__.barsPosiotionsContainer[self.gameID]['right']
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

                self.velocityX = self.speed * -math.cos(bounceAngle)
                self.velocityY = self.speed * -math.sin(bounceAngle)

                self.speed += 0.2

            elif (self.ballPositionX < 0 or self.ballPositionX > 97):
                if (self.ballPositionX < 0):
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
                self.gameID,
                {
                    'type': 'relay',
                    'message': pos
                }
            )
