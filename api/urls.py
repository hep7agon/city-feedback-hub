from django.conf.urls import url
from rest_framework.urlpatterns import format_suffix_patterns

from api import views

urlpatterns = [
    url(r'^requests/$', views.FeedbackList.as_view(), name='feedback-list'),
    url(r'^requests/(?P<service_request_id>\w+)/$', views.FeedbackDetail.as_view(), name='feedback-details'),
    url(r'^services/$', views.ServiceList.as_view(), name='service-list'),
    url(r'^service_statistics/$', views.get_service_statistics, name='service-statistics'),
    url(r'^agency_statistics/$', views.get_agency_statistics, name='agency-statistics'),

]

urlpatterns = format_suffix_patterns(urlpatterns)
