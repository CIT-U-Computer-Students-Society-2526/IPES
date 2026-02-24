/**
 * Evaluations API Hooks
 * 
 * Hooks for evaluation forms, questions, assignments, and responses
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useOrganizationState } from '@/contexts/OrganizationContext';

// Evaluation Form types
export interface Question {
  id: number;
  form_id: number;
  text: string;
  input_type: 'rating' | 'text' | 'dropdown' | 'checkbox' | 'number' | 'textarea';
  order: number;
  weight: number;
  is_required?: boolean;
  min_value?: number;
  max_value?: number;
  options?: string[]; // For dropdown/checkbox types
}

export interface EvaluationForm {
  id: number;
  organization_id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  created_by: number;
  is_active: boolean;
  is_deleted: boolean;
  results_released: boolean;
  questions?: Question[];
  created_at: string;
  updated_at: string;
}

// Evaluation Assignment types
export interface Response {
  id: number;
  assignment_id: number;
  question_id: number;
  score_value?: number;
  text?: string;
}

export interface EvaluationAssignment {
  id: number;
  evaluator_id: number;
  evaluator_email?: string;
  evaluator_name?: string;
  evaluatee_id: number;
  evaluatee_email?: string;
  evaluatee_name?: string;
  form_id: number;
  form_title?: string;
  status: 'Pending' | 'In Progress' | 'Submitted' | 'Reviewed' | 'Completed';
  submitted_at?: string;
  total_score?: number;
  responses?: Response[];
  due_date?: string;
}

// Submit evaluation data
export interface EvaluationSubmitData {
  responses: {
    question_id: number;
    score_value?: number;
    text?: string;
  }[];
}

// Assignment Rule types
export interface AssignmentRule {
  id: number;
  form_id: number;
  evaluator_unit: number | null;
  evaluator_unit_name: string | null;
  evaluator_position: number | null;
  evaluator_position_name: string | null;
  evaluatee_unit: number | null;
  evaluatee_unit_name: string | null;
  evaluatee_position: number | null;
  evaluatee_position_name: string | null;
  exclude_self: boolean;
}

export interface AssignmentRuleCreateData {
  form_id: number;
  evaluator_unit?: number | null;
  evaluator_position?: number | null;
  evaluatee_unit?: number | null;
  evaluatee_position?: number | null;
  exclude_self?: boolean;
}

// ===== Form Hooks =====

// Fetch all forms
export const useForms = (params?: { is_active?: boolean; is_published?: boolean; organization_id?: number }) => {
  const { activeOrganizationId } = useOrganizationState();
  const effectiveParams = { ...params, organization_id: params?.organization_id || activeOrganizationId || undefined };

  const queryString = Object.keys(effectiveParams).length > 0
    ? '?' + new URLSearchParams(
      Object.entries(effectiveParams).filter(([, v]) => v !== undefined).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {})
    ).toString()
    : '';

  return useQuery({
    queryKey: ['forms', effectiveParams],
    queryFn: async () => {
      const response = await api.get(`/forms/${queryString}`);
      const data = await response.json() as { results: EvaluationForm[] } | EvaluationForm[];
      return Array.isArray(data) ? data : data.results || [];
    },
  });
};

// Fetch single form with questions
export const useForm = (id: number) => {
  return useQuery({
    queryKey: ['forms', id],
    queryFn: async () => {
      const response = await api.get(`/forms/${id}/`);
      return response.json() as Promise<EvaluationForm>;
    },
    enabled: !!id,
  });
};

// Fetch form questions
export const useFormQuestions = (formId: number) => {
  return useQuery({
    queryKey: ['forms', formId, 'questions'],
    queryFn: async () => {
      const response = await api.get(`/forms/${formId}/questions/`);
      return response.json() as Promise<Question[]>;
    },
    enabled: !!formId,
  });
};

// Activate form
export const useActivateForm = () => {
  const queryClient = useQueryClient();

  return useMutation<EvaluationForm, Error, number>({
    mutationFn: async (id: number) => {
      const response = await api.post(`/forms/${id}/activate/`);
      return response.json() as Promise<EvaluationForm>;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      queryClient.invalidateQueries({ queryKey: ['forms', id] });
    },
  });
};

// Deactivate form
export const useDeactivateForm = () => {
  const queryClient = useQueryClient();

  return useMutation<EvaluationForm, Error, number>({
    mutationFn: async (id: number) => {
      const response = await api.post(`/forms/${id}/deactivate/`);
      return response.json() as Promise<EvaluationForm>;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      queryClient.invalidateQueries({ queryKey: ['forms', id] });
    },
  });
};

// Release results
export const useReleaseResults = () => {
  const queryClient = useQueryClient();

  return useMutation<EvaluationForm, Error, number>({
    mutationFn: async (id: number) => {
      const response = await api.post(`/forms/${id}/release_results/`);
      return response.json() as Promise<EvaluationForm>;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      queryClient.invalidateQueries({ queryKey: ['forms', id] });
    },
  });
};

// Duplicate form
export const useDuplicateForm = () => {
  const queryClient = useQueryClient();

  return useMutation<EvaluationForm, Error, number>({
    mutationFn: async (id: number) => {
      const response = await api.post(`/forms/${id}/duplicate/`);
      return response.json() as Promise<EvaluationForm>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
    },
  });
};

// Create form
export const useCreateForm = () => {
  const queryClient = useQueryClient();

  return useMutation<EvaluationForm, Error, Partial<EvaluationForm>>({
    mutationFn: async (data: Partial<EvaluationForm>) => {
      const response = await api.post('/forms/', data);
      return response.json() as Promise<EvaluationForm>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
    },
  });
};

// Update form
export const useUpdateForm = () => {
  const queryClient = useQueryClient();

  return useMutation<EvaluationForm, Error, { id: number; data: Partial<EvaluationForm> }>({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch(`/forms/${id}/`, data);
      return response.json() as Promise<EvaluationForm>;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      queryClient.invalidateQueries({ queryKey: ['forms', id] });
    },
  });
};

// Delete form
export const useDeleteForm = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id: number) => {
      await api.delete(`/forms/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
    },
  });
};

// Fetch form analytics
export const useFormAnalytics = (formId: number | undefined) => {
  return useQuery({
    queryKey: ['forms', formId, 'analytics'],
    queryFn: async () => {
      const response = await api.get(`/forms/${formId}/analytics/`);
      return response.json() as Promise<{
        form_details: {
          title: string;
          description: string;
          created_at: string | null;
          end_date: string | null;
          is_active: boolean;
          results_released: boolean;
        };
        overall_score: number;
        total_evaluations: number;
        participation_rate: number;
        category_data: { name: string; score: number }[];
        trend_data: { month: string; score: number }[];
        top_performers: { rank: number; name: string; unit: string; score: number; trend: string }[];
        unit_breakdown: { unit: string; members: number; avgScore: number; completion: number }[];
        unit_data: { name: string; value: number; color: string }[];
        raw_data: {
          evaluator_name: string;
          evaluatee_name: string;
          question_text: string;
          score: number | null;
          text_response: string | null;
          submitted_at: string | null;
        }[];
      }>;
    },
    enabled: !!formId,
  });
};


// ===== Assignment Rule Hooks =====

// Fetch rules for a form
export const useFormRules = (formId: number) => {
  return useQuery({
    queryKey: ['assignment-rules', formId],
    queryFn: async () => {
      const response = await api.get(`/assignment-rules/?form_id=${formId}`);
      const data = await response.json() as { results: AssignmentRule[] } | AssignmentRule[];
      return Array.isArray(data) ? data : data.results || [];
    },
    enabled: !!formId,
    staleTime: 30_000, // rules rarely change – avoid re-fetch on every tab switch
  });
};

// Create a rule
export const useCreateRule = () => {
  const queryClient = useQueryClient();

  return useMutation<AssignmentRule, Error, AssignmentRuleCreateData>({
    mutationFn: async (data) => {
      const response = await api.post('/assignment-rules/', data);
      return response.json() as Promise<AssignmentRule>;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['assignment-rules', vars.form_id] });
    },
  });
};

// Delete a rule
export const useDeleteRule = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: number; form_id: number }>({
    mutationFn: async ({ id }) => {
      await api.delete(`/assignment-rules/${id}/`);
    },
    onSuccess: (_, { form_id }) => {
      queryClient.invalidateQueries({ queryKey: ['assignment-rules', form_id] });
    },
  });
};

// Generate assignments from all rules on a form
export const useGenerateAssignments = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string; created: number }, Error, number>({
    mutationFn: async (form_id: number) => {
      const response = await api.post('/assignment-rules/generate/', { form_id });
      return response.json() as Promise<{ message: string; created: number }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
};


// ===== Question Hooks =====

// Bulk create questions for a form
export const useCreateQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation<Question[], Error, { form_id: number; questions: Partial<Question>[] }>({
    mutationFn: async (data: { form_id: number; questions: Partial<Question>[] }) => {
      const response = await api.post('/questions/bulk_create/', data);
      return response.json() as Promise<Question[]>;
    },
    onSuccess: (_, { form_id }) => {
      queryClient.invalidateQueries({ queryKey: ['forms', form_id, 'questions'] });
    },
  });
};

// Update single question
export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation<Question, Error, { id: number; form_id: number; data: Partial<Question> }>({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch(`/questions/${id}/`, data);
      return response.json() as Promise<Question>;
    },
    onSuccess: (_, { form_id }) => {
      queryClient.invalidateQueries({ queryKey: ['forms', form_id, 'questions'] });
    },
  });
};

// Delete single question
export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: number; form_id: number }>({
    mutationFn: async ({ id }) => {
      await api.delete(`/questions/${id}/`);
    },
    onSuccess: (_, { form_id }) => {
      queryClient.invalidateQueries({ queryKey: ['forms', form_id, 'questions'] });
    },
  });
};

// ===== Assignment Hooks =====

// Fetch all assignments
export const useAssignments = (params?: { status?: string; form_id?: number; organization_id?: number }) => {
  const { activeOrganizationId } = useOrganizationState();
  const effectiveParams = { ...params, organization_id: params?.organization_id || activeOrganizationId || undefined };

  const queryString = Object.keys(effectiveParams).length > 0
    ? '?' + new URLSearchParams(
      Object.entries(effectiveParams).filter(([, v]) => v !== undefined).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {})
    ).toString()
    : '';

  return useQuery({
    queryKey: ['assignments', effectiveParams],
    queryFn: async () => {
      const response = await api.get(`/assignments/${queryString}`);
      const data = await response.json() as { results: EvaluationAssignment[] } | EvaluationAssignment[];
      return Array.isArray(data) ? data : data.results || [];
    },
  });
};

// Fetch pending assignments for current user
export const useMyPendingEvaluations = () => {
  return useQuery({
    queryKey: ['assignments', 'my_pending'],
    queryFn: async () => {
      const response = await api.get('/assignments/my_pending/');
      const data = await response.json() as { results: EvaluationAssignment[] } | EvaluationAssignment[];
      return Array.isArray(data) ? data : data.results || [];
    },
  });
};

// Fetch my completed evaluations
export const useMyCompletedEvaluations = () => {
  return useQuery({
    queryKey: ['assignments', 'my_completed'],
    queryFn: async () => {
      const response = await api.get('/assignments/?status=Submitted');
      const data = await response.json() as { results: EvaluationAssignment[] } | EvaluationAssignment[];
      return Array.isArray(data) ? data : data.results || [];
    },
  });
};

export type MyPerformanceData = {
  overallScore: number;
  categoryScores: { name: string; score: number; maxScore: number }[];
  feedbackComments: { id: number; text: string; type: string }[];
  evaluationHistory: { period: string; score: number; evaluators: number }[];
};

// Fetch aggregated performance data
export const useMyPerformance = () => {
  return useQuery({
    queryKey: ['assignments', 'my_performance'],
    queryFn: async () => {
      const response = await api.get('/assignments/my_performance/');
      return response.json() as Promise<MyPerformanceData>;
    },
  });
};

// Fetch single assignment
export const useAssignment = (id: number) => {
  return useQuery({
    queryKey: ['assignments', id],
    queryFn: async () => {
      const response = await api.get(`/assignments/${id}/`);
      return response.json() as Promise<EvaluationAssignment>;
    },
    enabled: !!id,
  });
};

// Submit evaluation
export const useSubmitEvaluation = () => {
  const queryClient = useQueryClient();

  return useMutation<EvaluationAssignment, Error, { id: number; data: EvaluationSubmitData }>({
    mutationFn: async ({ id, data }) => {
      const response = await api.post(`/assignments/${id}/submit/`, data);
      return response.json() as Promise<EvaluationAssignment>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assignments', 'my_pending'] });
    },
  });
};

// ===== Response Hooks =====

// Fetch responses for an assignment
export const useAssignmentResponses = (assignmentId: number) => {
  return useQuery({
    queryKey: ['responses', 'by_assignment', assignmentId],
    queryFn: async () => {
      const response = await api.get(`/responses/?assignment_id=${assignmentId}`);
      const data = await response.json() as { results: Response[] } | Response[];
      return Array.isArray(data) ? data : data.results || [];
    },
    enabled: !!assignmentId,
  });
};

// Save draft responses without submitting
export const useSaveDraftResponses = () => {
  const queryClient = useQueryClient();

  return useMutation<Response[], Error, { assignment_id: number; responses: { question_id: number; score_value?: number; text?: string; }[] }>({
    mutationFn: async (data) => {
      const response = await api.post(`/responses/bulk_create/`, data);
      return response.json() as Promise<Response[]>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['responses', 'by_assignment', variables.assignment_id] });
      queryClient.invalidateQueries({ queryKey: ['assignments', variables.assignment_id] });
      queryClient.invalidateQueries({ queryKey: ['assignments', 'my_pending'] });
    },
  });
};
