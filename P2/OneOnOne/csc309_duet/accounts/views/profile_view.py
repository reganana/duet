# from rest_framework.views import APIView
# from accounts.serializers.serializer_profile import ProfileSerializer
# from rest_framework.permissions import IsAuthenticated
# from django.contrib.auth.models import User
# from rest_framework.response import Response
    
# class ProfileView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         user = request.user
#         serializer = ProfileSerializer(user)
#         return Response(serializer.data)
