
from django.urls import path,include
from django.conf.urls.static import static
from Chat import settings
from . import views
urlpatterns = [
    path('register/',views.UserRegistrationView.as_view(),name='register'),
    path('login/',views.UserLoginView.as_view(),name='login'),
    path('profile/',views.UserProfileView.as_view(),name='profile'),
    path('logout/',views.LogoutView.as_view(),name='logout'),
    path('users/', views.UserListView.as_view(), name='user-list'),
]

if settings.DEBUG:
    urlpatterns+=static(settings.MEDIA_URL,document_root=settings.MEDIA_ROOT)