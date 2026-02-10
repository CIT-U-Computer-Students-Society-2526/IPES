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
                'retrieve': '/api/users/users/{id}/',
            },
            'organizations': {
                'list': '/api/organizations/organizations/',
                'units': '/api/organizations/units/',
                'memberships': '/api/organizations/memberships/',
                'positions': '/api/organizations/positions/',
                'unit_types': '/api/organizations/unit-types/',
            },
            'evaluations': {
                'forms': '/api/evaluations/forms/',
                'questions': '/api/evaluations/questions/',
                'assignments': '/api/evaluations/assignments/',
                'responses': '/api/evaluations/responses/',
                'my_pending': '/api/evaluations/assignments/my_pending/',
            },
            'portfolio': {
                'accomplishments': '/api/portfolio/accomplishments/',
                'my': '/api/portfolio/accomplishments/my/',
                'pending': '/api/portfolio/accomplishments/pending/',
                'summary': '/api/portfolio/accomplishments/summary/',
            },
            'audit': {
                'logs': '/api/audit/audit/',
                'recent': '/api/audit/audit/recent/',
                'today': '/api/audit/audit/today/',
                'this_week': '/api/audit/audit/this_week/',
                'stats': '/api/audit/audit/stats/',
                'search': '/api/audit/audit/search/',
            },
            'note': 'POST to /api/auth/login/ to authenticate',
        })


api_view(['GET'])(APIRoot.as_view())
