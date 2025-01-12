from django.urls import path,include
from rest_framework.routers import DefaultRouter
from meeting.views import MeetingDetailView, MeetingView, UserAvailabilityView, OverlapView

app_name = 'meeting'

urlpatterns = [
    path('', MeetingView.as_view(), name='meeting'),
    path('<int:meeting_id>/', MeetingDetailView.as_view()), 
    path('<int:meeting_id>/overlap_time/', OverlapView.as_view(), name='overlap_time'),
    path('<int:meeting_id>/user_availability/', UserAvailabilityView.as_view(), name='user_avail'),
]
