from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status,generics
from .models import Contact
from meeting.models import Meeting
from .serializers import ContactSerializer, MeetingSerializer,ContactAddSerializer,ContactEditSerializer
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.urls import reverse
from django.shortcuts import redirect
from rest_framework.viewsets import ViewSet
from django.core import mail
from django.conf import settings




class ContactList(APIView):
    def get(self, request):
        contacts = Contact.objects.filter(user=request.user)
        serializer = ContactSerializer(contacts, many=True)
        return Response(serializer.data)
    
    def post(self, request, *args, **kwargs):
        serializer_class = ContactAddSerializer
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        
        serializer = serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Save the contact under the current authenticated user
        serializer.save(user=request.user)
        contact_id = serializer.instance.id

        # Redirect to the URL: get_contact_details
        return Response({'message': 'contact created successfully'}, status=status.HTTP_201_CREATED)

class ContactDetail(APIView):
    permission_classes = [IsAuthenticated]
    def get_object(self, contact_id):
        return get_object_or_404(Contact, id=contact_id)

    def get(self, request, contact_id):
        contact = self.get_object(contact_id)
        serializer = ContactSerializer(contact)
        return Response(serializer.data)
    
    def delete(self, request, contact_id):
 
        contact = self.get_object(contact_id)
        contact.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    def put(self, request, contact_id, *args, **kwargs):
        serializer_class = ContactEditSerializer
        # Check if the user is authenticated
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        
        # Retrieve the contact to be edited
        contact = get_object_or_404(Contact, pk=contact_id)
        
        # Check if the contact belongs to the authenticated user
        if contact.user != request.user:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        
        # Update the contact with the provided data
        serializer = serializer_class(contact, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Redirect to the contact details page
        return Response(serializer.data)
    
class MeetingList(APIView):
    def get(self, request, contact_id, meeting_status):
        print("in get meeting status list")
        contact = get_object_or_404(Contact, id=contact_id)
        print(contact)
        meetings = Meeting.objects.filter(contact=contact, meeting_status=meeting_status)
        serializer = MeetingSerializer(meetings, many=True)
        return Response(serializer.data)

class MeetingDetail(APIView):

    permission_classes = [IsAuthenticated]
    def get_object(self, meeting_id):
        return get_object_or_404(Meeting, id=meeting_id)

    def get(self, request, contact_id, meeting_id):
        meeting = self.get_object(meeting_id)
        serializer = MeetingSerializer(meeting)
        return Response(serializer.data)
    
    def delete(self, request, contact_id, meeting_id):
        meeting = get_object_or_404(Meeting, id=meeting_id)
        meeting_title = meeting.title
        meeting_contact_email = meeting.contact.email
        meeting.delete()

        with mail.get_connection() as connection:
                mail.EmailMessage(
                    f'Meeting {meeting_title} cancelled',
                    f'Meeting {meeting_title} has been cancelled by the host',
                    'Duet Team < ' + settings.EMAIL_HOST_USER + ' >',
                    [meeting_contact_email],
                    connection=connection,
                ).send()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
  
    def patch(self, request, contact_id, meeting_id):
        meeting = get_object_or_404(Meeting, id=meeting_id)
        selected_time = request.data.get('selected_time')
        if selected_time:
            meeting.scheduled_time = selected_time
            meeting.meeting_status = 'Confirmed'
            meeting.save()
            serializer = MeetingSerializer(meeting)
            with mail.get_connection() as connection:
                email = mail.EmailMessage(
                    f'Meeting {meeting.title} scheduled successfully',
                    f'Meeting {meeting.title} has been scheduled at {meeting.scheduled_time}',
                    'Duet Team <' + settings.EMAIL_HOST_USER + '>',
                    [meeting.contact.email],
                    connection=connection,
                )
                email.send()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Selected time not provided'}, status=status.HTTP_400_BAD_REQUEST)

class SendReminderView(APIView):
    def post(self, request, contact_id, meeting_id):
        meeting = get_object_or_404(Meeting, id=meeting_id)
        
        # Send reminder email
        with mail.get_connection() as connection:
            email = mail.EmailMessage(
                f'Reminder: Please choose a time for your meeting: {meeting.title}',
                f'Please choose a time for your meeting: {meeting.title} before {meeting.deadline}',
                'Duet Team <' + settings.EMAIL_HOST_USER + '>',
                [meeting.contact.email],
                connection=connection,
            )
            email.send()

        return Response({'message': 'Reminder email sent'}, status=status.HTTP_200_OK)

