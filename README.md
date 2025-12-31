# IPES
The IPES is an evaluation system by the Committee on Research of the CIT-U Supreme Student Government. It is done through Google Forms, but this makes workload heavy both for officers answering and the ones handling the results. 

We provide a solution that will unify the system and reduce the cumbersome process by developing a dedicated, automated evaluation platform tailored to IPES. This system will streamline form distribution, response collection, and result analysis. 
We hope that this system willl help in minimizing manual effort, reducing errors, and providing real-time insights for both evaluators and administrators.

## Tech stack
- Back-end: Django
- Front-end: ReactJS
- Database: Supabase

## ERD
```mermaid
---
title:  CSS IPES v1
---
%% EVALUATION_ASSIGNMENT and RESPONSE is subject to change 
%% depending on new info from one of the officers of CIT-U SSG CoR

erDiagram
    %% Core Entities
    ORGANIZATION {
        int id PK
        string name "e.g., CIT-U Supreme Student Government"
        string code "e.g., SSG-2025"
        %% since organizations can restructure every year, 
        %% we can implore the admin users to create a new organzation instance every year,
        %% specifying its year start and (optional) end.
        int period_year_start 
        int period_year_end "nullable, Auto-calculated when Admin closes the Organization instance"
        boolean is_active
    }
    COMMITTEE {
        int id PK
        int organization_id FK
        string name
        string description
    }
    ORGANIZATION ||--|{ COMMITTEE : "has"
    ORGANIZATION ||--o{ EVALUATION_FORM : "has"
    COMMITTEE ||--o{ USER : "has members"

    %% User Management 
    USER {
        int id PK
        string email
        string password_hash
        string first_name
        string last_name
        string role "Admin, Officer"
        %% some members may not belong to one specific committee
        %% making this nullable will help in some orgs with that kind of structure
        int committee_id FK "nullable"
        boolean is_active
    }

    %% Accomplishments
    USER ||--o{ ACCOMPLISHMENT : "logs"
    USER ||--o{ ACCOMPLISHMENT : "verifies (Admin)"
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

    %% Evaluation Structure 
    USER ||--o{ EVALUATION_FORM : "creates (Admin)"
    EVALUATION_FORM ||--|{ QUESTION : "contains"
    
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
        %% if True, evaluatees can view results
        boolean is_published "Controls visibility"
    }

    QUESTION {
        int id PK
        int form_id FK
        string text
        %% might need to add more
        string input_type "Scale, Text, Boolean"
        int order
        %% for input_type="Text", weight is null
        %% ...this logic must be implemented in the application layer
        int weight "null when input_type=Text"
    }

    %% The Assignment Logic (Who evaluates Who) 
    USER ||--o{ EVALUATION_ASSIGNMENT : "is evaluator"
    USER ||--o{ EVALUATION_ASSIGNMENT : "is evaluatee"
    EVALUATION_FORM ||--o{ EVALUATION_ASSIGNMENT : "instances of"

    %% This is an associative entity
    EVALUATION_ASSIGNMENT {
        int id PK
        int evaluator_id FK
        int evaluatee_id FK
        int form_id FK
        string status "Pending, Completed"
        datetime submitted_at
        float total_score "Auto-calculated"
    }

    %% Responses and Scoring 
    EVALUATION_ASSIGNMENT ||--|{ RESPONSE : "contains"
    QUESTION ||--o{ RESPONSE : "answers"

    RESPONSE {
        int id PK
        int assignment_id FK
        int question_id FK
        int score_value "nullable"
        text text_value "nullable"
    }

    %% Included to track changes and maintain system integrity
    USER ||--o{ AUDIT_LOG : "generates"
    AUDIT_LOG {
        int id PK
        int user_id FK
        string action
        string ip_address
        datetime timestamp
    }
```
