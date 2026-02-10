from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta

from .models import AuditLog
from .serializers import AuditLogSerializer, AuditLogListSerializer


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing audit logs - Admin only access
    """
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter audit logs based on user role and parameters"""
        queryset = AuditLog.objects.all()
        
        # Only admins can view audit logs
        if self.request.user.role not in ['admin', 'super_admin']:
            return AuditLog.objects.none()
        
        # Filter by user
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by action
        action_param = self.request.query_params.get('action')
        if action_param:
            queryset = queryset.filter(action__icontains=action_param)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(datetime__gte=start_date)
        if end_date:
            queryset = queryset.filter(datetime__lte=end_date)
        
        # Filter by IP
        ip_address = self.request.query_params.get('ip_address')
        if ip_address:
            queryset = queryset.filter(ip_address=ip_address)
        
        return queryset.select_related('user_id').order_by('-datetime')
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent audit logs (last 100)"""
        if request.user.role not in ['admin', 'super_admin']:
            return Response(
                {'error': 'Unauthorized'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        logs = AuditLog.objects.all()[:100]
        serializer = AuditLogListSerializer(logs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_user(self, request):
        """Get audit logs for a specific user"""
        user_id = request.query_params.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'user_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logs = self.get_queryset().filter(user_id=user_id)
        serializer = AuditLogListSerializer(logs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_action(self, request):
        """Get audit logs by action type"""
        action_param = request.query_params.get('action')
        
        if not action_param:
            return Response(
                {'error': 'action parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logs = self.get_queryset().filter(
            action__icontains=action_param
        )
        serializer = AuditLogListSerializer(logs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_date(self, request):
        """Get audit logs within a date range"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not start_date or not end_date:
            return Response(
                {'error': 'start_date and end_date parameters are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logs = self.get_queryset().filter(
            datetime__range=[start_date, end_date]
        )
        serializer = AuditLogListSerializer(logs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's audit logs"""
        if request.user.role not in ['admin', 'super_admin']:
            return Response(
                {'error': 'Unauthorized'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        today = timezone.now().date()
        logs = AuditLog.objects.filter(
            datetime__date=today
        ).select_related('user_id').order_by('-datetime')
        
        serializer = AuditLogListSerializer(logs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def this_week(self, request):
        """Get this week's audit logs"""
        if request.user.role not in ['admin', 'super_admin']:
            return Response(
                {'error': 'Unauthorized'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        week_ago = timezone.now() - timedelta(days=7)
        logs = AuditLog.objects.filter(
            datetime__gte=week_ago
        ).select_related('user_id').order_by('-datetime')
        
        serializer = AuditLogListSerializer(logs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search audit logs by keyword"""
        keyword = request.query_params.get('q')
        
        if not keyword:
            return Response(
                {'error': 'q (search query) parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logs = self.get_queryset().filter(
            Q(action__icontains=keyword) |
            Q(ip_address__icontains=keyword) |
            Q(user_id__email__icontains=keyword)
        )
        
        serializer = AuditLogListSerializer(logs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get audit log statistics"""
        if request.user.role not in ['admin', 'super_admin']:
            return Response(
                {'error': 'Unauthorized'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        from django.db.models import Count
        
        # Total count
        total = AuditLog.objects.count()
        
        # Today's count
        today = timezone.now().date()
        today_count = AuditLog.objects.filter(datetime__date=today).count()
        
        # Count by action type (top 10)
        action_counts = dict(
            AuditLog.objects.values('action')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
            .values_list('action', 'count')
        )
        
        # Count by user (top 10)
        user_counts = dict(
            AuditLog.objects.values('user_id__email')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
            .values_list('user_id__email', 'count')
        )
        
        return Response({
            'total': total,
            'today': today_count,
            'by_action': action_counts,
            'by_user': user_counts
        })
