from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    OrganizationViewSet,
    UnitTypeViewSet,
    OrganizationUnitViewSet,
    PositionTypeViewSet,
    MembershipViewSet,
    JoinRequestViewSet
)

router = DefaultRouter()
router.register(r'organizations', OrganizationViewSet,
                basename='organizations')
router.register(r'unit-types', UnitTypeViewSet, basename='unit-types')
router.register(r'units', OrganizationUnitViewSet, basename='units')
router.register(r'positions', PositionTypeViewSet, basename='positions')
router.register(r'memberships', MembershipViewSet, basename='memberships')
router.register(r'join-requests', JoinRequestViewSet, basename='join-requests')

urlpatterns = [
    path('', include(router.urls)),
]
