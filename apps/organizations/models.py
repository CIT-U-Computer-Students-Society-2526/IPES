from django.conf import settings
from django.db import models

class Organization(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    display_picture = models.ImageField(upload_to='organizations/pictures/', blank=True, null=True)
    description = models.TextField()
    period_year_start = models.DateField()
    period_year_end = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

class UnitType(models.Model):
    organization_id = models.ForeignKey(Organization, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)

class OrganizationUnit(models.Model):
    organization_id = models.ForeignKey(Organization, on_delete=models.CASCADE)
    type_id = models.ForeignKey(UnitType, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField()

class PositionType(models.Model):
    organization_id = models.ForeignKey(Organization, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    rank = models.IntegerField(help_text='1 for Head, higher numbers for lower rank')

class Membership(models.Model):
    user_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='memberships')
    unit_id = models.ForeignKey(OrganizationUnit, on_delete=models.CASCADE, related_name='members')
    position_id = models.ForeignKey(PositionType, on_delete=models.PROTECT)
    
    ROLE_CHOICES = (
        ('Admin', 'Admin'),
        ('Member', 'Member'),
    )
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='Member')
    
    date_start = models.DateField()
    date_end = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

class JoinRequest(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='join_requests')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='join_requests')
    
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'organization')