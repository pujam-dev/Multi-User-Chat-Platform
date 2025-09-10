
from rest_framework import serializers
from users.models import User
from chatrooms.models import ChatRoom



# class ChatRoomSerializer(serializers.ModelSerializer):
#     joined = serializers.SerializerMethodField()
#     participant_id=serializers.PrimaryKeyRelatedField(many=True,queryset=User.objects.all(),required=False) 
#     class Meta:
#         model = ChatRoom
#         fields = ["id", "name", "room_type", "participant_id", 'created_at',"joined"]
#     def get_joined(self, obj):
#         request = self.context.get("request")
#         if request and request.user.is_authenticated:
#             return obj.participant_id.filter(id=request.user.id).exists()
#         return False
#     def update(self, instance, validated_data):
#         new_participants = validated_data.pop("participant_id", [])
#         for user in new_participants:
#             instance.participant_id.add(user) 
#         instance.save()
#         return instance
    

class ChatRoomSerializer(serializers.ModelSerializer):
    joined = serializers.SerializerMethodField()
    participant_id=serializers.PrimaryKeyRelatedField(many=True,queryset=User.objects.all(),required=False) 
    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'room_type', 'participant_id', 'created_at',"joined"] # Include participant_id for creating private groups
        read_only_fields = ['id']

    def create(self, validated_data):
        room_type = validated_data.get('room_type')
        participants_data = validated_data.pop('participant_id', [])

        chat_room = ChatRoom.objects.create(**validated_data)

        user = self.context['request'].user
        if user:
            chat_room.participant_id.add(user)
        if room_type == 'private_group':    
            for participant in participants_data:
                chat_room.participant_id.add(participant)

        return chat_room
    
    def get_joined(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.participant_id.filter(id=request.user.id).exists()
        return False
    def update(self, instance, validated_data):
        new_participants = validated_data.pop("participant_id", [])
        for user in new_participants:
            instance.participant_id.add(user) 
        instance.save()
        return instance