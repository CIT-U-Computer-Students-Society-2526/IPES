/**
 * Assignment rule hooks — queries and mutations for AssignmentRule CRUD + generate.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AssignmentRule, AssignmentRuleCreateData } from './types';

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
    staleTime: 30_000,
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
