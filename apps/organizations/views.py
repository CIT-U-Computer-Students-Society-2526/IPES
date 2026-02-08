from rest_framework import viewsets, permissions
from .models import Organization, UnitType, OrganizationUnit, PositionType, Membership
from .serializers import (
    OrganizationSerializer,
    UnitTypeSerializer,
    OrganizationUnitSerializer,
    PositionTypeSerializer,
    MembershipSerializer
)


class OrganizationViewSet(viewsets.ModelViewSet):
    """ViewSet for Organization CRUD"""
    queryset = Organization.objects.filter(is_active=True)
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated]


class UnitTypeViewSet(viewsets.ModelViewSet):
    """ViewSet for UnitType CRUD"""
    queryset = UnitType.objects.all()
    serializer_class = UnitTypeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        org_id = self.request.query_params.get('organization_id')
        if org_id:
            queryset = queryset.filter(organization_id=org_id)
        return queryset


class OrganizationUnitViewSet(viewsets.ModelViewSet):
    """ViewSet for OrganizationUnit CRUD"""
    queryset = OrganizationUnit.objects.all()
    serializer_class = OrganizationUnitSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        org_id = self.request.query_params.get('organization_id')
        if org_id:
            queryset = queryset.filter(organization_id=org_id)
        return queryset


class PositionTypeViewSet(viewsets.ModelViewSet):
    """ViewSet for PositionType CRUD"""
    queryset = PositionType.objects.all()
    serializer_class = PositionTypeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        org_id = self.request.query_params.get('organization_id')
        if org_id:
            queryset = queryset.filter(organization_id=org_id)
        return queryset


class MembershipViewSet(viewsets.ModelViewSet):
    """ViewSet for Membership CRUD"""
    queryset = Membership.objects.filter(is_active=True)
    serializer_class = MembershipSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user_id = self.request.query_params.get('user_id')
        unit_id = self.request.query_params.get('unit_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        if unit_id:
            queryset = queryset.filter(unit_id=unit_id)
        return queryset
