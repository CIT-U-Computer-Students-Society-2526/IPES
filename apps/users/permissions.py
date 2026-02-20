from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """
    Custom permission to only allow Admins to access the view.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        if request.user.is_staff or request.user.is_superuser:
            return True
            
        # Check if the user has an 'Admin' role in ANY active membership
        return request.user.memberships.filter(is_active=True, role__iexact='admin').exists()
