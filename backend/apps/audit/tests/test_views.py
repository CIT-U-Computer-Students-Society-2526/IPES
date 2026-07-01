from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.audit.models import AuditLog
from apps.users.models import User
from apps.organizations.models import Organization
from django.utils import timezone

class AuditViewSetTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_superuser(email='audit_admin@cit.edu', username='audadmin', password='password')
        self.client.force_authenticate(user=self.user)
        
        self.org = Organization.objects.create(name='Test Org', code='ORG1', period_year_start=timezone.now().date())
        
        self.log = AuditLog.objects.create(
            user_id=self.user,
            organization_id=self.org,
            action='Created evaluation form',
            ip_address='192.168.1.1'
        )

    def test_list_audit_logs(self):
        url = reverse('audit-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        self.assertTrue(len(results) > 0)
        self.assertEqual(results[0]['action'], 'Created evaluation form')
