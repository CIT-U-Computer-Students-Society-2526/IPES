from django.test import TestCase
from django.db.utils import IntegrityError
from apps.users.models import User

class UserModelTest(TestCase):
    def setUp(self):
        self.user_data = {
            'email': 'test@example.com',
            'username': 'testuser',
            'first_name': 'Test',
            'last_name': 'User',
            'password': 'testpassword123'
        }

    def test_create_user(self):
        user = User.objects.create_user(**self.user_data)
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.username, 'testuser')
        self.assertTrue(user.check_password('testpassword123'))
        self.assertTrue(user.is_active)
        self.assertEqual(str(user), 'test@example.com')

    def test_email_is_unique(self):
        User.objects.create_user(**self.user_data)
        with self.assertRaises(IntegrityError):
            User.objects.create_user(
                email='test@example.com',
                username='anotheruser',
                first_name='Another',
                last_name='User',
                password='testpassword123'
            )
