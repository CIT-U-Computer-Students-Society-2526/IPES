/**
 * Question hooks — mutations for Question CRUD.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Question } from './types';

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
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
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
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
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
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
};
