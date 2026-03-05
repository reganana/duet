from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from meeting.models import Meeting
from meeting.serializers.serializer_create_meeting import MeetingSerializer
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

class MeetingView(APIView):
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = MeetingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
           return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
