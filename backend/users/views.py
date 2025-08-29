from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from users.serializers import UserRegistrationSerializer,UserLoginSerializer,UserProfileSerializer
from users.renderers import UserRenderer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
# for generrating token Manually
def get_tokens_for_user(user):
    refresh=RefreshToken.for_user(user)

    return {
        'refresh':str(refresh),
        'access':str(refresh.access_token),
    }


# Create your views here.
class UserRegistrationView(APIView):
    renderer_classes=[UserRenderer]
    def post(self,request,format=None):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user= serializer.save()
            token=get_tokens_for_user(user)
            return Response({"token":token,"msg":"resgister successful"},
                            status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    

class UserLoginView(APIView):
    renderer_classes=[UserRenderer]
    def post(self,request,format=None):
        serializer=UserLoginSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            email=serializer.data.get('email')
            password=serializer.data.get('password')
            user=authenticate(email=email,password=password)
            if user is not None:
                token=get_tokens_for_user(user)
                return Response({"token":token,"msg":"Login successful"},
                            status=status.HTTP_200_OK)
            else:
                return Response({'errors':{'non_field_errors':['email or password is not valid ']}},
                            status=status.HTTP_404_NOT_FOUND)       
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
class UserProfileView(APIView):
    renderer_classes=[UserRenderer]
    permission_classes=[IsAuthenticated]
    def get(self,request,fromat=None):
        serializer=UserProfileSerializer(request.user.profile)
        return Response(serializer.data,status=status.HTTP_200_OK)
    def put(self,request):
        serializer=UserProfileSerializer(request.user.profile,data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"msg":"Profile updated","data":serializer.data})
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
             

class LogoutView(APIView):
     permission_classes = (IsAuthenticated,)
     def post(self, request):
          
          try:
               refresh_token = request.data["refresh"]
               token = RefreshToken(refresh_token)
               token.blacklist()
               return Response({"msg":"logged out successfully"},status=status.HTTP_205_RESET_CONTENT)
          except Exception as e:
               return Response({"error":str(e)},status=status.HTTP_400_BAD_REQUEST)