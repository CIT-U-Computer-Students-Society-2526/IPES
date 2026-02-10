from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EvaluationFormViewSet, QuestionViewSet, EvaluationAssignmentViewSet, ResponseViewSet

router = DefaultRouter()
router.register(r'forms', EvaluationFormViewSet, basename='forms')
router.register(r'questions', QuestionViewSet, basename='questions')
router.register(r'assignments', EvaluationAssignmentViewSet, basename='assignments')
router.register(r'responses', ResponseViewSet, basename='responses')

urlpatterns = [
    path('', include(router.urls)),
]
