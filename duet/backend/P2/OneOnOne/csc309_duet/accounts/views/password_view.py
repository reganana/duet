from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.urls import reverse
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from accounts.serializers.serializer_password import UsernameSerializer, NewPwdSerializer

class PasswordView(APIView):
    def put(self, request, *args, **kwargs):
        if 'username' in request.data:
            serializer = UsernameSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            username = serializer.validated_data['username']

            try:
                user = User.objects.get(username=username)
                token = default_token_generator.make_token(user)
                # reset_link = request.build_absolute_uri('/reset_password.html/') + f'?uid={user.pk}&token={token}'
                
                reset_link = f'http://18.119.164.105/ResetPwd?uid={user.pk}&token={token}'

                # Sending email
                with mail.get_connection() as connection:
                    mail.EmailMessage(
                        'Password Reset Request',
                        f'Please click the link to reset your password: {reset_link}',
                        'Duet Team < ' + settings.EMAIL_HOST_USER + ' >',
                        [user.email],
                        connection=connection,
                    ).send()

                return Response({'message': 'Password reset link sent'}, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                return Response({'message': 'Invalid username'}, status=status.HTTP_404_NOT_FOUND)
        elif 'uid' in request.data and 'token' in request.data:
            try:
                user = User.objects.get(pk=request.data['uid'])
                token = request.data['token']
            except (TypeError, ValueError, OverflowError, User.DoesNotExist) as e:
                if isinstance(e, User.DoesNotExist):
                    return Response({'message': 'Invalid user ID'}, status=status.HTTP_404_NOT_FOUND)
                
                return Response({f'message': {e}}, status=status.HTTP_400_BAD_REQUEST)

            if user is not None and default_token_generator.check_token(user, token):
                serializer = NewPwdSerializer(data=request.data)
                if serializer.is_valid():
                    user.set_password(serializer.validated_data['new_password'])
                    user.save()
                    return Response({'message': 'Password has been reset'}, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'message': 'Invalid token or user ID'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'message': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)
