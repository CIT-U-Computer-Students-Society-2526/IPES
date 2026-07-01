# Testing Guide

This document describes how to execute the test suites for both the backend (Django) and frontend (React/Vitest) applications.

---

## 🧪 Testing the Application

The project uses Django's built-in testing framework for the backend and Vitest/React Testing Library for the frontend.

### Backend Tests

To run the backend tests, ensure your virtual environment is active and you are in the `backend` directory.

The project is configured to automatically use a local **SQLite** database for tests to ensure speed and isolation.

```bash
# Navigate to backend directory
cd backend

# Run all backend tests
python manage.py test

# Run tests for specific apps
python manage.py test apps.users apps.organizations
```

> [!NOTE]
> The test runner automatically overrides the `DATABASES` setting to use SQLite when the `test` command is detected. This prevents session conflicts and permission issues often encountered when testing against a remote PostgreSQL instance (like Supabase). If you need to test Postgres-specific features, you can temporarily disable this override in `IPES/settings.py`.

### Frontend Tests

The frontend uses Vitest for rapid execution and React Testing Library for simulating user interactions. Navigate to the `frontend` directory:

```bash
# Navigate to frontend directory
cd frontend

# Run frontend tests in the console
npm run test

# Run tests with a visual, interactive dashboard in your browser
npm run test:ui
```
