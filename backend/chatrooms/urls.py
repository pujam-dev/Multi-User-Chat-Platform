
from django.urls import path,include
from . import views
urlpatterns = [
    path('public/create/',views.PublicChatList.as_view(),name='publicroomcreate'),
    path('private/create/',views.PrivateChatView.as_view(),name='privateroomcreate'),
    path('public/groups/',views.PublicChatList.as_view(),name='publicgroups'),
    path("mychats/", views.UserChatRoomView.as_view(), name="mychats"),
    path("public/crud/<int:pk>/", views.PublicChatUpdateDelete.as_view(), name="publicgroup_crud"),
]