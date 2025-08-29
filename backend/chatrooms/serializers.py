
from rest_framework import serializers
from users.models import User
from chatrooms.models import ChatRoom

class ChatRoomSerializer(serializers.ModelSerializer):
    participant_id=serializers.PrimaryKeyRelatedField(many=True,queryset=User.objects.all())
                                                      
    class Meta:
        model=ChatRoom
        fields=['id','name','participant_id']