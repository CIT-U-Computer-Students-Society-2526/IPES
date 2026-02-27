from rest_framework import serializers
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    """Serializer for AuditLog model"""
    user_email = serializers.CharField(source='user_id.email', read_only=True)
    user_name = serializers.CharField(
        source='user_id.get_full_name', read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            'id', 'user_id', 'user_email', 'user_name',
            'action', 'ip_address', 'datetime'
        ]
        read_only_fields = ['id', 'user_id',
                            'action', 'ip_address', 'datetime']


class AuditLogListSerializer(serializers.ModelSerializer):
    """Extended serializer for list view"""
    user_email = serializers.CharField(source='user_id.email', read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            'id', 'user_id', 'user_email', 'action',
            'ip_address', 'datetime'
        ]
