from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User
from apps.organizations.models import OrganizationRole
from django.contrib.auth.password_validation import validate_password
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.contrib.auth.tokens import default_token_generator


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
        """
        Returns the organizations this user belongs to, determined by OrganizationRole.
        Membership rows are supplementary — they provide position/unit data only.
        """
        try:
            active_org_roles = obj.organization_roles.filter(
                is_active=True,
                organization__is_active=True
            ).select_related('organization')
        except Exception:
            return []

        result = []
        for org_role in active_org_roles:
            org = org_role.organization

            # Get all active Membership rows for this user in this org (for position info)
            memberships = obj.memberships.filter(
                unit_id__organization_id=org,
                is_active=True
            ).select_related('unit_id', 'position_id')

            if memberships.exists():
                # One entry per position/unit the user holds in this org
                for m in memberships:
                    result.append({
                        'id': m.id,
                        'organization_id': org.id,
                        'organization_name': org.name,
                        'organization_email': org.email,
                        'unit_id': m.unit_id.id if m.unit_id else None,
                        'unit_name': m.unit_id.name if m.unit_id else None,
                        'position_id': m.position_id.id if m.position_id else None,
                        'position_name': m.position_id.name if m.position_id else None,
                        'position_rank': m.position_id.rank if m.position_id else None,
                        'role': org_role.role,
                        'is_active': True,
                    })
            else:
                # User has an org role but no positional membership yet
                result.append({
                    'id': None,
                    'organization_id': org.id,
                    'organization_name': org.name,
                    'organization_email': org.email,
                    'unit_id': None,
                    'unit_name': None,
                    'position_id': None,
                    'position_name': None,
                    'position_rank': None,
                    'role': org_role.role,
                    'is_active': True,
                })

        return result


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


class ForgotPasswordRequestSerializer(serializers.Serializer):
    """Serializer for requesting a password reset link"""
    email = serializers.EmailField()


class ForgotPasswordConfirmSerializer(serializers.Serializer):
    """Serializer for confirming a password reset"""
    uidb64 = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, validators=[validate_password])

    def validate(self, attrs):
        uidb64 = attrs.get('uidb64')
        token = attrs.get('token')
        
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError({"token": "Invalid token or user ID."})
            
        if not default_token_generator.check_token(user, token):
            raise serializers.ValidationError({"token": "Invalid or expired token."})
            
        attrs['user'] = user
        return attrs
        
    def save(self, **kwargs):
        user = self.validated_data['user']
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
