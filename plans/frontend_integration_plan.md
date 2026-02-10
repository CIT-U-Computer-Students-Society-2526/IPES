# Frontend Integration Plan: Connect Prototype to Backend APIs

## Overview
The frontend prototype from Lovable has hardcoded placeholder data. This plan outlines how to integrate the React pages with the Django REST API backend.

## Current State Analysis

### Pages with Hardcoded Data
| Page | File | Placeholder Type |
|------|------|------------------|
| Admin Dashboard | [`frontend/src/pages/admin/Dashboard.tsx`](frontend/src/pages/admin/Dashboard.tsx:1) | Stats, activity, progress |
| Officer Dashboard | [`frontend/src/pages/officer/Dashboard.tsx`](frontend/src/pages/officer/Dashboard.tsx:1) | Stats, evaluations, notifications |
| Officer Evaluations | [`frontend/src/pages/officer/Evaluations.tsx`](frontend/src/pages/officer/Evaluations.tsx:1) | Full list of evaluations |
| Admin Users | [`frontend/src/pages/admin/Users.tsx`](frontend/src/pages/admin/Users.tsx:1) | User table, stats, dialogs |

### API Layer
- [`frontend/src/lib/api.ts`](frontend/src/lib/api.ts:1) - Basic API client exists
- Need: Enhanced API hooks and data fetching

---

## Implementation Strategy

### Phase 1: API Layer Enhancement

#### 1.1 Create API Hooks (using React Query)
```typescript
// frontend/src/hooks/useUsers.ts
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users/users/'),
  });
};

// frontend/src/hooks/useEvaluations.ts
export const usePendingEvaluations = () => {
  return useQuery({
    queryKey: ['evaluations', 'pending'],
    queryFn: () => api.get('/evaluations/assignments/my_pending/'),
  });
};
```

#### 1.2 API Service Files
```
frontend/src/services/
├── api.ts           # Existing base API
├── users.ts         # User-related API calls
├── evaluations.ts  # Evaluation-related API calls
├── portfolio.ts     # Accomplishment API calls
└── audit.ts         # Audit log API calls
```

---

## Page-by-Page Integration Plan

### 1. Admin Dashboard ([`Dashboard.tsx`](frontend/src/pages/admin/Dashboard.tsx:1))

**Hardcoded Data to Replace:**
```typescript
// Lines 15-44: Stats cards
const stats = [
  { label: "Total Officers", value: "156", ... },
  { label: "Active Evaluations", value: "24", ... },
  ...
];

// Lines 46-52: Recent activity
const recentActivity = [
  { id: 1, action: "New evaluation assigned", target: "Research Committee", time: "2 min ago" },
  ...
];
```

**API Endpoints Needed:**
- `/api/users/users/?is_active=true` → Count total officers
- `/api/evaluations/forms/?is_active=true&is_published=true` → Active evaluations
- `/api/evaluations/assignments/?status=Pending` → Pending count
- `/api/portfolio/accomplishments/?status=Pending` → Accomplishments pending
- `/api/audit/audit/recent/` → Recent activity

**Changes:**
1. Create `useAdminStats()` hook
2. Replace hardcoded `stats` with `useQuery` data
3. Replace `recentActivity` with audit logs
4. Add loading states

---

### 2. Officer Dashboard ([`Dashboard.tsx`](frontend/src/pages/officer/Dashboard.tsx:1))

**Hardcoded Data to Replace:**
```typescript
// Lines 14-36: Pending evaluations
const pendingEvaluations = [
  { id: 1, title: "Peer Evaluation...", dueDate: "Jan 10, 2026", ... },
  ...
];

// Lines 38-42: Notifications
const notifications = [...];
```

**API Endpoints Needed:**
- `/api/evaluations/assignments/my_pending/` → Pending evaluations
- `/api/evaluations/assignments/my_completed/` → Completed count
- `/api/portfolio/accomplishments/my/` → User accomplishments

**Changes:**
1. Create `useOfficerStats()` hook
2. Replace `pendingEvaluations` with API data
3. Replace notifications with accomplishments data
4. Calculate average rating from completed evaluations

---

### 3. Officer Evaluations ([`Evaluations.tsx`](frontend/src/pages/officer/Evaluations.tsx:1))

**Hardcoded Data to Replace:**
```typescript
// Lines 8-69: Full evaluations list
const evaluations = [
  { id: 1, title: "Peer Evaluation...", status: "pending", ... },
  ...
];
```

**API Endpoints Needed:**
- `/api/evaluations/assignments/` → All assignments (filtered by evaluator)
- `/api/evaluations/forms/{id}/questions/` → Form questions

**Changes:**
1. Replace `evaluations` constant with `useQuery`
2. Filter by status (pending/completed) on API or client
3. Update `filterEvaluations` function to work with API data
4. Add refresh on submission

---

### 4. Admin Users ([`Users.tsx`](frontend/src/pages/admin/Users.tsx:1))

**Hardcoded Data to Replace:**
```typescript
// Lines 53-114: Users array
const users = [
  { id: 1, name: "Maria Santos", role: "Admin", ... },
  ...
];
```

