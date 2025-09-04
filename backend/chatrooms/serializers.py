
from rest_framework import serializers
from users.models import User
from chatrooms.models import ChatRoom



class ChatRoomSerializer(serializers.ModelSerializer):
    joined = serializers.SerializerMethodField()
    participant_id=serializers.PrimaryKeyRelatedField(many=True,queryset=User.objects.all(),required=False) 
    class Meta:
        model = ChatRoom
        fields = ["id", "name", "room_type", "participant_id", 'created_at',"joined"]
    def get_joined(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.participant_id.filter(id=request.user.id).exists()
        return False