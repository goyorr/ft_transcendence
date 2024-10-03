from django.contrib import admin
from .models import CustomUser,Friend_request,Notification,Block,PasswordReset,Message,Conversation


admin.site.register(CustomUser)
admin.site.register(Block)
admin.site.register(Notification)
admin.site.register(Friend_request)
admin.site.register(PasswordReset)
admin.site.register(Conversation)
admin.site.register(Message)
# admin.site.register(Friend_request)
# Register your models here.
