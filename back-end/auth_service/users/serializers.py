from rest_framework import serializers
from .models import CustomUser,Friend_request,Notification,Block,PasswordReset,Message,Conversation
from django.utils.html import escape
from game.models import Join
from game.models import winnerTournament


class Register(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['email', 'password', 'username', 'first_name', 'last_name']
        extra_kwargs = {
            'password': {'write_only': True}  
        }

    def validate_first_name(self, value):
        if len(value) < 3 or len(value) > 50:
            raise serializers.ValidationError("First name must be between 3 and 50 characters.")
        return value

    def validate_last_name(self, value):
        if len(value) < 3 or len(value) > 50:
            raise serializers.ValidationError("Last name must be between 3 and 50 characters.")
        return value

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        return value

    def validate_username(self, value):
        if ' ' in value:
            raise serializers.ValidationError("Username cannot contain spaces.")
        return value

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password']
        )
        return user

class SendRequestSerlizer(serializers.ModelSerializer):        
    class Meta:
        model = Friend_request
        fields = ['from_user','to_user']


class FriendsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id','username','image','first_name','last_name')


class ProfileSerlizer(serializers.ModelSerializer):

    user_logged = serializers.SerializerMethodField()
    friends = FriendsSerializer(many=True)
    tournaments_won = serializers.SerializerMethodField()

    def get_tournaments_won(self, obj):
        return winnerTournament.objects.filter(winner=obj).count()

    def get_user_logged(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user.id
        return None 


    class Meta:
        model = CustomUser
        fields = ['id','username','email','image','friends','enableTwoFA', 'otp_base32','user_logged','last_name','first_name','win','lose','level','total_game','cover_image','tournaments_won']

        extra_kwargs = {
            'password': {'write_only': True}
        }


class Serilizer_Player(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = '__all__'
    

class UserRequestSerilizer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id','username','image','created_at')

class UserSerializer(serializers.ModelSerializer):

    friends = FriendsSerializer(many=True)

    class Meta:
        model = CustomUser
        fields = ('pk','first_name','last_name','username','email','image','enableTwoFA','friends','win','lose','level','total_game','coin','intra_id','is_online','cover_image')

    def validate_username(self, value):
        if ' ' in value:
            raise serializers.ValidationError("Username cannot contain spaces.")
        return value

class OponnetSerlize(serializers.ModelSerializer):
    nickname = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ('id','username','image',"first_name",'last_name','nickname')

    def get_nickname(self, obj):
        try:
            join = Join.objects.filter(player=obj.id).first()
            return join.nickname if join else None
        except Exception as e:
            # Log the exception if needed
            logger.error(f"Error retrieving nickname: {e}")
            return None

# class OponnetSerlize(serializers.ModelSerializer):
#     nickname = serializers.SerializerMethodField()

#     class Meta:
#         model = CustomUser
#         fields = ('id','username','image',"first_name",'last_name','nickname')

#     def get_nickname(self, obj):
#         if self.context.get('skip_nickname', False):
#             return None
#         join = Join.objects.get(player=obj.id)
#         return join.nickname
 

class SerlizerNotification(serializers.ModelSerializer):
    from_user_details = FriendsSerializer(source='from_user', read_only=True)
    from_user = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())
    to_user = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())

    class Meta:
        model = Notification
        fields = ['id', 'from_user', 'to_user', 'type_notification', 'is_read', 'created_at', 'from_user_details']


class SerializerBlock(serializers.ModelSerializer):
    blocked_user_details = FriendsSerializer(source='blocked_id',read_only=True)
    blocked_id = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())
    class Meta:
        model = Block
        fields = ['id','blocker_id','blocked_id','blocked_user_details']

class SerializerPassword(serializers.ModelSerializer):
    class Meta:
        model = PasswordReset
        fields = '__all__'

class SerializerMessage(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'

class SerializerConversation(serializers.ModelSerializer):
    user1_details = FriendsSerializer(source='user1', read_only=True)
    user2_details = FriendsSerializer(source='user2', read_only=True)
    last_message = SerializerMessage(read_only=True)
    unread_messages = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'user1', 'user2', 'user1_details', 'user2_details', 'last_message', 'unread_messages','isFriend','isBlocked','blockedBy']

    def get_unread_messages(self, obj):
        user = self.context['request'].user
        return Message.objects.filter(conversation=obj, receiver=user, is_read=False).count()
    
