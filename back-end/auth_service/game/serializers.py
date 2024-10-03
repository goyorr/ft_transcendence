from rest_framework import serializers
from .models import Game, PlayerAchievement, winnerTournament
from .models import Tournament
from .models import Join
from .models import Match
from .models import MultiplayerGame
from users.serializers import OponnetSerlize
from django.utils import timezone
from users.serializers import OponnetSerlize
from django.contrib.auth import get_user_model

User = get_user_model()

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username','image')

class GameSerializer(serializers.ModelSerializer):
    opponent_info = serializers.SerializerMethodField()
    player_info = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = ('id', 'player', 'opponent', 'player_info', 'opponent_info', 'Winner_scr', 'Loser_scr', 'mode', 'type_game', 'date', 'result', 'winner_id', 'loser_id', 'winner_alias', 'loser_alias')

    def get_opponent_info(self, obj):
        context = self.context.copy()
        context['skip_nickname'] = True
        return OponnetSerlize(obj.opponent, context=context).data

    def get_player_info(self, obj):
        context = self.context.copy()
        context['skip_nickname'] = True
        return OponnetSerlize(obj.player, context=context).data

class TournamentSerializer(serializers.ModelSerializer):

      is_expired = serializers.SerializerMethodField()
      is_player_joined = serializers.SerializerMethodField()
      organizer_info =  PlayerSerializer(source='organizer',read_only=True)

      class Meta:
            model = Tournament
            fields =  ('id','name', 'start_date', 'end_date', 'player_count', 'max_players','is_expired','is_player_joined','is_end','organizer','organizer_info' )

      def get_is_expired(self,obj):
            current_time = timezone.localtime(timezone.now())
            if obj.end_date < current_time:
                  return True
            return False
      
      def get_is_player_joined(self,obj):
            return Join.objects.filter(tournament_id=obj.id,player=self.context['request'].user).exists();

class JoinSerializer(serializers.ModelSerializer):
      class Meta:
            model = Join
            fields =  '__all__'

class MatchSerializer(serializers.ModelSerializer):
      name_tournament = serializers.SerializerMethodField()
      p1 = OponnetSerlize(source='player_1',read_only=True)
      p2 = OponnetSerlize(source='player_2',read_only=True)

      def get_name_tournament(self,obj):
            tournament = Tournament.objects.get(id=obj.tournament_id.id)
            return tournament.name
      
      class Meta:
            model = Match
            fields =  ('id','tournament_id', 'player_1', 'player_2', 'winner_id', 'start_time', 'end_time', 'round_number', 'name_tournament','p1','p2','is_played')


class serilazerTernoiWinners(serializers.ModelSerializer):

      players = serializers.SerializerMethodField()
      name_tournament = serializers.SerializerMethodField()

      def get_players(self,obj):
            joins = Join.objects.filter(tournament_id=obj.tournament.id)
            players = [join.player for join in joins if join.player != self.context['user']]
            
            return PlayerSerializer(players,many=True).data
      
      def get_name_tournament(self,obj):
            return Tournament.objects.get(id=obj.tournament.id).name

      class Meta:
            model = winnerTournament
            fields = ('winner', 'tournament', 'createdAt','players','name_tournament' )

class Serialzer_Achievements(serializers.ModelSerializer):
      
      achievement_name_display = serializers.SerializerMethodField()
      
      class Meta:
            model  = PlayerAchievement
            fields = '__all__'

      def get_achievement_name_display(self, obj):
        return obj.get_achievement_name_display()

class MultiplayerUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'image', 'username')

class MultiplayerGameSerializer(serializers.ModelSerializer):
    player_1 = MultiplayerUserSerializer(read_only=True)
    player_2 = MultiplayerUserSerializer(read_only=True)
    player_3 = MultiplayerUserSerializer(read_only=True)
    player_4 = MultiplayerUserSerializer(read_only=True)

    class Meta:
        model = MultiplayerGame
        fields = ('game_id', 'player_1', 'player_2', 'player_3', 'player_4')
