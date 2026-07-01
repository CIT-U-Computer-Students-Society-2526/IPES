from django.test import TestCase
from django.utils import timezone
from apps.evaluations.models import EvaluationForm, Question, EvaluationAssignment, AssignmentRule, Response
from apps.organizations.models import Organization, OrganizationUnit, UnitType, PositionType
from apps.users.models import User

class EvaluationModelsTest(TestCase):
    def setUp(self):
        self.user_evaluator = User.objects.create_user(email='evaluator@cit.edu', username='eval', password='password123')
        self.user_evaluatee = User.objects.create_user(email='evaluatee@cit.edu', username='evale', password='password123')
        
        self.org = Organization.objects.create(
            name='Test Org', code='ORG1', period_year_start=timezone.now().date()
        )
        
        self.unit_type = UnitType.objects.create(organization_id=self.org, name='Department')
        self.unit = OrganizationUnit.objects.create(organization_id=self.org, type_id=self.unit_type, name='Unit 1')
        self.position = PositionType.objects.create(organization_id=self.org, name='Pos A', rank=1)

    def test_evaluation_form_creation(self):
        form = EvaluationForm.objects.create(
            organization_id=self.org,
            title='Midterm Evaluation',
            start_date=timezone.now().date(),
            end_date=timezone.now().date() + timezone.timedelta(days=7),
            created_by=self.user_evaluator
        )
        self.assertEqual(form.title, 'Midterm Evaluation')
        self.assertTrue(form.is_active)
        
        question = Question.objects.create(
            form_id=form,
            text='Rate your peer',
            input_type='rating',
            order=1,
            is_required=True
        )
        self.assertEqual(question.form_id, form)

    def test_evaluation_assignment_creation(self):
        form = EvaluationForm.objects.create(
            organization_id=self.org, title='Eval', start_date=timezone.now().date(), end_date=timezone.now().date()
        )
        
        assignment = EvaluationAssignment.objects.create(
            evaluator_id=self.user_evaluator,
            evaluatee_id=self.user_evaluatee,
            form_id=form
        )
        self.assertEqual(assignment.status, 'Pending')

    def test_assignment_rule(self):
        form = EvaluationForm.objects.create(
            organization_id=self.org, title='Eval R', start_date=timezone.now().date(), end_date=timezone.now().date()
        )
        rule = AssignmentRule.objects.create(
            form_id=form,
            evaluator_unit=self.unit,
            evaluatee_position=self.position
        )
        self.assertIn('Unit 1', str(rule))
