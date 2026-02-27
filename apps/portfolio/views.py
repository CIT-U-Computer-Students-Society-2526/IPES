from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
from django.utils import timezone

from apps.audit.utils import log_action, AuditActions

from .models import Accomplishment
from .serializers import (
    AccomplishmentSerializer,
    AccomplishmentCreateSerializer,
    AccomplishmentListSerializer,
    AccomplishmentUpdateSerializer,
    AccomplishmentVerifySerializer
)


class AccomplishmentViewSet(viewsets.ModelViewSet):
    """ViewSet for Accomplishment CRUD operations"""
    queryset = Accomplishment.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AccomplishmentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return AccomplishmentUpdateSerializer
        elif self.action == 'list':
            return AccomplishmentListSerializer
        return AccomplishmentSerializer
    
    def get_queryset(self):
        """Filter accomplishments based on organization, user role, and parameters"""
        queryset = Accomplishment.objects.all()
        user = self.request.user
        
        is_global_admin = user.is_staff or user.is_superuser
        org_id = self.request.query_params.get('organization_id')
        
        # If no org_id is provided, users can only see their own accomplishments
        # This prevents cross-tenant data leakage when no org is selected
        if not org_id and not is_global_admin:
            return queryset.filter(user_id=user).select_related('user_id', 'verified_by').order_by('-date_completed', '-id')

        # Organization scoping
        # Needs to check if the user is an admin of the requested organization
        is_org_admin = False
        if org_id and not is_global_admin:
            from apps.organizations.models import OrganizationRole
            is_org_admin = OrganizationRole.objects.filter(
                user_id=user,
                organization_id=org_id,
                role='Admin',
                is_active=True
            ).exists()

            # Users can only see their own accomplishments within an org if they are not an admin
            if not is_org_admin:
                return queryset.filter(user_id=user).select_related('user_id', 'verified_by').order_by('-date_completed', '-id')

            # If user is an org admin, restrict the queryset to users who are
            # members of that organization so admins cannot view other orgs' data
            queryset = queryset.filter(
                user_id__memberships__unit_id__organization_id=org_id,
                user_id__memberships__is_active=True
            )

        # Admin can filter by other users globally, or within their org
        user_id = self.request.query_params.get('user_id')
        status_param = self.request.query_params.get('status')
        type_param = self.request.query_params.get('type')
        
        if user_id and (is_global_admin or is_org_admin):
            queryset = queryset.filter(user_id=user_id)
        if status_param:
            queryset = queryset.filter(status=status_param)
        if type_param:
            queryset = queryset.filter(type=type_param)
        
        return queryset.select_related('user_id', 'verified_by').order_by('-date_completed', '-id')
    
    def perform_create(self, serializer):
        """Auto-set user_id from request and log creation"""
        accomplishment = serializer.save(user_id=self.request.user)
        log_action(
            self.request.user,
            AuditActions.ACCOMPLISHMENT_CREATED,
            self.request,
            accomplishment_id=str(accomplishment.id),
            title=accomplishment.title
        )
    
    def perform_update(self, serializer):
        """Update accomplishment and log the change"""
        accomplishment = serializer.save()
        log_action(
            self.request.user,
            AuditActions.ACCOMPLISHMENT_UPDATED,
            self.request,
            accomplishment_id=str(accomplishment.id),
            title=accomplishment.title,
            status=accomplishment.status
        )
    
    def update(self, request, *args, **kwargs):
        """Override update to allow only owners to edit pending/rejected accomplishments"""
        accomplishment = self.get_object()
        
        # Only allow editing if user is the owner
        if accomplishment.user_id != request.user:
            return Response(
                {'error': 'You can only edit your own accomplishments'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Only allow editing if status is Pending or Rejected
        if accomplishment.status not in ['Pending', 'Rejected']:
            return Response(
                {'error': 'You can only edit pending or rejected accomplishments'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().update(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def my(self, request):
        """Get current user's accomplishments"""
        accomplishments = self.get_queryset().filter(user_id=request.user)
        serializer = AccomplishmentListSerializer(accomplishments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get accomplishments pending verification (Admin only)"""
        user = request.user
        is_global_admin = user.is_staff or user.is_superuser
        org_id = request.query_params.get('organization_id')
        
        if not is_global_admin:
            if not org_id:
                return Response({'error': 'organization_id is required'}, status=status.HTTP_400_BAD_REQUEST)
                
            from apps.organizations.models import OrganizationRole
            is_org_admin = OrganizationRole.objects.filter(
                user_id=user,
                organization_id=org_id,
                role='Admin',
                is_active=True
            ).exists()
            
            if not is_org_admin:
                return Response(
                    {'error': 'Unauthorized'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Use the scoped queryset so org admins only see accomplishments
        # from their own organization
        accomplishments = self.get_queryset().filter(status='Pending')
        serializer = AccomplishmentListSerializer(accomplishments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Filter accomplishments by type"""
        type_param = request.query_params.get('type')
        if not type_param:
            return Response(
                {'error': 'type parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        accomplishments = self.get_queryset().filter(type=type_param)
        serializer = AccomplishmentListSerializer(accomplishments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get summary statistics for accomplishments"""
        user = request.user
        is_global_admin = user.is_staff or user.is_superuser
        org_id = request.query_params.get('organization_id')
        
        if not is_global_admin:
            if not org_id:
                return Response({'error': 'organization_id is required'}, status=status.HTTP_400_BAD_REQUEST)
                
            from apps.organizations.models import OrganizationRole
            is_org_admin = OrganizationRole.objects.filter(
                user_id=user,
                organization_id=org_id,
                role='Admin',
                is_active=True
            ).exists()
            
            if not is_org_admin:
                return Response(
                    {'error': 'Unauthorized'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        from django.db.models import Count

        # Base queryset - restrict to org members if org admin
        if not is_global_admin:
            queryset = Accomplishment.objects.filter(
                user_id__memberships__unit_id__organization_id=org_id,
                user_id__memberships__is_active=True
            )
        else:
            queryset = Accomplishment.objects.all()

        # If filtering by user
        user_id = request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Count by status
        total = queryset.count()
        verified = queryset.filter(status='Verified').count()
        pending = queryset.filter(status='Pending').count()
        rejected = queryset.filter(status='Rejected').count()
        
        # Count by type
        by_type = dict(
            queryset.values('type')
            .annotate(count=Count('id'))
            .values_list('type', 'count')
        )
        
        return Response({
            'total': total,
            'verified': verified,
            'pending': pending,
            'rejected': rejected,
            'by_type': by_type
        })
    
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Verify or reject an accomplishment (Admin only)"""
        accomplishment = self.get_object()
        
        user = request.user
        is_global_admin = user.is_staff or user.is_superuser
        org_id = request.query_params.get('organization_id') or request.data.get('organization_id')
        
        if not is_global_admin:
            if not org_id:
                return Response({'error': 'organization_id is required'}, status=status.HTTP_400_BAD_REQUEST)
                
            from apps.organizations.models import OrganizationRole
            is_org_admin = OrganizationRole.objects.filter(
                user_id=user,
                organization_id=org_id,
                role='Admin',
                is_active=True
            ).exists()
            
            if not is_org_admin:
                return Response(
                    {'error': 'Unauthorized'},
                    status=status.HTTP_403_FORBIDDEN
                )

        # Additional safety: ensure the accomplishment belongs to the org
        # the admin is managing. Prevent an org admin from operating on
        # accomplishments from other organizations.
        if not is_global_admin and org_id:
            belongs = accomplishment.user_id.memberships.filter(
                unit_id__organization_id=org_id,
                is_active=True
            ).exists()
            if not belongs:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        if accomplishment.status != 'Pending':
            return Response(
                {'error': 'Can only verify pending accomplishments'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = AccomplishmentVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        accomplishment.status = serializer.validated_data['status']
        accomplishment.verified_by = request.user
        
        # Store comments if rejecting
        if accomplishment.status == 'Rejected' and 'comments' in serializer.validated_data:
            accomplishment.comments = serializer.validated_data['comments']
        
        accomplishment.save()
        
        # Log verification
        action = AuditActions.ACCOMPLISHMENT_VERIFIED if accomplishment.status == 'Verified' else AuditActions.ACCOMPLISHMENT_REJECTED
        log_action(
            request.user,
            action,
            request,
            accomplishment_id=str(accomplishment.id),
            title=accomplishment.title,
            status=accomplishment.status
        )
        
        response_serializer = AccomplishmentSerializer(accomplishment)
        return Response({
            'message': f'Accomplishment {serializer.validated_data["status"].lower()} successfully',
            'accomplishment': response_serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def evaluatee_profile(self, request):
        """
        Return a specific user's Verified accomplishments + org unit info,
        for use by evaluators filling out a peer evaluation form.

        Required query params:
          - user_id: the evaluatee's user PK
          - organization_id: must be an org both parties belong to

        Any authenticated member of the org can call this.
        Only Verified accomplishments are exposed.
        """
        evaluatee_id = request.query_params.get('user_id')
        org_id = request.query_params.get('organization_id')

        if not evaluatee_id or not org_id:
            return Response(
                {'error': 'user_id and organization_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        from apps.organizations.models import Membership

        # Verify the requesting user is a member of the org
        requester_is_member = Membership.objects.filter(
            user_id=request.user,
            unit_id__organization_id=org_id,
            is_active=True
        ).exists()
        if not requester_is_member:
            return Response(
                {'error': 'You are not a member of this organization'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Fetch the evaluatee's active membership in the org
        evaluatee_membership = Membership.objects.filter(
            user_id=evaluatee_id,
            unit_id__organization_id=org_id,
            is_active=True
        ).select_related('user_id', 'unit_id', 'position_id').first()

        if not evaluatee_membership:
            return Response(
                {'error': 'Evaluatee is not a member of this organization'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Only expose Verified accomplishments
        accomplishments = Accomplishment.objects.filter(
            user_id=evaluatee_id,
            status='Verified'
        ).order_by('-date_completed', '-id')

        serializer = AccomplishmentListSerializer(accomplishments, many=True)

        return Response({
            'evaluatee_name': evaluatee_membership.user_id.get_full_name() or evaluatee_membership.user_id.email,
            'unit_name': evaluatee_membership.unit_id.name if evaluatee_membership.unit_id else None,
            'position_name': evaluatee_membership.position_id.name if evaluatee_membership.position_id else None,
            'accomplishments': serializer.data,
        })

    @action(detail=False, methods=['get'])
    def verified(self, request):
        """Get verified accomplishments"""
        accomplishments = self.get_queryset().filter(status='Verified')
        serializer = AccomplishmentListSerializer(accomplishments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def rejected(self, request):
        """Get rejected accomplishments"""
        accomplishments = self.get_queryset().filter(status='Rejected')
        serializer = AccomplishmentListSerializer(accomplishments, many=True)
        return Response(serializer.data)
