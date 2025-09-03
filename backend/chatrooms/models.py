from django.conf import settings
from django.db import models

# Create your models here.

class ChatRoom(models.Model):
    ROOM_TYPE_CHOICES=(
        ('private','Private'),
        ('public','Public'),
    )
    name=models.CharField(max_length=255)
    room_type=models.CharField(max_length=10,choices=ROOM_TYPE_CHOICES)
    participant_id=models.ManyToManyField(settings.AUTH_USER_MODEL,related_name="chat_rooms",blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        if self.room_type== 'private':
            return f"Private Chat: {','.join([u.username for u in self.participant_id.all()])}"
        return self.name or "Public Chat"
    