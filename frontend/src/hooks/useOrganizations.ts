/**
 * Organization API Hooks
 * 
 * Hooks for organization management and analytics
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useOrganizationState } from '@/contexts/OrganizationContext';

// Unit completion stats type
export interface UnitCompletionStats {
  unit_id: number;
  unit_name: string;
  unit_type: string | null;
  total_members: number;
  total_assignments: number;
  completed_assignments: number;
  completion_percentage: number;
}

// Analytics summary type
export interface AnalyticsSummary {
  total_organizations: number;
  total_units: number;
  total_members: number;
  total_users: number;
  total_assignments: number;
  completed_assignments: number;
  pending_assignments: number;
  overall_completion_rate: number;
}

// Fetch unit completion stats
export const useUnitCompletionStats = (organizationId?: number) => {
  const { activeOrganizationId } = useOrganizationState();
  const effectiveOrgId = organizationId || activeOrganizationId;

  const queryString = effectiveOrgId
    ? `?organization_id=${effectiveOrgId}`
    : '';

  return useQuery({
    queryKey: ['organizations', 'unit-completion', organizationId],
    queryFn: async () => {
      const response = await api.get(`/organizations/unit_completion_stats/${queryString}`);
      const data = await response.json() as UnitCompletionStats[];
      return data;
    },
  });
};

// Fetch analytics summary
export const useAnalyticsSummary = (organizationId?: number) => {
  const { activeOrganizationId } = useOrganizationState();
  const effectiveOrgId = organizationId || activeOrganizationId;

  const queryString = effectiveOrgId
    ? `?organization_id=${effectiveOrgId}`
    : '';

  return useQuery({
    queryKey: ['organizations', 'analytics', organizationId],
    queryFn: async () => {
      const response = await api.get(`/organizations/analytics_summary/${queryString}`);
      return response.json() as Promise<AnalyticsSummary>;
    },
  });
};

// Create new organization
export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { name: string; code: string; description: string; period_year_start: string; period_year_end?: string }>({
    mutationFn: async (data) => {
      const response = await api.post('/organizations/', data);
      return response.json();
    },
    onSuccess: () => {
      // Refresh user's memberships since creating an org gives them a new membership
      queryClient.invalidateQueries({ queryKey: ['users', 'current'] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

// Join Request Types
export interface JoinRequest {
  id: number;
  user: number;
  user_email: string;
  user_first_name: string;
  user_last_name: string;
  organization: number;
  organization_name: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
  updated_at: string;
}

// Join an organization via code
export const useJoinOrganization = () => {
  return useMutation<{ message: string }, Error, { code: string }>({
    mutationFn: async (data) => {
      const response = await api.post('/organizations/join_by_code/', data);
      return response.json() as Promise<{ message: string }>;
    }
  });
};

// Fetch Organization Units
export interface OrganizationUnit {
  id: number;
  name: string;
  description: string;
  type_id?: number;
  organization_id: number;
}

export const useOrganizationUnits = (organizationId?: number) => {
  const { activeOrganizationId } = useOrganizationState();
  const effectiveOrgId = organizationId || activeOrganizationId;

  return useQuery({
    queryKey: ['units', effectiveOrgId],
    queryFn: async () => {
      if (!effectiveOrgId) return [];
      const response = await api.get(`/units/?organization_id=${effectiveOrgId}`);
      const data = await response.json();
      return Array.isArray(data) ? data : data.results || [];
    },
    enabled: !!effectiveOrgId
  });
};

// Fetch Position Types
export interface PositionType {
  id: number;
  name: string;
  rank: number;
  organization_id: number;
}

export const usePositionTypes = (organizationId?: number) => {
  const { activeOrganizationId } = useOrganizationState();
  const effectiveOrgId = organizationId || activeOrganizationId;

  return useQuery({
    queryKey: ['positions', effectiveOrgId],
    queryFn: async () => {
      if (!effectiveOrgId) return [];
      const response = await api.get(`/positions/?organization_id=${effectiveOrgId}`);
      const data = await response.json();
      return Array.isArray(data) ? data : data.results || [];
    },
    enabled: !!effectiveOrgId
  });
};

// Fetch pending join requests for an organization
export const usePendingJoinRequests = (organizationId?: number) => {
  const { activeOrganizationId } = useOrganizationState();
  const effectiveOrgId = organizationId || activeOrganizationId;

  return useQuery({
    queryKey: ['join-requests', 'pending', effectiveOrgId],
    queryFn: async () => {
      if (!effectiveOrgId) return [];
      const response = await api.get(`/join-requests/?organization_id=${effectiveOrgId}&status=Pending`);
      const data = await response.json();
      return Array.isArray(data) ? data : data.results || [];
    },
    enabled: !!effectiveOrgId
  });
};

// Approve a join request
export const useApproveJoinRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, { id: number; unit_id: number; position_id: number; role?: string }>({
    mutationFn: async ({ id, ...data }) => {
      const response = await api.post(`/join-requests/${id}/approve/`, data);
      return response.json() as Promise<{ message: string }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['join-requests'] });
      queryClient.invalidateQueries({ queryKey: ['organizations', 'analytics'] });
    }
  });
};

// Reject a join request
export const useRejectJoinRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, { id: number }>({
    mutationFn: async ({ id }) => {
      const response = await api.post(`/join-requests/${id}/reject/`);
      return response.json() as Promise<{ message: string }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['join-requests'] });
    }
  });
};
