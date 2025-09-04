from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status,generics
from rest_framework.views import APIView
from chatrooms.models import ChatRoom
from users.models import User
from users.renderers import UserRenderer
from chatrooms.serializers import ChatRoomSerializer
from users.serializers import UserSerializer




class PrivateChatView(APIView):
    renderer_classes=[UserRenderer]
    permission_classes=[IsAuthenticated]
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
            room = ChatRoom.objects.create(room_type="private",name=user1.name+"&"+user2.name)
            room.participant_id.set([user1, user2])
        serializer = ChatRoomSerializer(room)
        return Response({"data":serializer.data,"sender":user1.id,"receiver":user2.id}, status=status.HTTP_200_OK)

class PublicChatList(generics.ListCreateAPIView):
    renderer_classes = [UserRenderer]
    queryset = ChatRoom.objects.filter(room_type="public")
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]
    def get_serializer_context(self):
        return {"request": self.request}
class PublicChatUpdateDelete(generics.RetrieveUpdateDestroyAPIView):
    renderer_classes = [UserRenderer]
    queryset = ChatRoom.objects.filter(room_type="public")
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]
    def get_serializer_context(self):
        return {"request": self.request}

#chatrooms where the user is involved like private chatrooms
class UserChatRoomView(APIView):
    renderer_classes=[UserRenderer]
    permission_classes=[IsAuthenticated]
    
    def get(self,request):
        user = request.user
        rooms = ChatRoom.objects.filter(participant_id=user)
        other_users=set()
        for room in rooms:
            for u in room.participant_id.exclude(id=user.id):
                other_users.add(u)
        serializer=UserSerializer(list(other_users),many=True)
        return Response({"data":serializer.data},status=status.HTTP_200_OK)





