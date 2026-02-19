/**
 * Organization API Hooks
 * 
 * Hooks for organization management and analytics
 */

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

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
  const queryString = organizationId 
    ? `?organization_id=${organizationId}`
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
  const queryString = organizationId 
    ? `?organization_id=${organizationId}`
    : '';

  return useQuery({
    queryKey: ['organizations', 'analytics', organizationId],
    queryFn: async () => {
      const response = await api.get(`/organizations/analytics_summary/${queryString}`);
      return response.json() as Promise<AnalyticsSummary>;
    },
  });
};
