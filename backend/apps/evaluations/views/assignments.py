"""
EvaluationAssignment ViewSet — CRUD, pending/completed lists, performance data, submit.
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response as DRFResponse
from django.db import models
from django.utils import timezone

from apps.audit.utils import log_action, AuditActions

from ..models import EvaluationForm, Question, EvaluationAssignment, Response
from ..serializers import (
    EvaluationAssignmentSerializer,
    ResponseSerializer,
)


class EvaluationAssignmentViewSet(viewsets.ModelViewSet):
    """ViewSet for EvaluationAssignment CRUD operations"""
    queryset = EvaluationAssignment.objects.all()
    serializer_class = EvaluationAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter assignments based on user role"""
        queryset = EvaluationAssignment.objects.all()
        user = self.request.user

        # Exclude assignments for deleted forms
        queryset = queryset.filter(form_id__is_deleted=False)

        org_id = self.request.query_params.get('organization_id')
        form_id = self.request.query_params.get('form_id')
        evaluator_id = self.request.query_params.get('evaluator_id')
        status_param = self.request.query_params.get('status')

        is_admin = user.is_superuser
        if not is_admin and org_id:
            from apps.organizations.models import OrganizationRole
            is_admin = OrganizationRole.objects.filter(
                user=user,
                organization_id=org_id,
                role='Admin',
                is_active=True
            ).exists()

        if org_id:
            queryset = queryset.filter(form_id__organization_id=org_id)

        # Regular members can only see their own assignments
        if not is_admin:
            from django.db.models import Q
            queryset = queryset.filter(Q(evaluatee_id=user) | Q(evaluator_id=user))
            if org_id:
                queryset = queryset.filter(form_id__organization_id=org_id)

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
        """Get pending and in-progress evaluations for current user"""
        assignments = self.get_queryset().filter(
            evaluator_id=request.user,
            status__in=['Pending', 'In Progress']
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

    @action(detail=False, methods=['get'])
    def my_performance(self, request):
        """Get aggregate performance data from received evaluations for a specific form or latest released form"""
        user = request.user
        form_id = request.query_params.get('form_id')
        org_id = request.query_params.get('organization_id')

        all_evaluatee_assignments = EvaluationAssignment.objects.filter(
            evaluatee_id=user,
            status='Completed'
        ).select_related('form_id')

        if org_id:
            all_evaluatee_assignments = all_evaluatee_assignments.filter(form_id__organization_id=org_id)

        released_form_ids = EvaluationForm.objects.filter(
            id__in=all_evaluatee_assignments.values_list('form_id', flat=True),
            results_released=True
        ).order_by('-end_date', '-id').values_list('id', flat=True)

        if not released_form_ids:
            return DRFResponse({
                'overallScore': 0,
                'overallMaxScore': 5,
                'categoryScores': [],
                'feedbackComments': [],
                'evaluationHistory': [],
                'available_forms': [],
                'evaluatorCount': 0,
                'selectedFormId': None
            })

        available_forms = (
            EvaluationForm.objects
            .filter(id__in=released_form_ids)
            .values('id', 'title')
            .order_by('-end_date', '-id')
        )

        # Determine selected form
        selected_form_id = None
        if form_id:
            try:
                selected_form_id = int(form_id)
                if selected_form_id not in released_form_ids:
                    selected_form_id = released_form_ids[0]
            except (ValueError, TypeError):
                selected_form_id = released_form_ids[0]
        else:
            selected_form_id = released_form_ids[0]

        assignments = all_evaluatee_assignments.filter(form_id_id=selected_form_id)

        overall_score = assignments.aggregate(avg=models.Avg('total_score'))['avg'] or 0
        overall_score = round(overall_score, 1)
        evaluator_count = assignments.count()

        # Overall max score
        form_questions = Question.objects.filter(form_id_id=selected_form_id)
        if form_questions.exists():
            total_weighted_max = 0
            total_weight = 0
            for q in form_questions:
                q_max = q.max_value if q.max_value is not None else (100 if q.input_type == 'number' else 5)
                if q.weight:
                    total_weighted_max += q_max * q.weight
                    total_weight += q.weight
            overall_max_score = round(total_weighted_max / total_weight, 1) if total_weight > 0 else 5
        else:
            overall_max_score = 5

        # Evaluation history
        history_map = {}
        for assignment in all_evaluatee_assignments:
            if assignment.form_id.results_released:
                title = assignment.form_id.title
                if title not in history_map:
                    history_map[title] = {'score_sum': 0, 'count': 0, 'evaluators': set()}
                if assignment.total_score is not None:
                    history_map[title]['score_sum'] += assignment.total_score
                    history_map[title]['count'] += 1
                    history_map[title]['evaluators'].add(assignment.evaluator_id_id)

        evaluation_history = []
        for period, data in history_map.items():
            if data['count'] > 0:
                evaluation_history.append({
                    'period': period,
                    'score': round(data['score_sum'] / data['count'], 1),
                    'evaluators': len(data['evaluators'])
                })

        # Category scores and feedback
        responses = Response.objects.filter(
            assignment_id__in=assignments
        ).select_related('question_id')

        category_map = {}
        feedback_comments = []
        comment_id = 1

        for response in responses:
            question = response.question_id
            category = (question.text[:30] + '...') if len(question.text) > 30 else question.text

            question_max = question.max_value if question.max_value is not None else (100 if question.input_type == 'number' else 5)

            if category not in category_map:
                category_map[category] = {'score_sum': 0, 'weight_sum': 0, 'max_score_sum': 0}

            if response.score_value is not None and question.weight:
                category_map[category]['score_sum'] += response.score_value * question.weight
                category_map[category]['weight_sum'] += question.weight
                category_map[category]['max_score_sum'] += question_max * question.weight

            if response.text and response.text.strip():
                feedback_type = 'info'
                if response.score_value is not None and question_max > 0:
                    score_ratio = response.score_value / question_max
                    feedback_type = 'positive' if score_ratio >= 0.8 else 'constructive'

                feedback_comments.append({
                    'id': comment_id,
                    'text': response.text.strip(),
                    'type': feedback_type
                })
                comment_id += 1

        category_scores = []
        for name, data in category_map.items():
            if data['weight_sum'] > 0:
                avg_score = round(data['score_sum'] / data['weight_sum'], 1)
                avg_max = round(data['max_score_sum'] / data['weight_sum'], 1)
                category_scores.append({
                    'name': name,
                    'score': avg_score,
                    'maxScore': avg_max
                })

        return DRFResponse({
            'overallScore': overall_score,
            'overallMaxScore': overall_max_score,
            'categoryScores': category_scores,
            'feedbackComments': feedback_comments[:10],
            'evaluationHistory': evaluation_history,
            'available_forms': list(available_forms),
            'evaluatorCount': evaluator_count,
            'selectedFormId': selected_form_id
        })

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

        total_score = 0
        total_weight = 0

        created_responses = []
        for response_data in responses_data:
            question_id = response_data.get('question_id')
            score_value = response_data.get('score_value')

            response = Response.objects.create(
                assignment_id=assignment,
                question_id_id=question_id,
                score_value=score_value,
                text=response_data.get('text', '')
            )
            created_responses.append(response)

            try:
                question = Question.objects.get(id=question_id)
                if question.weight and score_value is not None:
                    total_score += score_value * question.weight
                    total_weight += question.weight
            except Question.DoesNotExist:
                pass

        assignment.status = 'Completed'
        assignment.submitted_at = timezone.now()

        if total_weight > 0:
            assignment.total_score = total_score / total_weight
        else:
            assignment.total_score = None

        assignment.save()

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
