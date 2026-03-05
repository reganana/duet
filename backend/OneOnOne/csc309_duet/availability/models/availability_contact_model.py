from django.db import models
# from contacts.models import Contact
from meeting.models import Meeting

class AvailabilityContactBlock(models.Model):
    PREFERRED = 'preferred'
    LESS_PREFERRED = 'lesspreferred'
    AVAILABILITY_LEVEL_CHOICES = [
        (PREFERRED, 'Preferred'),
        (LESS_PREFERRED, 'Less Preferred'),
    ]

    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name='contact_block')
    availability_level = models.CharField(max_length=20, choices=AVAILABILITY_LEVEL_CHOICES)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
