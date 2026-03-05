# Create your views here.
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from meeting.models import Meeting
from meeting.serializers.serializer_create_meeting import MeetingSerializer
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from availability.serializers.serializer_availability_block import AvailabilityBlockSerializer
from django.core import mail
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator


class MeetingView(APIView):
    
    permission_classes = [IsAuthenticated]
    # create meeting
    def post(self, request):
        serializer = MeetingSerializer(data=request.data)
        if serializer.is_valid():
            meeting = serializer.save(user=request.user)
            user = request.user
            # token = default_token_generator.make_token(user)
            attendee_link = f'http://18.119.164.105/AttendeeLinkPage/{meeting.id}'
            
            # Sending email
            with mail.get_connection() as connection:
                mail.EmailMessage(
                    f'Meeting Invitation: {meeting.title}',
                    f'Please click the link to see meeting detail and set your availability: {attendee_link}',
                    'Duet Team < ' + settings.EMAIL_HOST_USER + ' >',
                    [meeting.contact.email],
                    connection=connection,
                ).send()

            # return Response({'message': 'Email sent to user\n' + serializer.data}, status=status.HTTP_200_OK)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
           return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
       
    def get(self, request):
        # Filter confirmed meetings of the current user
        user = request.user
        meetings = Meeting.objects.filter(user=user, meeting_status='Confirmed')
        
        # Serialize the meeting data
        serializer = MeetingSerializer(meetings, many=True)
        return Response(serializer.data)

    
from availability.models.availability_block_model import AvailabilityBlock
from availability.models.availability_contact_model import AvailabilityContactBlock


class MeetingDetailView(APIView):
    # update meeting status
    def patch(self, request, meeting_id):
        meeting = get_object_or_404(Meeting, pk=meeting_id)
        
        new_status = request.data.get('meeting_status')
        scheduled_time = request.data.get('scheduled_time')
        
        if scheduled_time is not None:
            meeting.scheduled_time = scheduled_time
            print("scheduled_time: ", meeting.scheduled_time)
        if new_status is not None:
            meeting.meeting_status = new_status
            print("meeting_status: ", meeting.meeting_status)
        #new_status must be provided
        if new_status is None:
            return Response({'error': 'meeting_status is not provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Only save and respond if there was something to update
        if scheduled_time is not None or new_status is not None:
            meeting.save()
            return Response({'message': 'Meeting updated successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Status not provided'}, status=status.HTTP_400_BAD_REQUEST)
        
    def get(self, request, meeting_id):
        try:
            meeting = get_object_or_404(Meeting, pk=meeting_id)
        except Meeting.DoesNotExist:
            return Response({"error": "Meeting not found."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = MeetingSerializer(meeting)
        return Response(serializer.data)

class OverlapView(APIView):
    # get availability overlap for both user and contact
    def get(self, request, meeting_id):
        permission_classes = [IsAuthenticated]
        try:
            meeting = get_object_or_404(Meeting, pk=meeting_id)
        except Meeting.DoesNotExist:
            return Response({"error": "Meeting not found."}, status=status.HTTP_404_NOT_FOUND)
        print("User:", meeting.user)
        print("Contact:", meeting.contact)
        if request.user not in [meeting.user, meeting.contact]:
            return Response({"error": "You are not part of this meeting."}, status=status.HTTP_403_FORBIDDEN)
        
        if meeting.preferred_user:
            availability_level_user = 'preferred'
            user_availabilities = AvailabilityBlock.objects.filter(user_id=request.user.id, availability_level=availability_level_user)
        else:
            user_availabilities = AvailabilityBlock.objects.filter(user_id=request.user.id)
            
        # if meeting.preferred_contact:
        #     availability_level_contact = 'preferred'
        #     contact_availabilities = AvailabilityContactBlock.objects.filter(meeting_id=meeting.id, availability_level=availability_level_contact)
        # else:
        #     
        contact_availabilities = AvailabilityContactBlock.objects.filter(meeting_id=meeting.id)
        # print("availability_level_user: ", availability_level_user)
        # print("availability_level_contact: ", availability_level_contact)
        # user_availabilities = AvailabilityBlock.objects.filter(user_id=request.user.id, availability_level=availability_level_user)
        # contact_availabilities = AvailabilityContactBlock.objects.filter(contact_id=meeting.contact.id, availability_level=availability_level_contact)
        overlaps = []

        for avail1 in user_availabilities:
            # print("avail1: ", avail1.date,avail1.start_time,avail1.end_time )
            for avail2 in contact_availabilities:
                # print("avail2: ",avail2.date,avail2.start_time,avail2.end_time)
                if avail1.date == avail2.date:
                    # print(avail1.date)
                    if avail1.start_time < avail2.end_time and avail2.start_time < avail1.end_time:
                        latest_start = max(avail1.start_time, avail2.start_time)
                        earliest_end = min(avail1.end_time, avail2.end_time)
                        if avail1.availability_level == 'preferred' and avail2.availability_level == 'preferred':
                            overlaps.append({
                                "start_time": latest_start,
                                "end_time": earliest_end,
                                'date': avail1.date,
                                'availability_level': 'preferred'
                            })
                        else:
                            overlaps.append({
                                "start_time": latest_start,
                                "end_time": earliest_end,
                                'date': avail1.date,
                                'availability_level': 'lesspreferred'
                            })
                            
        if not overlaps:
            return Response({"message": "No overlapping times found."}, status=status.HTTP_200_OK)

        return Response(overlaps)

# class UserAvailabilityView(APIView):
#     def get(self, request, mid):
#         if 'mid' in request.data and 'token' in request.data:
#             try:
#                 meeting = get_object_or_404(Meeting, pk=request.data['mid'])
#                 token = request.data['token']
#             except Meeting.DoesNotExist:
#                 return Response({"error": "Meeting not found."}, status=status.HTTP_404_NOT_FOUND)
            
#             if meeting is not None and default_token_generator.check_token(meeting, token):
#                 if meeting.preferred_user:
#                     availability_level = 'preferred'
#                 else:
#                     availability_level = 'lesspreferred'

#                 user1_availabilities = AvailabilityBlock.objects.filter(user_id=meeting.user.id, availability_level=availability_level)
                
#                 serializer = AvailabilityBlockSerializer(user1_availabilities, many=True)
#                 return Response(serializer.data)
#             else:
#                 return Response({'message': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)
    
class UserAvailabilityView(APIView):
    def get(self, request, meeting_id):
        try:
            meeting = get_object_or_404(Meeting, pk= meeting_id)
        except Meeting.DoesNotExist:
            return Response({"error": "Meeting not found."}, status=status.HTTP_404_NOT_FOUND)
        
        if meeting.preferred_user:
            availability_level = 'preferred'
        else:
            availability_level = 'lesspreferred'
            
        if availability_level == 'preferred':
            user1_availabilities = AvailabilityBlock.objects.filter(user_id=meeting.user.id, availability_level=availability_level)
        else:
            user1_availabilities = AvailabilityBlock.objects.filter(user_id=meeting.user.id)
        
        serializer = AvailabilityBlockSerializer(user1_availabilities, many=True)
        return Response(serializer.data)