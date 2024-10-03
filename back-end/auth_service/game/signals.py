
import datetime
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save, pre_delete
from .models import Join,Tournament,Match,Rounds,winnerTournament,Game,PlayerAchievement
from django.dispatch import receiver
import random
from django.utils import timezone
from django.db import IntegrityError
from django.core.exceptions import ObjectDoesNotExist

from users.models import CustomUser

def get_player_level_number(elo_rating):
    if elo_rating <= 1000 and elo_rating >= 900:
        return 1
    elif elo_rating <= 1100 and elo_rating >= 1000:
        return 2
    elif elo_rating <= 1200 and elo_rating >= 1100:
        return 3
    elif elo_rating <= 1300 and elo_rating >= 1200:
        return 4
    elif elo_rating <= 1400 and elo_rating >= 1300:
        return 5
    elif elo_rating <= 1500 and elo_rating >= 1400:
        return 6
    elif elo_rating <= 1600 and elo_rating >= 1500:
        return 7
    elif elo_rating <= 1700 and elo_rating >= 1600:
        return 8
    elif elo_rating <= 1800 and elo_rating >= 1700:
        return 9
    elif elo_rating <= 1900 and elo_rating >= 1800:
        return 10
    elif elo_rating <= 2000 and elo_rating >= 1900:
        return 11
    elif elo_rating <= 2100 and elo_rating >= 2000:
        return 12
    elif elo_rating <= 2200 and elo_rating >= 2100:
        return 13
    elif elo_rating <= 2300 and elo_rating >= 2200:
        return 14
    elif elo_rating <= 2400 and elo_rating >= 2300:
        return 15
    elif elo_rating <= 2500 and elo_rating >= 2400:
        return 16
    elif elo_rating <= 2600 and elo_rating >= 2500:
        return 17
    elif elo_rating <= 2700 and elo_rating >= 2600:
        return 18
    elif elo_rating <= 2800 and elo_rating >= 2700:
        return 19
    elif elo_rating <= 2900 and elo_rating >= 2800:
        return 20
    elif elo_rating <= 3000 and elo_rating >= 2900:
        return 21    
    else:
        return 22

def award_achievement(player, achievement_name):
    if not PlayerAchievement.objects.filter(player=player, achievement_name=achievement_name).exists():
        PlayerAchievement.objects.create(player=player, achievement_name=achievement_name)

def check_and_award_achievements(player, winner=True):
    if winner:
        win_count = Game.objects.filter(winner_id=player.id).count()
        if win_count >= 1:
            award_achievement(player, 'win_1_match')
        if win_count >= 10:
            award_achievement(player, 'win_10_matches')
        if win_count >= 50:
            award_achievement(player, 'win_50_matches')
        if win_count >= 100:
            award_achievement(player, 'win_100_matches')

        recent_wins = Game.objects.filter(winner_id=player.id).order_by('-date')[:10]
        win_streak = len(recent_wins)
        if win_streak >= 3:
            award_achievement(player, 'win_3_matches_in_a_row')
        if win_streak >= 5:
            award_achievement(player, 'win_5_matches_in_a_row')
        if win_streak >= 10:
            award_achievement(player, 'win_10_matches_in_a_row')
        if player.elo_rating >= 1000:
            award_achievement(player, 'elo_1000')
        if player.elo_rating >= 1500:
            award_achievement(player, 'elo_1500')
        if player.elo_rating >= 2000:
            award_achievement(player, 'elo_2000')
        if player.elo_rating >= 2500:
            award_achievement(player, 'elo_2500')

        if player.level >= 5:
            award_achievement(player, 'level_5')
        if player.level >= 10:
            award_achievement(player, 'level_10')
        if player.level >= 15:
            award_achievement(player, 'level_15')
        if player.level >= 20:
            award_achievement(player, 'level_20')

        matches_played = Game.objects.filter(winner_id=player.id).count() + Game.objects.filter(loser_id=player.id).count()
        if matches_played >= 10:
            award_achievement(player, 'play_10_matches')
        if matches_played >= 50:
            award_achievement(player, 'play_50_matches')
        if matches_played >= 100:
            award_achievement(player, 'play_100_matches')

    if player.elo_rating >= 1000:
        award_achievement(player, 'elo_1000')
    if player.elo_rating >= 1500:
        award_achievement(player, 'elo_1500')
    if player.elo_rating >= 2000:
        award_achievement(player, 'elo_2000')
    if player.elo_rating >= 2500:
        award_achievement(player, 'elo_2500')

