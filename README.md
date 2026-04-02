![readme/IPES-banner.png](readme/IPES-banner.png)
---
# IPES
The Individual Performance Evaluation System (IPES) is an evaluation system by the Committee on Research of the CIT-U Supreme Student Government. It is done through Google Forms, but this makes workload heavy both for officers answering and the ones handling the results. 

We provide a solution that will unify the system and reduce the cumbersome process by developing a dedicated, automated evaluation platform tailored to IPES. This system will streamline form distribution, response collection, and result analysis. 
We hope that this system will help in minimizing manual effort, reducing errors, and providing real-time insights for both evaluators and administrators.

---
## Tech stack
- Back-end: Django
- Front-end: ReactJS
- Database: Supabase

---
## ERD
```mermaid
---
config:
    layout: elk
    look: handDrawn
---

erDiagram

    %% --- Org Structure ---

    ORGANIZATION {
        int id PK
        string name "e.g., CIT-U Supreme Student Government"
        string code "e.g., SSG-2025"
        text description
        string email "nullable"
        image display_picture "link to a CDN"
        date period_year_start
        date period_year_end "nullable"
        boolean is_active
    }
    ORGANIZATION_UNIT {
        int id PK
        int organization_id FK
        int type_id FK
        string name "e.g., Committee on Research"
        text description "nullable"
        boolean is_active
    }
    MEMBERSHIP {
        int id PK
        int user_id FK
        int unit_id FK
        int position_id FK
        date date_start
        date date_end "nullable"
        boolean is_active
    }
    ORGANIZATION_ROLE {
        int id PK
        int user_id FK
        int organization_id FK
        string role "Admin, Member"
        boolean is_active
    }
    JOIN_REQUEST {
        int id PK
        int user_id FK
        int organization_id FK
        string status "Pending, Approved, Rejected"
        datetime created_at
        datetime updated_at
    }

    %% LUT for ORG_UNIT
    UNIT_TYPE {
        int id PK
        int organization_id FK
        string name "e.g. Committee, Commission"
        boolean is_active
    }

    %% LUT for MEMBERSHIP
    POSITION_TYPE {
        int id PK
        int organization_id FK
        string name
        int rank "1 for Head, higher for lower rank"
        boolean is_active
    }

    ORGANIZATION ||--|{ UNIT_TYPE : "defines"
    ORGANIZATION ||--|{ POSITION_TYPE : "defines"
    ORGANIZATION ||--|{ ORGANIZATION_UNIT : "consists of"
    ORGANIZATION ||--o{ JOIN_REQUEST : "receives"
    ORGANIZATION ||--|{ ORGANIZATION_ROLE : "has"
    ORGANIZATION ||--o{ ACCOMPLISHMENT : "tracks"

    UNIT_TYPE ||--|{ ORGANIZATION_UNIT : "defines type"
    POSITION_TYPE ||--|{ MEMBERSHIP : "defines rank"

    ORGANIZATION_UNIT ||--o{ MEMBERSHIP : "has members"

    %% --- User ---

    USER {
        int id PK
        string email "unique"
        string username
        string first_name
        string last_name
        image display_picture "nullable"
        boolean is_active
    }
    ACCOMPLISHMENT {
        int id PK
        int user_id FK
        int organization_id FK
        string title
        text description
        string type
        datetime date_completed
        string proof_link "URL"
        string status "Pending, Verified, Rejected"
        int verified_by_id FK "nullable"
        text comments "nullable"
        datetime created_at
        datetime updated_at
    }

    USER ||--|{ MEMBERSHIP : "holds"
    USER ||--o{ JOIN_REQUEST : "submits"
    USER ||--o{ ACCOMPLISHMENT : "logs"
    USER ||--o{ ACCOMPLISHMENT : "verifies (Admin)"
    USER ||--o{ ORGANIZATION_ROLE : "assigned"

    %% --- Evaluation Structure ---

    EVALUATION_FORM {
        int id PK
        int organization_id FK
        string title
        text description
        date start_date
        date end_date
        int created_by_id FK "nullable"
        boolean is_active
        boolean results_released
        boolean is_deleted
        datetime created_at
        datetime updated_at
    }

    QUESTION {
        int id PK
        int form_id FK
        text text
        string input_type
        int order
        float weight "nullable"
        boolean is_required
        int min_value "nullable"
        int max_value "nullable"
    }

    ASSIGNMENT_RULE {
        int id PK
        int form_id FK
        int evaluator_unit_id FK "nullable"
        int evaluator_position_id FK "nullable"
        int evaluatee_unit_id FK "nullable"
        int evaluatee_position_id FK "nullable"
        boolean exclude_self
    }
    
    USER ||--o{ EVALUATION_FORM : "creates (Admin)"
    ORGANIZATION ||--o{ EVALUATION_FORM : "has"
    EVALUATION_FORM ||--|{ QUESTION : "contains"
    EVALUATION_FORM ||--|{ ASSIGNMENT_RULE : "governed by"

    ASSIGNMENT_RULE }o--o| ORGANIZATION_UNIT : "evaluator unit"
    ASSIGNMENT_RULE }o--o| POSITION_TYPE : "evaluator position"
    ASSIGNMENT_RULE }o--o| ORGANIZATION_UNIT : "evaluatee unit"
    ASSIGNMENT_RULE }o--o| POSITION_TYPE : "evaluatee position"

    %% --- Evaluation Assignment ---
    EVALUATION_ASSIGNMENT {
        int id PK
        int evaluator_id FK
        int evaluatee_id FK
        int form_id FK
        string status "Pending, In Progress, Completed"
        datetime submitted_at "nullable"
        float total_score "nullable"
    }

    USER ||--o{ EVALUATION_ASSIGNMENT : "is evaluator"
    USER ||--o{ EVALUATION_ASSIGNMENT : "is evaluatee"
    EVALUATION_FORM ||--o{ EVALUATION_ASSIGNMENT : "instances of"

    %% --- Responses ---
    RESPONSE {
        int id PK
        int assignment_id FK
        int question_id FK
        float score_value "nullable"
        text text "nullable"
    }

    EVALUATION_ASSIGNMENT ||--|{ RESPONSE : "contains"
    QUESTION ||--o{ RESPONSE : "answers"

    %% --- Audit ---
    
    AUDIT_LOG {
        int id PK
        int user_id FK
        int organization_id FK "nullable"
        string action
        string ip_address "nullable"
        datetime datetime
    }

    USER ||--o{ AUDIT_LOG : "generates"
    ORGANIZATION ||--o{ AUDIT_LOG : "recorded for"
```

