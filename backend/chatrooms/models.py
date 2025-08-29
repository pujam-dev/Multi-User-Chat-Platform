from django.conf import settings
from django.db import models

# Create your models here.

class ChatRoom(models.Model):
    name=models.CharField(max_length=255)
    participant_id=models.ManyToManyField(settings.AUTH_USER_MODEL,related_name="chatrooms")
    created_at=models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name