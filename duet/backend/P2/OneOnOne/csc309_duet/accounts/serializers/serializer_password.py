from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

class NewPwdSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Password fields didn't match."})

        return attrs


class UsernameSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
