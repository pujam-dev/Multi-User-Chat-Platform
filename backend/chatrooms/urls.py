
from django.urls import path,include
from . import views
urlpatterns = [
    path('create/',views.ChatRoomView.as_view(),name='roomcreate'),
]