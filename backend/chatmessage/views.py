from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status,generics
from rest_framework.views import APIView
from users.renderers import UserRenderer
from chatmessage.serializers import MessageSerializer
from chatmessage.models import Message




class RoomMessagesView(generics.ListCreateAPIView):
    renderer_classes=[UserRenderer]
    serializer_class = MessageSerializer
    def get_queryset(self):
        chatroom_id = self.kwargs["chatroom_id"]
        return Message.objects.filter(chatroom_id=chatroom_id).order_by("timestamp")
    def perform_create(self, serializer):
        serializer.save(
            sender=self.request.user,
            chatroom_id=self.kwargs["chatroom_id"]
        )
