from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Avg, Q
from django.utils import timezone

from apps.audit.utils import log_action, AuditActions

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
    
    def perform_create(self, serializer):
        """Log organization creation"""
        org = serializer.save()
        log_action(
            self.request.user,
            AuditActions.ORG_CREATED,
            self.request,
            org_name=org.name,
            org_id=str(org.id)
        )
    
    @action(detail=False, methods=['get'])
    def unit_completion_stats(self, request):
        """
        Get evaluation completion statistics by unit.
        
        Returns completion percentage for each unit based on:
        - Total assignments for members of the unit
        - Completed assignments (status='Submitted')
        """
        from apps.evaluations.models import EvaluationAssignment
        
        # Get active organization
        org_id = request.query_params.get('organization_id')
        if org_id:
            units = OrganizationUnit.objects.filter(organization_id=org_id)
        else:
            units = OrganizationUnit.objects.all()
        
        stats = []
        for unit in units:
            # Get all active members of this unit
            member_user_ids = Membership.objects.filter(
                unit_id=unit,
                is_active=True
            ).values_list('user_id', flat=True)
            
            if not member_user_ids:
                stats.append({
                    'unit_id': unit.id,
                    'unit_name': unit.name,
                    'unit_type': unit.type_id.name if unit.type_id else None,
                    'total_members': 0,
                    'total_assignments': 0,
                    'completed_assignments': 0,
                    'completion_percentage': 0
                })
                continue
            
            # Get assignments for these users (as evaluatees)
            assignments = EvaluationAssignment.objects.filter(
                evaluatee_id__in=member_user_ids
            )
            
            total = assignments.count()
            completed = assignments.filter(status='Completed').count()
            
            completion_percentage = round((completed / total * 100), 1) if total > 0 else 0
            
            stats.append({
                'unit_id': unit.id,
                'unit_name': unit.name,
                'unit_type': unit.type_id.name if unit.type_id else None,
                'total_members': len(member_user_ids),
                'total_assignments': total,
                'completed_assignments': completed,
                'completion_percentage': completion_percentage
            })
        
        # Sort by completion percentage descending
        stats.sort(key=lambda x: x['completion_percentage'], reverse=True)
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def analytics_summary(self, request):
        """
        Get comprehensive analytics summary for the dashboard.
        
        Returns:
        - Total organizations
        - Total units
        - Total members
        - Total assignments
        - Overall completion rate
        """
        from apps.evaluations.models import EvaluationAssignment
        from apps.users.models import User
        
        org_id = request.query_params.get('organization_id')
        
        # Base querysets
        if org_id:
            units_qs = OrganizationUnit.objects.filter(organization_id=org_id)
            memberships_qs = Membership.objects.filter(
                unit_id__in=units_qs,
                is_active=True
            )
        else:
            memberships_qs = Membership.objects.filter(is_active=True)
            units_qs = OrganizationUnit.objects.filter(
                id__in=memberships_qs.values('unit_id')
            )
        
        total_members = memberships_qs.values('user_id').distinct().count()
        total_units = units_qs.count()
        
        # Get all active users
        total_users = User.objects.filter(is_active=True).count()
        
        # Assignment stats
        if org_id:
            member_user_ids = memberships_qs.values_list('user_id', flat=True)
            assignments = EvaluationAssignment.objects.filter(
                evaluatee_id__in=member_user_ids
            )
        else:
            assignments = EvaluationAssignment.objects.all()
        
        total_assignments = assignments.count()
        completed_assignments = assignments.filter(status='Completed').count()
        pending_assignments = assignments.filter(status='Pending').count()
        
        overall_completion = round((completed_assignments / total_assignments * 100), 1) if total_assignments > 0 else 0
        
        return Response({
            'total_organizations': Organization.objects.filter(is_active=True).count(),
            'total_units': total_units,
            'total_members': total_members,
            'total_users': total_users,
            'total_assignments': total_assignments,
            'completed_assignments': completed_assignments,
            'pending_assignments': pending_assignments,
            'overall_completion_rate': overall_completion
        })


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
