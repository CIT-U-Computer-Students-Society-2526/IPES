/**
 * Response hooks — queries and mutations for evaluation responses.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Response } from './types';

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

  return useMutation<Response[], Error, { assignment_id: number; responses: { question_id: number; score_value?: number; text?: string }[] }>({
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
