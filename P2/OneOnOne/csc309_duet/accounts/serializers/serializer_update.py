from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

class UserUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'email': {'required': False},
            'username': {'read_only': True}
        }

    def validate(self, attrs):
        if 'password' in attrs and 'password2' in attrs:
            if attrs['password'] != attrs.pop('password2'):
                raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def update(self, instance, validated_data):
        # Update user info
        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        
        # Update password if provided
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
        
        instance.save()
        return instance
