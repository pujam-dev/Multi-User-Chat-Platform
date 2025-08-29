from rest_framework import serializers
from users.models import User,Profile


class UserRegistrationSerializer(serializers.ModelSerializer):
    password2=serializers.CharField(style={'input_type':'password'},write_only=True)
    class Meta:
        model=User
        fields=['email','name','date_of_birth','password','password2','tc']
        extra_kwargs={
            'password':{'write_only':True}

        }
        #validating password and confirm password 
    def validate(self,attrs):
        password = attrs.get('password')
        password2=attrs.pop('password2')
        if password != password2:
            raise serializers.ValidationError("password and confirm password does not match")
        return attrs
    def create(self,validate_data):
            
        return User.objects.create_user(**validate_data)
            


class UserLoginSerializer(serializers.ModelSerializer):
    email=serializers.EmailField(max_length=255)
    class Meta:
        model=User
        fields=['email','password']


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model=Profile
        fields=['avatar','status','bio']


