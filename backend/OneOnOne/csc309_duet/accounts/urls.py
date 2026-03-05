from django.urls import path
from .views import password_view, register_view, logout_view
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

app_name = 'accounts'

urlpatterns = [
    path('', register_view.UserView.as_view()),
    path('password/', password_view.PasswordView.as_view(), name='password'),
]
