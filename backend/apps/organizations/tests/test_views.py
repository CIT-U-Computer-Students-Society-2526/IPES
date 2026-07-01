from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.utils import timezone
from apps.organizations.models import Organization
from apps.users.models import User

class OrganizationViewSetTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='user@cit.edu',
            username='user',
            password='password123'
        )
        self.client.force_authenticate(user=self.user)
        
        self.org = Organization.objects.create(
            name='Test Organization',
            code='ORG',
            description='Test Desc',
            period_year_start=timezone.now().date(),
            is_active=True
        )

    def test_list_organizations(self):
        url = reverse('organizations-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Assuming pagination or flat list
        results = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        self.assertTrue(len(results) > 0)
        self.assertEqual(results[0]['code'], 'ORG')

    def test_retrieve_organization(self):
        url = reverse('organizations-detail', args=[self.org.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['code'], 'ORG')
        self.assertEqual(response.data['name'], 'Test Organization')
