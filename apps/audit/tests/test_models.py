from django.test import TestCase
from apps.audit.models import AuditLog
from apps.users.models import User
from apps.organizations.models import Organization
from django.utils import timezone

class AuditModelsTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='audituser@cit.edu', username='auditor', password='password123')
        self.org = Organization.objects.create(name='Test Org', code='ORG1', period_year_start=timezone.now().date())

    def test_audit_log_creation(self):
        log = AuditLog.objects.create(
            user_id=self.user,
            organization_id=self.org,
            action='Created evaluation form',
            ip_address='192.168.1.1'
        )
        self.assertEqual(log.user_id, self.user)
        self.assertEqual(log.organization_id, self.org)
        self.assertEqual(log.action, 'Created evaluation form')
        self.assertEqual(log.ip_address, '192.168.1.1')
        self.assertIsNotNone(log.datetime)
