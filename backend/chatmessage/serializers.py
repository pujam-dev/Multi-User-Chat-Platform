
from rest_framework import serializers
from users.models import User
from chatmessage.models import Message


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender_id.name", read_only=True)
    receiver_name = serializers.CharField(source="receiver_id.name", read_only=True)
    chatroom_name = serializers.CharField(source="chatroom_id.name", read_only=True)
    class Meta:
        model = Message
        fields = ["id", "sender_id", "receiver_id", "chatroom_id", "content", "time_stamp",
                  "sender_name", "receiver_name", "chatroom_name"]
        read_only_fields = ["time_stamp"]