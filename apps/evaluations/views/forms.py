"""
EvaluationForm ViewSet — CRUD, lifecycle actions, and analytics.
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response as DRFResponse
from django.db import models

from django.contrib.auth import get_user_model

from apps.audit.utils import log_action, AuditActions

User = get_user_model()

from ..models import EvaluationForm, Question, EvaluationAssignment, Response
from ..serializers import (
    EvaluationFormSerializer,
    EvaluationFormCreateSerializer,
    QuestionSerializer,
)

from .analytics import compute_form_analytics


class EvaluationFormViewSet(viewsets.ModelViewSet):
    """ViewSet for EvaluationForm CRUD operations"""
    queryset = EvaluationForm.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return EvaluationFormCreateSerializer
        return EvaluationFormSerializer

    def get_queryset(self):
        """Filter forms based on organization"""
        queryset = EvaluationForm.objects.all()
        org_id = self.request.query_params.get('organization_id')
        is_active = self.request.query_params.get('is_active')
        results_released = self.request.query_params.get('results_released')

        # Exclude softly deleted forms
        queryset = queryset.filter(is_deleted=False)

        if org_id:
            queryset = queryset.filter(organization_id=org_id)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        if results_released is not None:
            queryset = queryset.filter(results_released=results_released.lower() == 'true')

        return queryset.order_by('-id')

    def perform_create(self, serializer):
        """Set created_by to current user and log creation"""
        form = serializer.save(created_by=self.request.user)
        log_action(
            self.request.user,
            AuditActions.FORM_CREATED,
            self.request,
            form_title=form.title,
            form_id=str(form.id)
        )

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a form"""
        form = self.get_object()

        if form.is_active:
            return DRFResponse(
                {'error': 'Form is already active'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not form.questions.exists():
            return DRFResponse(
                {'error': 'Form must have at least one question before it can be activated.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        form.is_active = True
        form.save()

        log_action(
            request.user,
            AuditActions.FORM_PUBLISHED,
            request,
            form_title=form.title,
            form_id=str(form.id)
        )

        return DRFResponse({
            'message': 'Form activated successfully',
            'is_active': form.is_active
        })

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a form"""
        form = self.get_object()

        if not form.is_active:
            return DRFResponse(
                {'error': 'Form is already inactive'},
                status=status.HTTP_400_BAD_REQUEST
            )

        form.is_active = False
        form.save()

        log_action(
            request.user,
            AuditActions.FORM_UNPUBLISHED,
            request,
            form_title=form.title,
            form_id=str(form.id)
        )

        return DRFResponse({
            'message': 'Form deactivated successfully',
            'is_active': form.is_active
        })

    @action(detail=True, methods=['post'])
    def release_results(self, request, pk=None):
        """Release results for a form"""
        form = self.get_object()

        if form.results_released:
            return DRFResponse(
                {'error': 'Results are already released'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not form.questions.exists():
            return DRFResponse(
                {'error': 'Form must have at least one question before results can be released.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        form.results_released = True
        form.is_active = False
        form.save()

        log_action(
            request.user,
            AuditActions.FORM_PUBLISHED,
            request,
            form_title=form.title,
            form_id=str(form.id)
        )

        return DRFResponse({
            'message': 'Results released successfully',
            'results_released': form.results_released
        })

    def destroy(self, request, *args, **kwargs):
        """Soft delete a form"""
        form = self.get_object()
        form.is_deleted = True
        form.is_active = False
        form.save()

        log_action(
            request.user,
            AuditActions.FORM_DELETED,
            request,
            form_title=form.title,
            form_id=str(form.id)
        )

        return DRFResponse({'message': 'Form deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """Get all questions for a form"""
        form = self.get_object()
        questions = form.questions.all().order_by('order')
        serializer = QuestionSerializer(questions, many=True)
        return DRFResponse(serializer.data)

    @action(detail=True, methods=['get'])
    def completed_count(self, request, pk=None):
        """Get count of completed assignments for this form - used for edit warning"""
        form = self.get_object()
        count = EvaluationAssignment.objects.filter(
            form_id=form,
            status='Completed'
        ).count()
        return DRFResponse({'completed_count': count})

    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplicate a form with its questions"""
        form = self.get_object()

        new_form = EvaluationForm.objects.create(
            organization_id=form.organization_id,
            title=f"{form.title} (Copy)",
            description=form.description,
            type=form.type,
            start_date=form.start_date,
            end_date=form.end_date,
            created_by=request.user,
            is_active=False,
            results_released=False
        )

        for question in form.questions.all():
            Question.objects.create(
                form_id=new_form,
                text=question.text,
                input_type=question.input_type,
                order=question.order,
                weight=question.weight,
                is_required=question.is_required,
                min_value=question.min_value,
                max_value=question.max_value,
            )

        serializer = EvaluationFormSerializer(new_form)

        log_action(
            request.user,
            AuditActions.FORM_DUPLICATED,
            request,
            original_form_id=str(form.id),
            new_form_id=str(new_form.id)
        )

        return DRFResponse(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        """Get comprehensive analytics for a specific evaluation form"""
        form = self.get_object()
        data = compute_form_analytics(form)
        return DRFResponse(data)
