from .serializers import (
    EvaluationFormSerializer,
    EvaluationFormCreateSerializer,
    QuestionSerializer,
    AssignmentRuleSerializer,
    EvaluationAssignmentSerializer,
    ResponseSerializer
)
from .models import EvaluationForm, Question, EvaluationAssignment, AssignmentRule, Response
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response as DRFResponse
from django.db import models
from django.utils import timezone

from django.contrib.auth import get_user_model

from apps.audit.utils import log_action, AuditActions

User = get_user_model()


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
            queryset = queryset.filter(
                results_released=results_released.lower() == 'true')

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

        # Log form activation
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

        # Log form deactivation
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

        # Log results release
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
        form.is_active = False  # Deactivate as well just in case
        form.save()

        # Log soft delete
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
            is_active=False,
            results_released=False
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

    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        """Get comprehensive analytics for a specific evaluation form"""
        form = self.get_object()
        from django.db.models import Avg, Count, Q

        # 1. Basic Stats
        assignments = EvaluationAssignment.objects.filter(form_id=form)
        total_evaluations = assignments.count()
        completed = assignments.filter(status='Completed')
        completed_count = completed.count()

        participation_rate = round(
            (completed_count / total_evaluations * 100), 1) if total_evaluations > 0 else 0
        overall_score = completed.aggregate(avg=Avg('total_score'))['avg']
        overall_score = round(overall_score, 2) if overall_score else 0.0

        # 2. Category Data (Questions - taking top 6 highest scoring questions)
        from .models import Response
        question_stats = Response.objects.filter(
            assignment_id__form_id=form,
            assignment_id__status='Completed',
            score_value__isnull=False
        ).values('question_id__text').annotate(
            avg_score=Avg('score_value')
        ).order_by('-avg_score')[:6]

        category_data = []
        for qs in question_stats:
            text = qs['question_id__text']
            # Truncate to first 15 chars if too long
            short_name = (text[:15] + '...') if len(text) > 15 else text
            category_data.append({
                'name': short_name,
                'score': round(qs['avg_score'], 1)
            })

        # 4. Top Performers and Unit Breakdown
        from apps.organizations.models import Membership

        # Get active memberships in the org
        memberships = Membership.objects.filter(
            unit_id__organization_id=form.organization_id,
            is_active=True
        ).select_related('user_id', 'unit_id')

        # Map users to their units
        user_units = {}
        for m in memberships:
            user_units[m.user_id_id] = m.unit_id.name if m.unit_id else 'Unknown'

        # Evaluatee stats
        evaluatee_stats = assignments.values('evaluatee_id', 'evaluatee_id__first_name', 'evaluatee_id__last_name').annotate(
            total=Count('id'),
            completed=Count('id', filter=Q(status='Completed')),
            avg_score=Avg('total_score', filter=Q(status='Completed'))
        ).order_by('-avg_score')

        top_performers = []
        rank = 1
        unit_stats_map = {}

        for es in evaluatee_stats:
            uid = es['evaluatee_id']
            unit_name = user_units.get(uid, 'Unknown')
            name = f"{es['evaluatee_id__first_name']} {es['evaluatee_id__last_name'][0]}." if es[
                'evaluatee_id__last_name'] else es['evaluatee_id__first_name']

            # Add to top performers if they have a score
            if es['avg_score'] is not None and rank <= 5:
                top_performers.append({
                    'rank': rank,
                    'name': name,
                    'unit': unit_name,
                    'score': round(es['avg_score'], 1),
                    'trend': 'same'  # Without historical, just hardcode format for now
                })
                rank += 1

            # Add to unit stats map
            if unit_name not in unit_stats_map:
                unit_stats_map[unit_name] = {
                    'members': set(),
                    'total_assignments': 0,
                    'completed_assignments': 0,
                    'sum_score': 0,
                    'scored_count': 0
                }

            usm = unit_stats_map[unit_name]
            usm['members'].add(uid)
            usm['total_assignments'] += es['total']
            usm['completed_assignments'] += es['completed']
            if es['avg_score'] is not None:
                usm['sum_score'] += es['avg_score']
                usm['scored_count'] += 1

        unit_breakdown = []
        unit_data = []  # For pie chart
        colors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899',
                  '#8b5cf6', '#ef4444', '#14b8a6', '#f97316', '#6366f1']

        c_idx = 0
        for unit_name, metrics in unit_stats_map.items():
            avg = (metrics['sum_score'] / metrics['scored_count']
                   ) if metrics['scored_count'] > 0 else 0
            comp = (metrics['completed_assignments'] / metrics['total_assignments']
                    * 100) if metrics['total_assignments'] > 0 else 0

            unit_breakdown.append({
                'unit': unit_name,
                'members': len(metrics['members']),
                'avgScore': round(avg, 1),
                'completion': round(comp, 0)
            })

            if avg > 0:
                unit_data.append({
                    'name': unit_name,
                    'value': round(avg, 1),
                    'color': colors[c_idx % len(colors)]
                })
                c_idx += 1

        unit_breakdown.sort(key=lambda x: x['avgScore'], reverse=True)

        # 5. Raw Data (for export)
        from .models import Response
        raw_responses = Response.objects.filter(
            assignment_id__form_id=form,
            assignment_id__status='Completed'
        ).select_related(
            'assignment_id',
            'assignment_id__evaluator_id',
            'assignment_id__evaluatee_id',
            'question_id'
        )

        raw_data = []
        for r in raw_responses:
            evaluator = r.assignment_id.evaluator_id
            evaluatee = r.assignment_id.evaluatee_id
            raw_data.append({
                'evaluator_name': f"{evaluator.first_name} {evaluator.last_name}".strip() if evaluator else 'Unknown',
                'evaluatee_name': f"{evaluatee.first_name} {evaluatee.last_name}".strip() if evaluatee else 'Unknown',
                'question_text': r.question_id.text,
                'score': r.score_value,
                'text_response': r.text,
                'submitted_at': r.assignment_id.submitted_at.isoformat() if r.assignment_id.submitted_at else None
            })

        return DRFResponse({
            'form_details': {
                'title': form.title,
                'description': form.description,
                'created_at': form.created_at.isoformat() if form.created_at else None,
                'end_date': form.end_date.isoformat() if form.end_date else None,
                'is_active': form.is_active,
                'results_released': form.results_released
            },
            'overall_score': overall_score,
            'total_evaluations': total_evaluations,
            'participation_rate': participation_rate,
            'category_data': category_data,
            'top_performers': top_performers[:5],  # Keep only top 5
            'unit_breakdown': unit_breakdown,
            'unit_data': unit_data,
            'raw_data': raw_data
        })


