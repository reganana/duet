from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from meeting.models import Meeting
# from availability.models.availability_block_model import AvailabilityBlock
# from availability.serializers.serializer_availability_contact import AvailabilityContactBlockSerializer
# from availability.serializers.serializer_availability_block import AvailabilityBlockSerializer
# from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView

# class EmailViewSet(viewsets.ModelViewSet):
#     queryset = AvailabilityBlock.objects.all()
#     serializer_class = AvailabilityBlockSerializer

#     #Read user availability
#     @action(detail=False, methods=['get'])
#     def availiabilityDisplay(self, request):
#         meeting_id = request.query_params.get('meeting_id')
#         try:
#             meeting = Meeting.objects.get(pk=meeting_id)
#         except Meeting.DoesNotExist:
#             return Response({"error": "Meeting not found."}, status=404)
        
#         user1_availabilities = AvailabilityBlock.objects.filter(user_id=meeting.user.id, preferred = meeting.preferred)

#         return Response(user1_availabilities)

# # create contact availability blocks
# @api_view(['POST'])
# def create_contact_blocks(request, meeting_id):
#     meeting = get_object_or_404(Meeting, pk=meeting_id)
#     contact = meeting.contact
#     blocks_data = request.data

#     if not isinstance(blocks_data, list):
#         return Response({'error': 'Expected a list of blocks data'}, status=400)

#     created_blocks = []
#     for block_data in blocks_data:
#         serializer = AvailabilityContactBlockSerializer(data=block_data)
#         if serializer.is_valid():
#             block = serializer.save(contact=contact)
#             created_blocks.append(serializer.data)
#         else:
#             return Response(serializer.errors, status=400)
    
#     return Response(created_blocks, status=201)


# update meeting status
# @api_view(['PATCH'])
# def update_meeting(request, pk):
#     try:
#         meeting = Meeting.objects.get(pk=pk)
#     except Meeting.DoesNotExist:
#         return Response(status=status.HTTP_404_NOT_FOUND)
    
#     new_status = request.data.get('meeting_status')
#     scheduled_time = request.data.get('scheduled_time')
#     if scheduled_time:
#         meeting.scheduled_time = scheduled_time
#     if new_status:
#         meeting.meeting_status = new_status
#     else:
#         return Response({'error': 'Status not provided'}, status=status.HTTP_400_BAD_REQUEST)
    
#     meeting.save()
#     return Response({'meeting_status': 'Meeting updated successfully'})

class MeetingDetailView(APIView):
    # permission_classes = [IsAuthenticated]

    # update meeting status
    def patch(self, request, pk):
        meeting = get_object_or_404(Meeting, pk=pk)
        
        new_status = request.data.get('meeting_status')
        scheduled_time = request.data.get('scheduled_time')
        
        if scheduled_time is not None:
            meeting.scheduled_time = scheduled_time
        if new_status is not None:
            meeting.meeting_status = new_status
        
        # Only save and respond if there was something to update
        if scheduled_time is not None or new_status is not None:
            meeting.save()
            return Response({'message': 'Meeting updated successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Status not provided'}, status=status.HTTP_400_BAD_REQUEST)
