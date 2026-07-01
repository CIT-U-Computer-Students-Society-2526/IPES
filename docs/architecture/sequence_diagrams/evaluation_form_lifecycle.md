# Evaluation Form Lifecycle Sequence Diagram

This diagram illustrates the complete lifecycle of an evaluation form — from initial creation by an Admin, through question authoring, assignment generation, member response submission, and finally viewing results.

```mermaid
sequenceDiagram
    actor Admin
    participant Frontend as React Frontend
    participant API as Django REST API
    participant DB as PostgreSQL (Supabase)
    actor Member as Member (Evaluator)

    Note over Admin, DB: Phase 1 — Form Creation & Question Authoring

    Admin->>Frontend: Create new form (title, description)
    Frontend->>API: POST /api/evaluations/forms/
    API->>DB: Insert EvaluationForm (is_active=false)
    DB-->>API: Form record
    API-->>Frontend: 201 Created (form data)
    Frontend-->>Admin: Redirect to Form Editor

    Admin->>Frontend: Add questions (type, weight, min/max)
    Admin->>Frontend: Drag-and-drop to reorder questions
    Admin->>Frontend: Click "Save Draft"
    Frontend->>API: POST /api/evaluations/questions/bulk_create/
    API->>DB: Insert Question rows with order values
    DB-->>API: Created questions
    API-->>Frontend: 201 Created
    Frontend-->>Admin: "Draft Saved" toast

    Note over Admin, DB: Phase 2 — Assignment Rules & Generation

    Admin->>Frontend: Define assignment rules (evaluator ↔ evaluatee)
    Frontend->>API: POST /api/evaluations/rules/
    API->>DB: Insert AssignmentRule
    DB-->>API: Rule record
    API-->>Frontend: 201 Created

    Admin->>Frontend: Click "Activate Form"
    Frontend->>API: POST /api/evaluations/forms/{id}/activate/
    API->>DB: Update form (is_active=true)
    API-->>Frontend: 200 OK

    Admin->>Frontend: Click "Generate Assignments"
    Frontend->>API: POST /api/evaluations/rules/generate/
    API->>DB: Query Memberships matching each rule
    loop For each evaluator × evaluatee pair
        API->>DB: get_or_create EvaluationAssignment (status=Pending)
    end
    API-->>Frontend: 201 Created ({created: N})
    Frontend-->>Admin: "N assignments generated" toast

    Note over Member, DB: Phase 3 — Evaluation Response

    Member->>Frontend: View "My Evaluations" (pending list)
    Frontend->>API: GET /api/evaluations/assignments/my_pending/
    API->>DB: Query assignments where evaluator=user
    DB-->>API: Pending assignments
    API-->>Frontend: Assignment list
    Frontend-->>Member: Display pending evaluations

    Member->>Frontend: Open an assignment & fill in responses
    Frontend->>API: POST /api/evaluations/responses/bulk_create/
    API->>DB: Upsert Response rows (score_value, text)
    API->>DB: Update assignment status → "In Progress"
    API-->>Frontend: 201 Created

    Member->>Frontend: Click "Submit Evaluation"
    Frontend->>API: POST /api/evaluations/assignments/{id}/submit/
    API->>DB: Create Response rows
    API->>DB: Calculate weighted total_score
    API->>DB: Update assignment (status=Completed, submitted_at=now)
    API-->>Frontend: 200 OK (assignment + responses)
    Frontend-->>Member: "Evaluation submitted" toast

    Note over Admin, DB: Phase 4 — Results Release & Viewing

    Admin->>Frontend: Click "Release Results"
    Frontend->>API: POST /api/evaluations/forms/{id}/release_results/
    API->>DB: Update form (results_released=true, is_active=false)
    API-->>Frontend: 200 OK

    Member->>Frontend: View "My Results"
    Frontend->>API: GET /api/evaluations/assignments/my_performance/
    API->>DB: Query completed assignments for released forms
    API->>DB: Aggregate scores, category breakdowns, feedback
    API-->>Frontend: Performance data (scores, history, comments)
    Frontend-->>Member: Display results dashboard
```
