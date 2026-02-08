from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class APIRoot(APIView):
    """Public API root view - lists available endpoints"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({
            'auth': {
                'login': '/api/auth/login/',
                'logout': '/api/auth/logout/',
                'me': '/api/auth/me/',
            },
            'users': {
                'list': '/api/users/users/',
                'create': '/api/users/users/',
            },
            'organizations': {
                'list': '/api/organizations/organizations/',
                'units': '/api/organizations/units/',
                'memberships': '/api/organizations/memberships/',
            },
            'note': 'POST to /api/auth/login/ to authenticate',
        })


api_view(['GET'])(APIRoot.as_view())
