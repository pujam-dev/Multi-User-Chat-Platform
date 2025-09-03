
from django.urls import path,include
from . import views
urlpatterns = [
    path('public/create/',views.PublicChatList.as_view(),name='publicroomcreate'),
    path('private/create/',views.PrivateChatView.as_view(),name='privateroomcreate'),

    path("mychats/", views.UserChatRoomView.as_view(), name="mychats"),
]