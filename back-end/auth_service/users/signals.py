from django.db.models.signals import post_save,pre_save
from django.dispatch import receiver
from .models import CustomUser
from .consumers import notifications
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


@receiver(pre_save, sender=CustomUser)
def user_online_status_change(sender, instance, **kwargs):
    if kwargs.get('created', False):
        return

    if instance.pk:
        try:
            previous_instance = sender.objects.get(pk=instance.pk)
        except sender.DoesNotExist:
            return

        if previous_instance.is_online != instance.is_online:
            if previous_instance.is_online == False and instance.is_online == True:
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    "notify_public", 
                    {
                        "type": "notify_user_status",
                        "action":"login",
                        'user':{
                            "id": instance.id,
                        }
                    }
                )
                
            elif previous_instance.is_online == True and instance.is_online == False:
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    "notify_public", 
                    {
                        "type": "notify_user_status",
                        "action":"logout",
                        'user':{
                            "id": instance.id,
                        }
                    }
                )