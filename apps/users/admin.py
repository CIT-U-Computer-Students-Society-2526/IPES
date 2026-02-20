from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'first_name', 'last_name', 'role', 'is_staff', 'is_active')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    list_filter = ('role', 'is_staff', 'is_active', 'is_superuser')
    ordering = ('email',)
    
    # Since we use email as username, ensure fieldsets are correct if needed, 
    # but UserAdmin handles most things well. We just add 'role' to fieldsets.
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('role', 'display_picture')}),
    )
