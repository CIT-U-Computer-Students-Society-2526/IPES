from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class APIRootSmokeTest(APITestCase):
	"""Simple smoke tests for the public API root"""

	def test_api_root_contains_expected_sections(self):
		url = reverse('api-root')
		resp = self.client.get(url)
		self.assertEqual(resp.status_code, status.HTTP_200_OK)
		data = resp.json()
		# Basic keys from the API root mapping
		self.assertIn('evaluations', data)
		self.assertIn('portfolio', data)
		self.assertIn('audit', data)
		# evaluations should include forms endpoint
		self.assertIn('forms', data['evaluations'])


class EndpointAuthTests(APITestCase):
	"""Smoke tests for endpoint authentication and role checks"""

	def test_evaluations_forms_requires_auth(self):
		resp = self.client.get('/api/forms/')
		self.assertIn(resp.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

	def test_portfolio_accomplishments_requires_auth(self):
		resp = self.client.get('/api/accomplishments/')
		self.assertIn(resp.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

	def test_audit_recent_non_admin_forbidden(self):
		from django.contrib.auth import get_user_model
		User = get_user_model()
		user = User.objects.create(username='user', email='user@example.com', role='officer')
		self.client.force_authenticate(user=user)
		resp = self.client.get('/api/audit/recent/')
		self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

	def test_audit_recent_admin_ok(self):
		from django.contrib.auth import get_user_model
		User = get_user_model()
		admin = User.objects.create(username='admin', email='admin@example.com', role='admin')
		self.client.force_authenticate(user=admin)
		resp = self.client.get('/api/audit/recent/')
		self.assertEqual(resp.status_code, status.HTTP_200_OK)
		self.assertIsInstance(resp.json(), list)
