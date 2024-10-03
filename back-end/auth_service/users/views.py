from datetime import datetime, timedelta
import json
from django.conf import settings
from django.utils import timezone
import requests
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import HttpResponse, JsonResponse
from rest_framework import status,generics
from .serializers import OponnetSerlize, Register, SerializerConversation, SerializerMessage
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import CustomUser,Friend_request,Notification,Block,PasswordReset,Message,Conversation
from .serializers import SendRequestSerlizer,ProfileSerlizer,UserRequestSerilizer,UserSerializer,FriendsSerializer,ProfileSerlizer,SerlizerNotification,SerializerBlock,SerializerPassword,SerializerBlock
from django.shortcuts import get_object_or_404
import pyotp
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from requests.exceptions import RequestException, JSONDecodeError
import jwt
from django.db.models import Q
from django.db import transaction
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from rest_framework.permissions import AllowAny
from django.utils.http import urlsafe_base64_encode
from .models import PasswordReset
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator    
from django.utils.html import escape, strip_tags
import uuid



import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


import qrcode
import io
import base64

import os

import logging

logger = logging.getLogger(__name__)
    


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getFriendsOnline(request):
    user = request.user 
    online_friends = user.friends.filter(is_online=True) 
    serializer = FriendsSerializer(online_friends, many=True)  
    return Response(serializer.data,status=200) 
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def FriendRequests(request):
    firend_request = Friend_request.objects.filter(Q(from_user=request.user) | Q(to_user=request.user))
    serializer = SendRequestSerlizer(firend_request,many=True)
    return JsonResponse({"requests":serializer.data},status=200)


def get_tokens(user):

    current_time = datetime.utcnow()

    access_payload = {
        "token_type": "access",
        "exp": current_time + settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],  
        "iat": current_time,  
        "jti": str(uuid.uuid4()).replace('-', ''),  
        "user_id": str(user.id) 
    }


    refresh_payload = {
        "token_type": "refresh",
        "exp": current_time + settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],  
        "iat": current_time, 
        "jti": str(uuid.uuid4()).replace('-', ''),  
        "user_id": str(user.id)
    }

    access_token = jwt.encode(access_payload, os.getenv("SECRET_KEY"), algorithm='HS256')

    refresh_token = jwt.encode(refresh_payload, os.getenv("SECRET_KEY"), algorithm='HS256')

    return {
        "access_token": access_token,
        "refresh_token": refresh_token
    }

@api_view(['POST'])
def verify_token(request):
    try:
        decoded_data = jwt.decode(jwt=request.data.get('access_token'),
                                  key=os.getenv("SECRET_KEY"),
                                  algorithms=["HS256"])
        

        user = CustomUser.objects.filter(pk=decoded_data['user_id']).exists()

        if user == False:
            return JsonResponse({"message":"user not found"},status=404)

        return JsonResponse({
            "data":decoded_data
        },
        status=200)
    except jwt.exceptions.ExpiredSignatureError:
        return JsonResponse ({
            'message':'expired'
        },
            status=401
        )
    except (jwt.exceptions.InvalidTokenError, jwt.exceptions.DecodeError) as e:
        return JsonResponse ({
            'message':'invalid Token'
        },
            status=401
        )

@api_view(["POST"]) 
def LoginView(request):
    logger.info('Login attempt started')
    try:
        email = strip_tags(request.data.get('email', '').strip())
        password = strip_tags(request.data.get('password', '').strip())
        
        email = escape(email)
        password = escape(password)

        logger.debug(f'Attempting to authenticate user with email: {email}')

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            logger.warning(f'Failed login attempt for user with email: {email}')
            return JsonResponse({"error": "Not found"}, status=404)

        if user.check_password(password):
            logger.info(f'User {email} authenticated successfully')
            serializer = ProfileSerlizer(user, many=False)
            tokens = get_tokens(user)
            response = HttpResponse()

            if not user.enableTwoFA:
                response.set_cookie(
                    'refresh',
                    tokens['refresh_token'],
                    httponly=False, 
                    secure=True,   
                    samesite='Lax' 
                )
                response.set_cookie(
                    'access',
                    tokens['access_token'],
                    httponly=False,
                    secure=True,
                    samesite='Lax' 
                )
            else:
                response_data = {
                    'twofa': serializer.data.get('enableTwoFA', False),
                    'access': tokens['access_token'],
                    'refresh': tokens['refresh_token'],
                }
                response.content = json.dumps(response_data)
                response['Content-Type'] = 'application/json'

            user.is_online = True
            user.save()
            logger.info(f'User {email} logged in successfully')
            return response
        else:
            logger.warning(f'Failed login attempt for user with email: {email}')
            return JsonResponse({"error": "Not found"}, status=404)
    except Exception as e:
        logger.error(f'An error occurred: {e}')
        return JsonResponse({"error": "An error Occurred"}, status=400)

from django.db import connection


