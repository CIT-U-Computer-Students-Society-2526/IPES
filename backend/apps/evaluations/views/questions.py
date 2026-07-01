"""
Question ViewSet — CRUD, bulk create, reorder, and content-change detection.
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response as DRFResponse
from django.db import models

from ..models import EvaluationForm, Question, EvaluationAssignment, Response
from ..serializers import QuestionSerializer


class QuestionViewSet(viewsets.ModelViewSet):
    """ViewSet for Question CRUD operations"""
    queryset = Question.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        return QuestionSerializer

    def get_queryset(self):
        """Filter questions based on form"""
        queryset = Question.objects.all()
        form_id = self.request.query_params.get('form_id')

        if form_id:
            queryset = queryset.filter(form_id=form_id)

        return queryset.order_by('order')

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _reset_completed_assignments(self, form_id):
        """Reset completed assignments to In Progress when questions change"""
        EvaluationAssignment.objects.filter(
            form_id=form_id,
            status='Completed'
        ).update(status='In Progress', submitted_at=None)

    def _question_content_changed(self, old_question, new_data):
        """Check if question content (not just order) has changed"""
        if str(old_question.text) != str(new_data.get('text', old_question.text)):
            return True
        if old_question.weight != new_data.get('weight', old_question.weight):
            return True
        if old_question.min_value != new_data.get('min_value', old_question.min_value):
            return True
        if old_question.max_value != new_data.get('max_value', old_question.max_value):
            return True
        if old_question.input_type != new_data.get('input_type', old_question.input_type):
            return True
        if old_question.is_required != new_data.get('is_required', old_question.is_required):
            return True
        return False

    # ------------------------------------------------------------------
    # Overrides
    # ------------------------------------------------------------------

    def update(self, request, *args, **kwargs):
        """Override update to only reset assignments if content changed"""
        instance = self.get_object()

        content_changed = self._question_content_changed(instance, request.data)

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        question = serializer.save()

        if content_changed:
            self._reset_completed_assignments(question.form_id_id)

        return DRFResponse(serializer.data)

    def perform_destroy(self, instance):
        """Reset completed assignments and delete related responses when a question is deleted"""
        form_id = instance.form_id_id
        Response.objects.filter(question_id=instance).delete()
        instance.delete()
        self._reset_completed_assignments(form_id)

    # ------------------------------------------------------------------
    # Actions
    # ------------------------------------------------------------------

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Bulk create questions for a form"""
        form_id = request.data.get('form_id')
        questions_data = request.data.get('questions', [])

        if not form_id:
            return DRFResponse(
                {'error': 'form_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            form = EvaluationForm.objects.get(id=form_id)
        except EvaluationForm.DoesNotExist:
            return DRFResponse(
                {'error': 'Form not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        created_questions = []
        for question_data in questions_data:
            question = Question.objects.create(form_id=form, **question_data)
            created_questions.append(question)

        if created_questions:
            self._reset_completed_assignments(form_id)

        serializer = QuestionSerializer(created_questions, many=True)
        return DRFResponse(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def reorder(self, request, pk=None):
        """Update question order"""
        question = self.get_object()
        new_order = request.data.get('order')

        if new_order is None:
            return DRFResponse(
                {'error': 'order is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        old_order = question.order

        question.order = new_order
        question.save()

        if new_order > old_order:
            Question.objects.filter(
                form_id=question.form_id,
                order__gt=old_order,
                order__lte=new_order
            ).exclude(pk=question.pk).update(order=models.F('order') - 1)
        elif new_order < old_order:
            Question.objects.filter(
                form_id=question.form_id,
                order__gte=new_order,
                order__lt=old_order
            ).exclude(pk=question.pk).update(order=models.F('order') + 1)

        serializer = QuestionSerializer(question)
        return DRFResponse(serializer.data)
