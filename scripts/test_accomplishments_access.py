import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'IPES.settings')
import sys
# Ensure project root is on sys.path so the 'IPES' package is importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from apps.organizations.models import Organization, OrganizationRole, Membership
# from apps.portfolio.models import Accomplishment

User = get_user_model()
client = Client()

org = Organization.objects.filter(id=4).first()
print('Org:', org.id if org else 'None')

admin_role = OrganizationRole.objects.filter(organization=org, role='Admin', is_active=True).first()
admin_user = admin_role.user if admin_role else None

member_m = Membership.objects.filter(unit_id__organization_id=4, is_active=True).exclude(user_id=admin_user).first()
member_user = member_m.user_id if member_m else None

print('Admin user:', getattr(admin_user, 'email', None))
print('Member user:', getattr(member_user, 'email', None))

def do_get(user, path):
    client.force_login(user)
    r = client.get(path)
    print('\nRequest:', path)
    print('User:', getattr(user, 'email', None))
    print('Status:', r.status_code)
    try:
        d = r.json()
        if isinstance(d, dict):
            # For list endpoint DRF returns dict with results when pagination enabled
            items = d.get('results') if 'results' in d else d
            print('Response type: dict; keys:', list(d.keys()))
            print('Items count (if list):', len(items) if isinstance(items, list) else 'N/A')
        elif isinstance(d, list):
            print('Response type: list; items:', len(d))
        else:
            print('Response type:', type(d))
        print('Sample:', json.dumps(d, default=str)[:1000])
    except Exception as e:
        print('Non-JSON response, length', len(r.content))

# Run checks
if admin_user:
    do_get(admin_user, '/api/accomplishments/?organization_id=4')
    do_get(admin_user, '/api/accomplishments/pending/?organization_id=4')
    do_get(admin_user, '/api/accomplishments/summary/?organization_id=4')
else:
    print('No admin user found for org 4')

if member_user:
    do_get(member_user, '/api/accomplishments/?organization_id=4')
else:
    print('No member user found for org 4')

# Also test admin fetching another org (if exists)
other_org = Organization.objects.exclude(id=4).first()
if admin_user and other_org:
    print('\nTesting admin accessing another org (id=%s)' % other_org.id)
    do_get(admin_user, f'/api/accomplishments/?organization_id={other_org.id}')
else:
    print('\nNo other org to test or no admin user')
