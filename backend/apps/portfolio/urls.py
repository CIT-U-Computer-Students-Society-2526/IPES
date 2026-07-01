from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AccomplishmentViewSet

router = DefaultRouter()
router.register(r'accomplishments', AccomplishmentViewSet, basename='accomplishments')

urlpatterns = [
    path('', include(router.urls)),
]
