from django.urls import path

from . import views

urlpatterns = [
    path('', views.projector_view, name='projector'),
    path('operator/', views.operator_view, name='operator'),
    path('api/state/', views.state_api, name='api-state'),
    path('api/speakers/', views.add_speaker_api, name='api-speakers-add'),
    path('api/speakers/<int:speaker_id>/', views.delete_speaker_api, name='api-speakers-delete'),
    path('api/speakers/<int:speaker_id>/move/', views.move_speaker_api, name='api-speakers-move'),
    path('api/speakers/<int:speaker_id>/flags/', views.speaker_flags_api, name='api-speakers-flags'),
]
