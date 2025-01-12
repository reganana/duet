from rest_framework import serializers
from availability.models.availability_contact_model import AvailabilityContactBlock

class AvailabilityContactBlockSerializer(serializers.ModelSerializer):
    # Format date as yyyy-mm-dd
    date = serializers.DateField(format='%Y-%m-%d')
    # Format time as hh:mm:ss
    start_time = serializers.TimeField(format='%H:%M:%S')
    end_time = serializers.TimeField(format='%H:%M:%S')

    class Meta:
        model = AvailabilityContactBlock
        fields = ['availability_level', 'date', 'start_time', 'end_time']
