"""
Response ViewSet — CRUD and bulk-create/update for evaluation responses.
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response as DRFResponse

from ..models import EvaluationAssignment, Response
from ..serializers import ResponseSerializer


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
            question_id = response_data.get('question_id')
            existing_response = Response.objects.filter(
                assignment_id=assignment,
                question_id_id=question_id,
            ).first()

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
