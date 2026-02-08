from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
from django.utils import timezone

from .models import Accomplishment
from .serializers import (
    AccomplishmentSerializer,
    AccomplishmentCreateSerializer,
    AccomplishmentListSerializer,
    AccomplishmentVerifySerializer
)


class AccomplishmentViewSet(viewsets.ModelViewSet):
    """ViewSet for Accomplishment CRUD operations"""
    queryset = Accomplishment.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AccomplishmentCreateSerializer
        elif self.action == 'list':
            return AccomplishmentListSerializer
        return AccomplishmentSerializer
    
    def get_queryset(self):
        """Filter accomplishments based on user role and parameters"""
        queryset = Accomplishment.objects.all()
        user = self.request.user
        
        # Regular officers can only see their own accomplishments
        if user.role in ['officer', 'member']:
            queryset = queryset.filter(user_id=user)
        
        # Admin can filter by other users
        user_id = self.request.query_params.get('user_id')
        status_param = self.request.query_params.get('status')
        type_param = self.request.query_params.get('type')
        
        if user_id and user.role == 'admin':
            queryset = queryset.filter(user_id=user_id)
        if status_param:
            queryset = queryset.filter(status=status_param)
        if type_param:
            queryset = queryset.filter(type=type_param)
        
        return queryset.select_related('user_id', 'verified_by').order_by('-date_completed', '-id')
    
    def perform_create(self, serializer):
        """Auto-set user_id from request"""
        serializer.save(user_id=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my(self, request):
        """Get current user's accomplishments"""
        accomplishments = self.get_queryset().filter(user_id=request.user)
        serializer = AccomplishmentListSerializer(accomplishments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get accomplishments pending verification (Admin only)"""
        if request.user.role not in ['admin', 'super_admin']:
            return Response(
                {'error': 'Unauthorized'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        accomplishments = Accomplishment.objects.filter(status='Pending')
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
        if request.user.role not in ['admin', 'super_admin']:
            return Response(
                {'error': 'Unauthorized'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        from django.db.models import Count
        
        # Base queryset
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
        
        if request.user.role not in ['admin', 'super_admin']:
            return Response(
                {'error': 'Unauthorized'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if accomplishment.status != 'Pending':
            return Response(
                {'error': 'Can only verify pending accomplishments'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = AccomplishmentVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        accomplishment.status = serializer.validated_data['status']
        accomplishment.verified_by = request.user
        accomplishment.save()
        
        response_serializer = AccomplishmentSerializer(accomplishment)
        return Response({
            'message': f'Accomplishment {serializer.validated_data["status"].lower()} successfully',
            'accomplishment': response_serializer.data
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
