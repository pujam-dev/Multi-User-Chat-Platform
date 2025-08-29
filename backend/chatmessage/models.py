from django.conf import settings
from django.db import models
from chatrooms.models import ChatRoom
# Create your models here.

class Message(models.Model):
    receiver_id=models.ForeignKey (settings.AUTH_USER_MODEL,related_name="receiver",on_delete=models.CASCADE)
    sender_id=models.ForeignKey (settings.AUTH_USER_MODEL,related_name="sender",on_delete=models.CASCADE)
    chatroom_id=models.ForeignKey (ChatRoom,related_name="chatroom_id",on_delete=models.CASCADE)
    content=models.TextField(max_length=255)
    time_stamp=models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.id