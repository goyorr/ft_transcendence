from django.db import models
import uuid
from django.conf import settings
import shortuuid

from django.db import models
from django.contrib.auth.models import AbstractUser,BaseUserManager
from django.utils.translation import gettext_lazy as _
from django.core.validators import FileExtensionValidator

def upload_to(instance, filename):
    return 'images/{filename}'.format(filename=filename)

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email field must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(email, password, **extra_fields)


class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey('Conversation', related_name='messages', on_delete=models.CASCADE, null=True, blank=True)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='received_messages', on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_read = models.BooleanField(default=False)
    edited = models.BooleanField(default=False)
    deleted = models.BooleanField(default=False)
    reply_to = models.ForeignKey('Message', related_name='replies', on_delete=models.CASCADE, null=True, blank=True)
    def __str__(self):
        return f"{self.sender} send to {self.receiver} : {self.content}"

    
class Conversation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user1 = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='conversations_user1', on_delete=models.CASCADE)
    user2 = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='conversations_user2', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    isFriend = models.BooleanField(default=True)
    isBlocked = models.BooleanField(default=False)
    blockedBy = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='blockedBy', on_delete=models.CASCADE, null=True, blank=True)
    

    def __str__(self):
        return f"{self.user1} and {self.user2} conversation"
    
class CustomUser(AbstractUser):
    id = models.CharField(primary_key=True, max_length=22, default=shortuuid.uuid, editable=False)
    username = models.CharField(max_length=50, unique=False)
    email = models.EmailField(_('email address'), unique=True)
    image = models.ImageField(upload_to=upload_to, validators=[FileExtensionValidator(['png', 'jpg', 'gif', 'jpeg'])])
    cover_image = models.ImageField(upload_to=upload_to, validators=[FileExtensionValidator(['png', 'jpg', 'gif', 'jpeg'])], null=True, blank=True)
    is_staff = models.BooleanField(default=False) 
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    friends = models.ManyToManyField("CustomUser", related_name='friends_list', blank=True)
    enableTwoFA = models.BooleanField(default=False)
    otp_base32 = models.CharField(max_length=255, null=True)
    otp_verified = models.BooleanField(default=False)  
    win = models.IntegerField(default=0)
    lose = models.IntegerField(default=0)
    level = models.IntegerField(default=0)
    elo_rating = models.IntegerField(default=600)
    total_game = models.IntegerField(default=0)
    coin = models.PositiveIntegerField(default=0)
    conversations = models.ManyToManyField('Conversation', related_name='conversations', blank=True)
    intra_id = models.IntegerField(blank=True, null=True)
    is_online = models.BooleanField(default=False)
    last_heartbeat = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'email' 
    REQUIRED_FIELDS = [] 
    objects = CustomUserManager()

    def __str__(self):
        return str(self.id)



class Friend_request(models.Model):
    from_user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='friend_requests_sent', on_delete=models.CASCADE)
    to_user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='friend_requests_received', on_delete=models.CASCADE)
    is_accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"user Id {self.id}"
    

class Notification(models.Model):
    from_user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='from_user', on_delete=models.CASCADE,default=1)
    to_user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='to_user', on_delete=models.CASCADE,default=3)
    created_at = models.DateTimeField(auto_now_add=True)
    type_notification = models.CharField(max_length=255,default='')
    is_read = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.type_notification} from {self.from_user}"

class Block(models.Model):
    blocker_id = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='blocker_id', on_delete=models.CASCADE)
    blocked_id = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='blocked_id', on_delete=models.CASCADE)

    class Meta:
            unique_together = ('blocker_id','blocked_id')
    def __str__(self):
        return f"{self.blocker_id} is blocking {self.blocked_id}"


class PasswordReset(models.Model):
    email = models.EmailField()
    token = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.token)