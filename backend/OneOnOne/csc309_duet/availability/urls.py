from django.urls import path
from availability import views
from rest_framework.urlpatterns import format_suffix_patterns

app_name = 'availability'

urlpatterns = [
    path('availability-list/', views.availabilityList.as_view()),
    path('availability-list/<int:pk>/', views.availabilityList.as_view()),
    path('<int:meeting_id>/contact_availability/', views.ContactAvailabilityView.as_view()),
    # path('<int:meeting_id>/contact_availability/<int:block_id>/', views.ContactAvailabilityView.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)
