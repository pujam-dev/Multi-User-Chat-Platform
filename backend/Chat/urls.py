
from django.contrib import admin
from django.urls import path,include
from rest_framework_simplejwt import views as jwt_views
urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/user/',include('users.urls')),
    path('token/', 
          jwt_views.TokenObtainPairView.as_view(), 
          name ='token_obtain_pair'),
    path('token/refresh/', 
          jwt_views.TokenRefreshView.as_view(), 
          name ='token_refresh'),
    path('chatrooms/',include('chatrooms.urls')),
    path('message/',include('chatmessage.urls')),
]
