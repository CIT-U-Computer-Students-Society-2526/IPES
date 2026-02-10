/**
 * Generic API Hooks using TanStack Query
 * 
 * Provides reusable hooks for data fetching, mutations, and cache invalidation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Generic fetch hook
export const useFetch = <T>(
  key: string | string[],
  endpoint: string,
  options?: {
    enabled?: boolean;
    select?: (data: T) => unknown;
    staleTime?: number;
  }
) => {
  return useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: async () => {
      const response = await api.get(endpoint);
      return response.json() as Promise<T>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes by default
    ...options,
  });
};

// Generic fetch with params
export const useFetchWithParams = <T>(
  key: string | string[],
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>,
  options?: {
    enabled?: boolean;
    select?: (data: T) => unknown;
  }
) => {
  const queryString = params
    ? '?' + new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {})
      ).toString()
    : '';

  return useFetch<T>(key, endpoint + queryString, options);
};

// Generic create mutation
export const useCreate = <T, R>(
  endpoint: string,
  queryKey: string | string[],
  options?: {
    onSuccess?: (data: R) => void;
    onError?: (error: Error) => void;
  }
) => {
  const queryClient = useQueryClient();

  return useMutation<R, Error, T>({
    mutationFn: async (data: T) => {
      const response = await api.post(endpoint, data);
      return response.json() as Promise<R>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

// Generic update mutation
export const useUpdate = <T, R>(
  endpoint: string,
  queryKey: string | string[],
  options?: {
    onSuccess?: (data: R) => void;
    onError?: (Error) => void;
  }
) => {
  const queryClient = useQueryClient();

  return useMutation<R, Error, { id: number; data: T }>({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch(`${endpoint}${id}/`, data);
      return response.json() as Promise<R>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] });
    },
    onError: options?.onError,
  });
};

// Generic delete mutation
export const useDelete = (
  endpoint: string,
  queryKey: string | string[],
  options?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  }
) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id: number) => {
      await api.delete(`${endpoint}${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

// Custom action mutation (POST to custom endpoint)
export const useCustomAction = <R, T = undefined>(
  endpoint: string,
  options?: {
    onSuccess?: (data: R) => void;
    onError?: (error: Error) => void;
  }
) => {
  return useMutation<R, Error, T>({
    mutationFn: async (data?: T) => {
      const response = await api.post(endpoint, data);
      return response.json() as Promise<R>;
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
