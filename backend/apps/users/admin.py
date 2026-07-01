from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'first_name', 'last_name', 'is_staff', 'is_active')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    list_filter = ('is_staff', 'is_active', 'is_superuser')
    ordering = ('email',)
    
    # Since we use email as username, ensure fieldsets are correct if needed, 
    # but UserAdmin handles most things well. We just add 'display_picture' to fieldsets.
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('display_picture',)}),
    )
