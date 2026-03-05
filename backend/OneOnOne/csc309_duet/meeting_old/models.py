from django.db import models
from django.contrib.auth.models import User
from contacts.models import Contact

class Meeting(models.Model):
    # Meeting details
    duration = models.IntegerField(default=30)
    deadline = models.DateTimeField()
    title = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    content = models.TextField()
    suggested_time1 = models.DateTimeField(null=True, blank=True)
    suggested_time2 = models.DateTimeField(null=True, blank=True)
    suggested_time3 = models.DateTimeField(null=True, blank=True)
    scheduled_time = models.DateTimeField(null=True, blank=True)
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='my_meetings')
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name='invitee')
    
    preferred_user = models.BooleanField()
    preferred_contact = models.BooleanField()
    # availability_table_contact = models.ForeignKey(User, on_delete=models.CASCADE, related_name='availability_contact')

    # Meeting status represented by choices
    MEETING_STATUS = [
        ('Unconfirmed', 'Unconfirmed'),
        ('Scheduling', 'Scheduling'),
        ('Confirmed', 'Confirmed'),
    ]
    meeting_status = models.CharField(
        max_length=11,
        choices=MEETING_STATUS,
        default='Unconfirmed',
    )

    def __str__(self):
        return self.title
