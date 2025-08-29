from django.urls import path,include
from . import views
urlpatterns = [
    path("", views.MessageListCreateView.as_view(), name="message-list-create"),
    path("<int:id>/", views.MessageDetailView.as_view(), name="message-detail"),
]
