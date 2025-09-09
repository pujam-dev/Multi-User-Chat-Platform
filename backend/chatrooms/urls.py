
# from django.urls import path,include
# from . import views
# urlpatterns = [
#     path('public/create/',views.PublicChatList.as_view(),name='publicroomcreate'),
#     path('private/create/',views.PrivateChatView.as_view(),name='privateroomcreate'),
#     path('public/groups/',views.PublicChatList.as_view(),name='publicgroups'),
#     path("mychats/", views.UserChatRoomView.as_view(), name="mychats"),
#     path("public/crud/<int:pk>/", views.ChatRoomViewSet.as_view(), name="publicgroup_crud"),
# ]



from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatRoomViewSet, PublicChatList, PrivateChatView, UserChatRoomView,PublicChatUpdateDelete,LeaveGroupView
router = DefaultRouter()
router.register(r'public/crud', ChatRoomViewSet, basename="publicgroup")
urlpatterns = [
    path('public/create/', PublicChatList.as_view(), name='publicroomcreate'),
    path('private/create/', PrivateChatView.as_view(), name='privateroomcreate'),
    path('public/groups/', PublicChatList.as_view(), name='publicgroups'),
    path('public/delete/<int:pk>', PublicChatUpdateDelete.as_view(), name='publicgroupdelete'),
    path('public/leave/<int:pk>/', LeaveGroupView.as_view(), name='publicgroupleave'),

    path("mychats/", UserChatRoomView.as_view(), name="mychats"),
    path('', include(router.urls)),
]