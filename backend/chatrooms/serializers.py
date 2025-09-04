
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
    def update(self, instance, validated_data):
        new_participants = validated_data.pop("participant_id", [])
        for user in new_participants:
            instance.participant_id.add(user)  # append karega, overwrite nahi
        instance.save()
        return instance