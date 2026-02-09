/**
 * User API Hooks
 * 
 * Hooks for user management operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// User type definition
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'Admin' | 'Officer' | 'Evaluator';
  organization_id?: number;
  organization_name?: string;
  is_active: boolean;
  date_joined: string;
  last_login?: string;
}

export interface UserCreate {
  email: string;
  first_name: string;
  last_name: string;
  role: 'Admin' | 'Officer' | 'Evaluator';
  organization_id?: number;
  password: string;
}

export interface UserUpdate {
  first_name?: string;
  last_name?: string;
  role?: 'Admin' | 'Officer' | 'Evaluator';
  organization_id?: number;
  is_active?: boolean;
}

// Fetch all users
export const useUsers = (params?: { is_active?: boolean; role?: string; organization_id?: number }) => {
  const queryString = params
    ? '?' + new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {})
      ).toString()
    : '';

  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const response = await api.get(`/users/${queryString}`);
      const data = await response.json() as { results: User[]; count: number } | User[];
      // Handle both paginated and non-paginated responses
      return Array.isArray(data) ? data : data.results || [];
    },
  });
};

// Fetch single user
export const useUser = (id: number) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const response = await api.get(`/users/${id}/`);
      return response.json() as Promise<User>;
    },
    enabled: !!id,
  });
};

// Create user
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, UserCreate>({
    mutationFn: async (data: UserCreate) => {
      const response = await api.post('/users/', data);
      return response.json() as Promise<User>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Update user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, { id: number; data: UserUpdate }>({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch(`/users/${id}/`, data);
      return response.json() as Promise<User>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
    },
  });
};

// Delete/Deactivate user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id: number) => {
      await api.delete(`/users/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Get current user profile
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['users', 'current'],
    queryFn: async () => {
      const response = await api.get('/auth/me/');
      return response.json() as Promise<User>;
    },
  });
};

// Get user statistics
export const useUserStats = () => {
  return useQuery({
    queryKey: ['users', 'stats'],
    queryFn: async () => {
      const response = await api.get('/users/');
      const usersList = (await response.json()) as User[];
      const total = usersList.length;
      const active = usersList.filter(u => u.is_active).length;
      const by_role = usersList.reduce((acc: Record<string, number>, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1;
        return acc;
      }, {});

      return { total, active, by_role };
    },
  });
};
