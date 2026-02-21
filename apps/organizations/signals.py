from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Membership


@receiver(post_save, sender=Membership)
def auto_assign_on_membership_activation(sender, instance, created, **kwargs):
    """
    When a Membership is created or re-activated, check all active EvaluationForms
    in that org and apply any matching AssignmentRules for this member.
    """
    if not instance.is_active:
        return

    # Lazy import to avoid circular dependency
    from apps.evaluations.models import EvaluationForm

    org = instance.unit_id.organization_id
    forms = EvaluationForm.objects.filter(
        organization_id=org,
        is_active=True
    ).prefetch_related('assignment_rules')

    for form in forms:
        rules = form.assignment_rules.all()
        for rule in rules:
            # Check if this member's unit/position matches the evaluator side
            ev_unit_match = (rule.evaluator_unit is None or rule.evaluator_unit == instance.unit_id)
            ev_pos_match  = (rule.evaluator_position is None or rule.evaluator_position == instance.position_id)

            # Check if this member's unit/position matches the evaluatee side
            ee_unit_match = (rule.evaluatee_unit is None or rule.evaluatee_unit == instance.unit_id)
            ee_pos_match  = (rule.evaluatee_position is None or rule.evaluatee_position == instance.position_id)

            if ev_unit_match and ev_pos_match:
                # This member is a new evaluator — only generate their outgoing assignments
                _apply_rule_for_single_evaluator(rule, form, instance.user_id)

            if ee_unit_match and ee_pos_match:
                # This member is a new evaluatee — only generate incoming assignments for them
                _apply_rule_for_single_evaluatee(rule, form, instance.user_id)


def _apply_rule_for_single_evaluator(rule, form, ev_user):
    """Create assignments where ev_user is evaluator, for all matching evaluatees."""
    from apps.evaluations.models import EvaluationAssignment

    evaluatees = _get_memberships_for_side(rule.evaluatee_unit, rule.evaluatee_position, form)
    for ee_membership in evaluatees:
        ee_user = ee_membership.user_id
        if rule.exclude_self and ev_user == ee_user:
            continue
        EvaluationAssignment.objects.get_or_create(
            evaluator_id=ev_user,
            evaluatee_id=ee_user,
            form_id=form,
            defaults={'status': 'Pending'}
        )


def _apply_rule_for_single_evaluatee(rule, form, ee_user):
    """Create assignments where ee_user is evaluatee, for all matching evaluators."""
    from apps.evaluations.models import EvaluationAssignment

    evaluators = _get_memberships_for_side(rule.evaluator_unit, rule.evaluator_position, form)
    for ev_membership in evaluators:
        ev_user = ev_membership.user_id
        if rule.exclude_self and ev_user == ee_user:
            continue
        EvaluationAssignment.objects.get_or_create(
            evaluator_id=ev_user,
            evaluatee_id=ee_user,
            form_id=form,
            defaults={'status': 'Pending'}
        )


def _get_memberships_for_side(unit, position, form):
    """Return active Memberships matching the given unit/position filters within the form's org."""
    qs = Membership.objects.filter(
        unit_id__organization_id=form.organization_id,
        is_active=True,
    ).select_related('user_id')
    if unit:
        qs = qs.filter(unit_id=unit)
    if position:
        qs = qs.filter(position_id=position)
    return qs
