from django.db import models
from django.contrib.auth.models import User

class AvailabilityBlock(models.Model):
    PREFERRED = 'preferred'
    LESS_PREFERRED = 'lesspreferred'
    NONE = 'none'
    AVAILABILITY_LEVEL_CHOICES = [
        (PREFERRED, 'Preferred'),
        (LESS_PREFERRED, 'Less Preferred'),
        (NONE, 'none'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    availability_level = models.CharField(max_length=20, choices=AVAILABILITY_LEVEL_CHOICES)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
