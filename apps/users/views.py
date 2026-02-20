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
    LoginSerializer
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
    
    @action(detail=False, methods=['get'], url_path='me', permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get current authenticated user"""
        if request.user.is_authenticated:
            return Response(UserSerializer(request.user).data)
        return Response({'detail': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)


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
        return User.objects.all()
    
    def perform_create(self, serializer):
        """Log user creation"""
        user = serializer.save()
        log_action(
            self.request.user,
            AuditActions.USER_CREATED,
            self.request,
            user_email=user.email
        )
