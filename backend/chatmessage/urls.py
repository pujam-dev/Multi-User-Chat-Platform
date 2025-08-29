from django.urls import path,include
from . import views
urlpatterns = [
    path('add/',views.MessageView.as_view(),name='addmessage'),
]