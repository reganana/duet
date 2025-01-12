from django.shortcuts import render, get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from availability.models.availability_block_model import AvailabilityBlock
from rest_framework.views import APIView
from meeting.models import Meeting
from availability.serializers.serializer_availability_block import AvailabilityBlockSerializer
from availability.serializers.serializer_availability_contact import AvailabilityContactBlockSerializer
from django.http import Http404

class availabilityList(APIView):
   serializer_class = AvailabilityBlockSerializer
   permission_classes = [IsAuthenticated]

   def get_object(self, pk):
       try:
           return AvailabilityBlock.objects.get(pk=pk)
       except AvailabilityBlock.DoesNotExist:
           return Response(status=status.HTTP_404_NOT_FOUND)
   
   def get(self, request, pk=None):
       if not self.request.user.is_authenticated:
           return Response(status=status.HTTP_401_UNAUTHORIZED)
       else:
           if pk is not None:
               try:
                   # Retrieve a specific availability block by its pk
                   availability_block = get_object_or_404(AvailabilityBlock, pk=pk, user=self.request.user)
                   serializer = self.serializer_class(availability_block)
                   return Response(serializer.data)
               except Http404:
                   return Response({"This block has been deleted, please try another one"}, status=status.HTTP_404_NOT_FOUND)
           else:
               # Retrieve all availability blocks
               availability_blocks = AvailabilityBlock.objects.filter(user=self.request.user)
               serializer = self.serializer_class(availability_blocks, many=True)
               return Response(serializer.data)

   def post(self, request):
    if not request.user.is_authenticated:
        return Response(status=status.HTTP_401_UNAUTHORIZED)

    saved_items = [] 

    items = request.data if isinstance(request.data, list) else [request.data]
    for item_data in items:
         # if the preference level is 'none', skip it
        if item_data.get('availability_level') == AvailabilityBlock.NONE:
            print("No new availability block created due to status is none.")
            continue

        serializer = self.serializer_class(data=item_data)
        if serializer.is_valid():
            # Check for existing blocks that match
            is_duplicate = AvailabilityBlock.objects.filter(
                user=request.user,
                date=serializer.validated_data['date'],
                start_time=serializer.validated_data['start_time'],
                end_time=serializer.validated_data['end_time']
            ).exists()

            if is_duplicate:
                # If it's a duplicate, skip
                continue

            availability_block = serializer.save(user=request.user)

            ########### Print availability ID for test ###########
            availability_block = serializer.save(user=request.user)
            print("New availability block ID:", availability_block.id)
            ########### Print availability ID for test ###########

            saved_items.append(serializer.data)
        else:
            # If data is invalid for any item, return a bad request response for this item
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # After processing all items, return a success
    return Response(saved_items, status=status.HTTP_201_CREATED)

   def put(self, request):
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        data = request.data
        date = data.get('date')
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        availability_level = data.get('availability_level')

        # Retrieve all matching blocks
        matching_blocks = AvailabilityBlock.objects.filter(
            user=request.user,
            date=date,
            start_time=start_time,
            end_time=end_time
        )

        # Update availability level if necessary
        if matching_blocks.exists():
            for block in matching_blocks:
                if block.availability_level != availability_level:
                    block.availability_level = availability_level
                    block.save()

                    ############ Print the updated Block ID ###################
                    print(f"Updated availability block ID created: {block.id}")
                    ###########################################################

                    return Response("Availability level updated successfully.", status=status.HTTP_200_OK)
            return Response("No exsisted availability level changed.", status=status.HTTP_200_OK)
        else:
            return Response("No exsisted availability level changed.", status=status.HTTP_200_OK)

   def delete(self, request):
    if not request.user.is_authenticated:
        return Response(status=status.HTTP_401_UNAUTHORIZED)

    blocks_to_check = request.data if isinstance(request.data, list) else [request.data]
    deleted_blocks_ids = []  # Keep track of deleted block IDs

    for block_data in blocks_to_check:
        # Filter blocks that match the date, start_time, and end_time
        # and the user should be the current user
        matching_blocks = AvailabilityBlock.objects.filter(
            user=request.user,
            date=block_data.get('date'),
            start_time=block_data.get('start_time'),
            end_time=block_data.get('end_time'),
        )

        # Iterate through matching blocks and delete those with 'none' preference
        for block in matching_blocks:
            if block.availability_level == AvailabilityBlock.NONE:
                deleted_blocks_ids.append(block.id)
                block.delete()

    if deleted_blocks_ids:
        # If any blocks were deleted, return their IDs
        print(f"Deleted availability block ID: {deleted_blocks_ids}")
        return Response({"Deleted blocks": deleted_blocks_ids}, status=status.HTTP_200_OK)
    else:
        # If no blocks were deleted, still print 200 to avoid confusion
        return Response({"message": "No availability block deleted."},status=status.HTTP_200_OK)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from meeting.models import Meeting
from availability.models.availability_contact_model import AvailabilityContactBlock
from availability.serializers.serializer_availability_contact import AvailabilityContactBlockSerializer



class ContactAvailabilityView(APIView):
   # Assuming IsAuthenticated is required, otherwise adjust as needed
   # permission_classes = [IsAuthenticated]
   
   # create contact availability blocks
   def post(self, request, meeting_id):
       meeting = get_object_or_404(Meeting, pk=meeting_id)
       blocks_data = request.data

       if not isinstance(blocks_data, list):
           blocks_data = [blocks_data]  # Ensure blocks_data is always treated as a list

       created_blocks = []
       for block_data in blocks_data:
            existing_blocks = self.check_existing_blocks(block_data, meeting)
            if existing_blocks:
                continue
            else:
                serializer = AvailabilityContactBlockSerializer(data=block_data)
                if serializer.is_valid():
                    block = serializer.save(meeting=meeting)
                    created_blocks.append(serializer.data)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
       
       return Response(created_blocks, status=status.HTTP_201_CREATED)
   
   def check_existing_blocks(self, block_data, meeting):
    return AvailabilityContactBlock.objects.filter(
        date=block_data['date'],
        start_time=block_data['start_time'],
        end_time=block_data['end_time'],
        meeting=meeting
    ).exists()

   
   def get(self, request, meeting_id):
       meeting = get_object_or_404(Meeting, pk=meeting_id)
       availability_blocks = AvailabilityContactBlock.objects.filter(meeting=meeting)
       serializer = AvailabilityContactBlockSerializer(availability_blocks, many=True)
       return Response(serializer.data)