---

## Sequence Diagrams

### Evaluation Form Lifecycle

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

### Accomplishment Verification

This diagram shows how members submit accomplishments and how admins review (verify or reject) them.

```mermaid
sequenceDiagram
    actor Member
    participant Frontend as React Frontend
    participant API as Django REST API
    participant DB as PostgreSQL (Supabase)
    actor Admin

    Note over Member, DB: Phase 1 — Accomplishment Submission

    Member->>Frontend: Fill accomplishment form (title, type, proof link)
    Frontend->>API: POST /api/portfolio/accomplishments/
    API->>API: Auto-set user_id & organization_id from request
    API->>DB: Insert Accomplishment (status=Pending)
    DB-->>API: Accomplishment record
    API-->>Frontend: 201 Created
    Frontend-->>Member: "Accomplishment submitted" confirmation

    Note over Admin, DB: Phase 2 — Admin Review

    Admin->>Frontend: View "Accomplishments" page (pending tab)
    Frontend->>API: GET /api/portfolio/accomplishments/pending/
    API->>API: Verify caller is org Admin
    API->>DB: Query Accomplishments where status=Pending
    DB-->>API: Pending accomplishments list
    API-->>Frontend: Accomplishment data
    Frontend-->>Admin: Display pending accomplishments with proof links

    alt Admin approves
        Admin->>Frontend: Click "Verify"
        Frontend->>API: POST /api/portfolio/accomplishments/{id}/verify/
        Note right of API: body: {status: "Verified"}
        API->>API: Check accomplishment is "Pending"
        API->>DB: Update status=Verified, verified_by=admin
        API-->>Frontend: 200 OK
        Frontend-->>Admin: "Accomplishment verified" toast
    else Admin rejects
        Admin->>Frontend: Click "Reject" with comments
        Frontend->>API: POST /api/portfolio/accomplishments/{id}/verify/
        Note right of API: body: {status: "Rejected", comments: "..."}
        API->>API: Check accomplishment is "Pending"
        API->>DB: Update status=Rejected, verified_by=admin, comments
        API-->>Frontend: 200 OK
        Frontend-->>Admin: "Accomplishment rejected" toast
    end

    Note over Member, DB: Phase 3 — Member Sees Outcome

    Member->>Frontend: View "My Accomplishments"
    Frontend->>API: GET /api/portfolio/accomplishments/my/
    API->>DB: Query user's accomplishments
    DB-->>API: Accomplishments with updated statuses
    API-->>Frontend: Accomplishment list
    Frontend-->>Member: Display Verified / Rejected status

    opt If Rejected — Member can edit & resubmit
        Member->>Frontend: Edit rejected accomplishment
        Frontend->>API: PATCH /api/portfolio/accomplishments/{id}/
        API->>API: Validate owner & status is "Pending" or "Rejected"
        API->>DB: Update fields, reset status → Pending
        API-->>Frontend: 200 OK
        Frontend-->>Member: "Accomplishment resubmitted" confirmation
    end

    Note over Member, DB: Phase 4 — Verified accomplishments visible during evaluations

    Member->>Frontend: Evaluator opens peer evaluation form
    Frontend->>API: GET /api/portfolio/accomplishments/evaluatee_profile/?user_id=X
    API->>DB: Query Verified accomplishments for evaluatee
    DB-->>API: Verified accomplishments + membership info
    API-->>Frontend: Evaluatee profile data
    Frontend-->>Member: Display evaluatee's verified accomplishments alongside evaluation form
```

