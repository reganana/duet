from rest_framework import serializers
from meeting.models import Meeting
from datetime import timedelta
from accounts.serializers.serializer_profile import ProfileSerializer

class MeetingSerializer(serializers.ModelSerializer):
    user = ProfileSerializer(read_only=True)
    
    class Meta:
        model = Meeting
        fields = '__all__'
