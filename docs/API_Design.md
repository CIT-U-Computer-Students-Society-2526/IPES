# API Design and Endpoints

The Django REST Framework API is available under the `/api/` prefix. This document provides a catalog of the available endpoints.

---

## 🔌 API Endpoints

All endpoints (except for login and registration) require authentication via Bearer Token. Set the header `Authorization: Token <your_token>`.

### Auth & Users
- `/api/auth/` - Registration, login, password changes, and logout
- `/api/users/` - User profile management and search

### Organizations
- `/api/organizations/` - Main organization management (Admin only)
- `/api/unit-types/` - Definitions for Unit categories (e.g., Committee, Commission)
- `/api/units/` - Organizational units within an organization
- `/api/positions/` - Position titles and rank definitions
- `/api/memberships/` - Active user roles and assignments within units
- `/api/join-requests/` - Membership application and approval workflow

### Evaluations
- `/api/forms/` - Evaluation form lifecycle (Draft, Active, Released)
- `/api/questions/` - Question authoring and reordering
- `/api/assignment-rules/` - Logic for mapping evaluators to evaluatees
- `/api/assignments/` - Individual evaluation instances and status tracking
- `/api/responses/` - Recorded answers for evaluation questions

### Portfolio & Audit
- `/api/accomplishments/` - Member portfolios, verification, and feedback
- `/api/audit/` - System-wide audit logs showing critical admin and user actions