def _apply_rule(rule, form):
    """Apply a single AssignmentRule, creating missing EvaluationAssignments.
    Returns the count of newly created assignments."""
    from apps.organizations.models import Membership

    org = form.organization_id  # Organization instance

    def memberships_for(unit, position):
        qs = Membership.objects.filter(
            unit_id__organization_id=org,
            is_active=True,
        ).exclude(
            unit_id__type_id__name="System"
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
    http_method_names = ['get', 'post', 'delete',
                         'head', 'options']  # no PUT/PATCH

    def get_queryset(self):
        user = self.request.user
        qs = AssignmentRule.objects.all().select_related(
            'evaluator_unit', 'evaluator_position',
            'evaluatee_unit', 'evaluatee_position',
            'form_id',
        )

        # Filter by form_id if provided
        form_id = self.request.query_params.get('form_id')
        if form_id:
            qs = qs.filter(form_id=form_id)

        # Superusers see everything
        if user.is_superuser:
            return qs

        # Regular users only see rules for organizations where they have an active role or membership
        from apps.organizations.models import Membership, OrganizationRole

        # Orgs from direct unit memberships
        membership_org_ids = Membership.objects.filter(
            user_id=user, is_active=True
        ).values_list('unit_id__organization_id', flat=True)

        # Orgs from organization roles (e.g. Admins who aren't in a specific unit)
        role_org_ids = OrganizationRole.objects.filter(
            user=user, is_active=True
        ).values_list('organization_id', flat=True)

        user_org_ids = set(membership_org_ids) | set(role_org_ids)

        return qs.filter(form_id__organization_id__in=user_org_ids)

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

        if not form.is_active:
            return DRFResponse(
                {'error': 'Assignments can only be generated for active forms.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not form.questions.exists():
            return DRFResponse(
                {'error': 'Form must have at least one question before assignments can be generated.'},
                status=status.HTTP_400_BAD_REQUEST
            )

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
            {'message': f'{total_created} assignment(s) created.',
             'created': total_created},
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
            queryset = queryset.filter(
                Q(evaluatee_id=user) | Q(evaluator_id=user))
            # Also ensure members are restricted to the org if specified
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

        # Get all completed assignments for the user as evaluatee
        all_evaluatee_assignments = EvaluationAssignment.objects.filter(
            evaluatee_id=user,
            status='Completed'
        ).select_related('form_id')

        if org_id:
            all_evaluatee_assignments = all_evaluatee_assignments.filter(
                form_id__organization_id=org_id)

        # Find forms that have released results and the user has evaluations for
        released_form_ids = EvaluationForm.objects.filter(
            id__in=all_evaluatee_assignments.values_list('form_id', flat=True),
            results_released=True
        ).order_by('-end_date', '-id').values_list('id', flat=True)

        if not released_form_ids:
            return DRFResponse({
                'overallScore': 0,
                'categoryScores': [],
                'feedbackComments': [],
                'evaluationHistory': [],
                'available_forms': [],
                'evaluatorCount': 0,
                'selectedFormId': None
            })

        # Available forms for the selector
        available_forms = EvaluationForm.objects.filter(
            id__in=released_form_ids).values('id', 'title').order_by('-end_date', '-id')

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

        # Filter assignments for the selected form
        assignments = all_evaluatee_assignments.filter(
            form_id_id=selected_form_id)

        overall_score = assignments.aggregate(
            avg=models.Avg('total_score'))['avg'] or 0
        overall_score = round(overall_score, 1)
        evaluator_count = assignments.count()

        # evaluationHistory: still useful to show historical averages for comparison maybe?
        # Let's keep it but calculate it from ALL released assignments
        history_map = {}
        for assignment in all_evaluatee_assignments:
            if assignment.form_id.results_released:
                title = assignment.form_id.title
                if title not in history_map:
                    history_map[title] = {'score_sum': 0,
                                          'count': 0, 'evaluators': set()}
                if assignment.total_score is not None:
                    history_map[title]['score_sum'] += assignment.total_score
                    history_map[title]['count'] += 1
                    history_map[title]['evaluators'].add(
                        assignment.evaluator_id_id)

        evaluation_history = []
        for period, data in history_map.items():
            if data['count'] > 0:
                evaluation_history.append({
                    'period': period,
                    'score': round(data['score_sum'] / data['count'], 1),
                    'evaluators': len(data['evaluators'])
                })

        # Category Scores and Feedback Comments for SELECTED FORM ONLY
        responses = Response.objects.filter(
            assignment_id__in=assignments).select_related('question_id')

        category_map = {}
        feedback_comments = []
        comment_id = 1

        for response in responses:
            question = response.question_id
            # Use question text as category since category field is missing in model
            category = (
                question.text[:30] + '...') if len(question.text) > 30 else question.text

            if category not in category_map:
                category_map[category] = {
                    'score_sum': 0, 'weight_sum': 0, 'max_score': 5}

            if response.score_value is not None and question.weight:
                category_map[category]['score_sum'] += response.score_value * \
                    question.weight
                category_map[category]['weight_sum'] += question.weight

            if response.text and response.text.strip():
                feedback_type = 'positive' if (
                    response.score_value and response.score_value >= 4) else 'constructive'
                if not response.score_value:
                    feedback_type = 'info'

                feedback_comments.append({
                    'id': comment_id,
                    'text': response.text.strip(),
                    'type': feedback_type
                })
                comment_id += 1

        category_scores = []
        for name, data in category_map.items():
            if data['weight_sum'] > 0:
                category_scores.append({
                    'name': name,
                    'score': round(data['score_sum'] / data['weight_sum'], 1),
                    'maxScore': 5
                })

        return DRFResponse({
            'overallScore': overall_score,
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
            existing_response = Response.objects.filter(
                assignment_id=assignment, question_id_id=question_id).first()

            if existing_response:
                existing_response.score_value = response_data.get(
                    'score_value')
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
