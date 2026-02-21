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
        image display_picture "link to a CDN"
        int period_year_start 
        int period_year_end "nullable, Auto-calculated when Admin closes the Organization instance"
        boolean is_active
    }
    ORGANIZATION_UNIT {
        int id PK
        int organization_id FK
        int type_id FK
        string name "e.g., Committee on Research, Commission on Elections"
        text description
    }
    MEMBERSHIP {
        int id PK
        int user_id FK
        int unit_id FK
        int position_id FK
        string role "Admin, Member"
        date date_start
        date date_end "Nullable (Null means currently active)"
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
        string name "e.g. Committee, Commission, Council, Department"
    }

    %% LUT for MEMBERSHIP
    POSITION_TYPE {
        int id PK
        %% we use org_id instead of org_unit_id so we can avoid duplication of positions across org_units
        %% i.e., positions are scoped to org level instead of org-unit level.
        %% this may not make sense in a business-sense, but it makes sense in a database-sense. Trust 🤙.
        int organization_id FK
        string name
        %% If we have chariman of a commission and head of a committee, we can use "rank" attribute when we sort them
        %% in simple words: different in name, same in hierarchy
        int rank "e.g., 1 for Head, 10 for Member (used for sorting)"
    }

    ORGANIZATION ||--|{ UNIT_TYPE : "defines"
    ORGANIZATION ||--|{ POSITION_TYPE : "defines"
    ORGANIZATION ||--|{ ORGANIZATION_UNIT : "consists of"
    ORGANIZATION ||--o{ JOIN_REQUEST : "receives"

    UNIT_TYPE ||--|{ ORGANIZATION_UNIT : "defines type"
    POSITION_TYPE ||--|{ MEMBERSHIP : "defines role"

    ORGANIZATION_UNIT ||--o{ MEMBERSHIP : "has members"

    %% --- User ---

    USER {
        int id PK
        string email
        string password_hash
        string first_name
        string last_name
        image display_picture "link to a CDN"
        boolean is_active
    }
    ACCOMPLISHMENT {
        int id PK
        int user_id FK
        string title
        text description "List of contributions"
        string type "Project, Attendance, General"
        date date_completed
        string proof_link "URL"
        string status "Pending, Verified, Rejected"
        int verified_by_id FK "nullable"
    }

    USER ||--|{ MEMBERSHIP : "holds"
    USER ||--o{ JOIN_REQUEST : "submits"
    USER ||--o{ ACCOMPLISHMENT : "logs"
    USER ||--o{ ACCOMPLISHMENT : "verifies (Admin)"

    %% --- Evaluation Structure ---

    
    EVALUATION_FORM {
        int id PK
        int organization_id FK
        string title
        string description
        string type "Peer, Cross-committee, Executive, Self"
        date start_date
        date end_date
        int created_by_id FK
        boolean is_active
        boolean is_published "if True, evaluatees can view results"
    }

    QUESTION {
        int id PK
        int form_id FK
        string text
        string input_type
        int order
        %% for input_type="Text", weight is null
        %% ...this logic must be implemented in the application layer
        int weight
    }
    
    USER ||--o{ EVALUATION_FORM : "creates (Admin)"
    ORGANIZATION ||--o{ EVALUATION_FORM : "has"
    EVALUATION_FORM ||--|{ QUESTION : "contains"

    %% --- Evaluation Assignment ---
    EVALUATION_ASSIGNMENT {
        int id PK
        int evaluator_id FK
        int evaluatee_id FK
        int form_id FK
        string status "Pending, Completed"
        datetime submitted_at
        float total_score "Auto-calculated"
    }

    USER ||--o{ EVALUATION_ASSIGNMENT : "is evaluator"
    USER ||--o{ EVALUATION_ASSIGNMENT : "is evaluatee"
    EVALUATION_FORM ||--o{ EVALUATION_ASSIGNMENT : "instances of"

    %% --- Responses ---
    RESPONSE {
        int id PK
        int assignment_id FK
        int question_id FK
        int score_value
        text text_value
    }

    EVALUATION_ASSIGNMENT ||--|{ RESPONSE : "contains"
    QUESTION ||--o{ RESPONSE : "answers"

    %% --- Audit ---
    
    AUDIT_LOG {
        int id PK
        int user_id FK
        string action
        string ip_address
        datetime timestamp
    }

    USER ||--o{ AUDIT_LOG : "generates"
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
├── apps/              # Django apps (backend)
│   ├── audit/
│   ├── evaluations/
│   ├── organizations/
│   ├── portfolio/
│   └── users/
├── frontend/          # React application (frontend)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── lib/
│   └── package.json
├── IPES/              # Django project settings
├── manage.py
└── requirements.txt
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
