from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status,generics,viewsets
from rest_framework.views import APIView
from chatrooms.models import ChatRoom
from users.models import User
from users.renderers import UserRenderer
from chatrooms.serializers import ChatRoomSerializer
from users.serializers import UserSerializer
from django.db.models import Q



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
# this is for both private and public group create
class PublicChatList(generics.ListCreateAPIView):
    renderer_classes = [UserRenderer]
    queryset = ChatRoom.objects.filter(room_type="public")
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]
    def get_serializer_context(self):
        return {"request": self.request}

    

class AllChatGroupsList(generics.ListCreateAPIView):
    renderer_classes = [UserRenderer]
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = ChatRoom.objects.filter(
            Q(room_type="public") | Q(room_type="private_group", participant_id=user)
        ).distinct()
        #print(queryset)
        return queryset
    
    def get_serializer_context(self):
        return {"request": self.request}
    

class PublicChatUpdateDelete(generics.RetrieveUpdateDestroyAPIView):
    renderer_classes = [UserRenderer]
    queryset = ChatRoom.objects.filter(room_type="public")
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]
    def get_serializer_context(self):
        return {"request": self.request}
    
class ChatRoomViewSet(viewsets.ModelViewSet):
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer

#chatrooms where the user is involved like private chatrooms
class UserChatRoomView(APIView):
    renderer_classes=[UserRenderer]
    permission_classes=[IsAuthenticated]
    def get(self, request):
        user = request.user
        rooms = ChatRoom.objects.filter(participant_id=user,room_type='private')
        user_room_list = []

        for room in rooms:
            for other_user in room.participant_id.exclude(id=user.id):
                user_room_list.append({
                    "id": other_user.id,
                    "username": other_user.name,
                    "email": other_user.email,
                    "chatroom_id": room.id
                })
        return Response({"data": user_room_list}, status=status.HTTP_200_OK)
    

class LeaveGroupView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        user = request.user 
        try:
            group = ChatRoom.objects.get(id=pk, room_type="public")
        except ChatRoom.DoesNotExist:
            return Response({"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND)

        if user in group.participant_id.all():
            group.participant_id.remove(user) 
            group.save()
            return Response({"msg": "Left group successfully"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "User not in group"}, status=status.HTTP_400_BAD_REQUEST)





