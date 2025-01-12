from django.urls import path
from . import views

app_name = 'contacts'

urlpatterns = [
    path('', views.ContactList.as_view(), name='contact-list'),
    path('<int:contact_id>/', views.ContactDetail.as_view(), name='contact-detail'),
    path('<int:contact_id>/meetings/<str:meeting_status>/', views.MeetingList.as_view(), name='meeting-list-status'),
    path('<int:contact_id>/meetings/detail/<int:meeting_id>/', views.MeetingDetail.as_view(), name='meeting-detail'),
    path('<int:contact_id>/meetings/detail/<int:meeting_id>/send-reminder', views.SendReminderView.as_view(), name='send-reminder'),
]