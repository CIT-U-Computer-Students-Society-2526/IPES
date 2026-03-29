"""
AssignmentRule ViewSet and the ``_apply_rule`` helper.
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response as DRFResponse

from apps.audit.utils import log_action, AuditActions

from ..models import EvaluationForm, EvaluationAssignment, AssignmentRule
from ..serializers import AssignmentRuleSerializer


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
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

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

        if user.is_superuser:
            return qs

        from apps.organizations.models import OrganizationRole

        user_org_ids = OrganizationRole.objects.filter(
            user=user, is_active=True
        ).values_list('organization_id', flat=True)

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
            {'message': f'{total_created} assignment(s) created.', 'created': total_created},
            status=status.HTTP_201_CREATED
        )
