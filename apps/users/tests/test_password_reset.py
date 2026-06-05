from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.core import mail
from apps.users.models import User
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator

class PasswordResetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create(
            username='testuser', 
            email='test@example.com',
            is_active=True
        )
        self.user.set_password('oldpassword123')
        self.user.save()

    def test_password_reset_request_valid_email(self):
        url = '/api/auth/password-reset-request/'
        data = {'email': 'test@example.com'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Password Reset Request', mail.outbox[0].subject)

    def test_password_reset_request_invalid_email(self):
        url = '/api/auth/password-reset-request/'
        data = {'email': 'invalid@example.com'}
        response = self.client.post(url, data)
        # Anti-enumeration: should still return 200
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 0)

    def test_password_reset_confirm_valid_token(self):
        uidb64 = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)
        
        url = '/api/auth/password-reset-confirm/'
        data = {
            'uidb64': uidb64,
            'token': token,
            'new_password': 'newpassword1234!'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify password changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpassword1234!'))

    def test_password_reset_confirm_invalid_token(self):
        uidb64 = urlsafe_base64_encode(force_bytes(self.user.pk))
        
        url = '/api/auth/password-reset-confirm/'
        data = {
            'uidb64': uidb64,
            'token': 'invalid-token',
            'new_password': 'newpassword1234!'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_reset_confirm_used_token(self):
        uidb64 = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)
        
        url = '/api/auth/password-reset-confirm/'
        data = {
            'uidb64': uidb64,
            'token': token,
            'new_password': 'newpassword1234!'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Second attempt should fail because password changed, invalidating token
        data['new_password'] = 'anotherpassword123!'
        response2 = self.client.post(url, data)
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)
