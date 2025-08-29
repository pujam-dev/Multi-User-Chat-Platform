from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status,generics
from rest_framework.views import APIView
from users.renderers import UserRenderer
from chatmessage.serializers import MessageSerializer
from chatmessage.models import Message


class MessageListCreateView(generics.ListCreateAPIView):
    queryset = Message.objects.all().order_by("-time_stamp")
    serializer_class = MessageSerializer
#  Get, Update, Delete single message
class MessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    lookup_field = "id"
