/**
 * Organization domain types.
 */

export interface UnitCompletionStats {
  unit_id: number;
  unit_name: string;
  unit_type: string | null;
  total_members: number;
  total_assignments: number;
  completed_assignments: number;
  completion_percentage: number;
}

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

export interface Organization {
  id: number;
  name: string;
  code: string;
  description: string;
  email: string | null;
  is_active: boolean;
  period_year_start: string;
  period_year_end: string | null;
}

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

export interface OrganizationUnit {
  id: number;
  name: string;
  description: string;
  type_id?: number;
  organization_id: number;
  members_count?: number;
}

export interface UnitType {
  id: number;
  name: string;
  organization_id: number;
}

export interface PositionType {
  id: number;
  name: string;
  rank: number;
  organization_id: number;
}
