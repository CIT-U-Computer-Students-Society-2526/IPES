from rest_framework import serializers
from .models import Organization, UnitType, OrganizationUnit, PositionType, Membership, JoinRequest


class OrganizationSerializer(serializers.ModelSerializer):
    """Serializer for Organization model"""
    
    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'code', 'display_picture', 'description',
            'period_year_start', 'period_year_end', 'is_active'
        ]
        read_only_fields = ['id']


class UnitTypeSerializer(serializers.ModelSerializer):
    """Serializer for UnitType model"""
    organization_name = serializers.CharField(source='organization_id.name', read_only=True)
    
    class Meta:
        model = UnitType
        fields = ['id', 'organization_id', 'organization_name', 'name']
        read_only_fields = ['id']


class OrganizationUnitSerializer(serializers.ModelSerializer):
    """Serializer for OrganizationUnit model"""
    organization_name = serializers.CharField(source='organization_id.name', read_only=True)
    type_name = serializers.CharField(source='type_id.name', read_only=True)
    members_count = serializers.IntegerField(read_only=True, default=0)
    
    class Meta:
        model = OrganizationUnit
        fields = [
            'id', 'organization_id', 'organization_name', 
            'type_id', 'type_name', 'name', 'description', 'members_count'
        ]
        read_only_fields = ['id']


class PositionTypeSerializer(serializers.ModelSerializer):
    """Serializer for PositionType model"""
    organization_name = serializers.CharField(source='organization_id.name', read_only=True)
    
    class Meta:
        model = PositionType
        fields = ['id', 'organization_id', 'organization_name', 'name', 'rank']
        read_only_fields = ['id']


class MembershipSerializer(serializers.ModelSerializer):
    """Serializer for Membership model"""
    user_email = serializers.CharField(source='user_id.email', read_only=True)
    unit_name = serializers.CharField(source='unit_id.name', read_only=True)
    position_name = serializers.CharField(source='position_id.name', read_only=True)
    
    class Meta:
        model = Membership
        fields = [
            'id', 'user_id', 'user_email', 'unit_id', 'unit_name',
            'position_id', 'position_name', 'date_start', 
            'date_end', 'is_active'
        ]
        read_only_fields = ['id']

class JoinRequestSerializer(serializers.ModelSerializer):
    """Serializer for JoinRequest model"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_first_name = serializers.CharField(source='user.first_name', read_only=True)
    user_last_name = serializers.CharField(source='user.last_name', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    
    class Meta:
        model = JoinRequest
        fields = [
            'id', 'user', 'user_email', 'user_first_name', 'user_last_name',
            'organization', 'organization_name', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']