@receiver(post_save, sender=Game)
def update_elo_ratings(sender, instance, created, **kwargs):
    if created:
        winner = instance.winner_id
        loser = instance.loser_id

        if winner is not None and loser is not None:
            K = 10  

            expected_winner = 1 / (1 + 10**((loser.elo_rating - winner.elo_rating) / 400))
            expected_loser = 1 - expected_winner

            winner_new_rating = winner.elo_rating + K * (1 - expected_winner)
            loser_new_rating = loser.elo_rating + K * (0 - expected_loser)

            winner.elo_rating = winner_new_rating
            loser.elo_rating = loser_new_rating

            winner.level = get_player_level_number(winner_new_rating)
            loser.level = get_player_level_number(loser_new_rating)

            winner.save()
            loser.save()

            check_and_award_achievements(winner, winner=True)

@receiver(post_save, sender=Join)
def IncrementPlayer(sender, instance, created, **kwargs):
    if created:
        tournament = Tournament.objects.get(id=instance.tournament_id.id)
        tournament.player_count += 1
        tournament.save()

@receiver(pre_delete, sender=Join)
def DeleteJoin(sender, instance, **kwargs):
    tournament = Tournament.objects.get(id=instance.tournament_id.id)
    tournament.player_count -= 1
    tournament.save()

@receiver(post_save, sender=Join)
def MakeGames(sender, instance, created, **kwargs):
    if created:
        try:
            tournament = Tournament.objects.get(id=instance.tournament_id.id)
        except Tournament.DoesNotExist:
            raise ValueError("Tournament does not exist")

        players = tournament.player_count
        max_players = tournament.max_players

        if players > max_players:
            try:
                join = Join.objects.filter(tournament_id=instance.tournament_id.id).order_by('-date_join').first()
                if join:
                    join.delete()
                    print("Join removed successfully.")
                else:
                    print("No join found for this tournament id.")
            except Exception as e:
                print(f"An error occurred: {e}")
            players -= 1
        elif players == max_players:
            try:
                joins = Join.objects.filter(tournament_id=tournament)
                players = [join.player for join in joins]

                if len(players) != 4:
                    raise ValueError("There must be exactly 4 players in the tournament")

                random.shuffle(players)

                Match.objects.create(
                    tournament_id=tournament,
                    player_1=players[0],
                    player_2=players[1],
                    start_time=timezone.now(),
                    end_time=timezone.now() + timezone.timedelta(hours=1)  
                )

                Match.objects.create(
                    tournament_id=tournament,
                    player_1=players[2],
                    player_2=players[3],
                    start_time=timezone.now(),
                    end_time=timezone.now() + timezone.timedelta(hours=1)
                )

            except IntegrityError as e:
                raise ValueError(f"Database error occurred: {e}")

            except Exception as e:
                raise ValueError(f"An unexpected error occurred: {e}")
        
@receiver(post_save, sender=Match)
def MakeNextMatch(sender, instance, **kwargs):

    if instance.winner_id and(instance.tournament_id.total_rounds() == instance.round_number + 1):
        winnerTournament.objects.create(
            winner = instance.winner_id,
            tournament=instance.tournament_id,
        )

        tournament = Tournament.objects.get(id=instance.tournament_id.id)
        tournament.is_end = True
        tournament.save()

    if instance.winner_id:
        current_round_number = instance.round_number

        matches = Match.objects.filter(tournament_id=instance.tournament_id, winner_id__isnull=False, round_number=current_round_number)

        winners = [match.winner_id for match in matches]

        if len(winners) < 2:
            return
        if len(winners) % 2 != 0:
            return

        random.shuffle(winners)
        next_round_number = current_round_number + 1

        next_round_matches = []
        for i in range(0, len(winners), 2):
            match = Match.objects.create(
                tournament_id=instance.tournament_id,
                player_1=winners[i],
                player_2=winners[i + 1],
                start_time=timezone.now(),
                end_time=timezone.now() + timezone.timedelta(hours=1),  
                round_number=next_round_number
            )
            next_round_matches.append(match)

        next_round = Rounds.objects.create(tournament_id=instance.tournament_id, round_number=next_round_number)
        next_round.matches.add(*next_round_matches)


@receiver(post_save, sender=Game)
def update_user_stats(sender, instance, created, **kwargs):
    if created and instance.mode != "local":
        if instance.winner_id:
            winner = instance.winner_id
            winner.win += 1
            winner.total_game += 1
            winner.save()

        if instance.loser_id:
            loser = instance.loser_id
            loser.lose += 1
            loser.total_game += 1
            loser.save()