---

## 📦 Requirements

### Backend
- Python 3.13+
- Virtual environment
- Database (PostgreSQL)

### Frontend
- Node.js 18+ and npm (or yarn/pnpm)
- Modern web browser

---

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/rkSp4/IPES.git
cd IPES
```

### 2. Create Virtual Environment
```bash
python -m venv .venv
```

Activate it:
- **Windows (PowerShell):**
  ```bash
  .venv\Scripts\Activate.ps1
  ```
- **Windows (Command Prompt)**
  ```cmd
  .venv\Scripts\activate.bat
  ```
- **macOS/Linux:**
  ```bash
  source .venv/bin/activate
  ```

### 3. Install Backend Dependencies
```bash
pip install -r requirements.txt
```

### 4. Setup Frontend

Navigate to the frontend directory:
```bash
cd frontend
```

Install frontend dependencies:
```bash
npm install
```

Create frontend environment file:
```bash
cp .env.example .env.local
```

Edit `frontend/.env.local` and set your API base URL (default: `http://localhost:8000/api`)

Return to project root:
```bash
cd ..
```

### 5. Environment Variables
Copy the example environment file:
```bash
cp sample.env .env
```

Edit `.env` and update with your local secrets (e.g. database, secret key, debug mode).

---

## 🔑 Environment Variables

### Backend (`.env`)

Your `.env` file should look like this:
```env
SECRET_KEY=mysecretkey
DEBUG=True
DB_NAME=IPES
DB_USER=root
DB_PASSWORD=12345
DB_HOST=127.0.0.1
DB_PORT=5432
```

Generate your secret key [here](https://djecrety.ir/).
> ⚠️ Update the database credentials to match your database configuration (e.g., Supabase PostgreSQL).

### Frontend (`frontend/.env.local`)

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

> ⚠️ Never commit `.env` or `.env.local` — they contain sensitive information.

---

## 🗄️ Database Setup

Supabase uses PostgreSQL. Connect to your Supabase database and run:

1. Apply migrations:
   ```bash
   python manage.py migrate
   ```
2. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```
---

## 🧪 Testing the Application

The project uses Django's built-in testing framework for the backend and Vitest/React Testing Library for the frontend.

### Backend Tests
To run the backend tests, ensure your environment is set up. The project is configured to automatically use a local **SQLite** database for tests to ensure speed and isolation.

```bash
# Run all backend tests
python manage.py test

# Run tests for specific apps
python manage.py test apps.users apps.organizations
```
> **Note:** The test runner automatically overrides the `DATABASES` setting to use SQLite when the `test` command is detected. This prevents session conflicts and permission issues often encountered when testing against a remote PostgreSQL instance (like Supabase). If you need to test Postgres-specific features, you can temporarily disable this override in `IPES/settings.py`.

### Frontend Tests
The frontend uses Vitest for rapid execution and React Testing Library for simulating user interactions.

```bash
cd frontend

# Run frontend tests in the console
npm run test

# Run tests with a visual, interactive dashboard in your browser
npm run test:ui
```

---

## ▶️ Running the Application

### Development Mode

You need to run both the Django backend and React frontend servers simultaneously.

#### Terminal 1 - Django Backend
```bash
python manage.py runserver
```
Backend will be available at: [http://127.0.0.1:8000](http://127.0.0.1:8000)

#### Terminal 2 - React Frontend
```bash
cd frontend
npm run dev
```
Frontend will be available at: [http://localhost:8080](http://localhost:8080)

### Production Build

To build the frontend for production:
```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/` and can be served by Django static files or a web server.

---

## 📁 Project Structure

```
IPES/
├── apps/               # Django backend apps
│   ├── audit/          # Logging and audit trails
│   ├── evaluations/    # Evaluation forms, rules, and results
│   ├── organizations/  # Organization and membership management
│   ├── portfolio/      # Accomplishment tracking and verification
│   └── users/          # Custom user model and authentication
├── frontend/           # React frontend (Vite)
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── contexts/   # React Context providers (Auth, Org)
│   │   ├── hooks/      # Custom React hooks (API queries)
│   │   ├── lib/        # Utility functions and API configuration
│   │   ├── pages/      # View components (Admin, Officer, Auth)
│   │   └── App.tsx     # Main routing and layout wrapper
│   └── package.json
├── IPES/               # Django project core settings
├── manage.py           # Django CLI entry point
└── requirements.txt    # Python dependencies
```

---

## 🔌 API Endpoints

The Django REST Framework API is available at `/api/`. API endpoints will be added as you develop the backend functionality.

Example API structure:
- `/api/users/` - User management
- `/api/evaluations/` - Evaluation forms and responses
- `/api/organizations/` - Organization management
- etc.

---
