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
