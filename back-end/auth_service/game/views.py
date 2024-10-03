
import logging
from django.conf import settings
from django.db import models,transaction
from django.http.response import JsonResponse
from django.shortcuts import get_object_or_404, render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import Serialzer_Achievements,GameSerializer, JoinSerializer, TournamentSerializer,MatchSerializer, serilazerTernoiWinners, MultiplayerGameSerializer
from .models import Game, PlayerAchievement, Tournament,Join,Match, winnerTournament, MultiplayerGame
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination
from datetime import datetime
from django.db import connection
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from users.models import CustomUser
from django.db.models.functions import TruncMonth
from collections import defaultdict
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count
from django.db.models.functions import TruncMonth
from datetime import datetime, timedelta



logger = logging.getLogger(__name__)


def get_game_stats(user):
    today = timezone.now()
    six_months_ago = today - timedelta(days=6*30)

    
    wins = Game.objects.filter(
        ~Q(mode='local'),
        winner_id=user,
        date__range=(six_months_ago, today)
    ).count()

    losses = Game.objects.filter(
        ~Q(mode='local'),
        loser_id=user,
        date__range=(six_months_ago, today),
    ).count()
    
    return wins, losses

def get_tournaments_won(user):
    today = timezone.now()
    six_months_ago = today - timedelta(days=6*30)
    
    tournaments_won = winnerTournament.objects.filter(
        winner=user,
        createdAt__range=(six_months_ago, today)
    ).count()
    
    return tournaments_won


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getDataForDoghnutChart(request,pk):
    wins, losses = get_game_stats(pk)
    tournaments_won = get_tournaments_won(pk)
    
    data =  {
        'wins': wins,
        'losses': losses,
        'tournaments_won': tournaments_won
    }


    return JsonResponse(data,status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_win_loss_data(request,pk):
    six_months_ago = timezone.now() - timedelta(days=6*30)
    recent_games = Game.objects.filter(Q(date__gte=six_months_ago) & ~Q(mode='local'))

    wins_by_month = recent_games.filter(winner_id=pk).annotate(month=TruncMonth('date')).values('month').annotate(win_count=Count('id'))

    losses_by_month = recent_games.filter(loser_id=pk).annotate(month=TruncMonth('date')).values('month').annotate(loss_count=Count('id'))

    month_names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    win_loss_data = []
    current_date = timezone.now()
    for i in range(6):
        month = (current_date - timedelta(days=i*30)).month
        win_loss_data.append({
            'month': month_names[month - 1],
            'win': 0,
            'lose': 0
        })

    for entry in wins_by_month:
        month = entry['month'].month
        for item in win_loss_data:
            if item['month'] == month_names[month - 1]:
                item['win'] = entry['win_count']

    for entry in losses_by_month:
        month = entry['month'].month
        for item in win_loss_data:
            if item['month'] == month_names[month - 1]:
                item['lose'] = entry['loss_count']

    # win_loss_data.reverse()

    return JsonResponse(win_loss_data, safe=False)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def List_games(request,pk):
    user = get_object_or_404(CustomUser, pk=pk)
    games = Game.objects.filter(Q(player=user) | Q(opponent=user)).order_by('-date')

    serializer = GameSerializer(games, many=True)
    return Response({'games':serializer.data},status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unjoin(request):
    tournament_id = request.data.get('tournament_id')

    if tournament_id is None:
        logger.warning(f"User '{request.user}' failed to unjoin: 'tournament_id' is required.")
        return Response({'message': 'Tournament ID is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        join = Join.objects.get(tournament_id=tournament_id, player=request.user)
        
        join.delete()
        logger.info(f"User '{request.user}' successfully unjoined tournament ID '{tournament_id}'.")
        return Response({'message': 'Unjoined successfully'}, status=status.HTTP_200_OK)

    except Join.DoesNotExist:
        logger.warning(f"User '{request.user}' failed to unjoin tournament ID '{tournament_id}': User is not joined.")
        return Response({'message': 'You are not joined in this tournament'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error while processing unjoin request for user '{request.user}': {str(e)}")
        return Response({'message': 'An error occurred while processing your request'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join(request):
    tournament_id = request.data.get('tournament_id')
    nickname = request.data.get('nickname')

    if tournament_id is None or nickname is None or len(nickname) < 5:
        logger.warning(f"User '{request.user}' failed to join tournament: Missing or invalid fields.")
        return Response({'message': 'All fields are required and nickname must be at least 5 characters long'}, status=status.HTTP_400_BAD_REQUEST)

    if Join.objects.filter(tournament_id=tournament_id, player=request.user).exists():
        logger.info(f"User '{request.user}' attempted to join tournament ID '{tournament_id}' but is already joined.")
        return Response({'message': 'Already joined'}, status=status.HTTP_400_BAD_REQUEST)

    data = {
        'tournament_id': tournament_id,
        'player': request.user.pk,
        'nickname': nickname,
    }

    serializer = JoinSerializer(data=data)
    if serializer.is_valid():
        try:
            serializer.save()
            try:
                tournament = Tournament.objects.get(id=tournament_id)
                response = {
                    'id': tournament_id,
                    'player_count': tournament.player_count,
                    'is_player_joined': True
                }
                logger.info(f"User '{request.user}' successfully joined tournament ID '{tournament_id}'.")
                return Response({'success': response}, status=status.HTTP_200_OK)

            except Tournament.DoesNotExist:
                logger.warning(f"User '{request.user}' failed to join tournament ID '{tournament_id}': Tournament not found.")
                return Response({'errors': 'Tournament not found'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.error(f"Error while processing join request for user '{request.user}': {str(e)}")
            return Response({'errors': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        logger.warning(f"User '{request.user}' provided invalid data for joining tournament ID '{tournament_id}': {serializer.errors}")
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def CreateRetrieve(request):
    if request.method == 'POST':
        name = request.data.get('name')
        end_date = request.data.get('end_date')
        organizer = request.user.pk

        if not name or not end_date:
            logger.warning(f"User '{request.user}' failed to create a tournament: Missing required fields.")
            return Response({"message": "Both 'name' and 'end_date' are required"}, status=status.HTTP_400_BAD_REQUEST)

        data = {
            'name': name,
            'end_date': end_date,
            'organizer': organizer
        }
        
        serializer = TournamentSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            try:
                serializer.save()
                logger.info(f"User '{request.user}' successfully created a tournament with name '{name}'.")
                return Response({"message": "Tournament created successfully"}, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.error(f"Error while saving tournament for user '{request.user}': {str(e)}")
                return Response({"message": "Error occurred while creating tournament"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            logger.warning(f"User '{request.user}' provided invalid data for creating a tournament: {serializer.errors}")
            return Response({"message": "Invalid data", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'GET':
        query_name = request.query_params.get('qname')
        if query_name:
            tournaments = Tournament.objects.filter(
                Q(name=query_name) | 
                Q(name__startswith=query_name) | 
                Q(name__endswith=query_name) |  
                Q(name__contains=query_name)
            )
            logger.info(f"User '{request.user}' searched tournaments with query name '{query_name}'.")
        else:
            tournaments = Tournament.objects.all()
            logger.info(f"User '{request.user}' retrieved all tournaments.")

        paginator = PageNumberPagination()
        paginator.page_size = 8
        result_page = paginator.paginate_queryset(tournaments, request)
        serializer = TournamentSerializer(result_page, many=True, context={'request': request})

        return paginator.get_paginated_response(serializer.data)


@api_view(["GET","PUT"])
@permission_classes([IsAuthenticated])
def MatchTournament(request):
    matches = Match.objects.filter(Q(player_1=request.user) | Q(player_2=request.user))
    serializer = MatchSerializer(matches,many=True)
    return Response({'data':serializer.data},status=200)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def UpdateWinner(request, match_id):
    try:
        match = Match.objects.get(id=match_id)
    except Match.DoesNotExist:
        logger.error(f"User '{request.user}' attempted to update winner for non-existent match ID '{match_id}'.")
        return Response({'message': 'Match not found'}, status=status.HTTP_404_NOT_FOUND)

    winner_id = request.data.get('winner_id')
    if not winner_id:
        logger.warning(f"User '{request.user}' failed to update winner for match ID '{match_id}': 'winner_id' is missing.")
        return Response({'message': 'winner_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    data = {'winner_id': winner_id}
    serializer = MatchSerializer(match, data=data, partial=True)

    if serializer.is_valid():
        try:
            serializer.save()
            logger.info(f"User '{request.user}' successfully updated winner for match ID '{match_id}' to winner ID '{winner_id}'.")
            return Response({'message': 'Update successful'}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error while saving updated winner for match ID '{match_id}' by user '{request.user}': {str(e)}")
            return Response({'message': 'Error occurred while updating'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        logger.warning(f"User '{request.user}' provided invalid data for updating winner of match ID '{match_id}': {serializer.errors}")
        return Response({'message': 'Invalid data', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def TournamentsWins(request):
    user = request.user
    tournaments = winnerTournament.objects.filter(winner=user)
    serilazer = serilazerTernoiWinners(tournaments,many=True,context={'user':request.user})

    return Response({'tournaments':serilazer.data},status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listachievement(request,pk):
    achievements = PlayerAchievement.objects.filter(player=pk)
    paginator = PageNumberPagination()
    paginator.page_size = 5
    result_page = paginator.paginate_queryset(achievements, request)

    serializer = Serialzer_Achievements(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def UpdateIsPlayed(request, match_id):
    try:
        match = Match.objects.get(id=match_id)
    except Match.DoesNotExist:
        logger.error(f"User '{request.user}' attempted to update 'is_played' for non-existent match ID '{match_id}'.")
        return Response({'message': 'Match not found'}, status=status.HTTP_404_NOT_FOUND)

    is_played = request.data.get('is_played')
    if is_played is None:
        logger.warning(f"User '{request.user}' failed to update 'is_played' for match ID '{match_id}': 'is_played' is missing.")
        return Response({'message': 'is_played field is required'}, status=status.HTTP_400_BAD_REQUEST)

    data = {'is_played': is_played}
    serializer = MatchSerializer(match, data=data, partial=True)

    if serializer.is_valid():
        try:
            serializer.save()
            logger.info(f"User '{request.user}' successfully updated 'is_played' for match ID '{match_id}' to '{is_played}'.")
            return Response({'message': 'Update successful'}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error while saving updated 'is_played' for match ID '{match_id}' by user '{request.user}': {str(e)}")
            return Response({'message': 'Error occurred while updating'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        logger.warning(f"User '{request.user}' provided invalid data for updating 'is_played' of match ID '{match_id}': {serializer.errors}")
        return Response({'message': 'Invalid data', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def UpdateHistory(request):
    logger.info(f"User '{request.user}' is attempting to update game history.")

    serializer = GameSerializer(data=request.data)
    if serializer.is_valid():
        try:
            serializer.save()
            logger.info(f"User '{request.user}' successfully updated game history with data: {serializer.validated_data}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error while saving game history for user '{request.user}': {str(e)}")
            return Response({'message': 'Error occurred while updating game history'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        logger.warning(f"User '{request.user}' provided invalid data for updating game history: {serializer.errors}")
        return Response({'message': 'Invalid data', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def CreateJoinMultiplayer(request):
    user = request.user
    logger.info(f"User '{user}' is attempting to join a multiplayer game.")
    
    try:
        with transaction.atomic():
            game = MultiplayerGame.objects.filter(is_full=False).first()
            # user.last_heartbeat = timezone.now()
            
            if game is None:
                game = MultiplayerGame.objects.create(player_1=user)
                game.player_count += 1
                game.save()
                logger.info(f"Created new game with user '{user}' as player 1.")
            elif game.player_1 == user or game.player_2 == user or game.player_3 == user or game.player_4 == user:
                logger.info(f"User '{user}' is already in a game.")
                return Response({'detail': 'You are already in a game'}, status=status.HTTP_202_ACCEPTED)
            else:
                if game.player_1 is None:
                    game.player_1 = user
                elif game.player_2 is None:
                    game.player_2 = user
                elif game.player_3 is None:
                    game.player_3 = user
                elif game.player_4 is None:
                    game.player_4 = user
                
                game.player_count += 1
                if game.player_count == 4:
                    game.is_full = True
                
                game.save()
                logger.info(f"User '{user}' joined game with ID {game.game_id}. Total players: {game.player_count}. Game is_full: {game.is_full}.")
            return Response({'detail': 'Successfully joined the game'}, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Error occurred while creating or joining multiplayer game for user '{user}': {str(e)}")
        return Response({'detail': 'Error occurred while joining the game'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def StartGame(request):
    user = request.user

    # user.last_heartbeat = timezone.now()
    # user.save()

    game = MultiplayerGame.objects.filter(Q(player_1=user) | Q(player_2=user) | Q(player_3=user) | Q(player_4=user)).first()

    if not game:
        return Response({'detail': 'You are not in any game'}, status=status.HTTP_202_ACCEPTED)

    # players = [game.player_1, game.player_2, game.player_3, game.player_4]
    # has_removed_player = False

    # timeout_interval = timedelta(seconds=3)
    # now = timezone.now()

    # for player in players:
    #     if player and player.last_heartbeat and player.last_heartbeat < now - timeout_interval:

    #         if game.player_1 == player:
    #             game.player_1 = None
    #         elif game.player_2 == player:
    #             game.player_2 = None
    #         elif game.player_3 == player:
    #             game.player_3 = None
    #         elif game.player_4 == player:
    #             game.player_4 = None

    #         game.player_count -= 1
    #         has_removed_player = True

    # if has_removed_player:
    #     if game.player_count == 0:
    #         game.delete()
    #         return Response({'detail': 'Game ended, no active players'}, status=status.HTTP_200_OK)
    #     else:
    #         game.save()

    if not game.is_full:
        return Response({'detail': 'Game not ready'}, status=status.HTTP_202_ACCEPTED)

    serializer = MultiplayerGameSerializer(game)
    serialized_data = serializer.data
    
    return Response({'detail': 'Game started', 'game': serialized_data}, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def CleanMultiPLayer(request):
    user = request.user
    logger.info(f"User '{user}' is attempting to clean their multiplayer game.")

    try:
        game = MultiplayerGame.objects.filter(Q(player_1=user) | Q(player_2=user) | Q(player_3=user) | Q(player_4=user)).first()

        if game is None:
            logger.info(f"User '{user}' is not in any game.")
            return Response({'detail': 'You are not in any game'}, status=status.HTTP_202_ACCEPTED)
        
        game.delete()
        logger.info(f"Game with ID {game.game_id} has been cleaned by user '{user}'.")

    except Exception as e:
        logger.error(f"Error occurred while cleaning multiplayer game for user '{user}': {str(e)}")
        return Response({'detail': 'Error occurred while cleaning the game'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({'detail': 'Game cleaned'}, status=status.HTTP_200_OK)