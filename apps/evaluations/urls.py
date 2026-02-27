from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EvaluationFormViewSet, QuestionViewSet, EvaluationAssignmentViewSet, ResponseViewSet, AssignmentRuleViewSet

router = DefaultRouter()
router.register(r'forms', EvaluationFormViewSet, basename='forms')
router.register(r'questions', QuestionViewSet, basename='questions')
router.register(r'assignments', EvaluationAssignmentViewSet,
                basename='assignments')
router.register(r'responses', ResponseViewSet, basename='responses')
router.register(r'assignment-rules', AssignmentRuleViewSet,
                basename='assignment-rules')

urlpatterns = [
    path('', include(router.urls)),
]
