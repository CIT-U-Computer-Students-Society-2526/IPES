from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Avg, Q
from django.utils import timezone
from django.shortcuts import get_object_or_404

from apps.audit.utils import log_action, AuditActions

from .models import Organization, UnitType, OrganizationUnit, PositionType, Membership, JoinRequest
from .serializers import (
    OrganizationSerializer,
    UnitTypeSerializer,
    OrganizationUnitSerializer,
    PositionTypeSerializer,
    MembershipSerializer,
    JoinRequestSerializer
)


class OrganizationViewSet(viewsets.ModelViewSet):
    """ViewSet for Organization CRUD"""
    queryset = Organization.objects.filter(is_active=True)
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        """Log organization creation and set founder as Admin"""
        org = serializer.save()
        
        # Create default functional structure
        unit_type = UnitType.objects.create(
            organization_id=org,
            name="Executive Board"
        )
        
        org_unit = OrganizationUnit.objects.create(
            organization_id=org,
            type_id=unit_type,
            name="Executive Board",
            description="Main governing body of the organization."
        )
        
        position = PositionType.objects.create(
            organization_id=org,
            name="Founder",
            rank=1
        )
        
        # Automatically assign the creator as Admin
        Membership.objects.create(
            user_id=self.request.user,
            unit_id=org_unit,
            position_id=position,
            role='Admin',
            date_start=timezone.now().date(),
            is_active=True
        )
        
        log_action(
            self.request.user,
            AuditActions.ORG_CREATED,
            self.request,
            org_name=org.name,
            org_id=str(org.id)
        )
        
    @action(detail=False, methods=['post'])
    def join_by_code(self, request):
        """Allows users to submit a join request using a unique organization code"""
        code = request.data.get('code')
        if not code:
            return Response({'error': 'Code is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            org = Organization.objects.get(code=code, is_active=True)
        except Organization.DoesNotExist:
            return Response({'error': 'Invalid organization code'}, status=status.HTTP_404_NOT_FOUND)
            
        # Check if already a member
        if Membership.objects.filter(user_id=request.user, unit_id__organization_id=org, is_active=True).exists():
            return Response({'error': 'You are already a member of this organization'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Check if request already exists
        if JoinRequest.objects.filter(user=request.user, organization=org, status='Pending').exists():
            return Response({'error': 'You already have a pending join request'}, status=status.HTTP_400_BAD_REQUEST)
            
        JoinRequest.objects.create(user=request.user, organization=org, status='Pending')
        
        log_action(
            request.user,
            AuditActions.ORG_JOIN_REQUESTED,
            request,
            org_name=org.name
        )
        
        return Response({'message': 'Join request submitted successfully'}, status=status.HTTP_201_CREATED)
    
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


class JoinRequestViewSet(viewsets.ModelViewSet):
    """ViewSet for JoinRequest CRUD and approvals"""
    queryset = JoinRequest.objects.all()
    serializer_class = JoinRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        org_id = self.request.query_params.get('organization_id')
        user_id = self.request.query_params.get('user_id')
        req_status = self.request.query_params.get('status')
        if org_id:
            queryset = queryset.filter(organization_id=org_id)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        if req_status:
            queryset = queryset.filter(status=req_status)
        return queryset
        
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Admin action to approve a join request and assign user to a unit and position."""
        join_request = self.get_object()
        
        # Verify user is an admin of this specific org
        if not Membership.objects.filter(user_id=request.user, unit_id__organization_id=join_request.organization, role='Admin', is_active=True).exists():
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
            
        if join_request.status != 'Pending':
            return Response({'error': 'Request is not pending'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Needs unit and position to create the actual membership
        unit_id = request.data.get('unit_id')
        position_id = request.data.get('position_id')
        role_choice = request.data.get('role', 'Member')
        
        if not unit_id or not position_id:
            return Response({'error': 'unit_id and position_id required to approve'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            unit = OrganizationUnit.objects.get(id=unit_id, organization_id=join_request.organization)
            position = PositionType.objects.get(id=position_id, organization_id=join_request.organization)
        except (OrganizationUnit.DoesNotExist, PositionType.DoesNotExist):
            return Response({'error': 'Invalid unit or position IDs'}, status=status.HTTP_400_BAD_REQUEST)
            
        Membership.objects.create(
            user_id=join_request.user,
            unit_id=unit,
            position_id=position,
            role=role_choice,
            date_start=timezone.now().date(),
            is_active=True
        )
        
        join_request.status = 'Approved'
        join_request.save()
        
        log_action(
            request.user,
            AuditActions.ORG_JOIN_APPROVED,
            request,
            target_user_email=join_request.user.email,
            org_name=join_request.organization.name
        )
        
        return Response({'message': 'Member approved and added successfully'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Admin action to reject a pending join request"""
        join_request = self.get_object()
        
        # Verify user is an admin of this specific org
        if not Membership.objects.filter(user_id=request.user, unit_id__organization_id=join_request.organization, role='Admin', is_active=True).exists():
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
            
        join_request.status = 'Rejected'
        join_request.save()
        
        log_action(
            request.user,
            AuditActions.ORG_JOIN_REJECTED,
            request,
            target_user_email=join_request.user.email,
            org_name=join_request.organization.name
        )
        
        return Response({'message': 'Join request rejected'})
