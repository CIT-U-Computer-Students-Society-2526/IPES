from django.db import models
from django.conf import settings

from apps.organizations.models import Organization


class EvaluationForm(models.Model):
    organization_id = models.ForeignKey(Organization, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    start_date = models.DateField()
    end_date = models.DateField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    is_active = models.BooleanField(default=True)
    results_released = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Question(models.Model):
    form_id = models.ForeignKey(
        EvaluationForm, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField(max_length=500)
    input_type = models.CharField(max_length=50)
    order = models.IntegerField()
    weight = models.FloatField(null=True, blank=True)
    is_required = models.BooleanField(default=True)
    min_value = models.IntegerField(null=True, blank=True)
    max_value = models.IntegerField(null=True, blank=True)


class EvaluationAssignment(models.Model):
    evaluator_id = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assignments_as_evaluator'
    )
    evaluatee_id = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assignments_as_evaluatee'
    )
    form_id = models.ForeignKey(EvaluationForm, on_delete=models.CASCADE)
    status = models.CharField(max_length=50, default='Pending')
    submitted_at = models.DateTimeField(null=True, blank=True)
    total_score = models.FloatField(null=True, blank=True)

    class Meta:
        unique_together = [('evaluator_id', 'evaluatee_id', 'form_id')]


class AssignmentRule(models.Model):
    """Defines which groups should evaluate which groups for a given form."""
    form_id = models.ForeignKey(
        EvaluationForm, on_delete=models.CASCADE, related_name='assignment_rules')
    evaluator_unit = models.ForeignKey(
        'organizations.OrganizationUnit',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )
    evaluator_position = models.ForeignKey(
        'organizations.PositionType',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )
    evaluatee_unit = models.ForeignKey(
        'organizations.OrganizationUnit',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )
    evaluatee_position = models.ForeignKey(
        'organizations.PositionType',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )
    exclude_self = models.BooleanField(default=True)

    def __str__(self):
        ev_unit = (self.evaluator_unit.name if self.evaluator_unit
                   else 'Any Unit')
        ev_pos = (self.evaluator_position.name if self.evaluator_position
                  else 'Any Position')
        ee_unit = self.evaluatee_unit.name if self.evaluatee_unit else 'Any Unit'
        ee_pos = self.evaluatee_position.name if self.evaluatee_position else 'Any Position'
        return f'[{ev_unit} / {ev_pos}] → [{ee_unit} / {ee_pos}]'


class Response(models.Model):
    assignment_id = models.ForeignKey(
        EvaluationAssignment, on_delete=models.CASCADE, related_name='responses')
    question_id = models.ForeignKey(Question, on_delete=models.CASCADE)
    score_value = models.FloatField(null=True, blank=True)
    text = models.TextField(null=True, blank=True)
