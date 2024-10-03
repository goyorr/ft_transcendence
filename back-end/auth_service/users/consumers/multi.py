import logging
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
import math
import random

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class multiConsumer(AsyncWebsocketConsumer):

    barsPosiotionsContainer = {}
    started = {}
    playerId = 1
    group_sizes = {}
    strplayerId = ''
    strgameId = ''
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
        # self.lmao = 1
        await self.send('connect')
        # await self.send('connect')
        # await self.send('connect')

    async def receive(self, text_data):
        id_data = text_data.split(",")
        if 'join' in text_data:
            self.room_group_name = str(id_data[1])
            self.strgameId = str(id_data[1])
            self.strplayerId = str(id_data[2])
            self.__class__.started[self.strgameId] = False

            if self.room_group_name not in self.__class__.barsPosiotionsContainer:
                self.__class__.barsPosiotionsContainer[self.strgameId] = {'topleft': 10, 'topright': 10, 'botleft': 70, 'botright': 70}
            if self.room_group_name not in self.__class__.group_sizes:
                self.__class__.group_sizes[self.room_group_name] = 1
            else:
                # self.__class__.group_sizes[self.room_group_name] += 1
                self.group_sizes[self.room_group_name] = self.group_sizes.get(self.room_group_name, 0) + 1
            await self.channel_layer.group_add (
                self.strgameId,
                self.channel_name
            )
            await asyncio.sleep(3)
            if self.group_sizes.get(self.room_group_name, 0) == 4:
                if self.__class__.started[self.strgameId] == False:
                    self.__class__.started[self.strgameId] = True
                    await self.channel_layer.group_send (
                        self.room_group_name,
                        {
                            'type': 'relay',
                            'message': 'start'
                        }
                    )
                    asyncio.sleep(0.5)
                    asyncio.create_task(self.start_scheduler())
            else:
                await self.channel_layer.group_send (
                    self.room_group_name,
                    {
                        'type': 'relay',
                        'message': 'missing'
                    }
                )
            
        elif ('right' in text_data or 'left' in text_data) and 'Score' not in text_data:
            if 'toprightUp' in text_data:
                self.__class__.barsPosiotionsContainer[str(id_data[0])]['topright'] -= 5
            elif 'toprightDown' in text_data:
                self.__class__.barsPosiotionsContainer[str(id_data[0])]['topright'] += 5
            elif 'topleftUp' in text_data:
                self.__class__.barsPosiotionsContainer[str(id_data[0])]['topleft'] -= 5
            elif 'topleftDown' in text_data:
                self.__class__.barsPosiotionsContainer[str(id_data[0])]['topleft'] += 5
 
            elif 'botrightUp' in text_data:
                self.__class__.barsPosiotionsContainer[str(id_data[0])]['botright'] -= 5
            elif 'botrightDown' in text_data:
                self.__class__.barsPosiotionsContainer[str(id_data[0])]['botright'] += 5
            elif 'botleftUp' in text_data:
                self.__class__.barsPosiotionsContainer[str(id_data[0])]['botleft'] -= 5
            elif 'botleftDown' in text_data:
                self.__class__.barsPosiotionsContainer[str(id_data[0])]['botleft'] += 5

            #limit bars to Q of screen

            if self.__class__.barsPosiotionsContainer[str(id_data[0])]['topright'] < 1.5: self.__class__.barsPosiotionsContainer[str(id_data[0])]['topright'] = 1.5
            if self.__class__.barsPosiotionsContainer[str(id_data[0])]['topright'] > 30: self.__class__.barsPosiotionsContainer[str(id_data[0])]['topright'] = 30

            if self.__class__.barsPosiotionsContainer[str(id_data[0])]['topleft'] < 1.5: self.__class__.barsPosiotionsContainer[str(id_data[0])]['topleft'] = 1.5
            if self.__class__.barsPosiotionsContainer[str(id_data[0])]['topleft'] > 30: self.__class__.barsPosiotionsContainer[str(id_data[0])]['topleft'] = 30

            if self.__class__.barsPosiotionsContainer[str(id_data[0])]['botright'] < 48: self.__class__.barsPosiotionsContainer[str(id_data[0])]['botright'] = 48
            if self.__class__.barsPosiotionsContainer[str(id_data[0])]['botright'] > 76: self.__class__.barsPosiotionsContainer[str(id_data[0])]['botright'] = 76

            if self.__class__.barsPosiotionsContainer[str(id_data[0])]['botleft'] < 48: self.__class__.barsPosiotionsContainer[str(id_data[0])]['botleft'] = 48
            if self.__class__.barsPosiotionsContainer[str(id_data[0])]['botleft'] > 76: self.__class__.barsPosiotionsContainer[str(id_data[0])]['botleft'] = 76

            # pos =  self.strgameId + ',' + str(self.__class__.barsPosiotionsContainer[str(id_data[0])]['topleft']) + ',' + str(self.__class__.barsPosiotionsContainer[str(id_data[0])]['topright']) + ',' + str(self.__class__.barsPosiotionsContainer[str(id_data[0])]['botleft']) + ',' + str(self.__class__.barsPosiotionsContainer[str(id_data[0])]['botright'])
            pos =  'bars,' + str(self.__class__.barsPosiotionsContainer[str(id_data[0])]['topleft']) + ',' + str(self.__class__.barsPosiotionsContainer[str(id_data[0])]['topright']) + ',' + str(self.__class__.barsPosiotionsContainer[str(id_data[0])]['botleft']) + ',' + str(self.__class__.barsPosiotionsContainer[str(id_data[0])]['botright'])

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'relay',
                    'message': pos
                }
            )

        elif 'leave' in text_data:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'relay',
                    'message': 'leave'
                }
            )

    #fix deleted shit
    async def disconnect(self, close_code):
        print(f'{self.strplayerId} disconnected from multiplayer game.')
        #delete all class related stuff when recieving game game not on disconnect. (to prtect from leaving mid game)

    async def relay(self, event):
        text = event['message']
        await self.send(text)

    async def start_scheduler(self):
        self.loop = True
        await asyncio.sleep(1)
        while self.loop:
            await asyncio.sleep(0.02)

            barHeight = 25

            self.ballPositionX += self.velocityX
            self.ballPositionY += self.velocityY

            topleftBarPosition = self.__class__.barsPosiotionsContainer[self.strgameId]['topleft']
            botleftBarPosition = self.__class__.barsPosiotionsContainer[self.strgameId]['botleft']
            toprightBarPosition = self.__class__.barsPosiotionsContainer[self.strgameId]['topright']
            botrightBarPosition = self.__class__.barsPosiotionsContainer[self.strgameId]['botright']
            #(ballPosition.x === 3 && ballPosition.y >= topLeftBarPosition && ballPosition.y <= topLeftBarPosition + 20 && velocity.x < 0) ||
            #top left
            if (self.ballPositionX <= 3 and self.ballPositionY + 5 >= topleftBarPosition
                and self.ballPositionY + 5 <= topleftBarPosition + barHeight):

                relativeIntersectY = (topleftBarPosition + barHeight / 2) - self.ballPositionY
                IntersectionY = (relativeIntersectY / (barHeight / 2))
                bounceAngle = IntersectionY * math.pi / 4
  
                self.velocityX = self.speed * math.cos(bounceAngle)
                self.velocityY = self.speed * -math.sin(bounceAngle)

                self.speed += 0.2
            #(ballPosition.x === 94 && ballPosition.y >= topRightBarPosition && ballPosition.y <= topRightBarPosition + 20 && velocity.x > 0) ||
            #top right
            elif (self.ballPositionX >= 94 and self.ballPositionY + 5 >= toprightBarPosition
                  and self.ballPositionY + 5 <= toprightBarPosition + barHeight):

                relativeIntersectY = (toprightBarPosition + barHeight / 2) - self.ballPositionY
                IntersectionY = (relativeIntersectY / (barHeight / 2))
                bounceAngle = IntersectionY * math.pi / 4

                self.velocityX =  self.speed * -math.cos(bounceAngle)
                self.velocityY =  self.speed * -math.sin(bounceAngle)

                self.speed += 0.2
            #(ballPosition.x === 3 && ballPosition.y >= botLeftBarPosition && ballPosition.y <= botLeftBarPosition + 20 && velocity.x < 0) ||
            #bot left
            elif (self.ballPositionX <= 3 and self.ballPositionY + 5 >= botleftBarPosition
                  and self.ballPositionY + 5 <= botleftBarPosition + barHeight):

                relativeIntersectY = (botleftBarPosition + barHeight / 2) - self.ballPositionY
                IntersectionY = (relativeIntersectY / (barHeight / 2))
                bounceAngle = IntersectionY * math.pi / 4

                self.velocityX =  self.speed * math.cos(bounceAngle)
                self.velocityY =  self.speed * -math.sin(bounceAngle)

                self.speed += 0.2
            #bot right
            #(ballPosition.x === 94 && ballPosition.y >= botRightBarPosition && ballPosition.y <= botRightBarPosition + 20 && velocity.x > 0)
            elif (self.ballPositionX >= 94 and self.ballPositionY + 5 >= botrightBarPosition
                  and self.ballPositionY + 5 <= botrightBarPosition + barHeight):

                relativeIntersectY = (botrightBarPosition + barHeight / 2) - self.ballPositionY
                IntersectionY = (relativeIntersectY / (barHeight / 2))
                bounceAngle = IntersectionY * math.pi / 4

                self.velocityX =  self.speed * -math.cos(bounceAngle)
                self.velocityY =  self.speed * -math.sin(bounceAngle)

                self.speed += 0.2




            ##########################
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
                if self.strgameId in self.__class__.barsPosiotionsContainer:
                    del self.__class__.barsPosiotionsContainer[self.strgameId]
                if self.strgameId in self.__class__.group_sizes:
                    del self.__class__.group_sizes[self.strgameId]
                if self.strgameId in self.__class__.started:
                    del self.__class__.started[self.strgameId]
            else:
                pos = 'ball,' + str(self.ballPositionX) + ',' + str(self.ballPositionY) + ',' + str(self.leftScore) + ',' + str(self.rightScore)

            await self.channel_layer.group_send(
                self.strgameId,
                {
                    'type': 'relay',
                    'message': pos
                }
            )
