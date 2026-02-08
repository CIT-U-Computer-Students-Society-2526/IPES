from rest_framework import serializers
from .models import EvaluationForm, Question, EvaluationAssignment, Response


class QuestionSerializer(serializers.ModelSerializer):
    """Serializer for Question model"""
    
    class Meta:
        model = Question
        fields = ['id', 'form_id', 'text', 'input_type', 'order', 'weight']
        read_only_fields = ['id']


class QuestionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating questions with validation"""
    
    class Meta:
        model = Question
        fields = ['id', 'text', 'input_type', 'order', 'weight']
        read_only_fields = ['id']
    
    def validate_input_type(self, value):
        """Validate input type is allowed"""
        allowed_types = ['rating', 'text', 'dropdown', 'checkbox', 'textarea', 'number']
        if value not in allowed_types:
            raise serializers.ValidationError(
                f"Input type must be one of: {', '.join(allowed_types)}"
            )
        return value


class EvaluationFormSerializer(serializers.ModelSerializer):
    """Serializer for EvaluationForm model"""
    questions = QuestionSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.email', read_only=True)
    
    class Meta:
        model = EvaluationForm
        fields = [
            'id', 'organization_id', 'title', 'description', 'type',
            'start_date', 'end_date', 'created_by', 'created_by_name',
            'is_active', 'is_published', 'questions'
        ]
        read_only_fields = ['id', 'created_by']


class EvaluationFormCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating evaluation forms with nested questions"""
    questions = QuestionCreateSerializer(many=True, required=False)
    
    class Meta:
        model = EvaluationForm
        fields = [
            'id', 'organization_id', 'title', 'description', 'type',
            'start_date', 'end_date', 'is_active', 'is_published', 'questions'
        ]
        read_only_fields = ['id']
    
    def validate(self, attrs):
        """Validate form dates"""
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError({
                'end_date': 'End date must be after start date'
            })
        
        return attrs
    
    def create(self, validated_data):
        """Create form with nested questions"""
        questions_data = validated_data.pop('questions', [])
        form = EvaluationForm.objects.create(**validated_data)
        
        for question_data in questions_data:
            Question.objects.create(form_id=form, **question_data)
        
        return form


class EvaluationAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for EvaluationAssignment model"""
    evaluator_email = serializers.CharField(source='evaluator_id.email', read_only=True)
    evaluatee_email = serializers.CharField(source='evaluatee_id.email', read_only=True)
    form_title = serializers.CharField(source='form_id.title', read_only=True)
    
    class Meta:
        model = EvaluationAssignment
        fields = [
            'id', 'evaluator_id', 'evaluator_email', 'evaluatee_id', 
            'evaluatee_email', 'form_id', 'form_title', 'status',
            'submitted_at', 'total_score'
        ]
        read_only_fields = ['id', 'status', 'submitted_at', 'total_score']


class ResponseSerializer(serializers.ModelSerializer):
    """Serializer for Response model"""
    question_text = serializers.CharField(source='question_id.text', read_only=True)
    
    class Meta:
        model = Response
        fields = ['id', 'assignment_id', 'question_id', 'question_text', 'score_value', 'text']
        read_only_fields = ['id']


class ResponseCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating responses"""
    
    class Meta:
        model = Response
        fields = ['id', 'question_id', 'score_value', 'text']
        read_only_fields = ['id']
    
    def validate(self, attrs):
        """Validate response based on question type"""
        question = attrs.get('question_id')
        score_value = attrs.get('score_value')
        text = attrs.get('text')
        
        if question.input_type in ['rating', 'number', 'dropdown']:
            if score_value is None:
                raise serializers.ValidationError({
                    'score_value': f"This question requires a score value for {question.input_type} type"
                })
            if score_value < 0 or score_value > 10:
                raise serializers.ValidationError({
                    'score_value': 'Score must be between 0 and 10'
                })
        
        if question.input_type in ['text', 'textarea']:
            if not text or not text.strip():
                raise serializers.ValidationError({
                    'text': 'This question requires a text response'
                })
        
        return attrs


class EvaluationSubmitSerializer(serializers.Serializer):
    """Serializer for submitting evaluations with multiple responses"""
    assignment_id = serializers.IntegerField()
    responses = ResponseCreateSerializer(many=True)
    
    def validate_assignment_id(self, value):
        """Validate assignment exists and is pending"""
        try:
            assignment = EvaluationAssignment.objects.get(id=value)
            if assignment.status == 'Completed':
                raise serializers.ValidationError('This evaluation has already been submitted')
        except EvaluationAssignment.DoesNotExist:
            raise serializers.ValidationError('Assignment not found')
        return value
    
    def validate_responses(self, responses):
        """Validate all responses are for questions in the assignment's form"""
        # This validation will be done in the view for access to the assignment
        return responses
