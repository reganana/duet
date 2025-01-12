from rest_framework import serializers
from meeting.models import Meeting

class MeetingUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meeting
        fields = ['scheduled_time', 'meeting_status']