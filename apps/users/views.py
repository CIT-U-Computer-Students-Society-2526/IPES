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
    UserProfileUpdateSerializer
)

from .permissions import IsAdmin

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

        return Response({
            'user': UserSerializer(user).data,
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
        
        return Response({
            'user': UserSerializer(user).data,
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
            # Only return users who have an active membership in the specified organization
            queryset = queryset.filter(
                memberships__unit_id__organization_id=org_id,
                memberships__is_active=True
            ).distinct()
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
