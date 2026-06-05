from rest_framework import status, viewsets
from rest_framework.decorators import action, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import login, logout

from apps.audit.utils import log_action, AuditActions

from .models import User
from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    LoginSerializer,
    PasswordResetSerializer,
    UserProfileUpdateSerializer,
    ForgotPasswordRequestSerializer,
    ForgotPasswordConfirmSerializer
)

from rest_framework.throttling import AnonRateThrottle
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
import logging

from .permissions import IsAdmin

logger = logging.getLogger(__name__)

class AuthViewSet(viewsets.ViewSet):
    """ViewSet for authentication endpoints"""
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'], url_path='login', permission_classes=[AllowAny])
    def login(self, request):
        """Handle user login"""
        serializer = LoginSerializer(data=request.data)

        if not serializer.is_valid():
            # Return validation errors with more detail
            return Response(
                {
                    'message': 'Login failed',
                    'errors': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.validated_data['user']
        login(request, user)

        # Log successful login
        log_action(user, AuditActions.USER_LOGIN, request)

        # Generate or retrieve token for API authentication
        from rest_framework.authtoken.models import Token
        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': 'Login successful'
        })

    @action(detail=False, methods=['post'], url_path='logout', permission_classes=[AllowAny])
    def logout(self, request):
        """Handle user logout"""
        # Get user before logout for logging
        user = request.user if request.user.is_authenticated else None
        logout(request)

        # Log logout if user was authenticated
        if user:
            log_action(user, AuditActions.USER_LOGOUT, request)
            # delete auth token so it cannot be reused
            try:
                from rest_framework.authtoken.models import Token
                Token.objects.filter(user=user).delete()
            except Exception:
                pass

        return Response({'message': 'Logout successful'})
        
    @action(detail=False, methods=['post'], url_path='register', permission_classes=[AllowAny])
    def register(self, request):
        """Handle public user registration"""
        serializer = UserCreateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {
                    'message': 'Registration failed',
                    'errors': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
            
        user = serializer.save()
        
        # Log successful registration
        log_action(user, AuditActions.USER_CREATED, request, user_email=user.email)
        
        # Log them in automatically
        login(request, user)
        log_action(user, AuditActions.USER_LOGIN, request)
        
        # Generate token for API authentication
        from rest_framework.authtoken.models import Token
        token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': 'Registration successful'
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get', 'put', 'patch'], url_path='me', permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get or update current authenticated user"""
        user = request.user

        if request.method == 'GET':
            return Response(UserSerializer(user).data)

        serializer = UserProfileUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            log_action(user, AuditActions.USER_UPDATED, request)
            return Response(UserSerializer(user).data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='password-reset-request', permission_classes=[AllowAny], throttle_classes=[AnonRateThrottle])
    def password_reset_request(self, request):
        """Request a password reset link"""
        serializer = ForgotPasswordRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.filter(email=email).first()
            
            if user and user.is_active:
                uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
                token = default_token_generator.make_token(user)
                frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
                reset_link = f"{frontend_url.rstrip('/')}/reset-password/{uidb64}/{token}"
                
                try:
                    if getattr(settings, 'DEBUG', False):
                        print(f"\n--- DEV: PASSWORD RESET LINK ---\n{reset_link}\n--------------------------------\n")
                    send_mail(
                        subject="Password Reset Request",
                        message=f"You requested a password reset. Click the link to reset your password:\n\n{reset_link}",
                        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@example.com'),
                        recipient_list=[email],
                        fail_silently=False,
                    )
                except Exception as e:
                    logger.error(f"Failed to send password reset email to {email}: {e}", exc_info=True)
            
            # Anti-enumeration: always return success
            return Response(
                {'message': 'If an account with this email exists, a reset link has been sent.'},
                status=status.HTTP_200_OK
            )
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='password-reset-confirm', permission_classes=[AllowAny])
    def password_reset_confirm(self, request):
        """Confirm password reset with token"""
        serializer = ForgotPasswordConfirmSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            log_action(user, AuditActions.USER_UPDATED, request, detail="Password reset via email link")
            return Response({'message': 'Password has been reset successfully.'}, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for User CRUD operations - Admin only"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer
    
    def get_queryset(self):
        """Filter users based on organization if needed"""
        queryset = User.objects.all()
        org_id = self.request.query_params.get('organization_id')
        if org_id:
            try:
                org_id = int(org_id)
                # Return users who belong to this organization via OrganizationRole
                # and are currently active in it.
                queryset = queryset.filter(
                    organization_roles__organization_id=org_id,
                    organization_roles__is_active=True
                ).distinct()
            except (ValueError, TypeError):
                # Invalid organization_id parameter
                queryset = User.objects.none()
        return queryset
    
    def perform_create(self, serializer):
        """Log user creation"""
        user = serializer.save()
        log_action(
            self.request.user,
            AuditActions.USER_CREATED,
            self.request,
            user_email=user.email
        )

    def perform_update(self, serializer):
        """Log user updates"""
        user = serializer.save()
        log_action(
            self.request.user,
            AuditActions.USER_UPDATED,
            self.request,
            user_email=user.email
        )

    def perform_destroy(self, instance):
        """Soft delete user and log the action"""
        instance.is_active = False
        instance.save()
        log_action(
            self.request.user,
            AuditActions.USER_DEACTIVATED,
            self.request,
            user_email=instance.email
        )
        
    @action(detail=True, methods=['post'], url_path='set-password')
    def set_password(self, request, pk=None):
        """Admin endpoint to forcefully reset a user's password"""
        user = self.get_object()
        serializer = PasswordResetSerializer(user, data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            log_action(
                request.user, 
                AuditActions.USER_UPDATED, 
                request, 
                user_email=user.email,
                detail="Password reset by admin"
            )
            return Response({'status': 'password set'})
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
