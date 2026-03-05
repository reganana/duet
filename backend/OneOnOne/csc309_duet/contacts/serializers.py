from rest_framework import serializers
from .models import Contact
from meeting.models import Meeting

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['id', 'first_name', 'last_name', 'email','user']

class MeetingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meeting
        fields = '__all__'

class ContactAddSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = Contact
        fields = ['first_name', 'last_name', 'email','user']

class ContactEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['first_name', 'last_name', 'email']

    def __init__(self, instance=None, **kwargs):
        super().__init__(instance=instance, **kwargs)
        if instance:
            # Prefill the serializer fields with the contact's current data
            self.fields['first_name'].initial = instance.first_name
            self.fields['last_name'].initial = instance.last_name
            self.fields['email'].initial = instance.email

    def validate(self, data):
        # Check if all fields are filled
        if not all(data.values()):
            raise serializers.ValidationError("All fields must be filled.")
        return data
