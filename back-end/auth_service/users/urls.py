from django.contrib import admin
from django.urls import path
from . import views
from rest_framework_simplejwt import views as jwt_views

urlpatterns = [
    path("oauth/",views.Ouath,name="oauth"),
    path('login/', views.LoginView, name='LoginView'),
    path('decode_and_check/', views.verify_token, name='verify'),
    path('refresh/', views.Getrefresh, name='Getrefresh'),
    path('register', views.SignUp.as_view(),name='sign up'),
    path('userRequest', views.UserRequest,name='send request'),
    path('send_request', views.send_request,name='send request'),
    path('requests', views.list_requestes,name='requests'),
    path('accept_request', views.accept_request,name='accept_request'),
    path('profile/<str:pk>', views.profile,name='profile'),
    path('get_Or_UpdateDataUser', views.Get_Or_UpdateDataUser,name="UpdateUserData"),
    path('twoFa', views.generate_qr_code, name='generate_qr_code'),
    path('verify', views.verifyOtp, name='generate_qr_code'),
    path('changePassword', views.changePassword, name='generate_qr_code'),
    path('searchUsers', views.searchUsers, name='searchUsers'),
    path('notify', views.Notifications, name='notifications'),
    path('unfriend', views.unfriend, name='unfriend'),
    path('block', views.BlockList, name='block'),
    path('SingleBlock/<str:profile_id>', views.SingleBlock, name='SingleBlock'),
    path('unblock', views.unblock, name='unblock'),
    path('logout', views.LogoutView.as_view(), name='logout'),
    path('request-password-reset/', views.RequestPasswordReset, name='password-reset-request'),
    path('rest_password/<uid>/<token>/', views.reset, name='reset-password'),
    path('getConversations', views.getConversations, name='getConversations'),
    path('getMessages/<str:id>', views.getMessages,name='getMessages'),
    path('sendMessage', views.sendMessage,name='sendMessage'),
    path('createNewChat', views.createNewChat,name='createNewChat'),
    path('FriendRequests', views.FriendRequests,name='FriendRequests'),
    path('Onlines', views.getFriendsOnline,name='getFriendsOnline'),
    path('readMessage/<str:id>', views.readMessage,name='readMessage'),
    path('deleteAccount/', views.delete_account, name='deleteAccount'),
    path('getFriendLogic/<str:profile_id>', views.getFriendLogic, name='getFriendLogic'),

]
