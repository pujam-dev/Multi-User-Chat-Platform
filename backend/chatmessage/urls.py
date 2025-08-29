from django.urls import path,include
from . import views
urlpatterns = [
    path('add/',views.RoomMessagesView.as_view(),name='addmessage'),
]