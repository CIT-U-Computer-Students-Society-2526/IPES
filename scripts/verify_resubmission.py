import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'IPES.settings')
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from apps.organizations.models import Organization, OrganizationRole, Membership
from apps.portfolio.models import Accomplishment
from django.utils import timezone

User = get_user_model()
client = Client()

def verify_resubmission():
    print("Testing Accomplishment Resubmission...")
    
    # 1. Setup - Get/Create Org and Users
    org = Organization.objects.first()
    if not org:
        print("No organization found. Creating one.")
        org = Organization.objects.create(name="Test Org", slug="test-org")
    
    admin_user = User.objects.filter(is_superuser=True).first()
    if not admin_user:
        admin_user = User.objects.create_superuser('admin@test.com', 'password123')
        
    member_user = User.objects.exclude(pk=admin_user.pk).first()
    if not member_user:
        member_user = User.objects.create_user('member@test.com', 'password123')
        
    # Ensure membership
    from apps.organizations.models import OrganizationUnit, UnitType, PositionType
    
    # Need a UnitType first
    type_obj, _ = UnitType.objects.get_or_create(organization_id=org, name="Office")
    
    unit = OrganizationUnit.objects.filter(organization_id=org).first()
    if not unit:
       unit = OrganizationUnit.objects.create(organization_id=org, type_id=type_obj, name="Main Unit")
       
    pos = PositionType.objects.filter(organization_id=org).first()
    if not pos:
        pos = PositionType.objects.create(organization_id=org, name="Member", rank=10)
        
    Membership.objects.get_or_create(
        user_id=member_user,
        unit_id=unit,
        position_id=pos,
        is_active=True,
        defaults={'date_start': timezone.now().date()}
    )

    # 2. Create a Rejected Accomplishment
    acc = Accomplishment.objects.create(
        user_id=member_user,
        organization_id=org,
        title="Test Accomplishment",
        description="Resubmission test",
        type="project",
        date_completed=timezone.now(),
        status="Rejected",
        verified_by=admin_user,
        comments="Initial rejection comment"
    )
    print(f"Created rejected accomplishment ID: {acc.id}")

    # 3. Simulate Member Update (Resubmission)
    client.force_login(member_user)
    update_data = {
        "title": "Updated Title",
        "description": "Updated description for resubmission",
        "type": "project",
        "date_completed": acc.date_completed.isoformat(),
        "proof_link": "https://example.com"
    }
    
    print("Sending update request to resubmit...")
    url = f"/api/accomplishments/{acc.id}/"
    response = client.put(url, data=update_data, content_type='application/json')
    
    if response.status_code != 200:
        print(f"FAILED: Expected 200, got {response.status_code}")
        print(response.json())
        return False

    # 4. Verify Results
    acc.refresh_from_db()
    
    errors = []
    if acc.status != 'Pending':
        errors.append(f"Expected status 'Pending', got '{acc.status}'")
    if acc.verified_by is not None:
        errors.append(f"Expected verified_by to be None, got {acc.verified_by}")
    if acc.comments is not None and acc.comments != "":
        errors.append(f"Expected comments to be cleared, got '{acc.comments}'")
    if acc.title != "Updated Title":
        errors.append(f"Expected title to be 'Updated Title', got '{acc.title}'")

    if errors:
        print("VERIFICATION FAILED:")
        for err in errors:
            print(f"  - {err}")
        return False
    else:
        print("VERIFICATION SUCCESSFUL: Status reset to Pending and feedback cleared.")
        return True

if __name__ == "__main__":
    success = verify_resubmission()
    sys.exit(0 if success else 1)
