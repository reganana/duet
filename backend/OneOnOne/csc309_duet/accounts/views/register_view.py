from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.serializers.serializer_register import RegisterSerializer
from accounts.serializers.serializer_profile import ProfileSerializer
from accounts.serializers.serializer_update import UserUpdateSerializer
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny
from rest_framework import status


class UserView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"user": serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request):
        permission_classes = [permissions.IsAuthenticated]
        print(permission_classes)
        user = request.user
        print(user)
        serializer = ProfileSerializer(user)
        return Response(serializer.data)
    
    def patch(self, request, *args, **kwargs):
        permission_classes = [permissions.IsAuthenticated]
        user = request.user
        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({"msg": "User updated successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
