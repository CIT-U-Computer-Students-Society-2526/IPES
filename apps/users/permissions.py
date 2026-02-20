from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """
    Custom permission to only allow Admins to access the view.
    """

    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == 'Admin' or request.user.is_staff or request.user.is_superuser)
        )