class SignUp(APIView):
    def post(self, request):
        logger.info("Received sign-up request data: %s", {k: escape(v) for k, v in request.data.items()})

        email = escape(request.data.get('email'))
        password = escape(request.data.get('password'))
        username = escape(request.data.get('username'))
        first_name = escape(request.data.get('first_name'))
        last_name = escape(request.data.get('last_name'))

        if CustomUser.objects.filter(email=email).exists():
            logger.warning(f'Sign-up attempt failed: User with email {email} already exists.')
            return Response({'error': 'User with provided credentials already exists.'}, status=status.HTTP_409_CONFLICT)
        
        data = {
            'email': email,
            'password': password,
            'username': username if username else f"{first_name[0]}{last_name}",
            'first_name': first_name,
            'last_name': last_name
        }

        serializer = Register(data=data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f'User registered successfully with email: {email}')
            return Response({'data': serializer.data}, status=status.HTTP_201_CREATED)

        logger.error(f'Validation errors occurred for sign-up with email: {email}. Errors: {serializer.errors}')
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_request(request):
    from_user = request.data.get('from_user')
    to_user = request.data.get('to_user')

    is_blocked = Block.objects.filter(
        Q(blocker_id=from_user, blocked_id=to_user) | 
        Q(blocker_id=to_user, blocked_id=from_user)
    ).exists()

    if is_blocked:
        logger.warning(f'Friend request blocked: user {from_user} is blocked by or has blocked user {to_user}')
        return JsonResponse({"error": "Friend request cannot be sent due to a block relationship"}, status=status.HTTP_403_FORBIDDEN)

    logger.info(f'Received friend request from user {from_user} to user {to_user}')

    if from_user == to_user:
        logger.warning(f'Failed friend request: user cannot send a request to themselves (from_user: {from_user}, to_user: {to_user})')
        return JsonResponse({"message": "you can't send to the same user"}, status=status.HTTP_400_BAD_REQUEST)

    if to_user != request.user.id:
        already_send = Friend_request.objects.filter(Q(to_user=request.user) & Q(from_user=from_user)).exists()
        if already_send:
            logger.warning(f'Friend request already sent by user {request.user.id}')
            return JsonResponse({'error': 'The request friend already sent'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = SendRequestSerlizer(data=request.data)
        if serializer.is_valid():
            if Friend_request.objects.filter(from_user=request.user, to_user=to_user).exists():
                logger.warning(f'Friend request already exists from user {request.user.id} to user {to_user}')
                return JsonResponse({'error': 'You have already sent a friend request to this user'}, status=status.HTTP_400_BAD_REQUEST)
            
            data = {
                'from_user': from_user,
                'to_user': to_user,
                'is_read': False,
                'type_notification': 'request',
            }
            serializer_notification = SerlizerNotification(data=data)
            if serializer_notification.is_valid():
                serializer.save(from_user=request.user)
                logger.info(f'Friend request successfully sent from user {from_user} to user {to_user}')
                return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
            else:
                logger.error(f'Error in serializer for notification: {serializer_notification.errors}')
                return JsonResponse(serializer_notification.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            logger.error(f'Error in serializer for friend request: {serializer.errors}')
            return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    logger.error(f'Invalid request data (from_user: {from_user}, to_user: {to_user})')
    return JsonResponse({"error": "Invalid request data"}, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        logger.info('Logout attempt started')

        try:
            refresh_token = request.data.get('refresh_token')
            if not refresh_token:
                logger.warning('Logout attempt failed: No refresh token provided')
                return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)

            user = CustomUser.objects.get(email=request.user.email)
            user.is_online = False
            user.save()
            logger.info(f'User with email {user.email} marked as offline')

            return Response(status=status.HTTP_205_RESET_CONTENT)
        except CustomUser.DoesNotExist:
            logger.error(f'Logout failed: User with email {request.user.email} does not exist')
            return Response({'error': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print("e",e)
            logger.error(f'An error occurred during logout: {e}')
            return Response({'error': 'Internal server error'}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request,pk):
    user = get_object_or_404(CustomUser, id=pk)
    same_user = True if user == request.user else False
    try :
        if user:
            serializer = ProfileSerlizer(user,many=False,context={'request': request})
            return JsonResponse({"user":serializer.data,"same_user":same_user},status=200)
    except user.DoesNotExist:        
        return JsonResponse({"error":serializer.errors},status=404)

@api_view(['GET','DELETE'])
@permission_classes([IsAuthenticated])
def list_requestes(request):
    user = request.user
    if request.method == 'GET':
        friend_requests = Friend_request.objects.filter(Q(from_user=user) | Q(to_user=user))
        serializer = SendRequestSerlizer(friend_requests, many=True)
        return JsonResponse(serializer.data,safe=False)
    elif request.method == 'DELETE':
            to_user = request.data.get('to_user')
            if to_user is None:
                return Response({'error': 'Missing required field "to_user"'}, status=status.HTTP_400_BAD_REQUEST)
            friend_request = Friend_request.objects.filter(from_user=user, to_user=to_user).first()
            if friend_request is not None:
                notification = Notification.objects.filter(from_user=user, to_user=to_user, type_notification="request").first()
                if notification is None:
                    return Response({'error': 'Friend request or notification not found'}, status=status.HTTP_404_NOT_FOUND)
                else:
                    notification.delete()
                    friend_request.delete()
                    return JsonResponse({})
            else:
                return Response({'error': 'Friend request or notification not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response({'message': 'error'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_request(request):
    from_user_id = request.data.get('from_user_id')

    is_blocked = Block.objects.filter(
        Q(blocker_id=from_user_id, blocked_id=request.user) | 
        Q(blocker_id=request.user, blocked_id=from_user_id)
    ).exists()

    if is_blocked:
        logger.warning(f'Friend request blocked: user {from_user_id} is blocked by or has blocked user {request.user}')
        return JsonResponse({"error": "Friend request cannot be sent due to a block relationship"}, status=status.HTTP_403_FORBIDDEN)

    if not from_user_id:
        logger.warning(f"User {request.user.id} attempted to accept a friend request without providing from_user_id.")
        return JsonResponse({"accept": False, "message": "from_user_id is required"}, status=400)

    try:
        to_user = request.user
        from_user = CustomUser.objects.get(pk=from_user_id)
        logger.info(f"User {to_user.id} is attempting to accept a friend request from user {from_user.id}.")
    except CustomUser.DoesNotExist:
        logger.error(f"User {request.user.id} tried to accept a friend request from non-existent user ID {from_user_id}.")
        return JsonResponse({"accept": False, "message": "User does not exist"}, status=404)

    friend_request = Friend_request.objects.filter(from_user_id=from_user_id, to_user=to_user).first()
    if friend_request is not None:
        logger.info(f"Friend request from user {from_user.id} to user {to_user.id} found.")
    else:
        logger.error(f"Friend request from user {from_user_id} to user {to_user.id} does not exist or has already been accepted.")
        return JsonResponse({"accept": False, "message": "Friend request does not exist or already accepted"}, status=404)

    try:
        with transaction.atomic():
            friend_request.is_accepted = True
            friend_request.save()
            logger.info(f"User {to_user.id} accepted the friend request from user {from_user.id}.")

            to_user.friends.add(from_user)
            from_user.friends.add(to_user)
            logger.info(f"User {to_user.id} and user {from_user.id} are now friends.")

            if not Conversation.objects.filter(
                    (Q(user1=from_user, user2=to_user) | Q(user1=to_user, user2=from_user))).exists():
                Conversation.objects.create(user1=to_user, user2=from_user, isFriend=True, isBlocked=False, blockedBy=None)
                logger.info(f"A new conversation between user {to_user.id} and user {from_user.id} was created.")

            friend_request.delete()
            Notification.objects.filter(from_user_id=from_user_id, to_user=to_user, type_notification='request').delete()
            logger.info(f"Friend request and notification related to users {to_user.id} and {from_user.id} were deleted.")

        return JsonResponse({"accept": True, "message": "Friend request accepted successfully"}, status=200)
    except Exception as e:
        logger.exception(f"An error occurred while user {to_user.id} was accepting a friend request from user {from_user.id}: {str(e)}")
        return JsonResponse({"accept": False, "message": f"An error occurred: {str(e)}"}, status=400)
    

def get_user_data(access_token):
    headers = {
        'Authorization': 'Bearer ' + access_token
    }
    try:
        user_data = requests.get(os.getenv('URL_API_INTRA'), headers=headers)
        user_data.raise_for_status() 
        json_data = user_data.json()
        data_user = {
            'email' : json_data['email'],
            'username' : json_data['login'],
            'first_name' : json_data['first_name'],
            'last_name' : json_data['last_name'],
            'image' : json_data['image']['link'],
        }
        try:
            exist_user = CustomUser.objects.get(Q(email=data_user['email']))
            return exist_user;
        except CustomUser.DoesNotExist:
            new_user = CustomUser.objects.create(
                email=json_data['email'],
                username=json_data['login'],
                first_name=json_data['first_name'],
                last_name=json_data['last_name'],
            )
            new_user.intra_id = json_data['id']
            new_user.save()
            return new_user
    except RequestException as e:
        print(f"Request failed: {e}")


def getTokens(code):
    SECRET_KEY_INTRA = os.getenv("SECRET_KEY_INTRA")
    CLIENT_KEY_INTRA = os.getenv("CLIENT_KEY_INTRA")
    REDIRECT_URI_INTRA = os.getenv("REDIRECT_URI_INTRA")

    params = {
        'grant_type': 'authorization_code',
        'client_id':  CLIENT_KEY_INTRA,
        'client_secret':  SECRET_KEY_INTRA,
        'code': code,
        'redirect_uri':  REDIRECT_URI_INTRA,
    }

    response = requests.post(os.getenv('URL_TOKEN_INTRA'), data=params)

    return response.json()

@api_view(['POST'])
def Ouath(request):
    code = request.data.get("code")

    token = getTokens(code)
    access = token.get("access_token")
    if access is not None:
        new_user = get_user_data(access)
        if new_user is not None :
            serializer = UserSerializer(new_user,many=False)
            tokens = get_tokens(new_user)
            if serializer.data['enableTwoFA'] == True:
                response = JsonResponse(
                {
                    "refresh_token":tokens['refresh_token'],
                    "access_token":tokens['access_token'],
                    "twofa":True,
                },
                status=200
                )
                return response
            else:
                response = HttpResponse(status=200)
                response.set_cookie(
                        'refresh',
                        tokens['refresh_token'],
                        httponly=False, 
                        secure=True,   
                        samesite='Lax' 
                    )
                response.set_cookie(
                        'access',
                        tokens['access_token'],
                        httponly=False,
                        secure=True,
                        samesite='Lax' 
                    )
                response_data = {
                    'success': "OK",
                }
                response.content = json.dumps(response_data)
                response['Content-Type'] = 'application/json'
                new_user.is_online = True
                new_user.save()
                return response
    
        return JsonResponse({"error": "user Not Found"}, status=404)
    else:
        return JsonResponse({"error": "Access token not found"}, status=400)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def UserRequest(request):
    user = get_object_or_404(CustomUser, id=request.data.get('id'))
    serializer = UserRequestSerilizer(user,many=False)
    return JsonResponse({"user":serializer.data})

@api_view(['PUT', 'GET'])
@permission_classes([IsAuthenticated])
def Get_Or_UpdateDataUser(request):
    try:
        user = CustomUser.objects.get(pk=request.user.pk)
        logger.info(f"User {request.user.pk} retrieved successfully.")
    except CustomUser.DoesNotExist:
        logger.error(f"User {request.user.pk} does not exist.")
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = UserSerializer(user, many=False)
        logger.info(f"User {request.user.pk} data retrieved for GET request.")
        return JsonResponse({"user": serializer.data}, status=200)

    if request.method == "PUT":
        logger.info(f"User {request.user.pk} is attempting to update their data.")
        logger.debug(f"Update data received: {dict(request.data)}")
        
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"User {request.user.pk} updated their data successfully.")
            return Response(serializer.data)
        else:
            logger.warning(f"User {request.user.pk} provided invalid data: {serializer.errors}")
            return JsonResponse({"message": serializer.errors}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unfriend(request):
    friend_id = request.data.get('id')
    
    if not friend_id:
        logger.error(f"User {request.user.pk} attempted to unfriend without providing a friend ID.")
        return Response({"message": "Friend ID is required"}, status=status.HTTP_400_BAD_REQUEST)
    if (friend_id is None):
        logger.error(f"User {request.user.pk} provided an invalid friend ID: {friend_id}.")
        return Response({"message": "Invalid friend ID"}, status=status.HTTP_400_BAD_REQUEST)
    if friend_id == request.user.id:
        logger.warning(f"User {request.user.pk} attempted to unfriend themselves.")
        return Response({"message": "You cannot unfriend yourself"}, status=status.HTTP_400_BAD_REQUEST)


    is_blocked = Block.objects.filter(
        Q(blocker_id=friend_id, blocked_id=request.user.pk) | 
        Q(blocker_id=request.user.pk, blocked_id=friend_id)
    ).exists()

    if is_blocked:
        logger.warning(f'Friend request blocked: user {friend_id} is blocked by or has blocked user {request.user.pk}')
        return JsonResponse({"error": "Friend request cannot be sent due to a block relationship"}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        friend = CustomUser.objects.get(id=friend_id)
        user = CustomUser.objects.get(pk=request.user.id)
        logger.info(f"User {request.user.pk} is attempting to unfriend User {friend_id}.")
    except CustomUser.DoesNotExist:
        logger.error(f"User {request.user.pk} or friend User {friend_id} does not exist.")
        return Response({"message": "User not exist"}, status=status.HTTP_404_NOT_FOUND)
    
    if not user.friends.filter(id=friend_id).exists():
        logger.warning(f"User {request.user.pk} attempted to unfriend User {friend_id}, but they are not friends.")
        return Response({"message": "You are not friends with this user"}, status=status.HTTP_400_BAD_REQUEST)
    
    user.friends.remove(friend)
    friend.friends.remove(user)
    logger.info(f"User {request.user.pk} and User {friend_id} are no longer friends.")
    
    conversation = Conversation.objects.filter(Q(user1=user, user2=friend) | Q(user1=friend, user2=user)).first()
    if conversation:
        conversation.isFriend = False
        conversation.isBlocked = False
        conversation.blockedBy = None
        conversation.save()
        logger.info(f"Conversation between User {request.user.pk} and User {friend_id} updated to reflect unfriended status.")

    return JsonResponse({"remove": "success"}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_qr_code(request):
    try:
        user = CustomUser.objects.get(pk=request.user.pk)
    except CustomUser.DoesNotExist:
        return None
    otp_base32 = pyotp.random_base32()
    
    otp_auth_url = pyotp.totp.TOTP(otp_base32).provisioning_uri(
    name=user.username.lower(), issuer_name= os.getenv("DOMAIN_NAME") + ".com")

    user.otp_base32 = otp_base32
    user.save()
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=6,
    )

    qr.add_data(otp_auth_url)
    qr.make(fit=True)

    qr_img = qr.make_image(fill_color="black", back_color="white")

    img_bytes_io = io.BytesIO()
    qr_img.save(img_bytes_io, format="PNG")
    img_bytes_io.seek(0)
    img_bytes = img_bytes_io.getvalue()

    img_base64 = base64.b64encode(img_bytes).decode('utf-8')

    qr_code_link = f"data:image/png;base64,{img_base64}"
    return JsonResponse({"link_qr":qr_code_link},status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verifyOtp(request):
    enabled = request.data.get('enabled')
    OTP = request.data.get('otp')
    
    if not OTP:
        logger.error(f"User {request.user.pk} failed to provide OTP.")
        return JsonResponse({"status": "Verification failed", "message": "OTP is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = CustomUser.objects.get(pk=request.user.pk)
        logger.info(f"User {request.user.pk} is attempting OTP verification.")
    except CustomUser.DoesNotExist:
        logger.error(f"User {request.user.pk} does not exist.")
        return Response({"status": "Verification failed", "message": "No user with the corresponding username and password exists"}, 
                        status=status.HTTP_404_NOT_FOUND)

    OTP_BASE_32 = user.otp_base32
    totp = pyotp.TOTP(OTP_BASE_32)

    check = totp.verify(OTP)
    if not check:
        logger.warning(f"User {request.user.pk} provided an invalid OTP.")
        return JsonResponse({"status": "Verification failed", "message": "__otp_invalid"}, 
                            status=status.HTTP_400_BAD_REQUEST)
    
    if enabled is not None:
        logger.info(f"User {request.user.pk} is updating 2FA settings to {'enabled' if enabled else 'disabled'}.")
        data = {'enableTwoFA': enabled}
        serializer = UserSerializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"User {request.user.pk} successfully updated 2FA settings.")
        else:
            logger.error(f"User {request.user.pk} failed to update 2FA settings. Errors: {serializer.errors}")
            return JsonResponse({"status": "Verification failed", "message": "Failed to update 2FA settings"}, 
                                status=status.HTTP_400_BAD_REQUEST)
    else:
        tokens = get_tokens(user)
        response = HttpResponse(status=200)

        response.set_cookie(
            'refresh',
            tokens['refresh_token'],
            httponly=False, 
            secure=True,   
            max_age=60*60*24*7,
            samesite='Lax'
        )
        response.set_cookie(
            'access',
            tokens['access_token'],
            httponly=False,
            secure=True,
            max_age=60*15,
            samesite='Lax'
        )

        response_data = {'otp_verified': True}
        response.content = json.dumps(response_data)
        response['Content-Type'] = 'application/json'

        logger.info(f"User {request.user.pk} successfully verified OTP.")
        return response
    
    return Response({'otp_verified': check})



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def changePassword(request):
    old = request.data.get('oldpassword')
    new = request.data.get('newpassword')

    if old is None or new is None:
        logger.error(f"User {request.user.pk} failed to provide both old and new passwords.")
        return JsonResponse({"error": "Old password and new password are required."}, status=status.HTTP_400_BAD_REQUEST)
    
    if len(old) < 8 or len(new) < 8:
        logger.warning(f"User {request.user.pk} provided a password that is too short.")
        return JsonResponse({"error": "password_car"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = CustomUser.objects.get(pk=request.user.pk)
        logger.info(f"User {request.user.pk} is attempting to change their password.")
    except CustomUser.DoesNotExist:
        logger.error(f"User {request.user.pk} does not exist.")
        return Response({"response": "No User exist"}, status=status.HTTP_404_NOT_FOUND)
    
    if user.check_password(new):
        logger.warning(f"User {request.user.pk} attempted to set a new password that is the same as the current password.")
        return JsonResponse({"error": "error_old_password"}, status=status.HTTP_400_BAD_REQUEST)

    if not user.check_password(old):
        logger.warning(f"User {request.user.pk} provided an incorrect old password.")
        return JsonResponse({"error": "__old_password_incorrect"}, status=status.HTTP_400_BAD_REQUEST)
    
    user.set_password(new)
    user.save()
    logger.info(f"User {request.user.pk} successfully changed their password.")

    return JsonResponse({"message": "__changed_password_success."}, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def searchUsers(request):
    q = request.query_params.get('q')
    if q:
        users = CustomUser.objects.filter(Q(last_name__icontains=q) | Q(first_name__icontains=q) | Q(username__icontains=q))
    
        serializer = OponnetSerlize(users, many=True,context={'skip_nickname':True})
        return JsonResponse({"users":serializer.data}, status=200)
    else:
        return JsonResponse({"message": "Query parameter 'q' is required."}, status=400)

@api_view(['GET', 'POST', 'PUT'])
@permission_classes([IsAuthenticated])
def Notifications(request):
    try:
        if not request.user.is_authenticated:
            logger.warning("Unauthorized access attempt.")
            return Response({"error": "Authentication required."}, status=status.HTTP_403_FORBIDDEN)
        
        if request.method == 'GET':
            notifications = Notification.objects.filter(Q(to_user=request.user)).order_by('-created_at')
            count_unread_notification = Notification.objects.filter(Q(to_user=request.user) & Q(is_read=False)).order_by('-created_at').count()
            serializer = SerlizerNotification(notifications, many=True)
            logger.info(f"User '{request.user.username}' fetched notifications. Total: {len(serializer.data)}, Unread count: {count_unread_notification}")
            return JsonResponse({'notifications': serializer.data, 'count': count_unread_notification}, status=200)
        
        elif request.method == 'POST':
            serializer = SerlizerNotification(data=request.data)
            if serializer.is_valid():
                try:
                    user = CustomUser.objects.get(Q(id=request.data['from_user']))
                except CustomUser.DoesNotExist:
                    logger.error(f"Invalid user ID provided: {request.data['from_user']}. User not found.")
                    return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
                
                serializer_user = ProfileSerlizer(user, many=False)
                serializer.validated_data['message'] = f"{serializer_user.data['username']} sent you a friend request."
                serializer.save()
                logger.info(f"User '{request.user.username}' sent a friend request notification to '{user.username}'")
                return Response(serializer.data)
            else:
                logger.warning(f"Invalid data for POST request from user '{request.user.username}': {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'PUT':
            serializer = SerlizerNotification(data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                logger.info(f"User '{request.user.username}' updated notification. Data: {serializer.validated_data}")
                return Response(serializer.data)
            else:
                logger.warning(f"Invalid data for PUT request from user '{request.user.username}': {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"An error occurred while processing notifications for user '{request.user.username}': {str(e)}")
        return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def BlockList(request):
    if request.method == 'GET':
        try:
            blockList = Block.objects.filter(Q(blocker_id=request.user))
            serializer = SerializerBlock(blockList, many=True)
            logger.info(f"User '{request.user.username}' fetched their block list. Total blocks: {len(serializer.data)}")
            return JsonResponse({"blockList": serializer.data}, status=status.HTTP_200_OK)
        except Block.DoesNotExist:
            logger.warning(f"Block list for user '{request.user.username}' does not exist.")
            return JsonResponse({}, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        current_user = request.user
        profile_id = request.data.get('profile_id')
        
        if profile_id is None:
            logger.warning(f"User '{current_user.username}' attempted to block with missing profile_id.")
            return JsonResponse({'message': "Profile ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        if str(current_user.id) == str(profile_id):
            logger.warning(f"User '{current_user.username}' attempted to block themselves.")
            return JsonResponse({'message': "Cannot block yourself"}, status=status.HTTP_400_BAD_REQUEST)
        
        conv = Conversation.objects.filter(
            (Q(user1=current_user) & Q(user2=profile_id)) | 
            (Q(user1=profile_id) & Q(user2=current_user))
        ).first()
        if conv:
            conv.isBlocked = True
            conv.blockedBy = current_user
            conv.save()
            logger.info(f"User '{current_user.username}' has blocked conversation with user '{profile_id}'.")

        try:
            profile_user = CustomUser.objects.get(id=profile_id)
            
            if Block.objects.filter(blocker_id=current_user, blocked_id=profile_user).exists():
                logger.info(f"User '{current_user.username}' already has an active block against user '{profile_id}'.")
                return JsonResponse({"message": "Already blocked"}, status=status.HTTP_409_CONFLICT)
            
            data = {
                'blocker_id': current_user.id,
                'blocked_id': profile_id
            }
            serializer = SerializerBlock(data=data)
            
            if serializer.is_valid():
                friend = CustomUser.objects.get(id=profile_id)
                user = CustomUser.objects.get(pk=request.user.id)

                user.friends.remove(friend)
                friend.friends.remove(user)
                logger.info(f"User '{current_user.username}' removed user '{profile_id}' from their friends list due to blocking.")
                
                Friend_request.objects.filter(
                    (Q(from_user=current_user) & Q(to_user=profile_user)) |
                    (Q(from_user=profile_user) & Q(to_user=current_user))
                ).delete()
                logger.info(f"Friend requests between user '{current_user.username}' and '{profile_id}' have been deleted.")

                Notification.objects.filter(
                    (Q(from_user=current_user) & Q(to_user=profile_user) & (Q(type_notification='request') | Q(type_notification='accept'))) |
                    (Q(from_user=profile_user) & Q(to_user=current_user) & Q(type_notification='request') | Q(type_notification='accept'))
                ).delete()
                logger.info(f"Friend request notifications between user '{current_user.username}' and '{profile_id}' have been deleted.")

                serializer.save()
                logger.info(f"User '{current_user.username}' successfully blocked user '{profile_id}'.")
                return Response({"is_block": True}, status=status.HTTP_201_CREATED)
            
            else:
                logger.warning(f"Invalid data for POST request from user '{current_user.username}': {serializer.errors}")
                return Response({'message': "Invalid data"}, status=status.HTTP_400_BAD_REQUEST)
        
        except CustomUser.DoesNotExist:
            logger.error(f"User '{current_user.username}' attempted to block a non-existent user with ID '{profile_id}'.")
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            logger.error(f"An error occurred while processing block request for user '{current_user.username}': {str(e)}")
            return Response({'message': "An internal server error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def SingleBlock(request,profile_id):
    current_user = request.user

    try:
        profile_user = CustomUser.objects.get(id=profile_id)
    except CustomUser.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    is_blocker = Block.objects.filter(blocker_id=current_user,blocked_id=profile_user).exists()
    is_blocked = Block.objects.filter(blocker_id=profile_user,blocked_id=current_user).exists()

    return JsonResponse({
        'isBlocker': is_blocker,
        'isBlocked': is_blocked
    }, status=status.HTTP_200_OK)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unblock(request):
    blocker_id = request.user
    blocked_id = request.data.get('blocked_id')
    
    if blocked_id is None:
        logger.warning(f"User '{blocker_id.username}' attempted to unblock with missing blocked_id.")
        return JsonResponse({'message': "Blocked ID is required"}, status=status.HTTP_400_BAD_REQUEST)

    if str(blocker_id.id) == str(blocked_id):
        logger.warning(f"User '{blocker_id.username}' attempted to unblock themselves.")
        return JsonResponse({'message': "Cannot unblock yourself"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        conv = Conversation.objects.filter(
            (Q(user1=blocker_id) & Q(user2=blocked_id)) | 
            (Q(user1=blocked_id) & Q(user2=blocker_id))
        ).first()
        if conv:
            conv.isBlocked = False
            conv.blockedBy = None
            conv.save()
            logger.info(f"User '{blocker_id.username}' has unblocked conversation with user '{blocked_id}'.")
        
        try:
            block = Block.objects.get(Q(blocker_id=blocker_id) & Q(blocked_id=blocked_id))
            block.delete()
            logger.info(f"User '{blocker_id.username}' successfully removed block on user '{blocked_id}'.")
            return JsonResponse({"message": "Block deleted"}, status=status.HTTP_200_OK)
        
        except Block.DoesNotExist:
            logger.warning(f"User '{blocker_id.username}' attempted to unblock user '{blocked_id}', but no block entry exists.")
            return JsonResponse({'message': "Block entry does not exist"}, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        logger.error(f"An error occurred while processing unblock request for user '{blocker_id.username}': {str(e)}")
        return JsonResponse({'message': "An internal server error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
  


@api_view(['POST'])
@permission_classes([AllowAny])
def RequestPasswordReset(request):
    email = request.data.get('email')
    
    if email is None:
        logger.warning("Password reset request failed: Email not provided.")
        return JsonResponse({'message': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = CustomUser.objects.filter(Q(email=email)).first()
        if user is None:
            logger.warning(f"Password reset request failed: No user found with email '{email}'.")
            return JsonResponse({'message': 'User with this email not found'}, status=status.HTTP_404_NOT_FOUND)
        
        uidb64 = urlsafe_base64_encode(force_bytes(user.id))
        token = default_token_generator.make_token(user)
        reset_url = f"https://{os.getenv('DOMAIN_NAME')}/forgot-password/{uidb64}/{token}"
        data = {
            'email': email,
            'token': token,
        }
        serializer = SerializerPassword(data=data)
        
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Password reset request initiated for user with email '{email}'.")

            sender_email = settings.EMAIL_DEFAULT_SENDER
            subject = "Password Reset Request"
            email_body = f"""
            <p>Hello,</p>
            <p>You have requested to reset your password. Please click the link below to reset your password:</p>
            <p><a href="{reset_url}">Reset Password</a></p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Thank you!</p>
            """
            msg = MIMEMultipart()
            msg['From'] = sender_email
            msg['To'] = email
            msg['Subject'] = subject
            msg.attach(MIMEText(email_body, 'html'))

            try:
                with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT) as server:
                    server.starttls()
                    server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
                    server.sendmail(sender_email, email, msg.as_string())
                    logger.info(f"Password reset email sent successfully to '{email}'.")
            except Exception as e:
                logger.error(f"Failed to send password reset email to '{email}': {str(e)}")
                return JsonResponse({'message': 'Failed to send email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({'message': 'Email sent successfully'}, status=status.HTTP_200_OK)
        
        logger.warning(f"Invalid data provided for password reset request: {serializer.errors}")
        return JsonResponse({'message': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.error(f"An error occurred during the password reset request: {str(e)}")
        return JsonResponse({'message': 'An internal server error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST', 'GET'])
def reset(request, uid, token):
    if request.method == 'POST':
        new_password = request.data.get('npassword')
        cnew_password = request.data.get('cnpassword')

        if new_password is None or cnew_password is None:
            logger.warning("Password reset failed: Password fields must be present.")
            return JsonResponse({'message': 'Passwords fields must be present'}, status=status.HTTP_400_BAD_REQUEST)
        
        if new_password != cnew_password or len(new_password) < 8:
            logger.warning("Password reset failed: Passwords do not match or are too short.")
            return JsonResponse({'message': 'Passwords do not match or are too short'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid_decoded = force_str(urlsafe_base64_decode(uid))
            user = CustomUser.objects.get(pk=uid_decoded)

            if user.check_password(new_password):
                logger.warning(f"User '{user.email}' attempted to reset password with the same old password.")
                return JsonResponse({'message': 'The new password is the same as the old password'}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()
            logger.info(f"Password successfully changed for user '{user.email}'.")
            return JsonResponse({'message': 'Password changed successfully'}, status=status.HTTP_201_CREATED)
        
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist) as e:
            logger.error(f"Password reset failed due to an error: {str(e)}")
            return JsonResponse({'message': 'Oops, something went wrong!'}, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'GET':
        try:
            uid_decoded = force_str(urlsafe_base64_decode(uid))
            user = CustomUser.objects.get(pk=uid_decoded)
            is_valid = default_token_generator.check_token(user, token)
            
            if not is_valid:
                logger.warning(f"Password reset token is invalid for user '{user.email}'.")
                return JsonResponse({'message': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
            
            token_user = PasswordReset.objects.get(token=token, email=user.email)
            current_time = timezone.now()
            time_difference = current_time - token_user.created_at
            
            if time_difference > timedelta(minutes=15):
                logger.warning(f"Password reset token expired for user '{user.email}'.")
                return JsonResponse({'message': 'Token is expired'}, status=status.HTTP_401_UNAUTHORIZED)
            
            logger.info(f"Password reset token validated for user '{user.email}'.")
            return JsonResponse({'message': 'Token is valid'}, status=status.HTTP_200_OK)
        
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist, PasswordReset.DoesNotExist) as e:
            logger.error(f"Error while validating password reset token: {str(e)}")
            return JsonResponse({'message': 'Oops, something went wrong!'}, status=status.HTTP_400_BAD_REQUEST)



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def getConversations(request):
    user = request.user
    conversations = Conversation.objects.filter(Q(user1=user) | Q(user2=user))
    for conversation in conversations:
        messages = Message.objects.filter(conversation=conversation)
        conversation.unread_messages = messages.filter(receiver=user, is_read=False).count()
        conversation.messages_count = messages.count()
        conversation.last_message = messages.order_by('-created_at').first() if messages else None
    conversations = sorted(conversations, key=lambda x: x.last_message.created_at if x.last_message else x.created_at, reverse=True)    
    serializer = SerializerConversation(conversations, many=True, context={'request': request})
    return JsonResponse(serializer.data, safe=False)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getMessages(request, id):
    user = request.user
    ConversationId = id
    # get lastgeted message from url parameter
    lastgetedParam = request.GET.get('lastgeted')
    lastgeted = None
    # print("====================================")
    # print("lastgetedParam",lastgetedParam)
    # print("====================================")
    if lastgetedParam != None and lastgetedParam != '' and lastgetedParam != 'null':
        lastgeted = Message.objects.get(id=lastgetedParam)
    conversation = Conversation.objects.get(id=ConversationId)
    if conversation is None:
        return JsonResponse({'error': 'conversation not found'}, status=404)
    messages = []
    if not lastgeted:
        # get last 20 messages
        messages = Message.objects.filter(conversation=conversation).order_by('created_at')
        unread_messages = messages.filter(receiver=user, is_read=False)
        for message in unread_messages:
            message.is_read = True
            message.save()
        messages = list(messages)[-20:]
    else:
        # get messages before lastgeted
        messages = Message.objects.filter(conversation=conversation, created_at__lt=lastgeted.created_at).order_by('created_at')
        unread_messages = messages.filter(receiver=user, is_read=False)
        for message in unread_messages:
            message.is_read = True
            message.save()            
        messages = list(messages)[-20:]
    # mark messages as read
    serializer = SerializerMessage(messages, many=True)
    # print("------------------------------------")
    # print("serializer.data   ",serializer.data)
    # print("------------------------------------")
    return JsonResponse(serializer.data, safe=False)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sendMessage(request):
    user = request.user
    message = request.data.get('content')
    conversation = request.data.get('conversation')
    replyTo = request.data.get('replyTo')
    if  message is None or conversation is None:
        return JsonResponse({'error': 'receiver and message are required'}, status=400)
    if len(message) > 256:
        return JsonResponse({'error': 'message is too long'}, status=400)
    if len(message) < 1:
        return JsonResponse({'error': 'message cannot be empty'}, status=400)
    try:
        conversation = Conversation.objects.get(id=conversation)
        if conversation.isBlocked:
            return JsonResponse({'error': 'conversation is blocked'}, status=400)
    except Conversation.DoesNotExist:
        return JsonResponse({'error': 'conversation not found'}, status=404)
    receiver = conversation.user1 if conversation.user1 != user else conversation.user2
    replyToMessage = Message.objects.filter(id=replyTo).first()
    new_message = Message(sender=user, receiver=receiver, content=message, conversation=conversation, reply_to=replyToMessage if replyToMessage else None)
    # print("new_message",new_message)
    new_message.save()
    new_message_serializer = {
        'id': new_message.id,
        'sender': new_message.sender.id,
        'receiver': new_message.receiver.id,
        'content': new_message.content,
        'created_at': new_message.created_at,
        'updated_at': new_message.updated_at,
        'reply_to': replyToMessage.id if replyToMessage else None
    }
    return JsonResponse(new_message_serializer, status=201)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def createNewChat(request):
    user1 = request.user
    user2 = request.data.get('receiver')
    if user2 is None:
        return JsonResponse({'error': 'receiver is required'}, status=400)
    # check if user in friends list
    if not user1.friends.filter(id=user2).exists():
        return JsonResponse({'error': 'receiver not in friends list'}, status=400)
    try:
        user2 = CustomUser.objects.get(id=user2)
        # check if conversation already exists
        conversation = Conversation.objects.filter(Q(user1=user1, user2=user2) | Q(user1=user2, user2=user1)).first()
        if conversation:
            conversation.visibleForBoth = True
            conversation.save()
            return JsonResponse({'id': conversation.id}, status=200)
        # create conversation
        conversation = Conversation(user1=user1, user2=user2)
        conversation.save()
        return JsonResponse({'id': conversation.id}, status=201)
    except CustomUser.DoesNotExist:
        return JsonResponse({'error': 'receiver not found'}, status=404)
    
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def readMessage(request,id):
    user = request.user
    message = Message.objects.get(id=id)
    if message is None:
        return JsonResponse({'error': 'message not found'}, status=404)
    if message.receiver != user:
        return JsonResponse({'error': 'you are not the receiver of this message'}, status=400)
    message.is_read = True
    message.save()
    return JsonResponse({'id': message.id}, status=200)

@permission_classes([IsAuthenticated])
@api_view(['POST'])
def delete_account(request):
    try:
        user = request.user
        refresh_token = request.data.get('refresh_token')
        
        if not refresh_token:
            logger.warning('Logout attempt failed: No refresh token provided')
            return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        token = RefreshToken(refresh_token)
        token.blacklist()
        logger.info(f'Token {refresh_token} successfully blacklisted')
        
        user.delete()
        logger.info(f'User with email {user.email} deleted his account')

        response = HttpResponse(status=status.HTTP_204_NO_CONTENT)
        
        response.delete_cookie('access') 
        response.delete_cookie('refresh') 

        return response

    except CustomUser.DoesNotExist:
        return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f'An error occurred while deleting account: {e}')
        return Response({'detail': 'An unexpected error occurred.'}, status=400)


@permission_classes([IsAuthenticated])
@api_view(['GET'])
def getFriendLogic(request, profile_id):
    friend_request = Friend_request.objects.filter(
        Q(from_user=profile_id, to_user=request.user) | 
        Q(to_user=profile_id, from_user=request.user)
    ).first()
    
    if friend_request is None:
        return Response({
            'sendRequest': True
        }, status=200)

    serializer = SendRequestSerlizer(friend_request)
    
    if friend_request.from_user == request.user:
        role = 'sender'
    elif friend_request.to_user == request.user:
        role = 'receiver'
    else:
        role = 'unknown'
    
    return Response({
        'sendRequest': False,
        'role': role,
        'friend_request': serializer.data
    }, status=200)


@api_view(['POST'])
def Getrefresh(request):
    refresh = request.data.get("refresh")
    
    if not refresh:
        return Response({"error": "Refresh token is missing"}, status=400)

    try:
        decoded_refresh = jwt.decode(refresh, os.getenv("SECRET_KEY"), algorithms=['HS256'])
        
        payload = {
            "token_type": "access",
            "exp": datetime.utcnow() + timedelta(seconds=900), 
            "iat": datetime.utcnow(),  
            "jti": str(uuid.uuid4()).replace('-', ''),  
            "user_id": decoded_refresh.get("user_id") 
        }

        new_access_token = jwt.encode(payload, os.getenv("SECRET_KEY"), algorithm='HS256')

        return Response({
            "access": new_access_token,
        },status=200)

    except jwt.exceptions.ExpiredSignatureError:
        return Response({"error": "Refresh token has expired"}, status=401)
    except jwt.exceptions.InvalidTokenError:
        return Response({"error": "Invalid refresh token"}, status=401)
    except jwt.exceptions.DecodeError:
        return Response({"error": "Invalid token Or Error occurred"}, status=400)