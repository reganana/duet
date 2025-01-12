from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from meeting.models import Meeting
from django.shortcuts import get_object_or_404
from availability.models.availability_block_model import AvailabilityBlock
from availability.models.availability_contact_model import AvailabilityContactBlock
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
# from availability.serializers.serializer_availability_block import AvailabilityBlockSerializer
# from availability.serializers.serializer_availability_contact import AvailabilityContactBlockSerializer

class MeetingAvailabilityView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, meeting_id):
        try:
            meeting = get_object_or_404(Meeting, pk=meeting_id)
        except Meeting.DoesNotExist:
            return Response({"error": "Meeting not found."}, status=status.HTTP_404_NOT_FOUND)
        
        if request.user not in [meeting.user, meeting.contact]:
            return Response({"error": "You are not part of this meeting."}, status=status.HTTP_403_FORBIDDEN)
        
        user_availabilities = AvailabilityBlock.objects.filter(user_id=request.user.id)
        contact_availabilities = AvailabilityContactBlock.objects.filter(contact_id=meeting.contact.id)
        overlaps = []

        for avail1 in user_availabilities:
            for avail2 in contact_availabilities:
                latest_start = max(avail1.start_time, avail2.start_time)
                earliest_end = min(avail1.end_time, avail2.end_time)
                if latest_start <= earliest_end:
                    overlaps.append({
                        "start": latest_start.strftime('%Y-%m-%d %H:%M:%S'),
                        "end": earliest_end.strftime('%Y-%m-%d %H:%M:%S')
                    })

        if not overlaps:
            return Response({"message": "No overlapping times found."}, status=status.HTTP_200_OK)

        return Response(overlaps)
    

    # #Send overlaped block period(s) to frontend
    # @action(detail=False, methods=['get'])
    # def overlaps(self, request):
    #     meeting_id = request.query_params.get('meeting_id')
    #     try:
    #         meeting = Meeting.objects.get(pk=meeting_id)
    #     except Meeting.DoesNotExist:
    #         return Response({"error": "Meeting not found."}, status=404)
    
    #     if request.user not in [meeting.user, meeting.contact]:
    #         return Response({"error": "You are not part of this meeting."}, status=403)
    
    #     user_availabilities = AvailabilityBlock.objects.filter(user_id=request.user.id)
    #     contact_availabilities = AvailabilityContactBlock.objects.filter(contact_id=meeting.contact.id)
    #     overlaps = []

    #     for avail1 in user_availabilities:
    #         for avail2 in contact_availabilities:
    #             latest_start = max(avail1.start_time, avail2.start_time)
    #             earliest_end = min(avail1.end_time, avail2.end_time)
    #             if latest_start <= earliest_end:
    #                 overlaps.append({"start": latest_start.strftime('%Y-%m-%d %H:%M:%S'), "end": earliest_end.strftime('%Y-%m-%d %H:%M:%S')})
    #     if not overlaps:
    #         return Response({"message": "No overlapping times found."}, status=200)

    #     return Response(overlaps)
