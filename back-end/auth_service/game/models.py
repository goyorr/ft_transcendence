import math
from django.db import models
from django.conf import settings
from datetime import datetime
from django.utils import timezone
from users.models import CustomUser

ACHIEVEMENT_CRITERIA_CHOICES = [
    ('win_1_match', 'Win 1 match'),
    ('win_10_matches', 'Win 10 matches'),
    ('win_50_matches', 'Win 50 matches'),
    ('win_100_matches', 'Win 100 matches'),
    ('win_3_matches_in_a_row', 'Win 3 matches in a row'),
    ('win_5_matches_in_a_row', 'Win 5 matches in a row'),
    ('win_10_matches_in_a_row', 'Win 10 matches in a row'),
    ('elo_1000', 'Reach an Elo rating of 1000'),
    ('elo_1500', 'Reach an Elo rating of 1500'),
    ('elo_2000', 'Reach an Elo rating of 2000'),
    ('elo_2500', 'Reach an Elo rating of 2500'),
    ('participate_1_tournament', 'Participate in 1 tournament'),
    ('participate_5_tournaments', 'Participate in 5 tournaments'),
    ('participate_10_tournaments', 'Participate in 10 tournaments'),
    ('win_1_tournament', 'Win 1 tournament'),
    ('win_3_tournaments', 'Win 3 tournaments'),
    ('win_5_tournaments', 'Win 5 tournaments'),
    ('level_5', 'Reach level 5'),
    ('level_10', 'Reach level 10'),
    ('level_15', 'Reach level 15'),
    ('level_20', 'Reach level 20'),
    ('play_10_matches', 'Play 10 matches'),
    ('play_50_matches', 'Play 50 matches'),
    ('play_100_matches', 'Play 100 matches'),
    ('defeat_higher_rated', 'Defeat a player with an Elo rating 200 points higher'),
    ('elo_increase_100', 'Achieve an Elo rating increase of 100 points in a single match'),
    ('win_streak_7_day', 'Achieve a winning streak of 7 matches in a single day'),
]

class Game(models.Model):
    player = models.ForeignKey(settings.AUTH_USER_MODEL,  on_delete=models.CASCADE, related_name='player_games')
    opponent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='opponent_games',null=True,blank=True)
    Winner_scr = models.IntegerField(default=0)
    Loser_scr = models.IntegerField(default=0)
    mode = models.CharField(max_length=255,default="")
    type_game = models.CharField(max_length=255,default="")
    date = models.DateTimeField(default=timezone.now)
    result = models.BooleanField(default=False)
    winner_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="winner_game",null=True,blank=True)
    loser_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="loser_game",null=True,blank=True)
    winner_alias = models.CharField(max_length=255, null=True, blank=True)
    loser_alias = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self) -> str:
        return str(self.date)
    
class Tournament(models.Model):
    organizer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='organizer')
    name = models.CharField(max_length=100, default='')
    start_date = models.DateTimeField(default=datetime.now)
    end_date = models.DateTimeField(default=datetime.now)
    player_count = models.IntegerField(default=0)
    max_players = models.IntegerField(default=4)
    is_end = models.BooleanField(default=False)

    def total_rounds(self):
        if (self.max_players & (self.max_players - 1)) != 0 or self.max_players == 0:
            raise ValueError("The number of players must be a power of 2.")
        return int(math.log2(self.max_players))
    
    def is_last_match(self, match):
        current_round = match.round_number
        total_rounds = self.total_rounds()
        if current_round < total_rounds:
            return False

        matches_in_current_round = Match.objects.filter(tournament_id=self, round_number=current_round)
        return matches_in_current_round.count() == 1

    def __str__(self):
        return str(self.name)

class Join(models.Model):
    tournament_id = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name="joins")
    player = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='joined_tournaments')
    date_join = models.DateTimeField(default=datetime.now)
    nickname = models.CharField(max_length=50,blank=True,null=True)

    def __str__(self):
        return self.nickname + " join " + str(self.tournament_id)
    
class winnerTournament(models.Model):
    winner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='Tournament_won')
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='Tournament')
    createdAt = models.DateTimeField(default=datetime.now)

    def __str__(self):
        return  str(self.winner.username) + " win tournament of " + str(self.tournament_id)

class Match(models.Model):
    tournament_id = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name="matches")
    player_1 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="matches_as_player_1")
    player_2 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="matches_as_player_2")
    winner_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="matches_won",null=True,blank=True)
    start_time = models.DateTimeField(default=datetime.now)
    end_time = models.DateTimeField(default=datetime.now)
    round_number = models.IntegerField(default=0)
    is_played = models.BooleanField(default=False)

    def __str__(self):
        return str(self.tournament_id)

class Rounds(models.Model):
    tournament_id = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name="rounds")
    round_number = models.IntegerField(default=0)
    matches = models.ManyToManyField(Match, related_name="rounds")

    def __str__(self):
        return f"Tournament {self.tournament_id}, Round {self.round_number}"

    
class PlayerAchievement(models.Model):
    player = models.ForeignKey(CustomUser,on_delete=models.CASCADE)
    achievement_name = models.CharField(max_length=50,choices=ACHIEVEMENT_CRITERIA_CHOICES)
    date_awarded =  models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.achievement_name}"

class MultiplayerGame(models.Model):
    game_id = models.AutoField(primary_key=True)
    player_1 = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE, related_name="multiplayer_matches_as_player_1")
    player_2 = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE, related_name="multiplayer_matches_as_player_2")
    player_3 = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE, related_name="multiplayer_matches_as_player_3")
    player_4 = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE, related_name="multiplayer_matches_as_player_4")
    player_count = models.IntegerField(default=0)
    is_full = models.BooleanField(default=False)

    def __str__(self):
        return str(self.game_id)
