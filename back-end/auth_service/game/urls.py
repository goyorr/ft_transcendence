from django.urls import path
from .views import MatchTournament,List_games, TournamentsWins, UpdateWinner,join,unjoin,CreateRetrieve,listachievement,UpdateIsPlayed,UpdateHistory,CreateJoinMultiplayer,StartGame,CleanMultiPLayer,get_user_win_loss_data,getDataForDoghnutChart

urlpatterns = [
    path('list_game/<str:pk>',List_games,name="list_game"),
    path('join',join,name="join"),
    path('unjoin',unjoin,name="join"),
    path('Create_Retrieve',CreateRetrieve,name="join"),
    path('matches',MatchTournament,name="join"),
    path('updateWinner/<str:match_id>',UpdateWinner,name="winner"),
    path('ternoiwins',TournamentsWins,name="ternoiwins"),
    path('listachievement/<str:pk>',listachievement,name="ternoiwins"),
    path('update_is_played/<str:match_id>', UpdateIsPlayed, name='update_is_played'),
    path('update_history', UpdateHistory, name='update_history'),
    path('Create_join_multiplayer', CreateJoinMultiplayer, name='Create_join_multiplayer'),
    path('start_game', StartGame, name='start_game'),
    path('clean_multiplayer', CleanMultiPLayer, name='clean_multiplayer'),
    path('get_user_win_loss_data/<str:pk>', get_user_win_loss_data, name='win_lose_chart'),
    path('getDataForDoghnutChart/<str:pk>', getDataForDoghnutChart, name='getDataForDoghnutChart'),
]
