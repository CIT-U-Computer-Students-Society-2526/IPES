from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response as DRFResponse
from django.db import models
from django.utils import timezone

from django.contrib.auth import get_user_model

from apps.audit.utils import log_action, AuditActions

User = get_user_model()

from .models import EvaluationForm, Question, EvaluationAssignment, AssignmentRule, Response
from .serializers import (
    EvaluationFormSerializer,
    EvaluationFormCreateSerializer,
    QuestionSerializer,
    QuestionCreateSerializer,
    AssignmentRuleSerializer,
    EvaluationAssignmentSerializer,
    ResponseSerializer,
    EvaluationSubmitSerializer
)


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
        is_published = self.request.query_params.get('is_published')
        
        if org_id:
            queryset = queryset.filter(organization_id=org_id)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        if is_published is not None:
            queryset = queryset.filter(is_published=is_published.lower() == 'true')
        
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
    def publish(self, request, pk=None):
        """Publish a form"""
        form = self.get_object()
        
        if form.is_published:
            return DRFResponse(
                {'error': 'Form is already published'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        form.is_published = True
        form.save()
        
        # Log form publishing
        log_action(
            request.user,
            AuditActions.FORM_PUBLISHED,
            request,
            form_title=form.title,
            form_id=str(form.id)
        )
        
        return DRFResponse({
            'message': 'Form published successfully',
            'is_published': form.is_published
        })
    
    @action(detail=True, methods=['post'])
    def unpublish(self, request, pk=None):
        """Unpublish a form"""
        form = self.get_object()
        
        if not form.is_published:
            return DRFResponse(
                {'error': 'Form is not published'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        form.is_published = False
        form.save()
        
        # Log form unpublishing
        log_action(
            request.user,
            AuditActions.FORM_UNPUBLISHED,
            request,
            form_title=form.title,
            form_id=str(form.id)
        )
        
        return DRFResponse({
            'message': 'Form unpublished successfully',
            'is_published': form.is_published
        })
    
    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """Get all questions for a form"""
        form = self.get_object()
        questions = form.questions.all().order_by('order')
        serializer = QuestionSerializer(questions, many=True)
        return DRFResponse(serializer.data)
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplicate a form with its questions"""
        form = self.get_object()
        
        # Create new form
        new_form = EvaluationForm.objects.create(
            organization_id=form.organization_id,
            title=f"{form.title} (Copy)",
            description=form.description,
            type=form.type,
            start_date=form.start_date,
            end_date=form.end_date,
            created_by=request.user,
            is_active=True,
            is_published=False
        )
        
        # Duplicate questions
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
        
        # Log form duplication
        log_action(
            request.user,
            AuditActions.FORM_DUPLICATED,
            request,
            original_form_id=str(form.id),
            new_form_id=str(new_form.id)
        )
        
        return DRFResponse(serializer.data, status=status.HTTP_201_CREATED)


def _apply_rule(rule, form):
    """Apply a single AssignmentRule, creating missing EvaluationAssignments.
    Returns the count of newly created assignments."""
    from apps.organizations.models import Membership

    org = form.organization_id  # Organization instance

    def memberships_for(unit, position):
        qs = Membership.objects.filter(
            unit_id__organization_id=org,
            is_active=True,
        ).select_related('user_id')
        if unit:
            qs = qs.filter(unit_id=unit)
        if position:
            qs = qs.filter(position_id=position)
        return qs

    evaluators = memberships_for(rule.evaluator_unit, rule.evaluator_position)
    evaluatees = memberships_for(rule.evaluatee_unit, rule.evaluatee_position)

    created_count = 0
    for ev_membership in evaluators:
        for ee_membership in evaluatees:
            ev_user = ev_membership.user_id
            ee_user = ee_membership.user_id
            if rule.exclude_self and ev_user == ee_user:
                continue
            _, created = EvaluationAssignment.objects.get_or_create(
                evaluator_id=ev_user,
                evaluatee_id=ee_user,
                form_id=form,
                defaults={'status': 'Pending'}
            )
            if created:
                created_count += 1
    return created_count


class AssignmentRuleViewSet(viewsets.ModelViewSet):
    """ViewSet for AssignmentRule CRUD and assignment generation."""
    queryset = AssignmentRule.objects.all()
    serializer_class = AssignmentRuleSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'delete', 'head', 'options']  # no PUT/PATCH

    def get_queryset(self):
        user = self.request.user
        qs = AssignmentRule.objects.all().select_related(
            'evaluator_unit', 'evaluator_position',
            'evaluatee_unit', 'evaluatee_position',
            'form_id',
        )
        form_id = self.request.query_params.get('form_id')
        if form_id:
            qs = qs.filter(form_id=form_id)

        # Scope to forms the user's org owns
        from apps.organizations.models import Membership
        user_org_ids = Membership.objects.filter(
            user_id=user, is_active=True
        ).values_list('unit_id__organization_id', flat=True).distinct()
        qs = qs.filter(form_id__organization_id__in=user_org_ids)

        return qs

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Apply all rules for a form and generate EvaluationAssignment rows."""
        form_id = request.data.get('form_id')
        if not form_id:
            return DRFResponse(
                {'error': 'form_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            form = EvaluationForm.objects.get(id=form_id)
        except EvaluationForm.DoesNotExist:
            return DRFResponse({'error': 'Form not found'}, status=status.HTTP_404_NOT_FOUND)

        rules = form.assignment_rules.all()
        if not rules.exists():
            return DRFResponse(
                {'error': 'No assignment rules defined for this form.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        total_created = 0
        for rule in rules:
            total_created += _apply_rule(rule, form)

        log_action(
            request.user,
            AuditActions.ASSIGNMENTS_GENERATED,
            request,
            form_id=str(form.id),
            assignments_created=str(total_created)
        )

        return DRFResponse(
            {'message': f'{total_created} assignment(s) created.', 'created': total_created},
            status=status.HTTP_201_CREATED
        )


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
        
        # Update this question
        question.order = new_order
        question.save()
        
        # Shift other questions if needed
        if new_order > old_order:
            # Moving down - shift questions in between up
            Question.objects.filter(
                form_id=question.form_id,
                order__gt=old_order,
                order__lte=new_order
            ).exclude(pk=question.pk).update(order=models.F('order') - 1)
        elif new_order < old_order:
            # Moving up - shift questions in between down
            Question.objects.filter(
                form_id=question.form_id,
                order__gte=new_order,
                order__lt=old_order
            ).exclude(pk=question.pk).update(order=models.F('order') + 1)
        
        serializer = QuestionSerializer(question)
        return DRFResponse(serializer.data)


class EvaluationAssignmentViewSet(viewsets.ModelViewSet):
    """ViewSet for EvaluationAssignment CRUD operations"""
    queryset = EvaluationAssignment.objects.all()
    serializer_class = EvaluationAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter assignments based on user role"""
        queryset = EvaluationAssignment.objects.all()
        user = self.request.user
        
        # Regular officers can only see their own assignments
        if user.role in ['officer', 'member']:
            queryset = queryset.filter(evaluatee_id=user)
        
        form_id = self.request.query_params.get('form_id')
        evaluator_id = self.request.query_params.get('evaluator_id')
        status_param = self.request.query_params.get('status')
        
        if form_id:
            queryset = queryset.filter(form_id=form_id)
        if evaluator_id:
            queryset = queryset.filter(evaluator_id=evaluator_id)
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        return queryset.select_related(
            'evaluator_id', 'evaluatee_id', 'form_id'
        ).order_by('-id')
    
    @action(detail=False, methods=['get'])
    def my_pending(self, request):
        """Get pending evaluations for current user"""
        assignments = self.get_queryset().filter(
            evaluator_id=request.user,
            status='Pending'
        )
        serializer = EvaluationAssignmentSerializer(assignments, many=True)
        return DRFResponse(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_completed(self, request):
        """Get completed evaluations for current user"""
        assignments = self.get_queryset().filter(
            evaluator_id=request.user,
            status='Completed'
        )
        serializer = EvaluationAssignmentSerializer(assignments, many=True)
        return DRFResponse(serializer.data)
    
    @action(detail=True, methods=['get'])
    def responses(self, request, pk=None):
        """Get all responses for an assignment"""
        assignment = self.get_object()
        responses = Response.objects.filter(assignment_id=assignment)
        serializer = ResponseSerializer(responses, many=True)
        return DRFResponse(serializer.data)
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit an evaluation with responses"""
        assignment = self.get_object()
        
        if assignment.status == 'Completed':
            return DRFResponse(
                {'error': 'Evaluation has already been submitted'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate user is the evaluator
        if assignment.evaluator_id != request.user:
            return DRFResponse(
                {'error': 'You are not authorized to submit this evaluation'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        responses_data = request.data.get('responses', [])
        
        if not responses_data:
            return DRFResponse(
                {'error': 'At least one response is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate total score
        total_score = 0
        total_weight = 0
        
        created_responses = []
        for response_data in responses_data:
            question_id = response_data.get('question_id')
            score_value = response_data.get('score_value')

            # Create response
            response = Response.objects.create(
                assignment_id=assignment,
                question_id_id=question_id,
                score_value=score_value,
                text=response_data.get('text', '')
            )
            created_responses.append(response)

            # Calculate score if applicable
            try:
                question = Question.objects.get(id=question_id)
                if question.weight and score_value is not None:
                    total_score += score_value * question.weight
                    total_weight += question.weight
            except Question.DoesNotExist:
                pass
        
        # Update assignment
        assignment.status = 'Completed'
        assignment.submitted_at = timezone.now()
        
        # Calculate weighted average if applicable
        if total_weight > 0:
            assignment.total_score = total_score / total_weight
        else:
            assignment.total_score = None
        
        assignment.save()
        
        # Log evaluation submission
        log_action(
            request.user,
            AuditActions.EVALUATION_SUBMITTED,
            request,
            assignment_id=str(assignment.id),
            evaluatee_id=str(assignment.evaluatee_id.id),
            score=str(assignment.total_score)
        )
        
        serializer = EvaluationAssignmentSerializer(assignment)
        return DRFResponse({
            'message': 'Evaluation submitted successfully',
            'assignment': serializer.data,
            'responses': ResponseSerializer(created_responses, many=True).data
        })


class ResponseViewSet(viewsets.ModelViewSet):
    """ViewSet for Response CRUD operations"""
    queryset = Response.objects.all()
    serializer_class = ResponseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter responses based on assignment"""
        queryset = Response.objects.all()
        assignment_id = self.request.query_params.get('assignment_id')
        question_id = self.request.query_params.get('question_id')
        
        if assignment_id:
            queryset = queryset.filter(assignment_id=assignment_id)
        if question_id:
            queryset = queryset.filter(question_id=question_id)
        
        return queryset.select_related('assignment_id', 'question_id')
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Bulk create responses for an assignment"""
        assignment_id = request.data.get('assignment_id')
        responses_data = request.data.get('responses', [])
        
        if not assignment_id:
            return DRFResponse(
                {'error': 'assignment_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            assignment = EvaluationAssignment.objects.get(id=assignment_id)
        except EvaluationAssignment.DoesNotExist:
            return DRFResponse(
                {'error': 'Assignment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        created_responses = []
        for response_data in responses_data:
            # Check if updating an existing response rather than duplicating
            question_id = response_data.get('question_id')
            existing_response = Response.objects.filter(assignment_id=assignment, question_id_id=question_id).first()

            if existing_response:
                existing_response.score_value = response_data.get('score_value')
                existing_response.text = response_data.get('text', '')
                existing_response.save()
                created_responses.append(existing_response)
            else:
                response = Response.objects.create(
                    assignment_id=assignment,
                    question_id_id=question_id,
                    score_value=response_data.get('score_value'),
                    text=response_data.get('text', '')
                )
                created_responses.append(response)

        # Mark assignment as 'In Progress' if it was previously just 'Pending'
        if assignment.status == 'Pending':
            assignment.status = 'In Progress'
            assignment.save()

        serializer = ResponseSerializer(created_responses, many=True)
        return DRFResponse(serializer.data, status=status.HTTP_201_CREATED)
