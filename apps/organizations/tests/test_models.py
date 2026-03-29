from django.test import TestCase
from django.utils import timezone
from apps.organizations.models import Organization, UnitType, OrganizationUnit, PositionType, Membership
from apps.users.models import User

class OrganizationModelsTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='member@cit.edu',
            username='member',
            password='memberpassword123'
        )
        
        self.org = Organization.objects.create(
            name='Test Organization',
            code='ORG',
            description='Test Desc',
            period_year_start=timezone.now().date(),
            is_active=True
        )
        
        self.unit_type = UnitType.objects.create(
            organization_id=self.org,
            name='Department'
        )
        
        self.org_unit = OrganizationUnit.objects.create(
            organization_id=self.org,
            type_id=self.unit_type,
            name='IT Dept'
        )
        
        self.position = PositionType.objects.create(
            organization_id=self.org,
            name='Manager',
            rank=1
        )

    def test_organization_creation(self):
        org = Organization.objects.get(code='ORG')
        self.assertEqual(org.name, 'Test Organization')
        self.assertTrue(org.is_active)

    def test_membership_creation(self):
        membership = Membership.objects.create(
            user_id=self.user,
            unit_id=self.org_unit,
            position_id=self.position,
            date_start=timezone.now().date()
        )
        self.assertEqual(membership.user_id, self.user)
        self.assertEqual(membership.unit_id.name, 'IT Dept')
        self.assertEqual(membership.position_id.name, 'Manager')
        self.assertTrue(membership.is_active)

    def test_unit_cascades_on_org_delete(self):
        # Count elements before delete
        self.assertEqual(OrganizationUnit.objects.count(), 1)
        self.assertEqual(UnitType.objects.count(), 1)
        
        # Delete org
        self.org.delete()
        
        # Ensure cascades happened
        self.assertEqual(OrganizationUnit.objects.count(), 0)
        self.assertEqual(UnitType.objects.count(), 0)
