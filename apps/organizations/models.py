from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Organization(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    display_picture = models.ImageField(
        upload_to='organizations/pictures/', blank=True, null=True)
    description = models.TextField()
    email = models.EmailField(blank=True, null=True)
    period_year_start = models.DateField()
    period_year_end = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)


class UnitType(models.Model):
    organization_id = models.ForeignKey(Organization, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)


class OrganizationUnit(models.Model):
    organization_id = models.ForeignKey(Organization, on_delete=models.CASCADE)
    type_id = models.ForeignKey(UnitType, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)


class PositionType(models.Model):
    organization_id = models.ForeignKey(Organization, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    rank = models.IntegerField(
        help_text='1 for Head, higher numbers for lower rank',
        validators=[MinValueValidator(1), MaxValueValidator(100)]
    )
    is_active = models.BooleanField(default=True)


class Membership(models.Model):
    user_id = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='memberships')
    unit_id = models.ForeignKey(
        OrganizationUnit, on_delete=models.CASCADE, related_name='members')
    position_id = models.ForeignKey(PositionType, on_delete=models.PROTECT)

    date_start = models.DateField()
    date_end = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)


class OrganizationRole(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='organization_roles')
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name='user_roles')

    ROLE_CHOICES = (
        ('Admin', 'Admin'),
        ('Member', 'Member'),
    )
    role = models.CharField(
        max_length=50, choices=ROLE_CHOICES, default='Member')
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('user', 'organization')


class JoinRequest(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='join_requests')
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name='join_requests')

    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'organization')
