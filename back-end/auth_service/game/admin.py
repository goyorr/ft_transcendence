from django.contrib import admin
from .models import Game,Tournament,Join,Match,Rounds,winnerTournament,PlayerAchievement,MultiplayerGame

# Register your models here.
admin.site.register(Game)
admin.site.register(Tournament)
admin.site.register(Join)
admin.site.register(Match)
admin.site.register(Rounds)
admin.site.register(winnerTournament)
admin.site.register(PlayerAchievement)
admin.site.register(MultiplayerGame)
