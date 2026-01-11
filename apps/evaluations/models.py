from django.db import models
from django.conf import settings

from apps.organizations.models import Organization

class EvaluationForm(models.Model):
    organization_id = models.ForeignKey(Organization, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    type = models.CharField(max_length=100, default='', blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    is_active = models.BooleanField(default=True)
    is_published = models.BooleanField(default=False)

class Question(models.Model):
    form_id = models.ForeignKey(EvaluationForm, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField(max_length=500)
    input_type = models.CharField(max_length=50)
    order = models.IntegerField()
    weight = models.FloatField(null=True, blank=True)

class EvaluationAssignment(models.Model):
    evaluator_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assignments_as_evaluator')
    evaluatee_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assignments_as_evaluatee')
    form_id = models.ForeignKey(EvaluationForm, on_delete=models.CASCADE)
    status = models.CharField(max_length=50, default='Pending')
    submitted_at = models.DateTimeField(null=True, blank=True)
    total_score = models.FloatField(null=True, blank=True)

class Response(models.Model):
    assignment_id = models.ForeignKey(EvaluationAssignment, on_delete=models.CASCADE, related_name='responses')
    question_id = models.ForeignKey(Question, on_delete=models.CASCADE)
    score_value = models.FloatField(null=True, blank=True)
    text = models.TextField(null=True, blank=True)