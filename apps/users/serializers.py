from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User
from apps.organizations.models import OrganizationRole


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model - handles reading user data"""
    
    memberships = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'display_picture', 'is_active', 'date_joined', 'memberships'
        ]
        read_only_fields = ['id', 'date_joined']
        
    def get_memberships(self, obj):
        user_roles = {r.organization_id: r.role for r in obj.organization_roles.all()}
        
        return [
            {
                'id': m.id,
                'organization_id': m.unit_id.organization_id.id,
                'organization_name': m.unit_id.organization_id.name,
                'organization_email': m.unit_id.organization_id.email,
                'unit_id': m.unit_id.id,
                'unit_name': m.unit_id.name,
                'position_id': m.position_id.id,
                'position_name': m.position_id.name,
                'position_rank': m.position_id.rank,
                'role': user_roles.get(m.unit_id.organization_id.id, 'Member'),
                'is_active': m.is_active
            }
            for m in obj.memberships.filter(is_active=True, unit_id__organization_id__is_active=True)
        ]


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for admin to create new users"""
    password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'password'
        ]
        read_only_fields = ['username']
        
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def create(self, validated_data):
        import uuid
        password = validated_data.pop('password')
        # Auto-generate a unique username
        validated_data['username'] = uuid.uuid4().hex[:30] 
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for login requests"""
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            # Authenticate using email as username
            user = authenticate(username=email, password=password)

            if user:
                if not user.is_active:
                    raise serializers.ValidationError('Invalid email or password') # Prevent user enumeration
                attrs['user'] = user
                return attrs
            
            # Generic error message
            raise serializers.ValidationError('Invalid email or password')
        else:
            raise serializers.ValidationError('Email and password are required')


class PasswordResetSerializer(serializers.Serializer):
    """Serializer for password resets by Admins"""
    password = serializers.CharField(write_only=True, min_length=8)
    
    def update(self, instance, validated_data):
        instance.set_password(validated_data['password'])
        instance.save()
        return instance


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for regular users to update their own profile"""
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'display_picture']
