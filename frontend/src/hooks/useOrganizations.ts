/**
 * Organization API Hooks — Barrel re-export.
 *
 * All hooks and types are split into domain-specific modules under
 * ``./organizations/``.
 */

// Types
export type {
  UnitCompletionStats,
  AnalyticsSummary,
  Organization,
  JoinRequest,
  OrganizationUnit,
  UnitType,
  PositionType,
} from './organizations/types';

// Organization CRUD, analytics, and member management
export {
  useUnitCompletionStats,
  useAnalyticsSummary,
  useOrganization,
  useCreateOrganization,
  useUpdateOrganization,
  useDeleteOrganization,
  useJoinOrganization,
  useRemoveMember,
  useSetMemberRole,
} from './organizations/useOrgHooks';

// Unit & UnitType hooks
export {
  useOrganizationUnits,
  useCreateOrganizationUnit,
  useDeleteOrganizationUnit,
  useUpdateOrganizationUnit,
  useUnitTypes,
  useCreateUnitType,
  useDeleteUnitType,
  useUpdateUnitType,
} from './organizations/useUnitHooks';

// Position type hooks
export {
  usePositionTypes,
  useCreatePositionType,
  useDeletePositionType,
  useUpdatePositionType,
} from './organizations/usePositionHooks';

// Join request & membership hooks
export {
  usePendingJoinRequests,
  useApproveJoinRequest,
  useRejectJoinRequest,
  useUpdateMembership,
  useCreateMembership,
} from './organizations/useMembershipHooks';
