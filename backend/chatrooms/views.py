from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status,generics
from rest_framework.views import APIView
from chatrooms.models import ChatRoom
from users.models import User
from users.renderers import UserRenderer
from chatrooms.serializers import ChatRoomSerializer




class PrivateChatView(APIView):
    renderer_classes=[UserRenderer]
    def post(self, request):
        user1_id = request.data.get("user1")
        user2_id = request.data.get("user2")
        try:
            user1 = User.objects.get(id=user1_id)
            user2 = User.objects.get(id=user2_id)
        except User.DoesNotExist:
            return Response({"error": "Invalid user IDs"}, status=status.HTTP_400_BAD_REQUEST)
        # already exist or not
        room = ChatRoom.objects.filter(
            room_type="private", participant_id=user1
        ).filter(participant_id=user2).first()
        if not room:
            room = ChatRoom.objects.create(room_type="private")
            room.participant_id.set([user1, user2])
        serializer = ChatRoomSerializer(room)
        return Response({"data":serializer.data,"sender":user1.id,"receiver":user2.id}, status=status.HTTP_200_OK)

class PublicChatList(generics.ListAPIView):
    queryset = ChatRoom.objects.filter(room_type="public")
    serializer_class = ChatRoomSerializer