**API Endpoints Needed:**
- `/api/users/users/` → List users
- `/api/users/users/` (POST) → Create user
- `/api/users/users/{id}/` (PUT) → Update user
- `/api/users/users/{id}/` (DELETE) → Deactivate user

**Changes:**
1. Replace `users` constant with `useQuery`
2. Connect Add User dialog to POST endpoint
3. Connect Edit/Deactivate/Delete actions to API
4. Add loading and error states

---

## API Hooks to Create

### `frontend/src/hooks/useApi.ts`
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Generic hooks
export const useFetch = (key: string, endpoint: string) => {
  return useQuery({
    queryKey: [key],
    queryFn: () => api.get(endpoint).then(r => r.json()),
  });
};

export const useCreate = (endpoint: string, queryKey: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => api.post(endpoint, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });
};
```

### Specific Hooks
```typescript
// Users
export const useUsers = () => useFetch('users', '/users/users/');
export const useCreateUser = () => useCreate('/users/users/', 'users');

// Evaluations
export const usePendingEvaluations = () => 
  useQuery({
    queryKey: ['evaluations', 'pending'],
    queryFn: () => api.get('/evaluations/assignments/my_pending/').then(r => r.json()),
  });

export const useSubmitEvaluation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) =>
      api.post(`/evaluations/assignments/${id}/submit/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
    },
  });
};

// Accomplishments
export const useMyAccomplishments = () =>
  useQuery({
    queryKey: ['accomplishments', 'my'],
    queryFn: () => api.get('/portfolio/accomplishments/my/').then(r => r.json()),
  });

export const useVerifyAccomplishment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) =>
      api.post(`/portfolio/accomplishments/${id}/verify/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accomplishments'] });
    },
  });
};

// Audit
export const useAuditLogs = () =>
  useQuery({
    queryKey: ['audit', 'logs'],
    queryFn: () => api.get('/audit/audit/').then(r => r.json()),
  });
```

---

## Component Refactoring Pattern

### Before (Hardcoded)
```tsx
const stats = [
  { label: "Total Officers", value: "156", change: "+12 this term" },
  ...
];

// Render
{stats.map((stat) => (
  <div key={stat.label} className="stat-card">
    <p className="text-3xl font-bold">{stat.value}</p>
    ...
  </div>
))}
```

### After (API Data)
```tsx
const { data: stats, isLoading } = useAdminStats();

if (isLoading) {
  return <Skeleton className="h-32" />;
}

// Render
{stats?.map((stat) => (
  <div key={stat.label} className="stat-card">
    <p className="text-3xl font-bold">{stat.value}</p>
    ...
  </div>
))}
```

---

## Loading & Error States

Add to each page:
```tsx
import { Skeleton } from "@/components/ui/skeleton";

// Loading
if (isLoading) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
  );
}

// Error
if (error) {
  return (
    <div className="text-center py-12">
      <p className="text-destructive">Failed to load data</p>
      <Button onClick={() => refetch()}>Retry</Button>
    </div>
  );
}
```

---

## Priority Order

| Priority | Page | Reason |
|----------|------|--------|
| 1 | Admin Users | CRUD operations needed |
| 2 | Officer Evaluations | Core evaluation workflow |
| 3 | Admin Dashboard | Admin overview (stats + activity) |
| 4 | Officer Dashboard | Officer overview |
| 5 | Admin Accomplishments | Verification workflow |
| 6 | Audit Log | Admin monitoring |
| 7 | Form Builder | Admin form creation |
| 8 | Assignments | Admin assignment management |

---

## Files to Create/Modify

### New Files
```
frontend/src/
├── hooks/
│   ├── useApi.ts              # Generic API hooks
│   ├── useUsers.ts            # User hooks
│   ├── useEvaluations.ts      # Evaluation hooks
│   ├── usePortfolio.ts        # Accomplishment hooks
│   └── useAudit.ts            # Audit hooks
└── services/
    └── api.ts                 # Extended API service (already exists)
```

### Modified Files
```
frontend/src/pages/
├── admin/
│   ├── Dashboard.tsx          # Connect to API
│   ├── Users.tsx              # Full CRUD integration
│   ├── Accomplishments.tsx   # Verification workflow
│   └── AuditLog.tsx           # Connect to audit API
└── officer/
    ├── Dashboard.tsx          # Connect to API
    ├── Evaluations.tsx        # Full integration
    ├── EvaluationForm.tsx     # Form submission
    └── Accomplishments.tsx   # CRUD integration
```

---

## Testing Strategy

1. **Unit Tests** - Test hooks with mocked API responses
2. **Integration Tests** - Test component + hook integration
3. **E2E Tests** - Test full user flows with Cypress/Playwright

---

## Rollout Plan

1. **Week 1**: Create API hooks and services
2. **Week 2**: Integrate Admin pages (Users, Accomplishments)
3. **Week 3**: Integrate Officer pages (Evaluations, Dashboard)
4. **Week 4**: Testing and bug fixes
